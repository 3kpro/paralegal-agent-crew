# Supabase Debug Request - Campaigns Not Displaying

**Project**: Content Cascade AI (CCAI) - TrendPulse
**Date**: November 5, 2025
**For**: ChatGPT at Supabase.com

---

## 🚨 **Problem**

User creates campaigns successfully (sees fireworks celebration), but when redirected to `/campaigns` page, the list is empty. No campaigns display.

---

## 🔍 **Need You To Check**

### 1. Are Campaigns Being Saved?

```sql
-- Check if ANY campaigns exist in database
SELECT id, name, user_id, status, created_at, archived
FROM campaigns
ORDER BY created_at DESC
LIMIT 10;
```

**Question**: Do you see campaigns in the table?
- ✅ **YES** → Campaigns ARE saving (display issue)
- ❌ **NO** → Campaigns NOT saving (insert failing silently)

---

### 2. Check User ID Match

```sql
-- Get the logged-in user's ID
-- User email: [USER WILL PROVIDE]
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Check campaigns for that user
SELECT id, name, user_id, created_at
FROM campaigns
WHERE user_id = '[USER_ID_FROM_ABOVE]'
ORDER BY created_at DESC;
```

**Question**: Do campaigns exist for this specific user_id?

---

### 3. Check Archived Status

```sql
-- Check if campaigns are accidentally archived
SELECT id, name, archived, created_at
FROM campaigns
WHERE archived = true
ORDER BY created_at DESC;
```

**Question**: Are new campaigns being created with `archived = true`?

---

### 4. Check RLS Policies

```sql
-- View RLS policies on campaigns table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'campaigns';
```

**Question**: Do RLS policies allow users to SELECT their own campaigns?

Expected policy should include:
```sql
-- Should exist:
CREATE POLICY "Users can view own campaigns"
ON campaigns FOR SELECT
USING (auth.uid() = user_id);
```

---

### 5. Recent Insert Errors

Check Supabase logs for any INSERT errors:
- Dashboard → Logs → Database
- Filter by: `campaigns` table
- Time: Last 1 hour
- Look for: INSERT failures, constraint violations

---

## 📝 **Expected Schema**

Campaigns table should have:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `name` (text)
- `status` (text)
- `target_platforms` (text[])
- `archived` (boolean, default: false) ← **JUST ADDED**
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 🔧 **Quick Fixes**

If you find issues:

### Issue: RLS blocking SELECT
```sql
-- Add policy to allow users to view their campaigns
CREATE POLICY "Users can view own campaigns"
ON campaigns FOR SELECT
USING (auth.uid() = user_id);
```

### Issue: Campaigns defaulting to archived = true
```sql
-- Fix existing campaigns
UPDATE campaigns
SET archived = false
WHERE archived IS NULL OR archived = true;
```

### Issue: Missing user_id in INSERT
```sql
-- Check if user_id is NULL
SELECT COUNT(*) FROM campaigns WHERE user_id IS NULL;

-- If > 0, that's the problem
```

---

## 📊 **What We Know**

✅ Content generation works (200 OK)
✅ Fireworks celebration shows (success toast appears)
✅ No JavaScript errors in browser console
✅ Redirect to `/campaigns` works
❌ Campaigns list is empty (no data displays)

**This means**:
- Either INSERT fails silently
- OR SELECT query returns empty (RLS issue)
- OR campaigns exist but archived = true

---

## 🎯 **Next Steps**

Please run queries 1-4 above and report:
1. Total campaign count in database
2. Campaigns for user `[USER_ID]`
3. How many have `archived = true`
4. Current RLS policies on campaigns table

This will tell us exactly where the problem is.

---

**Urgent - User can't use app until fixed!**
