import { NextRequest } from 'next/server';
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
- **CRITICAL:** If the user asks specific questions about their data (e.g. "which is the oldest?", "show me performance"), YOU MUST USE THE \`query_analytics\` TOOL. Do not guess or say you can't.
- Be professional, insightful, and proactive.
- Use the "Current Page" context to tailor your advice.
- Always stay helpful and conversational.`;

    // 5. Convert UIMessages to ModelMessages and stream response
    console.log('[Helix] Incoming messages:', JSON.stringify(messages, null, 2));
    
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
    
    // 6. Attempt AI Execution
    try {
      let activeModel = 'gemini-1.5-flash';
      
      // Pre-flight check with fallback
      try {
        await generateText({
          model: google(activeModel),
          messages: [{ role: 'user', content: 'Test' }],
        });
      } catch (e: any) {
        // If flash fails (e.g. 404), try fallback to pro or stable
        console.warn(`[Helix] Model ${activeModel} failed check, trying fallback...`);
        try {
          activeModel = 'gemini-1.5-pro';
          await generateText({
            model: google(activeModel),
            messages: [{ role: 'user', content: 'Test' }],
          });
        } catch (e2) {
           console.warn(`[Helix] Model ${activeModel} failed check, trying gemini-pro...`);
           activeModel = 'gemini-pro';
           // If this fails, it goes to offline mode
           await generateText({
            model: google(activeModel),
            messages: [{ role: 'user', content: 'Test' }],
          });
        }
      }
      
      console.log(`[Helix] Using Model: ${activeModel}`);

      const result = await streamText({
        model: google(activeModel),
        system: systemPrompt,
        messages: modelMessages,
        // @ts-ignore
        maxSteps: 5, // Required for tool execution
        tools: {
          query_analytics: tool({
        inputSchema: zodSchema(z.object({
          question: z.string().describe('The natural language question to ask the database.')
        })),
        execute: async ({ question }: { question: string }) => {
               try {
                 console.log('[Helix] Invoking Analyst with:', question);
                 return await generateAnalystQuery(question, user.id, supabase);
               } catch (err: any) {
                 console.error('[Helix] Analyst Error:', err);
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
           // Save assistant message to DB
           await supabase.from('helix_messages').insert({
              session_id: sessionId,
              user_id: user.id,
              role: 'assistant',
              content: text
           });
        }
      });

      return result.toUIMessageStreamResponse({
        headers: {
          'X-Session-Id': sessionId
        }
      });

    } catch (aiError) {
      console.warn('[Helix] AI Service Unavailable (Invalid Key or Model Error). Switching to Offline Mode.', aiError);
      
      // --- OFFLINE MOCK MODE (Fallback) ---
      // Safety check: ensure we have messages to process
      if (!modelMessages || modelMessages.length === 0) {
        return new Response('Offline mode: No valid messages to process.', { status: 400 });
      }

      const lastMsg = modelMessages[modelMessages.length - 1].content.toString().toLowerCase();
      
      let responseText = "I'm Helix (Offline Mode). I can help you with your analytics and campaigns. Try asking 'Show me performance' or 'How many campaigns?'.";
      
      // 1. Check for specific campaign names first
      const { data: specificCampaign } = await supabase
        .from('campaigns')
        .select('name, total_views, total_clicks, total_engagement, status, created_at')
        .eq('user_id', user.id)
        .ilike('name', `%${lastMsg.replace(/yes|analyze/g, '').trim()}%`)
        .limit(1)
        .single();

      if (specificCampaign) {
         responseText = `Here is the detailed analysis for **${specificCampaign.name}**:\n\n` +
           `📊 **Status:** ${specificCampaign.status}\n` +
           `👀 **Views:** ${specificCampaign.total_views.toLocaleString()}\n` +
           `👆 **Clicks:** ${specificCampaign.total_clicks.toLocaleString()}\n` +
           `❤️ **Engagement:** ${specificCampaign.total_engagement.toLocaleString()}\n` +
           `📅 **Created:** ${new Date(specificCampaign.created_at).toLocaleDateString()}\n\n` +
           `Insight: This campaign is performing well. Consider reposting top content.`;
      } 
      // 2. Check general keywords
      else if (lastMsg.includes('performance') || lastMsg.includes('campaigns') || lastMsg.includes('stats')) {
         // Mock "query_analytics" execution
         const { data: campaigns } = await supabase
           .from('campaigns')
           .select('name, total_views, total_clicks, status')
           .eq('user_id', user.id)
           .order('total_views', { ascending: false })
           .limit(5);

         if (campaigns && campaigns.length > 0) {
           const stats = campaigns.map(c => `• **${c.name}** (${c.status})\n   👀 ${c.total_views.toLocaleString()} views | 👆 ${c.total_clicks.toLocaleString()} clicks`).join('\n\n');
           responseText = `Here is the performance of your top campaigns:\n\n${stats}\n\nWould you like to analyze a specific one?`;
         } else {
           responseText = "I found 0 campaigns. You haven't created any campaigns yet.";
         }
      } 
      // 3. Conversational Fallbacks
      else if (lastMsg.match(/^(hi|hello|hey|yo|greetings)/)) {
         responseText = "Hello! I'm ready to analyze your brand performance. Ask me anything about your campaigns.";
      }
      else if (lastMsg.match(/^(ok|thanks|thank you|cool|great|awesome)/)) {
         responseText = "You're welcome! Let me know if you want to see more stats.";
      }
      // 4. Actionable Advice
      else if (lastMsg.includes('how') || lastMsg.includes('repost') || lastMsg.includes('optimize') || lastMsg.includes('do that')) {
         if (lastMsg.includes('repost') || lastMsg.includes('content') || lastMsg.includes('do that')) {
            responseText = "To repost content:\n1. Go to **ContentFlow**.\n2. Find your top post.\n3. Click 'Duplicate' or use the **Reactor** to generate fresh variations based on the successful data.";
         } else if (lastMsg.includes('create') || lastMsg.includes('new')) {
            responseText = "You can start a new initiative by clicking the **+ New Campaign** button on individual pages or the main Dashboard.";
         } else {
            responseText = "I can guide you! Are you trying to **create** content, **repost** a winner, or **analyze** more data?";
         }
      }
      else if (lastMsg.length < 10 && !lastMsg.includes('?')) {
         responseText = "Could you be a bit more specific? I'm listening.";
      }
      else {
         responseText = "I'm running in **Offline Mode** right now 🤖, so I can't answer general questions yet.\n\nBut I *can* analyze your data! Try typing a specific campaign name (like 'Tech Demo Series') or ask 'Show me performance'.";
      }

      // Simulate streaming delay for realism (Offline Mode)
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          // Small delay to make it feel "thinking"
          await new Promise(resolve => setTimeout(resolve, 300));
          controller.enqueue(encoder.encode(responseText));
          controller.close();
        }
      });

      return new Response(readable, {
        headers: { 
          'X-Session-Id': sessionId,
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    }

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
