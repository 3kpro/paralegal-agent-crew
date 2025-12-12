import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

// Define the schema context for the AI
const DB_SCHEMA = `
Table: campaigns
Columns:
- id (uuid)
- user_id (uuid)
- name (text)
- status (text): 'draft', 'scheduled', 'published', 'completed', 'failed'
- type (text): 'full', 'single', 'trending', 'uploaded'
- scheduled_at (timestamp)
- published_at (timestamp)
- total_views (int)
- total_engagement (int)
- total_clicks (int)
- created_at (timestamp)

Table: generated_content (Post/Content items linked to campaigns)
Columns:
- id (uuid)
- campaign_id (uuid)
- content_text (text)
- platform (text)
- posted_at (timestamp)
- viral_score (float) - 0 to 100 predictions

Table: campaign_analytics (Daily stats)
Columns:
- id (uuid)
- campaign_id (uuid)
- date (date)
- views (int)
- likes (int)
- shares (int)
- comments (int)
- clicks (int)
`;

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

    // 2. Initialize AI
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return new Response('Configuration Error: Missing API Key', { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    // 3. Generate SQL using 2.0 Flash
    const systemPrompt = `You are an expert PostgreSQL Data Analyst.
Your task is to convert a natural language question into a valid, read-only SQL query.

Database Schema:
${DB_SCHEMA}

Rules:
1. Return ONLY the SQL query. No markdown formatting, no explanations.
2. The query MUST be read-only (SELECT only).
3. Always filter by user_id = '${user.id}' for 'campaigns' table queries to ensure data isolation.
   - Example: SELECT * FROM campaigns WHERE user_id = '${user.id}' ...
   - If querying joined tables, ensure the root campaign has user_id checked.
4. If a 'campaignId' is provided in the prompt context, filter by that specific campaign_id if relevant.
5. Use proper casting if comparing dates or UUIDs.
6. Return a query that aggregates data meaningfully if the question implies analytics (e.g. "total views" -> SUM(total_views)).
7. Limit results to 100 rows unless specified otherwise.

Current Context:
- User ID: ${user.id}
${campaignId ? `- Campaign ID Filter: ${campaignId}` : ''}
`;

    // Use generateObject to enforce a structured response containing the SQL
    // This is safer than plain text generation
    const { object: result } = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: z.object({
        sql: z.string().describe('The executable PostgreSQL SELECT statement'),
        explanation: z.string().describe('Brief explanation of what this query does'),
        chartType: z.enum(['bar', 'line', 'pie', 'table', 'number']).describe('Recommended visualization type for this data')
      }),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    });

    console.log('[NL2SQL] Generated:', result.sql);

    // 4. Execute SQL via RPC
    // Note: We use the `execute_readonly_sql` function we created in the migration
    // IMPORTANT: Strip trailing semicolon as it breaks the subquery in the RPC function
    const cleanSql = result.sql.trim().replace(/;$/, '');
    const { data: queryData, error: dbError } = await supabase.rpc('execute_readonly_sql', {
      query: cleanSql
    });

    if (dbError) {
      console.error('[NL2SQL] DB Error:', dbError);
      return new Response(JSON.stringify({ 
        error: 'Database execution failed', 
        details: dbError.message,
        sql: result.sql 
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      data: queryData,
      sql: result.sql,
      explanation: result.explanation,
      chartType: result.chartType
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[NL2SQL] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
