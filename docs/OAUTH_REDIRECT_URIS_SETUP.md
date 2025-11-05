# OAuth Redirect URI Configuration Guide

**Task**: Update OAuth redirect URIs in each platform's developer console to point to production domain.

**Production Domain**: `https://trendpulse.3kpro.services` (or final production domain)

---

## Platform Configuration Checklist

### ✅ **1. Twitter (X)**

**Developer Portal**: https://developer.twitter.com/en/portal/dashboard

**Steps**:
1. Navigate to **Your App** → **User authentication settings**
2. Find **Callback URI / Redirect URL** section
3. Add production redirect URI:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/twitter
   ```
4. Save changes

**Required Scopes** (verify these are enabled):
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access`

---

### ✅ **2. LinkedIn**

**Developer Portal**: https://www.linkedin.com/developers/apps

**Steps**:
1. Navigate to **Your App** → **Auth** tab
2. Find **Redirect URLs** section
3. Add production redirect URI:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/linkedin
   ```
4. Click **Update**

**Required Products** (verify access):
- Sign In with LinkedIn using OpenID Connect
- Share on LinkedIn

**Required Scopes**:
- `openid`
- `profile`
- `email`
- `w_member_social` (for posting)

---

### ✅ **3. Facebook**

**Developer Portal**: https://developers.facebook.com/

**Steps**:
1. Navigate to **Your App** → **Facebook Login** → **Settings**
2. Find **Valid OAuth Redirect URIs** section
3. Add production redirect URI:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/facebook
   ```
4. Click **Save Changes**

**Required Permissions**:
- `pages_manage_posts` (to post on behalf of pages)
- `pages_read_engagement` (to read page stats)
- `public_profile` (basic user info)

**Note**: Some permissions require app review. Start with basic permissions for testing.

---

### ✅ **4. Instagram**

**Developer Portal**: https://developers.facebook.com/ (same as Facebook)

**Steps**:
1. Navigate to **Your App** → **Instagram Basic Display** → **Basic Display**
2. Find **Valid OAuth Redirect URIs** section
3. Add production redirect URI:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/instagram
   ```
4. Also update these fields with the same URI:
   - **Deauthorize Callback URL**
   - **Data Deletion Request URL**
5. Click **Save Changes**

**Required Scopes**:
- `user_profile` (basic profile info)
- `user_media` (access to user's media)

**Note**: For publishing capabilities, you need **Instagram Graph API** which requires a Facebook Page connected to an Instagram Business account.

---

### ✅ **5. TikTok**

**Developer Portal**: https://developers.tiktok.com/

**Steps**:
1. Navigate to **Your App** → **Login Kit**
2. Find **Redirect URI** section
3. Add production redirect URI:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/tiktok
   ```
4. Click **Submit** or **Save**

**Required Scopes**:
- `user.info.basic`
- `video.list`
- `video.upload`

**Important Notes**:
- TikTok OAuth v1 was discontinued February 29, 2024
- Must use OAuth v2 API
- Tokens expire in 1 hour (refresh tokens must be implemented)

---

### ✅ **6. Reddit**

**Developer Portal**: https://www.reddit.com/prefs/apps

**Steps**:
1. Navigate to **Your App** (or create new app if needed)
2. Set **App Type**: Web App
3. Find **redirect uri** field
4. Add production redirect URI:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/reddit
   ```
5. Click **Update app**

**Required Scopes**:
- `identity` (basic user info)
- `submit` (post submissions)
- `read` (read posts and comments)

---

## Verification Checklist

After updating all redirect URIs, verify:

- [ ] **Twitter**: Redirect URI added to User authentication settings
- [ ] **LinkedIn**: Redirect URI added to Auth tab
- [ ] **Facebook**: Redirect URI added to Facebook Login settings
- [ ] **Instagram**: Redirect URI added to Basic Display settings (+ Deauthorize + Data Deletion)
- [ ] **TikTok**: Redirect URI added to Login Kit settings
- [ ] **Reddit**: Redirect URI added to app settings

---

## Testing Instructions

After configuration, test each platform:

1. Go to `https://trendpulse.3kpro.services/social-accounts`
2. Click **Connect** for each platform
3. Should redirect to platform's OAuth consent screen
4. After authorization, should redirect back to app with account connected
5. Check that profile info is fetched correctly

---

## Common Errors & Solutions

### ❌ Error: `redirect_uri_mismatch`
**Solution**: Redirect URI in platform settings doesn't exactly match the one in the OAuth request. Must be **exact match** including:
- Protocol: `https://` (not `http://`)
- Domain: `trendpulse.3kpro.services` (exact spelling)
- Path: `/api/auth/callback/[platform]` (exact path)

### ❌ Error: `invalid_client`
**Solution**: Client ID or Client Secret is incorrect. Verify environment variables in Vercel match platform credentials.

### ❌ Error: `insufficient_scope`
**Solution**: App doesn't have required permissions. Request additional scopes in platform settings.

### ❌ Error: `access_denied`
**Solution**: User denied permission during OAuth flow, or app doesn't have required API access.

---

## Important Notes

1. **HTTPS Required**: All redirect URIs must use `https://` in production (not `http://`)
2. **Exact Match**: Platform redirect URIs must **exactly** match the URIs used in OAuth requests
3. **No Trailing Slash**: Do not add trailing slash to redirect URIs
4. **Case Sensitive**: URIs are case-sensitive, use lowercase
5. **Local vs Production**: Keep separate redirect URIs for localhost (dev) and production

---

## Security Best Practices

✅ **DO**:
- Use HTTPS for all production redirect URIs
- Keep client secrets encrypted in environment variables
- Rotate credentials regularly
- Request minimum scopes needed

❌ **DON'T**:
- Expose client secrets in client-side code
- Use HTTP for production redirect URIs
- Share credentials in version control
- Request unnecessary permissions

---

## Contact Information

If you encounter issues during setup:
- Check platform-specific documentation (links above)
- Verify environment variables in Vercel: `vercel env ls`
- Test OAuth flow in development first with `http://localhost:3000/api/auth/callback/[platform]`

---

**Last Updated**: 2025-11-04
**Production Domain**: https://trendpulse.3kpro.services
**Environment**: Vercel Production
