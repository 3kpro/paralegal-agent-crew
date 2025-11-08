# Daily Usage Limits - Testing Guide

## Testing Status: Ready for Manual Testing

### Migration Status: ✅ VERIFIED
- Database tables created successfully
- Tier limits seeded (Free: 3, Pro: 25, Premium: Unlimited)
- All 6 helper functions confirmed operational

### Code Verification: ✅ COMPLETE
- [x] `/api/usage` route exists at `app/api/usage/route.ts`
- [x] `UsageMeter` component exists at `components/UsageMeter.tsx`
- [x] `DashboardClient` imports and renders `UsageMeter` component
- [x] `/api/generate` includes `can_user_generate` limit check (line 29)
- [x] `/api/generate` calls `increment_daily_usage` after success (line 303)

---

## Manual Testing Steps

### Step 1: Clear Browser Cache & Refresh Dashboard

**Why:** The browser may have cached the old JavaScript before UsageMeter was added.

**How:**
1. Open the application: http://localhost:3000/dashboard
2. Hard refresh the page:
   - **Windows:** `Ctrl + Shift + R` or `Ctrl + F5`
   - **Mac:** `Cmd + Shift + R`
3. Open browser DevTools (F12)
4. Go to the **Network** tab
5. Refresh again and look for a `GET /api/usage` request

**Expected Result:**
- You should see a `GET /api/usage` request with status `200`
- The UsageMeter component should appear on the dashboard (left column)
- It should display your current usage (e.g., "0 of 3 used")

---

### Step 2: Test UsageMeter Component Display

**What to Check:**
- [ ] UsageMeter component is visible on the dashboard
- [ ] Shows correct tier badge (Free/Pro/Premium)
- [ ] Displays daily generation limit
- [ ] Shows current usage count
- [ ] Progress bar is visible
- [ ] "Resets daily at midnight" text appears at bottom
- [ ] Premium users see "Unlimited" with crown icon

**Screenshot Locations:**
- Top left of dashboard in 3-column grid
- Should have cyan border with "Daily Generations" header

---

### Step 3: Test Generation Limit Enforcement

**Test Case A: Generate Content Under Limit**

1. Go to `/campaigns/new`
2. Generate content 1-2 times (for free tier, limit is 3)
3. Check the Network tab for:
   - `POST /api/generate` returns status `200` (success)
   - `GET /api/usage` is called after generation
4. Return to dashboard and verify UsageMeter updated

**Expected Result:**
- Content generation succeeds
- Usage count increments (e.g., "1 of 3 used" → "2 of 3 used")
- Progress bar moves forward
- No error messages

---

**Test Case B: Hit the Daily Limit**

1. Continue generating until you reach your tier limit (3 for free tier)
2. Try to generate one more piece of content (4th generation)
3. Check the Network tab for:
   - `POST /api/generate` returns status `429` (Too Many Requests)

**Expected Result:**
- Generation fails with error message:
  ```
  Daily generation limit reached
  You've used 3 of 3 daily generations. Upgrade to Pro for 25 daily generations or Premium for unlimited access.
  ```
- Error modal/toast appears with upgrade CTA
- Usage meter shows "3 of 3 used" (100%)
- Red warning appears: "⚠️ Daily limit reached! Resets at midnight."
- "Upgrade for more" link is visible

---

### Step 4: Test Usage Meter Warnings

**Test at 80% Usage (Free: 3 generations = 2.4 rounds to 2)**

After 2 generations, check if amber warning appears:
- [ ] Amber/yellow warning box with text: "⚡ Running low on generations!"
- [ ] "Upgrade now →" link visible
- [ ] Progress bar is amber/yellow colored

**Test at 100% Usage**

After 3 generations (limit reached):
- [ ] Red error box with text: "⚠️ Daily limit reached! Resets at midnight."
- [ ] "Upgrade for more →" link visible
- [ ] Progress bar is red colored

---

### Step 5: Test Upgrade CTAs

**Check all upgrade links navigate correctly:**

1. Click "Upgrade now →" link in UsageMeter
   - [ ] Redirects to `/settings?tab=membership`
   - [ ] Membership tab is auto-selected
   - [ ] Pro and Premium pricing cards are visible

2. Click "Upgrade for more →" link (when limit reached)
   - [ ] Same as above

3. Verify pricing information on settings page:
   - [ ] Pro: $29/month with "25 generations/day" listed
   - [ ] Premium: $99/month with "Unlimited generations" listed

---

### Step 6: Test Premium Tier (If Applicable)

**Manually upgrade your test account to Premium:**

1. Open Supabase Dashboard
2. Go to Table Editor → `profiles`
3. Find your user record
4. Change `subscription_tier` from `free` to `premium`
5. Save the change

**Then test:**
- [ ] Refresh dashboard
- [ ] UsageMeter shows "∞ Unlimited" with crown icon
- [ ] No progress bar displayed
- [ ] Text: "Premium members enjoy unlimited generations"
- [ ] No usage warnings appear
- [ ] You can generate content unlimited times (no 429 errors)

---

### Step 7: Verify Database Usage Tracking

**Check the `daily_usage` table:**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run this query:
```sql
SELECT
  du.user_id,
  du.usage_date,
  du.generations_count,
  du.tokens_used,
  du.campaigns_created,
  p.email
FROM daily_usage du
JOIN auth.users au ON au.id = du.user_id
JOIN profiles p ON p.id = du.user_id
WHERE du.usage_date = CURRENT_DATE
ORDER BY du.updated_at DESC;
```

**Expected Result:**
- Your user's usage record appears
- `generations_count` matches your actual generation count
- `usage_date` is today's date
- Record updates after each generation

---

### Step 8: Test Daily Reset Behavior

**Option A: Wait Until Midnight**
- Leave your account with some usage (e.g., 2 of 3 used)
- Wait until midnight in your timezone
- Refresh dashboard
- Verify usage resets to "0 of 3 used"

**Option B: Manually Simulate Reset (Testing Only)**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run this query to clear your usage:
```sql
DELETE FROM daily_usage
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```
4. Refresh dashboard
5. Verify usage shows "0 of 3 used"
6. Generate content to confirm tracking restarts

---

## Troubleshooting

### Issue: UsageMeter Not Appearing

**Possible Causes:**
1. Browser cached old JavaScript
2. Component has a runtime error

**Solutions:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache completely
3. Check browser console (F12) for React errors
4. Verify `/api/usage` is being called in Network tab

---

### Issue: `/api/usage` Returns 401 Unauthorized

**Cause:** User is not authenticated

**Solution:**
1. Log out and log back in
2. Check Supabase authentication in browser DevTools → Application → Cookies
3. Verify session cookie exists

---

### Issue: `/api/usage` Returns 500 Error

**Possible Causes:**
1. Database migration not applied
2. Database functions missing
3. RLS policies blocking access

**Solutions:**
1. Re-run the migration SQL in Supabase Dashboard
2. Verify functions exist: `get_user_tier_limits`, `get_user_daily_usage`, `can_user_generate`
3. Check Supabase logs for specific error

---

### Issue: Limit Not Enforced (Can Generate Unlimited)

**Possible Causes:**
1. `/api/generate` not updated with limit check
2. `can_user_generate` function returning wrong value
3. Database migration incomplete

**Solutions:**
1. Verify `/api/generate` route file contains limit check (line 27-60)
2. Test `can_user_generate` function directly in SQL Editor:
```sql
SELECT can_user_generate('YOUR-USER-UUID-HERE');
```
3. Check `tier_limits` table has correct limits seeded

---

### Issue: Usage Not Incrementing

**Possible Causes:**
1. `increment_daily_usage` not being called
2. Database function has an error
3. RLS policies blocking insert/update

**Solutions:**
1. Verify `/api/generate` calls `increment_daily_usage` (line 303)
2. Check dev server logs for errors after generation
3. Test function directly:
```sql
SELECT increment_daily_usage('YOUR-USER-UUID-HERE', 0);
```
4. Query `daily_usage` table to see if record exists

---

## Dev Server Logs to Monitor

When testing, watch the dev server console for these logs:

**Successful Flow:**
```
○ Compiling /api/usage ...
✓ Compiled /api/usage in XXXms
GET /api/usage 200 in XXXms

○ Compiling /api/generate ...
[Generate API] Request body: {...}
POST /api/generate 200 in XXXms
```

**Limit Reached Flow:**
```
[Generate API] Daily limit check failed
POST /api/generate 429 in XXXms
```

**Error Flow:**
```
Error checking usage limits: {...}
Error incrementing usage: {...}
POST /api/generate 500 in XXXms
```

---

## Success Criteria

All tests pass if:
- [x] Migration deployed successfully (VERIFIED ✅)
- [x] All code files in place (VERIFIED ✅)
- [ ] UsageMeter component displays on dashboard
- [ ] `/api/usage` returns correct usage data
- [ ] Generation succeeds under limit
- [ ] Generation fails with 429 when limit reached
- [ ] Usage increments after each generation
- [ ] Warning appears at 80% usage
- [ ] Error appears at 100% usage
- [ ] Upgrade CTAs link correctly
- [ ] Premium tier shows unlimited
- [ ] Database tracks usage correctly
- [ ] Daily reset works (midnight or manual)

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Mark this feature as production-ready
   - Update user-facing documentation
   - Consider adding email notifications for limit warnings
   - Monitor Supabase logs for any usage errors

2. **If Tests Fail:**
   - Document specific failure with screenshots
   - Check troubleshooting section above
   - Verify migration was applied correctly
   - Check browser console and dev server logs
   - Contact dev team with specific error messages

---

## Quick Start Command

To begin testing right now:

1. Open http://localhost:3000/dashboard
2. Hard refresh (Ctrl+Shift+R)
3. Open DevTools (F12) → Network tab
4. Look for `GET /api/usage` request
5. Verify UsageMeter component appears

**Then proceed through the testing steps above.**

---

Last Updated: 2025-11-06
Migration: 012_daily_usage_limits.sql (VERIFIED ✅)
