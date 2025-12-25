# TikTok OAuth - scope_not_authorized Error - Deep Troubleshooting

## Error Message

```
Failed to fetch TikTok profile (401)
{
  "error": {
    "code": "scope_not_authorized",
    "message": "The user did not authorize the scope required for completing this request."
  }
}
```

---

## What This Error Means

This error indicates that:
1. ✅ OAuth flow completed (token exchange succeeded)
2. ❌ Access token returned doesn't have `user.info.basic` scope
3. ❌ Cannot fetch user profile because scope is missing

---

## Root Causes & Solutions

### Cause 1: TikTok App Doesn't Have Scope Approved ⚠️ MOST COMMON

**Symptoms:**
- Error occurs immediately after clicking "Authorize"
- User clicked "Authorize" on TikTok consent screen
- Token exchange succeeds, but profile fetch fails

**Solution:**

1. Go to: https://developers.tiktok.com/
2. Select **Your App** (named "xelora")
3. Click **Scopes** tab
4. **Check if `user.info.basic` is listed**

**If NOT listed:**
1. Click **Add Scopes** button
2. Search for "user.info.basic"
3. Click **Add**
4. Wait for approval (should be instant for this scope)
5. **Save** changes

**If listed but not approved:**
- Status should show "Approved" (instant for user.info.basic)
- If showing "Pending", contact TikTok Developer Support

---

### Cause 2: User Denied Scope on Consent Screen

**Symptoms:**
- User accidentally clicked "Cancel" or "X" instead of "Authorize"
- User declined the permission

**Solution:**
1. Go to TikTok app on phone/desktop
2. Settings → Security → Connected Apps
3. Find "xelora" or your app name
4. Remove connection
5. Try connecting again
6. **Carefully click "Authorize"** (not Cancel)

---

### Cause 3: App in Development/Sandbox Mode

**Symptoms:**
- New app recently created
- App status not "Live"

**Solution:**

1. Go to: https://developers.tiktok.com/
2. Select **Your App** → **Overview**
3. Check **App Status**
4. Must be: **Live** (NOT Development or Sandbox)

**If not Live:**
1. Click **Go Live** or **Publish** button
2. Follow prompts
3. Wait for status change
4. Try OAuth again

---

### Cause 4: Client Key Mismatch

**Symptoms:**
- Using wrong TikTok app credentials
- Old app credentials in Vercel environment

**Solution:**

1. Go to TikTok Developer Portal → **Your App** → **Basic Information**
2. Copy **Client Key** (starts with letters, about 20 chars)
3. Go to Vercel Dashboard → Environment Variables
4. Verify `TIKTOK_CLIENT_KEY` matches exactly
5. **Redeploy** after changing

---

### Cause 5: TikTok Scope Format Issue

**Symptoms:**
- Scope parameter format incorrect
- TikTok rejecting the request format

**Solution:**
- Our code now uses: `&scope=user.info.basic` (no encoding)
- This matches TikTok's official documentation

---

## Verification Steps

### Step 1: Verify TikTok App Configuration

Run this checklist:

- [ ] **App Name**: xelora (matches what you created)
- [ ] **App Status**: Live (not Development)
- [ ] **Login Kit**: Enabled/Installed
- [ ] **Redirect URI**: `https://xelora.app/api/auth/callback/tiktok` (EXACT)
- [ ] **Scope `user.info.basic`**: Listed in Scopes tab
- [ ] **Scope Status**: Approved (not Pending or Rejected)

### Step 2: Verify Vercel Configuration

- [ ] `TIKTOK_CLIENT_KEY` environment variable is set
- [ ] `TIKTOK_CLIENT_SECRET` environment variable is set
- [ ] `NEXT_PUBLIC_APP_URL` is `https://xelora.app`
- [ ] Latest deployment has finished (check Vercel dashboard)

### Step 3: Check Production Logs

1. Go to: https://vercel.com/3kpros-projects/landing-page
2. Click **Logs** tab
3. Select most recent deployment
4. Look for `[tiktok]` prefixed logs

**What you should see:**
```
[tiktok] OAuth Configuration:
  Origin: https://xelora.app
  Callback URL: https://xelora.app/api/auth/callback/tiktok
  TikTok Client Key: awxyz12345...
  TikTok Client Key defined: true
  Requested scope: user.info.basic
  Code Challenge: yyz123...
```

```
[tiktok] OAuth callback started
  Code received: Yes
  Error param: None
  State validation: ✓ Valid
```

```
[tiktok] Token exchange success. Has refresh token: true
  Token expires_in: 86400
  Granted scopes: user.info.basic
  Requested scope: user.info.basic
  Scope match: ✅
```

**If you see:**
```
Granted scopes: (empty or different scope)
Scope match: ❌
```
This means TikTok didn't grant the requested scope. Cause 1 or 2 above.

---

## Testing Alternative Solutions

### Test 1: Create New TikTok App (Fresh Start)

If all checks pass and still fails, try fresh app:

1. Delete current "xelora" app
2. Create new app with different name (e.g., "xelora-v2")
3. Add Login Kit
4. Add redirect URI: `https://xelora.app/api/auth/callback/tiktok`
5. Verify scopes include `user.info.basic`
6. Set to Live mode
7. Copy new credentials
8. Update Vercel environment variables with new credentials
9. Redeploy

### Test 2: Try Different TikTok Account

Some accounts have restrictions:

1. Ask a friend or colleague to try connecting
2. Use their TikTok account to authorize
3. If it works, the issue is account-specific
4. Check if your account has age restrictions, country restrictions, etc.

### Test 3: Check TikTok API Status

Verify TikTok APIs are working:

1. Go to: https://developers.tiktok.com/status/
2. Check for any incidents or outages
3. If issues reported, wait for resolution

---

## Recent Code Changes Applied

| Commit | Change | Deployed |
|--------|--------|-----------|
| 2118257 | Remove encodeURIComponent from TikTok scope | ✅ Yes |

This change aligns with TikTok's official documentation:
```javascript
url += '&scope=user.info.basic';  // No encoding, plain text
```

---

## Expected OAuth Flow (Working Correctly)

```
User clicks "Connect TikTok"
    ↓
GET https://www.tiktok.com/v2/auth/authorize/
  ?client_key=YOUR_KEY
  &scope=user.info.basic
  &response_type=code
  &redirect_uri=https://xelora.app/api/auth/callback/tiktok
  &state=RANDOM
    ↓
TikTok Consent Screen:
  "Read your profile info (avatar, display name)"
  [ ] Allow
  [ ] Cancel
    ↓
User clicks "Allow"
    ↓
Redirect to:
  https://xelora.app/api/auth/callback/tiktok?code=xxx&state=xxx
    ↓
Server exchanges code for token:
  POST https://open.tiktokapis.com/v2/oauth/token/
    ↓
Token response includes:
  {
    "access_token": "xxx",
    "refresh_token": "yyy",
    "expires_in": 86400,
    "scope": "user.info.basic"  ← MUST BE PRESENT
    "token_type": "Bearer"
  }
    ↓
Server fetches user profile:
  GET https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,avatar_url
  Authorization: Bearer xxx
    ↓
Success! Connection saved.
```

---

## Quick Fix Summary

**Most likely fix:** Add `user.info.basic` scope to TikTok app

1. Go to: https://developers.tiktok.com/
2. Your App → Scopes
3. If `user.info.basic` is missing, click "Add Scopes"
4. Search and add `user.info.basic`
5. Wait for approval (instant for this scope)
6. Try connecting again

---

## Need Help?

1. **Check Production Logs**: Vercel Dashboard → Logs
2. **Run Diagnostic**: Look for `[tiktok]` logs with specific issues
3. **Verify Configuration**: Use checklist above
4. **Contact Support**: If all checks pass and still fails

---

**Last Updated**: December 24, 2025
**Latest Deploy**: Commit 2118257
**Production URL**: https://xelora.app
