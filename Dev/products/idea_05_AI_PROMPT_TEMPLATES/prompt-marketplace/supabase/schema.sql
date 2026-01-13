
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;

-- 2. Prompts
create table public.prompts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  full_text text not null, -- The actual prompt content
  category text not null,
  price integer not null, -- Stored in cents (e.g., 900 = $9.00)
  example_output text,
  use_cases text[], -- Array of strings
  is_active boolean default true,
  slug text unique, -- for friendly URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.prompts enable row level security;

-- 3. Bundles
create table public.bundles (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  price integer not null, -- Stored in cents
  is_active boolean default true,
  slug text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.bundles enable row level security;

-- 4. Bundle Items (Many-to-Many)
create table public.bundle_items (
  bundle_id uuid references public.bundles(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  primary key (bundle_id, prompt_id)
);
alter table public.bundle_items enable row level security;

-- 5. Purchases
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  -- Flexible polymorphic relation or specific columns?
  -- Let's go specific for query speed on this MVP
  prompt_id uuid references public.prompts(id),
  bundle_id uuid references public.bundles(id),
  
  stripe_payment_id text not null,
  amount_paid integer not null, -- in cents
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraint: Must generally have either prompt_id or bundle_id
  constraint purchase_target_check check (
    (prompt_id is not null and bundle_id is null) or
    (prompt_id is null and bundle_id is not null)
  )
);
alter table public.purchases enable row level security;

-- RLS Policies (Basic)

-- Profiles: Users can read/update their own data
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using ( true );

create policy "Users can insert their own profile." on public.profiles
  for insert with check ( auth.uid() = id );

create policy "Users can update own profile." on public.profiles
  for update using ( auth.uid() = id );

-- Prompts/Bundles: Publicly readable active items
create policy "Active prompts are readable by everyone." on public.prompts
  for select using ( is_active = true );

create policy "Active bundles are readable by everyone." on public.bundles
  for select using ( is_active = true );

create policy "Bundle items are readable by everyone." on public.bundle_items
  for select using ( true );

-- Purchases: Users can see their own purchases
create policy "Users can see own purchases." on public.purchases
  for select using ( auth.uid() = user_id );

-- Insert only by service role (via webhook usually), but for MVP maybe allow server-side calls
-- Typically purchases are inserted by the server after stripe webhook verification.
