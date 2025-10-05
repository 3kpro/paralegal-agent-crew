# Supabase Setup Guide

## Step 1: Get Credentials (After Project Creation)

Once your Supabase project is created, get these values:

### From Project Settings → API
1. **Project URL** - `https://xxxxx.supabase.co`
2. **anon public key** - Starts with `eyJ...`

### Add to `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

---

## Step 2: Run Database Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click **"Run"** (bottom right)
6. Wait ~10 seconds for completion
7. You should see: "Success. No rows returned"

---

## Step 3: Configure Authentication

### Email Provider (Already Enabled)
✅ Email/Password auth is enabled by default

### OAuth Providers (Optional - For Social Login)

#### Google OAuth:
1. Go to Authentication → Providers → Google
2. Enable Google provider
3. Add Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
4. Save

#### Twitter OAuth:
1. Go to Authentication → Providers → Twitter
2. Enable Twitter provider
3. Add Twitter OAuth credentials:
   - API Key: (from Twitter Developer Portal)
   - API Secret: (from Twitter Developer Portal)
4. Save

**Note:** For MVP, we can skip OAuth and use email/password only.

---

## Step 4: Configure Storage (For Media Assets)

1. Go to **Storage** in Supabase Dashboard
2. Create these buckets:

### Bucket: `avatars`
- Public: ✅ Yes
- File size limit: 2MB
- Allowed MIME types: `image/png, image/jpeg, image/webp`

### Bucket: `media-assets`
- Public: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: `image/*, video/*, audio/*`

### Bucket: `uploads`
- Public: ❌ No (private, user uploads)
- File size limit: 100MB
- Allowed MIME types: All

---

## Step 5: Test Authentication

Run the dev server:
```bash
npm run dev
```

Visit: `http://localhost:3001/login`

**Expected:**
- Login page loads
- Can create account
- Can sign in
- Redirect to dashboard after login

---

## Step 6: Verify Database Tables

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - ✅ profiles
   - ✅ social_accounts
   - ✅ brand_voices
   - ✅ campaigns
   - ✅ campaign_content
   - ✅ media_assets
   - ✅ ai_usage
   - ✅ api_keys
   - ✅ onboarding_progress
   - ✅ analytics_snapshots

3. Click on `profiles` table
4. Should be empty (no users yet)

---

## Step 7: Deploy Environment Variables to Vercel

Once local dev works, add to Vercel:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
3. Check all environments (Production, Preview, Development)
4. Redeploy

---

## Troubleshooting

### "Failed to fetch" error
- Check `.env.local` has correct URL and key
- Restart Next.js dev server

### "JWT expired" error
- Clear browser cookies
- Sign out and back in

### Database migration fails
- Check for syntax errors in SQL
- Run each CREATE TABLE statement one at a time
- Check Supabase logs (Dashboard → Logs)

### RLS blocking queries
- Verify policies are created correctly
- Check auth.uid() returns correct user ID
- Temporarily disable RLS for testing (re-enable for production!)

---

## Next Steps

✅ Once Supabase is configured:
1. Claude builds auth pages (login, signup)
2. Claude builds dashboard layout
3. ZenCoder builds UI components
4. Integrate campaign creation flow
5. Test full workflow: Signup → Create Campaign → Publish
