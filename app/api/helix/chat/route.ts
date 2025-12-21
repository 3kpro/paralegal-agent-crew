import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { streamText, generateText, tool, convertToModelMessages, zodSchema } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { generateAnalystQuery } from '../../../../lib/ai/analyst';

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

    const connectedPlatforms = connections?.map((c: any) => c.platform).join(', ') || 'None';

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
- **CRITICAL:** If the user asks specific questions about their data (e.g. "which is the oldest?", "show me performance"), YOU MUST USE THE \`query_analytics\` TOOL. Do not guess or say you can't.
- Be professional, insightful, and proactive.
- Use the "Current Page" context to tailor your advice.
- Always stay helpful and conversational.`;

    // 5. Convert UIMessages to ModelMessages and stream response
    console.log('[Helix] Incoming messages:', JSON.stringify(messages, null, 2));
    
    // Save the latest User message to the database
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      /*
      const { error: msgError } = await supabase.from('helix_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'user',
        content: lastUserMessage.content
      });
      
      if (msgError) {
        console.error('FAILED to save User Message:', msgError);
      }
      */
    }

    // Explicitly safe map to avoid "undefined map" errors in SDK utilities
    // Handle SDK v5 parts if content is missing
    const modelMessages = messages
      .map((m: any) => {
        let content = m.content;
        // If content is empty but parts exist, stringify parts
        if ((!content || (typeof content === 'string' && content.trim() === '')) && m.parts && m.parts.length > 0) {
           content = JSON.stringify(m.parts); 
        }
        return {
          role: m.role,
          content: typeof content === 'string' ? content : JSON.stringify(content || "")
        };
      })
      .filter((m: any) => m.content && m.content.trim() !== ''); // Only keep messages with actual content

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ NO API KEY FOUND in environment variables');
      return new Response('Configuration Error: Missing API Key', { status: 500 });
    }

    // Create custom provider to explicitly pass API key
    const google = createGoogleGenerativeAI({
      apiKey: apiKey
    });
    
    // 6. Attempt AI Execution with Version Fallbacks
    try {
      // FORCE OFFLINE MODE FOR DEBUGGING
      throw new Error('Forcing Offline Mode to test streaming');

      const modelsToTry = [
        'gemini-1.5-flash', 
        'gemini-1.5-pro', 
        'gemini-pro',
        'gemini-1.5-flash-latest', 
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-8b'
      ];
      
      let success = false;
      let activeModel = modelsToTry[0];
      let activeGoogleProvider = google;

      // Try different models and potentially different API versions
      for (const version of ['v1beta', 'v1'] as const) {
        // The SDK handles versioning, but we can try to force different model strings 
        const currentProvider = createGoogleGenerativeAI({ 
          apiKey,
          // Correctly pass version to the provider if supported, though usually it uses v1beta by default
        }); 
        
        for (const modelName of modelsToTry) {
          try {
            activeModel = modelName;
            activeGoogleProvider = currentProvider;
            
            // NOTE: The @ai-sdk/google provider expects simple names like 'gemini-1.5-flash'
            // It automatically prepends 'models/' and handles the endpoint.
            await generateText({
              model: activeGoogleProvider(activeModel),
              messages: [{ role: 'user', content: 'hi' }],
            });
            success = true;
            break; 
          } catch (e: any) {
             // Log the error more clearly
             console.warn(`[Helix] ${version}/${modelName} failed: ${e.message}`);
          }
        }
        if (success) break;
      }

      if (!success) throw new Error('No valid AI model configuration found for this key.');
      
      console.log(`[Helix] ACTIVE: ${activeModel}`);

      const result = await streamText({
        model: activeGoogleProvider(activeModel),
        system: systemPrompt,
        messages: modelMessages,
        // @ts-ignore
        maxSteps: 5,
        tools: {
          query_analytics: tool({
        inputSchema: zodSchema(z.object({
          question: z.string().describe('The natural language question to ask the database.')
        })),
        execute: async ({ question }: { question: string }) => {
               try {
                 console.log('[Helix] Invoking Analyst with:', question);
                 return await generateAnalystQuery(question, user!.id, supabase);
               } catch (err: any) {
                 console.error('[Helix] Analyst Error:', err,);
                 return {
                   error: err.message || 'Failed to query analytics.',
                   sql: 'N/A',
                   explanation: 'I encountered an error while trying to access the analytics database.',
                   chartType: 'number',
                   data: []
                 };
               }
            }
          }) as any
        },
        onFinish: async ({ text }) => {
           await supabase.from('helix_messages').insert({
              session_id: sessionId,
              user_id: user!.id,
              role: 'assistant',
              content: text
           });
        }
      });

      return result.toUIMessageStreamResponse({
        headers: { 'X-Session-Id': sessionId }
      });
      
    } catch (aiError: any) {
      console.warn('[Helix] AI Unavailable. Mode: Offline.', aiError.message);
      
      // Safety check: ensure we have messages to process
      if (!modelMessages || modelMessages.length === 0) {
        return new Response('Offline mode: No valid messages to process.', { status: 400 });
      }

      const lastMsg = modelMessages[modelMessages.length - 1].content.toString().toLowerCase();
      let responseText = "I'm Helix (Offline Mode). I can help you with your analytics and campaigns. Try asking 'Show me performance' or 'How many campaigns?'.";
      
      // 1. Check general keywords (more flexible regex)
      if (lastMsg.match(/campaign|performance|stats|data|analytics/i)) {
         const { data: campaigns } = await supabase
           .from('campaigns')
           .select('name, total_views, total_clicks, status')
           .eq('user_id', user.id)
           .order('total_views', { ascending: false })
           .limit(5);

         if (campaigns && campaigns.length > 0) {
           const stats = campaigns.map((c: any) => `• **${c.name}** (${c.status})\n   👀 ${c.total_views.toLocaleString()} views | 👆 ${c.total_clicks.toLocaleString()} clicks`).join('\n\n');
           responseText = `Here is the performance of your top campaigns:\n\n${stats}\n\nWould you like to analyze a specific one?`;
         } else {
           responseText = "I found 0 campaigns in your account. Try creating one in the Campaigns tab!";
         }
      } 
      // 2. Exact match for campaign name in text
      else {
        const { data: specificCampaign } = await supabase
          .from('campaigns')
          .select('name, total_views, total_clicks, total_engagement, status, created_at')
          .eq('user_id', user.id)
          .ilike('name', `%${lastMsg.replace(/yes|analyze|show|me/g, '').trim()}%`)
          .limit(1)
          .single();

        if (specificCampaign && lastMsg.length > 3) {
           responseText = `Detailed analysis for **${specificCampaign.name}**:\n\n` +
             `📊 **Status:** ${specificCampaign.status}\n` +
             `👀 **Views:** ${specificCampaign.total_views.toLocaleString()}\n` +
             `👆 **Clicks:** ${specificCampaign.total_clicks.toLocaleString()}\n` +
             `❤️ **Engagement:** ${specificCampaign.total_engagement.toLocaleString()}\n` +
             `📅 **Created:** ${new Date(specificCampaign.created_at).toLocaleDateString()}`;
        }
        else if (lastMsg.match(/^(hi|hello|hey|yo|greetings)/)) {
           responseText = "Hello! I'm ready to analyze your brand performance. Ask me anything about your campaigns.";
        }
        else {
           responseText = "I'm running in **Offline Mode** right now 🤖 because the AI service is unreachable.\n\nBut I *can* analyze your data! Try asking 'Show me my campaigns' or 'How is my performance?'.";
        }
      }

      // Persist the offline assistant response
      // Persist the offline assistant response - REMOVED for debugging
      /*
      const { error: offlineError } = await supabase.from('helix_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'assistant',
        content: responseText
      });
      
      if (offlineError) {
        console.error('FAILED to save Offline Response:', offlineError);
      }
      */

      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          const textPart = `0:${JSON.stringify(responseText)}\n`;
          controller.enqueue(encoder.encode(textPart));
          controller.close();
        }
      });

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1',
          'X-Session-Id': sessionId || ''
        }
      });
      
    } // End of catch (aiError)

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
