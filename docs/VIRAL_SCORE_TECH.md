# Viral Score™ Technical Architecture

**The Data-Driven Viral Prediction Engine Behind XELORA**

---

## The Problem We Solve

Most "viral prediction" tools use simple heuristics:
- "This topic is trending" (lagging indicator)
- "Use these hashtags" (correlation ≠ causation)
- "Post at this time" (generic advice)

**XELORA is different.** We don't guess what *might* go viral. We analyze what *actually* went viral—and match your content against proven patterns.

---

## The Technical Stack

### 1. Training Data Pipeline

```
Reddit JSON API → Data Collector → Supabase (viral_content_training)
```

**Data Sources (V1):**
- r/entrepreneur (startup/business content)
- r/marketing (marketing insights)
- r/technology (tech trends)
- r/business (general business)
- r/startups (early-stage content)
- r/productivity (workflow/life hacks)
- r/copywriting (headline techniques)
- r/socialmedia (platform strategies)
- r/content_marketing (content strategy)
- r/smallbusiness (SMB insights)

**Collection Strategy:**
- **Backfill Mode:** "Top of All Time" posts (10K+ upvotes) — The "Structural Brain"
- **Daily Mode:** "Top of Day" posts — The "Topical Brain"

**Quality Filters:**
- Minimum 50 upvotes
- Title length > 10 characters
- Unique constraint on (source, external_id) prevents duplicates

**Target Dataset:** 10,000+ proven viral headlines

---

### 2. Database Schema

```sql
create table viral_content_training (
  id uuid primary key,
  external_id text not null,        -- Reddit post ID
  title text not null,              -- The viral headline
  content text,                     -- Body (if available)
  score integer,                    -- Upvotes at collection time
  comment_count integer,            -- Engagement depth
  source text,                      -- 'reddit'
  sub_source text,                  -- 'r/entrepreneur', etc.
  url text,                         -- Original post URL
  viral_type text,                  -- 'top_all_time' or 'top_day'
  published_at timestamptz,         -- When it was posted
  created_at timestamptz            -- When we collected it
);
```

**Indexes for Performance:**
- `score DESC` — Fast "top performing" queries
- `(source, sub_source)` — Filter by platform/community
- `published_at DESC` — Temporal analysis

---

### 3. Benchmark Matching Engine

```typescript
// lib/viral-benchmarks.ts

// Find similar viral posts using full-text search
async function findSimilarViralHooks(topic: string, limit: number = 3)

// Return confidence boost (0-20 points) based on match quality
async function getBenchmarkScore(title: string): Promise<number>
```

**Scoring Tiers:**
| Match Quality | Score Boost | Condition |
|---------------|-------------|-----------|
| Massive Hit   | +20 points  | maxScore > 10,000 upvotes |
| Proven Hit    | +10 points  | maxScore > 1,000 upvotes |
| Some Traction | +5 points   | Any matches found |
| No Match      | +0 points   | No similar content in DB |

---

### 4. Viral Score™ Algorithm (5-Factor)

| Factor | Max Points | What It Measures |
|--------|------------|------------------|
| Volume | 10 | Audience size / search volume |
| Multi-Source | 10 | Cross-platform validation |
| Freshness | 10 | How new the trend is |
| Keywords | 15 | Viral trigger words (AI, hack, secret) |
| **Benchmark Match** | 20 | **Similarity to proven viral content** |

**Total: 65 base points + AI Analysis (up to 35) = 100 max**

---

## V2 Roadmap: Vector Embeddings

**Current Limitation:** Full-text search finds keyword matches but misses semantic similarity.

Example problem:
- "How I made $10K in a weekend" won't match "My weekend side hustle paid my rent"
- Both have the same viral pattern, different words

**V2 Solution:**
```
OpenAI text-embedding-3-small → pgvector → Semantic similarity search
```

This upgrade will dramatically improve pattern matching by understanding *meaning*, not just keywords.

---

## Why This Matters

### For Users
- **Confidence:** "This topic matched 847 posts that got 10K+ upvotes"
- **Specificity:** Not just "trending" — proven to perform in specific communities
- **Actionable:** "Add hot keywords for +15 bonus points"

### For Investors/Partners
- **Data Moat:** 10K+ curated viral posts (growing daily)
- **Defensibility:** Proprietary training data + scoring algorithm
- **Scalability:** Add Twitter, LinkedIn, TikTok data for cross-platform intelligence

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Training Posts | 10,000+ |
| Source Communities | 10 subreddits |
| Update Frequency | Daily |
| Query Latency | < 100ms |
| Score Accuracy | Pattern-matched, not predicted |

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/collect-viral-data.ts` | Data collection script |
| `lib/viral-benchmarks.ts` | Benchmark matching library |
| `supabase/migrations/014_viral_content_training.sql` | Database schema |
| `docs/handoffs/SUPABASE_MIGRATION_VIRAL_DATA.md` | Migration instructions |

---

*XELORA Viral Score™ — Predict viral. Don't guess.*
