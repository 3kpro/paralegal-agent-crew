import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { streamText, tool, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, sessionId: providedSessionId, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 });
    }

    // 2. Manage Session
    let sessionId = providedSessionId;
    if (!sessionId) {
      // Create a new session if none provided
      const firstUserMessage = messages.find((m: any) => m.role === 'user')?.content || 'New conversation';
      const { data: session, error: sessionError } = await supabase
        .from('helix_sessions')
        .insert({
          user_id: user.id,
          title: (typeof firstUserMessage === 'string' ? firstUserMessage : 'New Conversation').substring(0, 50)
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return new Response('Failed to create session', { status: 500 });
      }
      sessionId = session.id;
    }

    // 3. Load Brand DNA
    const { data: brandDna } = await supabase
      .from('helix_brand_dna')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 4. Construct System Prompt
    const systemPrompt = `You are Helix, an advanced AI Marketing Assistant.

Your Goal: Help the user build their brand, plan strategy, and generate content.

User Context:
- Current Page: ${context?.currentPath || 'Unknown'}
${context?.pageContent ? `- Page Content Summary: ${context.pageContent}` : ''}

Brand Context:
${brandDna ? JSON.stringify(brandDna.dna_attributes) : "No brand DNA established yet. Ask the user to define their voice."}

Instructions:
- Be professional, insightful, and proactive
- Use the "Current Page" context to tailor your advice
- When users ask about their brand, campaigns, or content, use the available tools to fetch real data
- Always stay helpful and conversational`;

    // 5. Convert UIMessages to ModelMessages and stream response
    console.log('[Helix] Incoming messages:', JSON.stringify(messages, null, 2));
    
    // Convert parts automatically if possible, or handle manual fallback
    const modelMessages = convertToModelMessages(messages);

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ NO API KEY FOUND in environment variables');
      return new Response('Configuration Error: Missing API Key', { status: 500 });
    }

    // Create custom provider to explicitly pass API key
    const google = createGoogleGenerativeAI({
      apiKey: apiKey
    });
    
    const result = streamText({
      model: google('gemini-2.0-flash-exp'),
      messages: [
        { role: 'system', content: systemPrompt },
        ...modelMessages
      ],
      // tools: {
      //   update_brand_dna: tool({
      //     description: 'Updates the user\'s Brand DNA profile with new rules or preferences. Pass attributes as a stringified JSON object.',
      //     parameters: z.object({
      //       attributes_json: z.string().describe('JSON string of Brand DNA attributes to update')
      //     }),
      //     execute: async ({ attributes_json }) => {
      //       const attributes = JSON.parse(attributes_json);
      //       // Get existing DNA
      //       const { data: existing } = await supabase
      //         .from('helix_brand_dna')
      //         .select('dna_attributes')
      //         .eq('user_id', user.id)
      //         .single();
      //
      //       const currentAttributes = existing?.dna_attributes || {};
      //       const newAttributes = { ...currentAttributes, ...attributes };
      //
      //       // Upsert new DNA
      //       const { error } = await supabase
      //         .from('helix_brand_dna')
      //         .upsert({
      //           user_id: user.id,
      //           dna_attributes: newAttributes,
      //           updated_at: new Date().toISOString()
      //         }, { onConflict: 'user_id' });
      //
      //       if (error) throw new Error(`Failed to update Brand DNA: ${error.message}`);
      //
      //       return { status: 'success', message: 'Brand DNA updated', current_dna: newAttributes };
      //     }
      //   }),
      //   search_knowledge_base: tool({
      //     description: 'Searches the user\'s uploaded documents for relevant information',
      //     parameters: z.object({
      //       query: z.string().describe('The search query')
      //     }),
      //     execute: async ({ query }) => {
      //       // TODO: Implement RAG search when Phase 1 is complete
      //       console.log('Knowledge base search:', query);
      //       return {
      //         results: [],
      //         message: 'Knowledge base search not yet implemented. Upload documents feature coming soon!'
      //       };
      //     }
      //   })
      // },
      onFinish: async ({ text, toolCalls }) => {
        // Save messages to database after streaming completes
        try {
          // Save user message (last message in array)
          const lastUserMessage = messages[messages.length - 1];
          let userContent = '';
          if (lastUserMessage?.role === 'user') {
             if (typeof lastUserMessage.content === 'string') {
                userContent = lastUserMessage.content;
             } else if (Array.isArray(lastUserMessage.parts)) {
                userContent = lastUserMessage.parts.map((p:any) => p.text).join(' ');
             }

            await supabase.from('helix_messages').insert({
              session_id: sessionId,
              user_id: user.id,
              role: 'user',
              content: userContent
            });
          }

          // Save assistant message
          await supabase.from('helix_messages').insert({
            session_id: sessionId,
            user_id: user.id,
            role: 'assistant',
            content: text,
            metadata: toolCalls ? { toolCalls } : null
          });
        } catch (error) {
          console.error('Error saving messages:', error);
        }
      }
    });

    // 6. Return streaming response
    return result.toTextStreamResponse({
      headers: {
        'X-Session-Id': sessionId
      }
    });

  } catch (error: any) {
    console.error('Helix API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
