-- Helix AI Assistant Schema

-- 1. Helix Brand DNA
-- Stores the "learned" personality and rules for a user/brand.
create table public.helix_brand_dna (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Core Identity
  brand_name text,
  brand_voice text, -- e.g., "Professional, Witty, Authoritative"
  target_audience text,
  
  -- The "DNA" (JSON blob for flexible attribute storage)
  -- Structure: { "keywords": [], "forbidden_words": [], "emoji_usage": "moderate", "sentence_length": "short" }
  dna_attributes jsonb default '{}'::jsonb,
  
  -- Status
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  primary key (id),
  unique (user_id) -- One DNA profile per user for now (can expand to multi-brand later)
);

-- 2. Helix Knowledge Base
-- Stores references to documents/text that Helix uses for context (RAG).
create table public.helix_knowledge_base (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  title text not null,
  content_type text not null, -- 'text', 'pdf_extract', 'url_scrape', 'video_transcript'
  content_text text not null, -- The actual text content to feed the LLM
  
  -- Metadata
  source_url text,
  token_count integer,
  
  created_at timestamptz default now(),
  
  primary key (id)
);

-- 3. Helix Chat Sessions
-- Groups messages into conversations.
create table public.helix_sessions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  title text, -- Auto-generated summary of the chat
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  
  primary key (id)
);

-- 4. Helix Chat Messages
-- The actual conversation history.
create table public.helix_messages (
  id uuid not null default gen_random_uuid(),
  session_id uuid not null references public.helix_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  
  -- Metadata for "Grounding" (e.g., citations, search results used)
  metadata jsonb default '{}'::jsonb,
  
  created_at timestamptz default now(),
  
  primary key (id)
);

-- Enable RLS
alter table public.helix_brand_dna enable row level security;
alter table public.helix_knowledge_base enable row level security;
alter table public.helix_sessions enable row level security;
alter table public.helix_messages enable row level security;

-- RLS Policies (Simple: Users can only see their own data)

-- Brand DNA
create policy "Users can view own brand dna" 
  on public.helix_brand_dna for select 
  using (auth.uid() = user_id);

create policy "Users can update own brand dna" 
  on public.helix_brand_dna for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own brand dna" 
  on public.helix_brand_dna for update 
  using (auth.uid() = user_id);

-- Knowledge Base
create policy "Users can view own knowledge base" 
  on public.helix_knowledge_base for select 
  using (auth.uid() = user_id);

create policy "Users can insert own knowledge base" 
  on public.helix_knowledge_base for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete own knowledge base" 
  on public.helix_knowledge_base for delete 
  using (auth.uid() = user_id);

-- Sessions
create policy "Users can view own sessions" 
  on public.helix_sessions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own sessions" 
  on public.helix_sessions for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete own sessions" 
  on public.helix_sessions for delete 
  using (auth.uid() = user_id);

-- Messages
create policy "Users can view own messages" 
  on public.helix_messages for select 
  using (auth.uid() = user_id);

create policy "Users can insert own messages" 
  on public.helix_messages for insert 
  with check (auth.uid() = user_id);
