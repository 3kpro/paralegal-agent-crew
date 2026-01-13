# Token Storage Strategy - OAuth Token Manager

## Research: Encryption at Rest in Supabase

### 1. Transparent Data Encryption (TDE)
Supabase (built on AWS/GCP/Azure RDS) uses AES-256 encryption at rest for all database disks, backups, and logs by default. This protects against physical theft of drives.

### 2. Application-Level Encryption (Recommended)
To protect sensitive OAuth tokens even from database administrators or in case of a SQL injection vulnerability that leaks table data, we will implement **Application-Level Encryption**.

### 3. Implementation Options

#### Option A: Supabase Vault (Recommended)
- uses the `pg_vault` extension.
- Secrets are stored in a dedicated `vault.secrets` table.
- Secrets are encrypted using a key managed by Supabase (KMS).
- Access is controlled via SQL functions.
- **Pros:** Native to Supabase, easy to use, highly secure.
- **Cons:** Slightly more complex to query compared to plain text.

#### Option B: pgcrypto Extension
- Use `pgp_sym_encrypt()` and `pgp_sym_decrypt()`.
- We would need to manage a "Master Key" (e.g., in a Supabase Secret / Env Var).
- **Pros:** Full control over algorithms.
- **Cons:** Managing the key securely is our responsibility.

## Selected Strategy: Supabase Vault

We will use the **Supabase Vault** extension to store the `access_token` and `refresh_token` for each connected platform.

### Database Schema Plan
- `public.connections`: Stores metadata (platform name, owner_id, status, last_refresh).
- `vault.secrets`: Stores the actual encrypted tokens, linked via a `connection_id` tag or a reference table.

### Refresh Flow (Edge Functions)
1. Edge Function wakes up (Cron).
2. Queries `public.connections` for tokens nearing expiry.
3. Calls a Postgres Function to retrieve and decrypt the token from `vault.secrets`.
4. Performs OAuth refresh with the provider (TikTok/LinkedIn/etc).
5. Updates `vault.secrets` with the new token.
6. Updates `public.connections` with the new expiry timestamp.
