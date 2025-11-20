# Facebook/Instagram OAuth Setup Guide

## Critical Error Fixed

**Error Message**:
```
The domain of this URL isn't included in the app's domains.
To be able to load this URL, add all domains and subdomains of your app
to the App Domains field in your app settings.
```

**Root Cause**: The Facebook App is missing the production domain in its configuration.

---

## Step-by-Step Fix

### 1. Access Facebook App Dashboard

1. Go to https://developers.facebook.com/apps
2. Log in with the account that created the app
3. Click on your app (the one with the CLIENT_ID that matches `FACEBOOK_CLIENT_ID` in Vercel)

### 2. Configure App Domains

**Navigate to**: App Settings → Basic

**Add App Domains**:
```
3kpro.services
trendpulse.3kpro.services
ccai.3kpro.services
```

**Important**:
- Add each domain on a separate line
- Do NOT include `https://` protocol
- Include both the base domain and subdomains

**Screenshot Reference**:
![App Domains Field](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/basic-settings/#app-domains)

### 3. Configure Valid OAuth Redirect URIs

**Navigate to**: Facebook Login → Settings

**Add these redirect URIs** (one per line):
```
https://trendpulse.3kpro.services/api/social-connections/oauth/facebook/callback
https://trendpulse.3kpro.services/api/social-connections/oauth/instagram/callback
https://ccai.3kpro.services/api/social-connections/oauth/facebook/callback
https://ccai.3kpro.services/api/social-connections/oauth/instagram/callback
```

**Important**:
- Include `https://` protocol
- Must be exact match (case-sensitive)
- Include both production domains
- Include both Facebook and Instagram callback paths

### 4. Configure Site URL

**Navigate to**: App Settings → Basic

**Set Site URL**:
```
https://trendpulse.3kpro.services
```

### 5. Verify App Mode

**Navigate to**: App Settings → Basic → App Mode

**Ensure**: App Mode is set to **"Live"** (not "Development")

**If in Development Mode**:
- Development mode only works for app administrators and testers
- Users will get errors when trying to authenticate
- Switch to "Live" mode after testing

**Important**: Before switching to Live mode, Facebook may require:
- Privacy Policy URL
- Terms of Service URL
- App icon
- Category selection
- Business verification (for some permissions)

### 6. Required Permissions (Products)

**Navigate to**: App Dashboard → Add Products

**Required Products**:
- ✅ **Facebook Login** (for OAuth)
- ✅ **Instagram Basic Display** (for Instagram profile access)
- ✅ **Instagram Graph API** (for Instagram Business/Creator accounts)

**Required Permissions** (Facebook Login → Permissions and Features):
- ✅ `pages_manage_posts` - Manage and publish content on Pages
- ✅ `pages_read_engagement` - Read Page engagement data
- ✅ `pages_show_list` - List Pages a person manages
- ✅ `public_profile` - Access public profile
- ✅ `instagram_basic` - Access Instagram profile
- ✅ `instagram_content_publish` - Publish Instagram content

**Permission Status**:
- Some permissions require **App Review** for public use
- Permissions work immediately for app admins/testers
- Submit for App Review if needed for public users

---

## Verification Checklist

After making the above changes, verify:

### In Facebook App Dashboard:
- [ ] App Domains includes: `3kpro.services`, `trendpulse.3kpro.services`, `ccai.3kpro.services`
- [ ] Valid OAuth Redirect URIs includes all 4 callback URLs
- [ ] Site URL is set to `https://trendpulse.3kpro.services`
- [ ] App Mode is "Live" (if ready for public use)
- [ ] Facebook Login product is added and configured
- [ ] Instagram products are added (Basic Display + Graph API)
- [ ] Required permissions are enabled

### In Vercel Environment Variables:
- [ ] `FACEBOOK_CLIENT_ID` matches App ID from dashboard
- [ ] `FACEBOOK_CLIENT_SECRET` matches App Secret from dashboard
- [ ] `INSTAGRAM_CLIENT_ID` matches App ID (same as Facebook)
- [ ] `INSTAGRAM_CLIENT_SECRET` matches App Secret (same as Facebook)
- [ ] No whitespace or newlines in values

### Test the OAuth Flow:
1. [ ] Go to https://trendpulse.3kpro.services/settings
2. [ ] Navigate to "Social Connections" tab
3. [ ] Click "Add Connection" → Instagram
4. [ ] Click "Connect with Instagram"
5. [ ] Should redirect to Facebook OAuth (NOT show domain error)
6. [ ] Complete authorization
7. [ ] Should redirect back with success message

---

## Common Issues & Solutions

### Issue 1: "Domain not included" error
**Solution**: Add `trendpulse.3kpro.services` to App Domains (Step 2)

### Issue 2: "Redirect URI mismatch" error
**Solution**: Add exact callback URL to Valid OAuth Redirect URIs (Step 3)

### Issue 3: "App not set up" error
**Solution**:
- Verify Facebook Login product is added
- Verify Instagram products are added
- Check App Mode is "Live" if testing with non-admin users

### Issue 4: "Permission denied" error
**Solution**:
- Check required permissions are enabled
- Submit for App Review if permissions require it
- Ensure user is using Instagram Business/Creator account (not personal)

### Issue 5: Users see "This app is in development mode"
**Solution**:
- Switch App Mode from "Development" to "Live"
- May require privacy policy, terms of service, business verification

---

## App Review Process (if needed)

Some permissions require Facebook App Review:

1. **Navigate to**: App Review → Permissions and Features
2. **Select permissions** that need review (will show "Not Approved" status)
3. **Provide**:
   - Screen recording showing how permission is used
   - Detailed step-by-step instructions
   - Test user credentials (if applicable)
4. **Submit** for review
5. **Wait** 3-7 business days for approval

**Permissions that typically need review**:
- `pages_manage_posts`
- `instagram_content_publish`
- `pages_read_engagement`

**Permissions that don't need review**:
- `public_profile`
- `email`

---

## Instagram-Specific Requirements

### Account Type Requirements

Instagram Content Publishing API **requires**:
- Instagram **Business** account OR
- Instagram **Creator** account

**Personal Instagram accounts will NOT work**.

### How to Convert to Business/Creator Account:

1. Open Instagram app on mobile
2. Go to Settings → Account
3. Tap "Switch to Professional Account"
4. Choose "Business" or "Creator"
5. Connect to Facebook Page (required for Business accounts)
6. Complete setup

### Verify Business Account:

1. Check Instagram profile shows "Professional Dashboard" button
2. Verify "Insights" tab is visible
3. Confirm Facebook Page connection (for Business accounts)

---

## Environment Variables Reference

These environment variables must be set in Vercel:

| Variable | Value | Source |
|----------|-------|--------|
| `FACEBOOK_CLIENT_ID` | Your App ID | Facebook App Dashboard → Settings → Basic → App ID |
| `FACEBOOK_CLIENT_SECRET` | Your App Secret | Facebook App Dashboard → Settings → Basic → App Secret (click "Show") |
| `INSTAGRAM_CLIENT_ID` | Same as Facebook | Instagram uses same Facebook App credentials |
| `INSTAGRAM_CLIENT_SECRET` | Same as Facebook | Instagram uses same Facebook App credentials |
| `NEXT_PUBLIC_APP_URL` | `https://trendpulse.3kpro.services` | Production domain |

---

## Testing Protocol

### Test with App Admin (Development Mode):

1. Log in as the Facebook account that created the app
2. Test Instagram OAuth flow
3. Verify connection succeeds
4. Test posting content

### Test with External User (Live Mode):

1. Switch app to "Live" mode
2. Have external user (not app admin) test
3. Verify they can complete OAuth
4. Verify they can post content

### Expected Success Flow:

```
1. User clicks "Connect with Instagram"
   → Redirects to Facebook OAuth page

2. User sees "3K Pro Services wants to access your Instagram"
   → Shows requested permissions

3. User clicks "Continue"
   → Facebook validates redirect URI

4. Redirects back to app callback URL
   → App exchanges code for access token

5. App saves encrypted token to database
   → Shows "Connection successful" message

6. User sees Instagram connection in list
   → Can test connection or post content
```

---

## Quick Reference: Where to Find Settings

| Setting | Location in Facebook Dashboard |
|---------|-------------------------------|
| App Domains | Settings → Basic → App Domains |
| OAuth Redirect URIs | Facebook Login → Settings → Valid OAuth Redirect URIs |
| Site URL | Settings → Basic → Site URL |
| App Mode | Settings → Basic → App Mode toggle |
| App ID | Settings → Basic → App ID |
| App Secret | Settings → Basic → App Secret (Show button) |
| Products | Dashboard → Add Products |
| Permissions | App Review → Permissions and Features |

---

## Support Links

- **Facebook Developer Docs**: https://developers.facebook.com/docs
- **Instagram API Docs**: https://developers.facebook.com/docs/instagram-api
- **App Review Process**: https://developers.facebook.com/docs/app-review
- **OAuth Flow**: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
- **Troubleshooting**: https://developers.facebook.com/support

---

**Last Updated**: 2025-11-19
**Status**: Configuration Required
**Next Step**: Follow steps 1-6 above to configure Facebook App
