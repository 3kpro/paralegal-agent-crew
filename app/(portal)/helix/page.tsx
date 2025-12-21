import { createClient } from '@/lib/supabase/server';
import HelixChatInterface from '@/components/helix/HelixChatInterface';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HelixPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch latest session for the user
  const { data: lastSession } = await supabase
    .from('helix_sessions')
    .select('id')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  let initialMessages: any[] = [];
  let sessionId = null;

  if (lastSession) {
    sessionId = lastSession.id;
    
    // Fetch last 50 messages from this session
    const { data: messages } = await supabase
      .from('helix_messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(50);
      
    if (messages) {
      initialMessages = messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        // Ensure strictly required fields for Vercel AI SDK
      }));
    }
  }

  return (
    <HelixChatInterface 
      initialMessages={initialMessages} 
      initialSessionId={sessionId} 
      user={user} 
    />
  );
}
