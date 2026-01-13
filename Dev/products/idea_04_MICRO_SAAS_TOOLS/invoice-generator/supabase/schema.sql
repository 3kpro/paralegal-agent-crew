-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create specific types
create type invoice_status as enum ('draft', 'sent', 'paid');

-- PROFILES (Next to Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  business_name text,
  business_address text,
  logo_url text, -- URL to Supabase Storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVOICES
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  invoice_number text not null, -- e.g. "INV-001"
  
  -- Client Details
  client_name text,
  client_email text,
  client_address text,
  
  -- Invoice Details
  status invoice_status default 'draft',
  date_issued date default CURRENT_DATE,
  date_due date,
  currency text default 'USD',
  template_id text default 'standard', -- 'standard', 'minimal', etc.
  
  -- Financials
  tax_rate numeric(5,2) default 0, -- Percentage
  subtotal numeric(12,2) default 0,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVOice Items
create table invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) default 0,
  amount numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Policies for Invoices
create policy "Users can view own invoices" on invoices
  for select using (auth.uid() = user_id);

create policy "Users can insert own invoices" on invoices
  for insert with check (auth.uid() = user_id);

create policy "Users can update own invoices" on invoices
  for update using (auth.uid() = user_id);

create policy "Users can delete own invoices" on invoices
  for delete using (auth.uid() = user_id);

-- Policies for Invoice Items
create policy "Users can view invoice items" on invoice_items
  for select using (
    exists ( select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid() )
  );

create policy "Users can insert invoice items" on invoice_items
  for insert with check (
    exists ( select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid() )
  );

create policy "Users can update invoice items" on invoice_items
  for update using (
    exists ( select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid() )
  );

create policy "Users can delete invoice items" on invoice_items
  for delete using (
    exists ( select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid() )
  );

-- Trigger to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure handle_updated_at();

create trigger invoices_updated_at
  before update on invoices
  for each row execute procedure handle_updated_at();

-- Trigger to create profile on signup (Optional, if using Supabase Auth strictly)
-- This assumes standard Supabase Auth behavior where a trigger on auth.users creates a profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
