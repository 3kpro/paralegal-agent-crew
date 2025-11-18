# 🔧 Supabase Manual SQL Execution Required

## What Needs to Be Done
The Social Connections system tables don't exist in production. You need to run 2 SQL migrations manually.

## Where to Execute
**Supabase SQL Editor:**
https://supabase.com/dashboard/project/hvcmidkylzrhmrwyigqr/sql/new

---

## Step 1: Create Tables & Schema

**File:** `supabase/migrations/20251117100400_social_connections_system.sql`

**Action:** Copy the ENTIRE contents of this file and paste into Supabase SQL Editor, then click **RUN**.

**What This Does:**
- ✅ Creates 4 tables: `social_providers`, `user_social_connections`, `scheduled_posts`, `publishing_activity`
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates indexes for performance
- ✅ Adds helper functions
- ✅ Seeds initial 6 platforms (Instagram, TikTok, YouTube, Facebook, LinkedIn, Twitter) with basic data

**Time:** ~5 seconds

---

## Step 2: Update Platform OAuth Configs

**File:** `supabase/migrations/20251118000000_seed_social_providers.sql`

**Action:** Copy the ENTIRE contents of this file and paste into Supabase SQL Editor, then click **RUN**.

**What This Does:**
- ✅ Updates all 6 platforms with proper OAuth URLs and scopes
- ✅ Adds setup instructions for users
- ✅ Sets correct auth_type (oauth for all platforms now)

**Time:** ~2 seconds

---

## Verification

After running both migrations, verify success:

### Test 1: Check Tables Exist
Run this in SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('social_providers', 'user_social_connections', 'scheduled_posts', 'publishing_activity');
```

**Expected:** 4 rows returned

### Test 2: Check Platforms Seeded
Run this in SQL Editor:
```sql
SELECT provider_key, name, auth_type, is_active
FROM public.social_providers
ORDER BY name;
```

**Expected:** 6 rows (Instagram, TikTok, YouTube, Facebook, LinkedIn, Twitter)

### Test 3: Check Production UI
1. Go to: https://ccai.3kpro.services/settings
2. Click "Connections" tab
3. **Expected:** See 6 social platform cards with "Connect" buttons

---

## If Something Goes Wrong

### Error: "relation already exists"
**Solution:** Tables already exist. Skip Step 1, run Step 2 only.

### Error: "duplicate key value violates unique constraint"
**Solution:** Platforms already seeded. That's fine - the migration uses `ON CONFLICT DO UPDATE` so it will just update existing records.

### No Platforms Showing in UI
**Checklist:**
1. ✅ Both SQL migrations ran successfully?
2. ✅ Hard refresh browser (Ctrl+Shift+R)?
3. ✅ Check browser console for errors (F12)?
4. ✅ Run Verification Test 2 above to confirm data exists?

---

## Alternative: Command Line (If Preferred)

```bash
# Apply all pending migrations
npx supabase db push
```

**Note:** This hasn't been working reliably, which is why manual SQL execution is recommended.

---

## Files Referenced
- `c:\DEV\3K-Pro-Services\landing-page\supabase\migrations\20251117100400_social_connections_system.sql`
- `c:\DEV\3K-Pro-Services\landing-page\supabase\migrations\20251118000000_seed_social_providers.sql`

---

**Estimated Total Time:** 2 minutes
