import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HelixAgentManager } from '@/lib/helix/agent-manager';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, sessionId: providedSessionId, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 2. Manage Session
    let sessionId = providedSessionId;
    if (!sessionId) {
      // Create a new session if none provided
      const { data: session, error: sessionError } = await supabase
        .from('helix_sessions')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + '...' // Initial title from first message
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }
      sessionId = session.id;
    }

    // 3. Process with Helix Agent
    const agent = new HelixAgentManager();
    
    // Note: In a real production app, we might want to reuse the agent instance 
    // or cache it, but for serverless functions, instantiating per request is standard 
    // unless we use a separate backend service.
    
    const responseText = await agent.processMessage(user.id, sessionId, message, context);

    return NextResponse.json({ 
      response: responseText,
      sessionId: sessionId 
    });

  } catch (error: any) {
    console.error('Helix API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
