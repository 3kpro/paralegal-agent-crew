# Database Schema - OAuth Token Manager

## Extensions
Run these to enable required features:
```sql
-- For encrypted secrets
create extension if not exists "vault" with schema "vault";

-- For UUID generation
create extension if not exists "uuid-ossp";
```

## Tables

### `public.connections`
Stores the metadata for each social media connection. The actual tokens are stored in the `vault`.

```sql
create table public.connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  platform text not null, -- 'instagram', 'tiktok', 'linkedin', 'twitter'
  platform_user_id text, -- ID of the user on that platform
  platform_username text, -- Display name/handle
  status text check (status in ('active', 'expired', 'error')) default 'active',
  error_message text,
  
  -- Secrets references (managed via vault)
  access_token_secret_id uuid, -- Reference to vault.secrets.id
  refresh_token_secret_id uuid, -- Reference to vault.secrets.id
  
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.connections enable row level security;

-- Policies
create policy "Users can see only their own connections"
  on public.connections for select
  using (auth.uid() = user_id);

create policy "Users can delete their own connections"
  on public.connections for delete
  using (auth.uid() = user_id);
```

### `public.refresh_logs`
Audit log for token refresh attempts.

```sql
create table public.refresh_logs (
  id uuid primary key default uuid_generate_v4(),
  connection_id uuid references public.connections(id) on delete cascade,
  status text check (status in ('success', 'failure')),
  response_body jsonb, -- Log provider responses for debugging
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.refresh_logs enable row level security;

-- Policies
create policy "Users can see logs for their own connections"
  on public.refresh_logs for select
  using (
    exists (
      select 1 from public.connections 
      where connections.id = refresh_logs.connection_id 
      and connections.user_id = auth.uid()
    )
  );
```

## Helper Functions (Example)

### `update_connection_tokens`
A function to securely update tokens in the vault and the connection metadata.

```sql
-- This would be called by the Edge Function via RPC with service_role
create or replace function public.update_tokens(
  p_connection_id uuid,
  p_access_token text,
  p_refresh_token text,
  p_expires_in int -- seconds
) returns void as $$
declare
  v_access_id uuid;
  v_refresh_id uuid;
begin
  -- 1. Upsert/Update secrets in vault.secrets
  -- Note: Implementation details vary based on how you want to manage vault entries.
  
  -- 2. Update connection meta
  update public.connections
  set 
    expires_at = now() + (p_expires_in || ' seconds')::interval,
    updated_at = now(),
    status = 'active'
  where id = p_connection_id;
end;
$$ language plpgsql security definer;
```
### `get_refresh_token`
Securely retrieves the refresh token for a connection.

```sql
create or replace function public.get_refresh_token(p_connection_id uuid)
returns text as $$
declare
  v_secret_id uuid;
  v_token text;
begin
  -- 1. Get the secret ID from connections
  select refresh_token_secret_id into v_secret_id
  from public.connections
  where id = p_connection_id;
  
  if v_secret_id is null then
    return null;
  end if;

  -- 2. Retrieve and decrypt from vault
  select decrypted_secret into v_token
  from vault.decrypted_secrets
  where id = v_secret_id;

  return v_token;
end;
$$ language plpgsql security definer;
```
### `get_access_token`
Securely retrieves the access token for a connection.

```sql
create or replace function public.get_access_token(p_connection_id uuid)
returns text as $$
declare
  v_secret_id uuid;
  v_token text;
begin
  select access_token_secret_id into v_secret_id
  from public.connections
  where id = p_connection_id;
  
  if v_secret_id is null then
    return null;
  end if;

  select decrypted_secret into v_token
  from vault.decrypted_secrets
  where id = v_secret_id;

  return v_token;
end;
$$ language plpgsql security definer;
```
