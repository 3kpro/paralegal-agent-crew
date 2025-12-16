import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAnalystQuery } from '../../../../lib/ai/analyst';

// Define the schema context for the AI


export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { question, campaignId } = await req.json();

    if (!question) {
      return new Response('Question is required', { status: 400 });
    }

    // 3. Delegate to Shared Logic
    const result = await generateAnalystQuery(question, user.id, supabase);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[NL2SQL] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
