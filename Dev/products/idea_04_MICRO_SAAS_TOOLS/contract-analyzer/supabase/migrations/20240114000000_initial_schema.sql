-- Create private schema for local logic that shouldn't be exposed
create schema if not exists private;

-- Grant access to schemas
grant usage on schema public to postgres, anon, authenticated, service_role;

-- USERS TABLE (Syncs with Clerk or Auth Provider)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null, -- External Auth ID (e.g., Clerk ID)
  email text,
  full_name text,
  subscription_status text default 'free', -- free, monthly, lifetime
  subscription_id text, -- Stripe Subscription ID
  customer_id text, -- Stripe Customer ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ANALYSES TABLE (Stores analysis history)
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(user_id) on delete cascade not null,
  file_name text not null,
  file_type text not null, -- pdf, docx, txt
  risk_score integer, -- 0-100 score
  risks_detected jsonb default '[]'::jsonb, -- Stored JSON response from Claude
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TEMPLATES TABLE (Core assets)
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null, -- NDA, Service, etc.
  description text,
  file_url text not null, -- URL to download/view
  is_premium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.analyses enable row level security;
alter table public.templates enable row level security;

-- USERS POLICIES
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid()::text = user_id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid()::text = user_id);

-- ANALYSES POLICIES
create policy "Users can view their own analyses"
  on public.analyses for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own analyses"
  on public.analyses for insert
  with check (auth.uid()::text = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  using (auth.uid()::text = user_id);

-- TEMPLATES POLICIES
create policy "Templates are readable by everyone"
  on public.templates for select
  using (true);
