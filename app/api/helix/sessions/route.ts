import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch recent messages to derive active sessions
  const { data: messages, error } = await supabase
    .from('helix_messages')
    .select('session_id, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Derive unique sessions
  const sessionsMap = new Map();
  messages?.forEach((msg: any) => {
    if (!sessionsMap.has(msg.session_id)) {
      sessionsMap.set(msg.session_id, {
        id: msg.session_id,
        snippet: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
        updatedAt: msg.created_at
      });
    }
  });

  return NextResponse.json({ sessions: Array.from(sessionsMap.values()) });
}
