import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DbTestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Not logged in</div>;

  // 1. Create test session
  const { data: session, error: sessionError } = await supabase
    .from('helix_sessions')
    .insert({
      user_id: user.id,
      title: 'DB Test Session ' + new Date().toISOString()
    })
    .select()
    .single();

  if (sessionError) return <div>Session Error: {JSON.stringify(sessionError)}</div>;

  // 2. Insert test message
  const { data: msg, error: msgError } = await supabase
    .from('helix_messages')
    .insert({
      session_id: session.id,
      user_id: user.id,
      role: 'user',
      content: 'Test Persistence'
    })
    .select()
    .single();

  if (msgError) return <div>Message Error: {JSON.stringify(msgError)}</div>;

  // 3. Fetch back
  const { data: fetchedMsg } = await supabase
    .from('helix_messages')
    .select('*')
    .eq('id', msg.id)
    .single();

  return (
    <div className="p-10 text-white">
      <h1>DB Test Result</h1>
      <pre className="bg-gray-800 p-4 rounded mt-4">
        User ID: {user.id}
        Session ID: {session.id}
        Message Inserted: {msg.id}
        Message Fetched: {fetchedMsg?.content}
      </pre>
    </div>
  );
}
