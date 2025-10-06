# Supabase Database Issue - Handoff Document

**Date**: December 2024  
**Issue**: "Database error updating user" during signup flow  
**Status**: Environment configured, database migration required  
**Priority**: High - Blocks user registration

---

## Issue Summary

The Premium upgrade functionality is working correctly, but user authentication is failing with "Database error updating user" during the signup process. This prevents users from accessing the protected `/settings` route where Premium upgrades are available.

**Current Environment Status**:
- ✅ Next.js application running properly on `localhost:3000`
- ✅ Supabase credentials configured in `.env.local`
- ✅ Stripe integration working and tested
- ❌ Database tables missing or incorrectly configured
- ❌ User registration failing

---

## Current Configuration

### Supabase Project Details
- **URL**: `https://hvcmidkylzrhmrwyigqr.supabase.co`
- **Project ID**: `hvcmidkylzrhmrwyigqr`
- **Environment**: Development (anon key configured)

### Environment Variables (Configured)
```env
NEXT_PUBLIC_SUPABASE_URL=https://hvcmidkylzrhmrwyigqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Y21pZGt5bHpyaG1yd3lpZ3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTI2NTEsImV4cCI6MjA3NTEyODY1MX0.3HNj-ktNjtM42bh6Ac5wGBKXiOLcNrN0S4ohazJpEdc
```

### Code Integration Status
- ✅ Client-side Supabase config: `/lib/supabase/client.ts`
- ✅ Server-side Supabase config: `/lib/supabase/server.ts`
- ✅ Auth callback handler: `/app/auth/callback/route.ts`
- ✅ Signup page implementation: `/app/(auth)/signup/page.tsx`

---

## Database Migration Required

### Migration Files Available
The codebase contains complete database schema files that need to be executed:

1. **`/supabase/migrations/001_initial_schema.sql`**
   - Creates all required tables (profiles, social_accounts, campaigns, etc.)
   - Sets up Row Level Security (RLS) policies
   - Creates trigger functions for auto-profile creation
   - Creates indexes for performance

2. **`/supabase/migrations/002_security_improvements.sql`**
   - Additional security enhancements

3. **`/supabase/migrations/003_ai_tools_and_profiles.sql`**
   - AI tools and profile extensions

### Key Tables That Must Exist
- `profiles` - Extends auth.users with subscription data
- `onboarding_progress` - Tracks user onboarding completion
- `social_accounts` - Social media integrations
- `campaigns` - Content campaigns
- `ai_usage` - Usage tracking for billing

---

## Immediate Action Required

### Step 1: Execute Database Migrations

**Method 1: Supabase Dashboard (Recommended)**
1. Login to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project: `hvcmidkylzrhmrwyigqr`
3. Go to **SQL Editor**
4. Execute each migration file in order:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and **Run** in SQL Editor
   - Verify "Success. No rows returned"
   - Repeat for files 002 and 003

**Method 2: Supabase CLI (Alternative)**
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref hvcmidkylzrhmrwyigqr

# Run migrations
supabase db push
```

### Step 2: Verify Database Setup

After migration, verify in Supabase Dashboard → **Table Editor**:
- [ ] `profiles` table exists
- [ ] `onboarding_progress` table exists  
- [ ] RLS policies are enabled
- [ ] Trigger `on_auth_user_created` exists

### Step 3: Test Authentication Flow

1. Clear browser cookies for `localhost:3000`
2. Navigate to `http://localhost:3000/signup`
3. Create test account with valid email
4. Verify successful redirect to `/onboarding`
5. Check Supabase Dashboard → Authentication → Users for new entry
6. Check Table Editor → profiles for corresponding profile record

---

## Expected Behavior After Fix

### Successful Signup Flow
1. User fills signup form at `/signup`
2. Supabase creates auth user record
3. Trigger `handle_new_user()` automatically creates:
   - Profile record in `profiles` table
   - Onboarding progress in `onboarding_progress` table
4. User redirected to `/onboarding`
5. User can then access `/settings` to upgrade to Premium

### Premium Upgrade Flow (Already Working)
1. Authenticated user visits `/settings`
2. Clicks "Upgrade to Premium" button
3. Stripe checkout session created
4. Payment processed → subscription active
5. User redirected back to `/settings` with Premium access

---

## Database Schema Overview

### Core Tables
```sql
profiles (id, email, full_name, subscription_tier, stripe_customer_id)
social_accounts (user_id, platform, access_token, is_active)
campaigns (user_id, name, status, ai_provider, target_platforms)
ai_usage (user_id, provider, tokens_used, cost_cents)
```

### RLS Security
- All tables have Row Level Security enabled
- Users can only access their own data
- Policies use `auth.uid()` for user identification
- API routes use server-side Supabase client for privileged operations

---

## Troubleshooting

### If Migration Fails
1. Check Supabase project logs: Dashboard → Logs
2. Verify anon key has sufficient permissions
3. Execute CREATE TABLE statements one at a time
4. Contact Supabase support if persistent issues

### If Auth Still Fails After Migration
1. Verify trigger `on_auth_user_created` was created successfully
2. Check if profiles table accepts INSERT operations
3. Test with temporary RLS disabled (re-enable immediately)
4. Examine browser network tab for specific API errors

### Connection Issues
1. Verify project URL and anon key are correct
2. Check Supabase project is not paused/suspended
3. Restart Next.js dev server after env changes

---

## Files Referenced

### Migration Files
- `/supabase/migrations/001_initial_schema.sql` - Primary schema
- `/supabase/migrations/002_security_improvements.sql` - Security updates  
- `/supabase/migrations/003_ai_tools_and_profiles.sql` - AI extensions

### Configuration Files
- `/.env.local` - Environment variables
- `/lib/supabase/client.ts` - Browser client config
- `/lib/supabase/server.ts` - Server client config

### Auth Implementation
- `/app/(auth)/signup/page.tsx` - Signup form
- `/app/auth/callback/route.ts` - OAuth callback handler
- `/app/(portal)/settings/page.tsx` - Premium upgrade page

---

## Contact Information

**Next Steps**: Execute database migrations in order, then test signup flow
**Estimated Time**: 15-30 minutes to complete migration and testing
**Dependencies**: Supabase dashboard access for project `hvcmidkylzrhmrwyigqr`

---

**Note**: The Premium upgrade functionality is confirmed working. This issue is specifically related to the initial user registration and profile creation process. Once resolved, the complete user flow from signup to Premium subscription will be functional.