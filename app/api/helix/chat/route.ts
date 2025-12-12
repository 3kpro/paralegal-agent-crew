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
      const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'New conversation';
      const { data: session, error: sessionError } = await supabase
        .from('helix_sessions')
        .insert({
          user_id: user.id,
          title: firstUserMessage.substring(0, 50) + (firstUserMessage.length > 50 ? '...' : '')
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return new Response('Failed to create session', { status: 500 });
      }
      sessionId = session.id;
    }

    // 3. Data Fetching for Context (Campaigns, Connections, Brand)
    const [
      { count: campaignCount },
      { data: connections },
      { data: brandDna }
    ] = await Promise.all([
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('user_social_connections').select('platform').eq('user_id', user.id),
      supabase.from('helix_brand_dna').select('*').eq('user_id', user.id).single()
    ]);

    const connectedPlatforms = connections?.map(c => c.platform).join(', ') || 'None';

    // 4. Construct System Prompt
    const systemPrompt = `You are Helix, the AI Copilot for **XELORA**.

**Product Knowledge (XELORA):**
- XELORA is an AI-powered Predictive Intelligence and Content Engineering platform.
- Core Capabilities:
  1. **Signal Tracking:** Monitors 6+ platforms for emerging trends.
  2. **Viral Engineering:** Predicts content virality ("Viral Score") before publishing.
  3. **Multi-Platform Publishing:** Deploys content to Twitter, LinkedIn, etc.
  4. **Reactor (AI Studio):** Generates high-performance content variations.
- **Identity:** You are NOT a generic assistant. You are the intelligence engine *inside* Xelora.

Your Goal: Help the user build their brand, plan strategy, and generate content using Xelora's capabilities.

User Context:
- Current Page: ${context?.currentPath || 'Unknown'}
${context?.pageContent ? `- Page Content Summary: ${context.pageContent}` : ''}
- Live Dashboard Data:
  - Total Campaigns Created: ${campaignCount || 0}
  - Connected Platforms: ${connectedPlatforms}

Brand Context:
${brandDna ? JSON.stringify(brandDna.dna_attributes) : "No brand DNA established yet. Ask the user to define their voice."}

Instructions:
- You HAVE access to the user's live data listed above. Do not claim you cannot access it.
- If asked "How many campaigns?", answer directly using the "Total Campaigns Created" value.
- Be professional, insightful, and proactive.
- Use the "Current Page" context to tailor your advice.
- Always stay helpful and conversational.`;

    // 5. Convert UIMessages to ModelMessages and stream response
    console.log('[Helix] Incoming messages:', JSON.stringify(messages, null, 2));
    
    // Explicitly safe map to avoid "undefined map" errors in SDK utilities
    const modelMessages = messages.map((m: any) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.parts || "")
    }));

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
          if (lastUserMessage?.role === 'user') {
            await supabase.from('helix_messages').insert({
              session_id: sessionId,
              user_id: user.id,
              role: 'user',
              content: lastUserMessage.content
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
