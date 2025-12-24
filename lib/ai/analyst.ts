import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';

// Define the Schema used for NL2SQL
export const ANALYST_DB_SCHEMA = `
Table: campaigns
Columns:
- id (uuid)
- user_id (uuid)
- name (text)
- status (text): 'draft', 'scheduled', 'published', 'archived'
- created_at (timestamp)
- total_views (int) -- Use this for overall 'views' or 'impressions'
- total_clicks (int) -- Use this for overall 'clicks'
- total_engagement (int) -- Use this for overall 'engagement'

Table: campaign_analytics
Columns:
- id (uuid)
- campaign_id (uuid)
- user_id (uuid)
- platform (text): 'twitter', 'linkedin', etc.
- tracked_at (timestamp) -- Use this for date/time trends
- impressions (int) -- Detailed view count for a specific date
- clicks (int)
- likes (int)
- shares (int)
- comments (int)
- engagement_rate (decimal)
- revenue_generated (decimal)
`;

export interface AnalystResult {
  sql: string;
  explanation: string;
  chartType: 'bar' | 'line' | 'pie' | 'number' | 'table';
  data: any[];
}

export async function generateAnalystQuery(
  question: string, 
  userId: string,
  supabase: SupabaseClient
): Promise<AnalystResult> {
  // Config AI with fallback keys
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Google AI API Key");
  
  const google = createGoogleGenerativeAI({ apiKey });
  const model = google('gemini-2.0-flash');

  const { object } = await generateObject({
    model,
    schema: z.object({
      sql: z.string(),
      explanation: z.string(),
      chartType: z.enum(['bar', 'line', 'pie', 'number', 'table']).describe('Best visualization for this data')
    }),
    system: `You are an expert SQL analyst using Supabase (PostgreSQL).
      Your goal is to generate a READ-ONLY SQL query to answer the user's question.
      
      SCHEMA:
      ${ANALYST_DB_SCHEMA}

      RULES:
      1. ALWAYS include "WHERE user_id = '${userId}'" to filter data. Security is critical.
      2. Use only SELECT statements. No UPDATE, DELETE, INSERT.
      3. For aggregate questions (e.g. "which is best?", "total views"), prefer the 'campaigns' table (total_views, total_clicks).
      4. For time-series trends (e.g. "by day", "this week") or platform-specific info, use the 'campaign_analytics' table.
      5. For time series, group by date_trunc('day', tracked_at) and order by date.
      6. For 'impressions', use "total_views" in 'campaigns' or "sum(impressions)" in 'campaign_analytics'.
      7. For 'tracked_at', cast as date (e.g. tracked_at::date as "date").
      8. For "oldest" or "newest" queries, ORDER BY created_at ASC/DESC and LIMIT 1.
      9. For specific single records (top performing, oldest, etc), SELECT name and the relevant metric/date.
      10. Return valid JSON with 'sql', 'explanation' and 'chartType'.
    `,
    prompt: question
  });

  // Execute SQL
  // Note: execute_readonly_sql must be defined in Supabase RPC
  const { data, error } = await supabase.rpc('execute_readonly_sql', {
    query: object.sql
  });

  if (error) {
    throw new Error(`SQL Execution Failed: ${error.message} (Query: ${object.sql})`);
  }

  return {
    ...object,
    data: data || []
  };
}
