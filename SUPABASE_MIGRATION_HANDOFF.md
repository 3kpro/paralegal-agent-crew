# Supabase Migration - Fix /api/usage Error

## Problem
- Production site throws 500 error on `/api/usage` endpoint
- Error occurs when users click "Upgrade" button
- Console shows: "Failed to load resource: the server responded with a status of 500"

## Root Cause
Missing database functions in production Supabase:
- `get_user_tier_limits(UUID)`
- `get_user_daily_usage(UUID)`
- `can_user_generate(UUID)`

These functions exist in migration file but were never run on production database.

## Solution
Run migration: `supabase/migrations/012_daily_usage_limits.sql`

## Instructions

### Option 1: Supabase Dashboard (Quickest)
1. Go to: https://supabase.com/dashboard/project/hvcmidkylzrhmrwyigqr
2. Click **SQL Editor** (left sidebar)
3. Open file: `c:\DEV\3K-Pro-Services\landing-page\supabase\migrations\012_daily_usage_limits.sql`
4. Copy all SQL content
5. Paste into SQL Editor
6. Click **Run**
7. Verify success message

### Option 2: Supabase CLI
```bash
cd c:\DEV\3K-Pro-Services\landing-page
supabase login
supabase link --project-ref hvcmidkylzrhmrwyigqr
supabase db push
```

## Verification
1. Hard refresh TrendPulse: https://trendpulse.3kpro.services (Ctrl+Shift+R)
2. Click "Upgrade" button
3. Should show pricing tiers without 500 error

## Database Info
- **Project Ref:** hvcmidkylzrhmrwyigqr
- **URL:** https://hvcmidkylzrhmrwyigqr.supabase.co
- **Anon Key:** (in .env.local)

## What the Migration Does
1. Creates `subscription_tiers` table (free/pro/premium limits)
2. Creates `daily_usage` table (tracks user consumption)
3. Creates 3 RPC functions for usage API endpoint
4. Sets up RLS policies
5. Seeds default tier data

## Notes
- Migration is idempotent (safe to run multiple times)
- No code deployment needed - backend issue only
- Error will disappear immediately after migration runs
