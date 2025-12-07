# NL2SQL Trend Analyst - Implementation Scaffold for Gemini

**From:** Claude (Sonnet 4.5)
**To:** Gemini 2.0 Flash (Lead Engineer)
**Date:** 2025-12-06
**Purpose:** Structured implementation guide for NL2SQL feature

---

## 🎯 Project Scope

Build an **NL2SQL Trend Analyst** that allows TrendPulse users to query their campaign data using natural language.

**Core Value Proposition:**
- Users ask: "Show me top 5 viral trends from last week that failed to convert"
- Agent generates SQL → Executes query → Returns visualized data

---

## 🏗️ Recommended Architecture (Google-First Approach)

Since this is **your territory** (Google Cloud ecosystem), here's a scaffold optimized for Google tools:

### **Tech Stack Recommendation**

```yaml
NL2SQL Layer:
  - Model: Gemini 2.0 Flash (your specialty)
  - Framework: Vertex AI Agent Builder (or direct Gemini API)

Data Layer:
  - Primary DB: Supabase PostgreSQL (existing)
  - Analytics: BigQuery (for ML/aggregations)
  - Sync: Supabase → BigQuery (scheduled jobs)

Security:
  - Read-only DB role
  - Vertex AI safety filters
  - Rate limiting via Cloud Run

Visualization:
  - Recharts (existing frontend library)
  - OR Google Charts API
```

---

## 📋 Implementation Checklist

### **Phase 1: MVP NL2SQL (Week 1-2)**

**Backend Setup:**
```typescript
// File: app/api/analyst/query/route.ts

import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { question, userId } = await req.json();

  // 1. Load database schema
  const schema = await getSchemaContext();

  // 2. Generate SQL with Gemini
  const vertexAI = new VertexAI({ project: 'your-project', location: 'us-central1' });
  const model = vertexAI.preview.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a SQL expert for TrendPulse analytics.

Database Schema:
${schema}

User Question: "${question}"

Generate a SAFE, READ-ONLY PostgreSQL SELECT query.
Return ONLY the SQL query, no explanations.`;

  const result = await model.generateContent(prompt);
  const sqlQuery = extractSQL(result.response.text());

  // 3. Validate query safety
  if (!isSafeQuery(sqlQuery)) {
    return Response.json({ error: 'Unsafe query detected' }, { status: 400 });
  }

  // 4. Execute via Supabase
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('execute_readonly', { query: sqlQuery });

  return Response.json({ data, sqlQuery });
}
```

**Database Security:**
```sql
-- File: supabase/migrations/XXX_readonly_analyst.sql

-- Create read-only execution function
CREATE OR REPLACE FUNCTION execute_readonly(query text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Block destructive operations
  IF query ~* '(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|GRANT|REVOKE|TRUNCATE)' THEN
    RAISE EXCEPTION 'Only SELECT queries allowed';
  END IF;

  -- Execute in read-only mode
  SET TRANSACTION READ ONLY;
  EXECUTE format('SELECT jsonb_agg(t) FROM (%s) t', query) INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users only
GRANT EXECUTE ON FUNCTION execute_readonly TO authenticated;
```

**Frontend Component:**
```typescript
// File: components/analyst/NL2SQLQuery.tsx

'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function NL2SQLQuery() {
  const [question, setQuestion] = useState('');
  const [data, setData] = useState(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    setLoading(true);
    const res = await fetch('/api/analyst/query', {
      method: 'POST',
      body: JSON.stringify({ question })
    });
    const { data, sqlQuery } = await res.json();
    setData(data);
    setSqlQuery(sqlQuery);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2>🔍 Trend Analyst</h2>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about your campaigns..."
        className="w-full p-3 border rounded"
      />

      <button onClick={handleQuery} disabled={loading}>
        {loading ? 'Analyzing...' : 'Ask'}
      </button>

      {sqlQuery && (
        <details className="mt-4">
          <summary>Generated SQL</summary>
          <pre className="bg-gray-100 p-2">{sqlQuery}</pre>
        </details>
      )}

      {data && (
        <BarChart width={600} height={300} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      )}
    </div>
  );
}
```

---

### **Phase 2: BigQuery Sync for ML (Week 3)**

**Why BigQuery?**
- Better for ML training (BigQuery ML)
- Faster aggregations on large datasets
- Separates analytics workload from transactional DB

**Setup:**
```typescript
// File: scripts/sync-to-bigquery.ts

import { BigQuery } from '@google-cloud/bigquery';
import { createClient } from '@supabase/supabase-js';

const bigquery = new BigQuery();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function syncCampaigns() {
  // 1. Fetch from Supabase
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .gte('updated_at', getLastSyncTime());

  // 2. Insert into BigQuery
  await bigquery
    .dataset('trendpulse')
    .table('campaigns')
    .insert(data);

  console.log(`Synced ${data.length} campaigns to BigQuery`);
}

// Run daily via Cloud Scheduler
syncCampaigns();
```

**BigQuery Schema:**
```sql
-- Create dataset
CREATE SCHEMA IF NOT EXISTS trendpulse;

-- Create campaigns table
CREATE OR REPLACE TABLE trendpulse.campaigns (
  id STRING,
  user_id STRING,
  title STRING,
  viral_score INT64,
  actual_engagement STRUCT<
    views INT64,
    likes INT64,
    shares INT64
  >,
  created_at TIMESTAMP,
  platform STRING
);
```

---

### **Phase 3: Predictive Modeling (Week 4-5)**

**BigQuery ML Model:**
```sql
-- Train viral score predictor
CREATE OR REPLACE MODEL trendpulse.viral_predictor
OPTIONS(
  model_type='boosted_tree_regressor',
  input_label_cols=['actual_engagement_score']
) AS
SELECT
  viral_score,
  hook_score,
  emotional_score,
  platform,
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  EXTRACT(DAYOFWEEK FROM created_at) as day_of_week,
  (actual_engagement.views + actual_engagement.likes * 10 + actual_engagement.shares * 50) as actual_engagement_score
FROM trendpulse.campaigns
WHERE actual_engagement IS NOT NULL;

-- Get feature importance
SELECT * FROM ML.FEATURE_IMPORTANCE(MODEL trendpulse.viral_predictor);

-- Make predictions
SELECT
  title,
  viral_score as predicted_score,
  predicted_actual_engagement_score
FROM ML.PREDICT(MODEL trendpulse.viral_predictor, (
  SELECT * FROM trendpulse.campaigns WHERE actual_engagement IS NULL
));
```

**Feedback Loop API:**
```typescript
// File: app/api/analyst/retrain/route.ts

import { BigQuery } from '@google-cloud/bigquery';

export async function POST(req: Request) {
  const bigquery = new BigQuery();

  // 1. Get feature importance from current model
  const [importance] = await bigquery.query(`
    SELECT * FROM ML.FEATURE_IMPORTANCE(MODEL trendpulse.viral_predictor)
    ORDER BY importance_weight DESC
  `);

  // 2. Calculate new weights based on importance
  const newWeights = {
    hook: importance.find(f => f.feature === 'hook_score').importance_weight,
    emotional: importance.find(f => f.feature === 'emotional_score').importance_weight,
    platform: importance.find(f => f.feature === 'platform').importance_weight,
  };

  // 3. Update scoring algorithm
  await updateViralScoreWeights(newWeights);

  return Response.json({ success: true, newWeights });
}
```

---

## 🔐 Security Checklist

- [ ] Read-only database role created
- [ ] SQL injection validation (regex + LLM)
- [ ] Rate limiting (50 queries/hour per user)
- [ ] Vertex AI safety filters enabled
- [ ] User authentication required
- [ ] Query execution timeout (5 seconds)
- [ ] Logging all generated SQL queries
- [ ] No access to sensitive user data (passwords, tokens)

---

## 📊 Success Metrics

**Phase 1 (NL2SQL):**
- Users can ask 10+ different question types
- 95% query success rate
- <2 second response time

**Phase 2 (BigQuery Sync):**
- Daily sync completes in <5 minutes
- Zero data loss during sync

**Phase 3 (ML):**
- Model accuracy: >80% correlation with actual engagement
- Viral score weights auto-adjust monthly
- User retention increases 15%+ (users return to see predictions vs actuals)

---

## 🚀 Deployment Strategy

### **Option A: Cloud Run (Recommended)**
```yaml
# cloud-run-analyst.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: trendpulse-analyst
spec:
  template:
    spec:
      containers:
      - image: gcr.io/your-project/trendpulse-analyst
        env:
        - name: GOOGLE_CLOUD_PROJECT
          value: your-project-id
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: supabase-creds
              key: url
```

### **Option B: Integrate into Next.js App**
- Deploy API routes to Vercel
- Use Vertex AI via REST API (not Node SDK due to Vercel limitations)
- BigQuery queries via HTTP API

---

## 🎁 Suggested Enhancements (Future)

1. **Natural Language Insights:**
   - After query, have Gemini summarize findings in plain English
   - "Your SaaS campaigns perform 3x better on Tuesday mornings"

2. **Query Suggestions:**
   - Show common questions: "What's my best-performing platform?"
   - Learn from user history

3. **Multi-turn Conversations:**
   - "Show me campaigns from last month"
   - → "Which ones had viral score >80?"
   - → "Compare those to this month"

4. **Saved Reports:**
   - Users can save frequently-used queries
   - Schedule weekly email reports

---

## 📝 Handoff Notes for Gemini

**What You Have:**
- ✅ Existing Supabase schema (campaigns, posts, users)
- ✅ Gemini API key already configured
- ✅ Next.js 16 app with App Router
- ✅ User authentication via Supabase

**What You Need to Build:**
1. `app/api/analyst/query/route.ts` - NL2SQL endpoint
2. `components/analyst/NL2SQLQuery.tsx` - Frontend interface
3. `supabase/migrations/XXX_readonly_analyst.sql` - Security layer
4. BigQuery setup (optional for Phase 2)

**Google Cloud Resources to Leverage:**
- Vertex AI Generative AI API (you're the expert here)
- BigQuery ML (for predictive modeling)
- Cloud Scheduler (for daily syncs)
- Cloud Run (if deploying separate from Vercel)

**Coordination with Claude:**
We're continuing work on the Helix AI assistant (different feature). You own this NL2SQL initiative end-to-end.

---

## ✅ Ready to Start?

This scaffold gives you:
- ✅ Complete architecture
- ✅ Code samples for all 3 phases
- ✅ Security considerations
- ✅ Deployment options
- ✅ Success metrics

**Recommended First Step:**
Build Phase 1 MVP (NL2SQL only) in a new branch: `feature/nl2sql-analyst`

Questions? Ping the user or coordinate async via these docs.

**Good luck! 🚀**

---

*Generated by Claude Sonnet 4.5 - 2025-12-06*
