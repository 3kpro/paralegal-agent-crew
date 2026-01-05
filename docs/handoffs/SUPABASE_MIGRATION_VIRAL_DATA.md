# Migration Request: Viral Content Training Database
**Context:**  
We are building a "Viral Score™" feature that predicts content performance. To train this model, we are collecting a benchmark dataset of proven viral posts from public sources (Reddit, etc.).

We need a table to store this training data.

---

### **Task: Create `viral_content_training` Table**

Please execute the following SQL migration to create the repository for our benchmark data.

```sql
-- Migration: Create viral_content_training table
-- Purpose: Store high-performing content from external sources (Reddit, etc.) to train Viral Score models.

create table if not exists public.viral_content_training (
  id uuid default gen_random_uuid() primary key,
  external_id text not null, -- ID from the source (e.g. Reddit post ID)
  title text not null,
  content text, -- Body content if available
  score integer default 0, -- Upvotes/Likes
  comment_count integer default 0,
  source text not null, -- 'reddit', 'twitter', etc.
  sub_source text, -- Subreddit name, etc.
  url text,
  viral_type text, -- 'top_all_time', 'top_day', 'rising'
  published_at timestamptz,
  created_at timestamptz default now(),
  
  -- Prevent duplicates from same source
  constraint viral_content_training_unique_source_id unique (source, external_id)
);

-- Enable RLS (Row Level Security)
alter table public.viral_content_training enable row level security;

-- Policies:
-- 1. "Service role write access": Allows our background scraper (using service_role key) to insert/update data.
create policy "Service role write access"
  on public.viral_content_training for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 2. "Public read access": Allows the frontend/AI to read this data for analysis (optional, but good for transparency).
create policy "Public read access"
  on public.viral_content_training for select
  using (true);

-- Indexes for performance:
-- Crucial for querying "Give me the top scoring posts" quickly.
create index if not exists viral_content_score_idx on public.viral_content_training (score desc);
create index if not exists viral_content_source_idx on public.viral_content_training (source, sub_source);
create index if not exists viral_content_published_idx on public.viral_content_training (published_at desc);
```

**Verification:**
After running, please confirm the table exists and RLS is enabled.
