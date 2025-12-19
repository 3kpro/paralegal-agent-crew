# OAuth Setup Guide for XELORA

**Last Updated:** December 18, 2025

This guide explains how to enable one-click OAuth publishing for TikTok, Instagram, and Facebook.

---

## 🎯 Overview

XELORA's OAuth implementation is **100% ready** - all code, APIs, and UI components are built. You just need to:

1. Create developer apps on each platform
2. Add CLIENT_ID and CLIENT_SECRET to your `.env` files
3. Users can then connect with one click

**Current Status:**
- ✅ OAuth flows fully implemented
- ✅ Token encryption (AES-256-GCM)
- ✅ Auto-refresh logic
- ✅ Publishing APIs ready
- ❌ **Missing: Platform OAuth credentials in environment**

---

## 🚀 Quick Start (5 Minutes Per Platform)

### Prerequisites
- Production domain: `https://xelora.app`
- Access to platform developer portals
- Ability to update environment variables on Vercel/hosting

---

## 📱 TikTok OAuth Setup

### Step 1: Create TikTok Developer App

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Sign in with your TikTok account
3. Click **"Manage apps"** → **"Create an app"**
4. Fill in app details:
   - **App name:** XELORA
   - **Company/个人:** Choose your entity type
   - **Industry:** Social Media / Content Creation
   - **Logo:** Upload XELORA logo
5. Save the app

### Step 2: Get OAuth Credentials

1. In your app dashboard, go to **"Login Kit"** or **"Content Posting API"**
2. Click **"Apply for permissions"** (if needed)
3. Request these permissions:
   - `user.info.basic` - User profile information
   - `video.publish` - Publish videos
   - `video.upload` - Upload video files
4. Copy your credentials:
   - **Client Key** (this is your CLIENT_ID)
   - **Client Secret**

### Step 3: Configure Redirect URI

1. In **"Login Kit settings"** or **"OAuth settings"**
2. Add redirect URI:
   ```
   https://xelora.app/api/auth/callback/tiktok
   ```
3. Save changes

### Step 4: Add to Environment

```bash
# .env.production
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
```

---

## 📷 Instagram OAuth Setup

**⚠️ Important:** Instagram uses Facebook OAuth. You need a Facebook App with Instagram permissions.

### Step 1: Create Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select app type: **"Business"** or **"Consumer"**
4. Fill in details:
   - **App name:** XELORA
   - **Contact email:** Your email
   - **Business account:** (if applicable)
5. Create app

### Step 2: Add Instagram Product

1. In your app dashboard, click **"Add Products"**
2. Find **"Instagram Graph API"** → Click **"Set Up"**
3. Complete the setup wizard
4. Navigate to **"Instagram Graph API"** → **"Settings"**

### Step 3: Configure OAuth Redirect

1. Go to **"Settings"** → **"Basic"**
2. Scroll to **"App Domains"**
3. Add: `xelora.app`
4. Scroll to **"Valid OAuth Redirect URIs"** (under Facebook Login product)
5. Add:
   ```
   https://xelora.app/api/auth/callback/instagram
   ```
6. Save changes

### Step 4: Get Permissions

1. Go to **"Permissions"** or **"Advanced Access"**
2. Request these permissions:
   - `instagram_basic` - Basic profile access
   - `instagram_content_publish` - Publish content
   - `pages_read_engagement` - Read page data
   - `pages_show_list` - List user's pages
3. Submit for review if required (for production use)

### Step 5: Get OAuth Credentials

1. Go to **"Settings"** → **"Basic"**
2. Copy:
   - **App ID** (this is your CLIENT_ID)
   - **App Secret** (click "Show" to reveal)

### Step 6: Add to Environment

```bash
# .env.production
INSTAGRAM_CLIENT_ID=your_facebook_app_id_here
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret_here
```

**Requirements for Users:**
- Must have Instagram Business or Creator account
- Instagram must be connected to a Facebook Page
- If not connected, OAuth will still work but publishing will fail

---

## 📘 Facebook OAuth Setup

### Step 1: Use Same Facebook App

If you already created a Facebook App for Instagram, **reuse it**. Otherwise, create one using the Instagram instructions above.

### Step 2: Add Facebook Login Product

1. In your app dashboard, click **"Add Products"**
2. Find **"Facebook Login"** → Click **"Set Up"**
3. Select **"Web"** platform
4. Site URL: `https://xelora.app`

### Step 3: Configure OAuth Settings

1. Go to **"Facebook Login"** → **"Settings"**
2. Add **"Valid OAuth Redirect URIs"**:
   ```
   https://xelora.app/api/auth/callback/facebook
   ```
3. **Client OAuth Login:** Enabled
4. **Web OAuth Login:** Enabled
5. Save changes

### Step 4: Request Permissions

1. Go to **"Permissions"** or **"Advanced Access"**
2. Request these permissions:
   - `pages_manage_posts` - Post to pages
   - `pages_read_engagement` - Read page engagement
   - `pages_show_list` - List user's pages
   - `public_profile` - Basic profile info
3. Submit for App Review if needed

### Step 5: Add to Environment

```bash
# .env.production
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
```

**Note:** Can use same credentials as Instagram if you're using the same Facebook App.

---

## 🔐 Complete Environment Variables

Update your `.env.production` and deploy:

```bash
# ===================================
# OAUTH CREDENTIALS
# ===================================

# TikTok
TIKTOK_CLIENT_KEY=awXXXXXXXXXXXXXXXXX
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Instagram (uses Facebook OAuth)
INSTAGRAM_CLIENT_ID=123456789012345
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret

# Facebook
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Twitter/X (if not already configured)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn (if not already configured)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# App URL (required for OAuth callbacks)
NEXT_PUBLIC_APP_URL=https://xelora.app

# Encryption key for token storage (already configured)
ENCRYPTION_KEY=ee8d695a2f14e2d2212c849cc7a975aac7d8e316b697fc8cf1e37b1c6e564b84
```

---

## 🧪 Testing OAuth Flows

### Test TikTok Connection

1. Log into XELORA
2. Go to **Settings** → **Connections** tab
3. Click **"Connect"** on TikTok card
4. Modal appears with instructions
5. Click **"Continue to TikTok"**
6. Authorize on TikTok
7. Redirected back to Settings → Connection should show as "Connected"

### Test Instagram Connection

1. Click **"Connect"** on Instagram card
2. Click **"Continue to Facebook"**
3. Log in to Facebook
4. Select Facebook Page linked to your Instagram Business account
5. Grant permissions
6. Redirected back → Connection saved

**If No Instagram Account Linked:**
- OAuth will complete successfully
- But publishing will fail with error: "Instagram Business Account not found"
- User needs to link Instagram to their Facebook Page first

### Test Facebook Connection

1. Click **"Connect"** on Facebook card
2. Click **"Continue to Facebook"**
3. Select Facebook Page
4. Grant permissions
5. Redirected back → Connection saved

---

## 🐛 Troubleshooting

### "OAuth credentials not configured" Error

**Cause:** Environment variable is undefined or misspelled

**Fix:**
1. Verify variable names match exactly:
   - TikTok: `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`
   - Instagram: `INSTAGRAM_CLIENT_ID` and `INSTAGRAM_CLIENT_SECRET`
   - Facebook: `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`
2. Redeploy after adding variables
3. Clear Next.js build cache: `npm run build`

### "Token exchange failed" Error

**Causes:**
- Wrong Client ID or Secret
- Redirect URI mismatch
- App not approved for permissions

**Fix:**
1. Double-check credentials in platform developer portal
2. Verify redirect URIs exactly match:
   - TikTok: `https://xelora.app/api/auth/callback/tiktok`
   - Instagram: `https://xelora.app/api/auth/callback/instagram`
   - Facebook: `https://xelora.app/api/auth/callback/facebook`
3. Ensure no trailing slashes in URLs
4. Check app is in "Live" mode (not Development mode)

### "Instagram Business Account not found" Error

**Cause:** User's Instagram is not a Business/Creator account or not linked to Facebook Page

**User Fix:**
1. Convert Instagram to Business account
2. Go to Instagram app → Settings → Account → Switch to Professional Account
3. Link to a Facebook Page:
   - Instagram → Settings → Business → Connect Facebook Page

### Publishing Fails After Successful OAuth

**Causes:**
- Token expired
- Insufficient permissions
- Account suspended

**Debug:**
1. Check connection `test_status` in database:
   ```sql
   SELECT connection_name, test_status, last_tested_at
   FROM user_social_connections
   WHERE user_id = 'user-id';
   ```
2. Try refreshing token (happens automatically on next publish)
3. Ask user to reconnect account

---

## 📊 OAuth Flow Architecture

### How It Works

1. **User Clicks "Connect" Button**
   ```
   components/settings/ConnectionGrid.tsx
   → Opens AddConnectionModal
   ```

2. **Modal Shows Platform Info**
   ```
   components/settings/AddConnectionModal.tsx
   → Loads capability config from /libs/capabilities/social/{platform}.json
   → Displays setup instructions
   ```

3. **User Clicks "Continue to {Platform}"**
   ```
   → Redirects to: /api/auth/connect/{platform}
   ```

4. **OAuth Initiation**
   ```
   app/api/auth/connect/[platform]/route.ts
   → Generates PKCE verifier (for Twitter)
   → Stores verifier in secure httpOnly cookie
   → Builds OAuth URL with scopes
   → Redirects to platform OAuth page
   ```

5. **Platform Authorization**
   ```
   User approves permissions on TikTok/Facebook/Instagram
   → Platform redirects back with authorization code
   ```

6. **OAuth Callback**
   ```
   app/api/auth/callback/[platform]/route.ts
   → Retrieves code from query params
   → Exchanges code for access token
   → Fetches user profile
   → Encrypts tokens (AES-256-GCM)
   → Stores in user_social_connections table
   → Redirects to Settings page with success message
   ```

7. **Publishing**
   ```
   User creates content
   → Clicks "Publish to {Platform}"
   → app/api/publish/route.ts
   → Loads encrypted token
   → Decrypts token
   → Calls lib/publishers/{platform}.publisher.ts
   → Posts to platform API
   → Returns success + post URL
   ```

### Token Security

- **Encryption:** AES-256-GCM
- **Storage:** PostgreSQL (Supabase) `user_social_connections` table
- **Auto-refresh:** 5-minute buffer before expiry
- **Never exposed:** Tokens never sent to frontend

### Database Schema

```sql
-- Connections stored here
user_social_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  provider_id UUID REFERENCES social_providers,
  connection_name TEXT,
  account_username TEXT,
  access_token_encrypted TEXT,  -- AES-256-GCM encrypted
  refresh_token_encrypted TEXT, -- AES-256-GCM encrypted
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  test_status TEXT,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB
)
```

---

## 🎨 UI Components

### Settings → Connections Tab

**File:** `app/(portal)/settings/page.tsx`

Shows all available platforms in a grid:
- Green badge: Connected
- Gray: Not connected
- Click "Connect" → Opens OAuth modal

### Add Connection Modal

**File:** `components/settings/AddConnectionModal.tsx`

Three steps:
1. **Instructions:** Shows platform-specific setup guide
2. **OAuth/Form:** Redirects to platform OR manual credentials (for custom apps)
3. **Success:** Redirects back to settings

### Social Connect Button (Legacy)

**File:** `components/SocialConnectButton.tsx`

Simple button component for quick connects.
Currently only supports Twitter and TikTok.

**Note:** ConnectionsTab is the recommended UI (more complete).

---

## 🔄 Auto-Refresh Logic

**File:** `lib/social/token-manager.ts`

Function: `getValidAccessToken(connectionId)`

```typescript
// Automatically refreshes token if:
// 1. Token expires in < 5 minutes
// 2. Platform supports refresh (Twitter, LinkedIn)
// 3. Refresh token exists

const tokenInfo = await getValidAccessToken(connectionId)
// Returns: { accessToken, expiresAt, username }
```

Platforms that support refresh:
- ✅ Twitter (via refresh_token)
- ✅ LinkedIn (via refresh_token)
- ❌ TikTok (no refresh support - user must re-authorize)
- ⚠️ Facebook/Instagram (long-lived tokens - 60 days, can be extended)

---

## 📚 Platform Documentation Links

### TikTok
- **Developer Portal:** https://developers.tiktok.com/
- **Content Posting API:** https://developers.tiktok.com/doc/content-posting-api-get-started
- **Login Kit:** https://developers.tiktok.com/doc/login-kit-web

### Instagram
- **Meta for Developers:** https://developers.facebook.com/
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **Content Publishing:** https://developers.facebook.com/docs/instagram-api/guides/content-publishing

### Facebook
- **Facebook Login:** https://developers.facebook.com/docs/facebook-login
- **Pages API:** https://developers.facebook.com/docs/pages-api
- **Publishing:** https://developers.facebook.com/docs/graph-api/reference/page/feed

---

## ✅ Post-Setup Checklist

After adding environment variables:

- [ ] Redeploy application to Vercel/production
- [ ] Test TikTok OAuth flow end-to-end
- [ ] Test Instagram OAuth flow (with Business account)
- [ ] Test Facebook OAuth flow (with Page)
- [ ] Verify tokens are encrypted in database
- [ ] Test publishing to each platform
- [ ] Check token refresh logic works
- [ ] Test error handling (wrong permissions, expired tokens)
- [ ] Update user documentation if needed

---

## 🚨 Important Notes

### For Production Use

1. **App Review Required:**
   - Instagram and Facebook require App Review for certain permissions
   - Submit app for review with detailed use case
   - Provide demo video showing OAuth flow
   - Can take 1-2 weeks for approval

2. **Rate Limits:**
   - TikTok: 100 posts/day, 1000 API calls/day
   - Instagram: 25 posts/day, 5 posts/hour
   - Facebook: 50 posts/hour per Page

3. **User Requirements:**
   - Instagram: Must be Business or Creator account
   - Instagram: Must be linked to Facebook Page
   - Facebook: Must have a Facebook Page (personal timeline limited)

4. **Token Expiry:**
   - TikTok: Tokens expire, no refresh (user must re-auth)
   - Instagram/Facebook: 60-day tokens (can be extended)
   - Twitter: Refresh tokens supported
   - LinkedIn: Refresh tokens supported

### Development Mode

While developing or testing:
- Use App in "Development" mode
- Add test users in platform developer portal
- Only test users can authorize the app
- Switch to "Live" mode when ready for production

---

## 🎯 Next Steps

1. ✅ Complete OAuth setup for each platform (follow guides above)
2. ✅ Add environment variables to production
3. ✅ Deploy and test each OAuth flow
4. ⏭️ (Optional) Submit apps for review if needed
5. ⏭️ (Optional) Add more platforms (YouTube, LinkedIn, etc.)

---

**Questions?**

- Check troubleshooting section above
- Review platform documentation links
- Test in development mode first
- Verify environment variables are set correctly

