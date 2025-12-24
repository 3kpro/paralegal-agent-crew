# TikTok Scope Authorization Issue - RESOLVED

## Problem
When clicking "Connect TikTok" and authorizing, OAuth flow would succeed (token exchange worked), but profile fetch would fail with:

```
Error: Failed to fetch TikTok profile (401)
{
  "error": {
    "code": "scope_not_authorized",
    "message": "The user did not authorize the scope required for completing this request."
  }
}
```

## Root Cause
TikTok OAuth API expects **space-separated scopes**, not comma-separated.

**Incorrect:**
```
scope=user.info.basic,video.publish
```

**Correct:**
```
scope=user.info.basic video.publish
```

## Fix Applied
Updated `app/api/auth/connect/[platform]/route.ts` to use space-separated scopes.

## Additional Requirements

### 1. Verify App Scopes in TikTok Developer Portal

Go to https://developers.tiktok.com/ → Your App → **Scopes** section

Ensure these scopes are added and **approved**:
- ✅ `user.info.basic` - Required for fetching user profile
- ✅ `video.publish` - Required for publishing videos

**Note:**
- `user.info.basic` is typically auto-added to all apps with Login Kit
- `video.publish` requires Content Posting API approval (3-7 days)
- Both scopes must be added to your app before users can authorize them

### 2. Redirect URI Must Match Exactly

In TikTok Developer Portal → Your App → **Login Kit** → **Redirect URIs**:

Add these **exact** URLs (no trailing slashes):
```
http://localhost:3000/api/auth/callback/tiktok
https://yourdomain.com/api/auth/callback/tiktok
```

### 3. User Must Grant Scopes

When user clicks "Connect TikTok", they will see the OAuth consent screen with:
- "Read your profile info (avatar, display name)" - from `user.info.basic`
- "Post content to TikTok" - from `video.publish`

**Important:**
- User must click "Authorize" (not "Cancel" or "X")
- User must grant BOTH scopes
- If user denies a scope, OAuth will fail with scope_not_authorized

## Testing After Fix

1. **Clear previous connection:**
   - Go to Settings → Connections
   - Click "Remove" on TikTok connection (if any)

2. **Test new OAuth flow:**
   - Click "Connect TikTok"
   - Review scopes on consent screen
   - Click "Authorize"

3. **Verify connection:**
   - Popup should close automatically
   - Connection appears with "Pending Test" or "Connected" status
   - Click "Test" to verify full connection

## Troubleshooting

### Still getting "scope_not_authorized" error?

**Check 1: App has scopes approved**
- Log into TikTok Developer Portal
- Your App → Scopes
- Verify `user.info.basic` and `video.publish` are listed
- Check status: Are they "Approved" or "Pending"?

**Check 2: User granted scopes**
- Try connecting with a different user account
- Or ask user to revoke and reconnect:
  - TikTok app → Settings → Security → Connected Apps
  - Find your app and remove it
  - Try connecting again

**Check 3: App is in Live mode**
- TikTok Developer Portal → Your App
- Check "App Status" - should be "Live", not "Development"
- Development apps have limited scope access

**Check 4: Redirect URI is correct**
- Verify exact match between code and portal settings
- Check for typos, extra slashes, wrong protocol (http vs https)
- After changing redirect URIs, wait 1-2 minutes before testing

## OAuth Scopes Reference

| Scope | User Display | Required For | Approval |
|-------|--------------|--------------|-----------|
| `user.info.basic` | Read your profile info | User profile fetch | Auto (Login Kit) |
| `user.info.stats` | Read your profile engagement statistics | Follower count, etc. | Auto (Login Kit) |
| `user.info.profile` | Read your additional profile information | Bio, profile link | Auto (Login Kit) |
| `video.list` | Read your public videos on TikTok | Listing user videos | Auto (Login Kit) |
| `video.publish` | Post content to TikTok | Publishing videos | Manual (3-7 days) |
| `video.upload` | Share content as a draft | Draft uploads | Manual (3-7 days) |

## Current Configuration

**OAuth URL Format:**
```
https://www.tiktok.com/v2/auth/authorize/
  ?client_key=CLIENT_KEY
  &scope=user.info.basic video.publish
  &response_type=code
  &redirect_uri=CALLBACK_URL
  &state=STATE
  &rid=TIMESTAMP
```

**Token Exchange:**
- Endpoint: `https://open.tiktokapis.com/v2/oauth/token/`
- Uses `client_key` (not `client_id`)
- Uses `client_secret`

**Profile Fetch:**
- Endpoint: `https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,avatar_url`
- Returns nested: `{ data: { user: {...} } }`

## Files Modified

- `app/api/auth/connect/[platform]/route.ts` - Fixed scope separator
- `TIKTOK_QUICK_START.md` - Updated scope documentation
- `docs/TIKTOK_OAUTH_TROUBLESHOOTING.md` - Added scope error troubleshooting

## Related Documentation

- [TikTok Scopes Reference](https://developers.tiktok.com/doc/tiktok-api-scopes)
- [TikTok Login Kit - Web](https://developers.tiktok.com/doc/login-kit-web)
- [Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started/)

---

**Status:** ✅ Fixed and deployed to production
**Deployed:** Commit 4d14d3e - "fix: TikTok OAuth scopes must be space-separated"
