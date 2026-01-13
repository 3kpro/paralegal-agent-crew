-- Add Subscription Fields to Profiles
alter table profiles 
add column if not exists stripe_customer_id text,
add column if not exists subscription_status text default 'inactive', -- 'active', 'inactive', 'lifetime'
add column if not exists subscription_id text,
add column if not exists plan_type text; -- 'monthly', 'lifetime'

-- Index for faster lookups
create index if not exists idx_profiles_stripe_customer_id on profiles(stripe_customer_id);

-- Update RLS if needed (already users can view own profile, so they can view these fields)
