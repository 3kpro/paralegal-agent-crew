# Admin OAuth Setup Guide
**For 3K Pro Services Platform Administrator**

This guide walks through setting up centralized OAuth applications for all social media platforms. Users will connect through these apps without needing their own Client IDs/Secrets.

---

## Overview

**Centralized OAuth Architecture:**
- You create ONE app per platform (one-time setup)
- You add credentials to Vercel environment variables
- Users click "Connect" → OAuth flow → Done
- All users share the same app (standard SaaS approach)

**Platforms:**
1. Instagram (via Facebook)
2. TikTok
3. YouTube (via Google)
4. Facebook
5. LinkedIn
6. Twitter/X

---

## 1. Instagram Setup (via Facebook App)

### Step 1: Create Facebook App

1. Go to https://developers.facebook.com
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as app type
4. Fill in details:
   - **App Name:** `3K Pro Services` (or your brand name)
   - **App Contact Email:** your-email@3kpro.services
   - **Business Account:** Select your business account
5. Click **"Create App"**

### Step 2: Add Instagram Graph API Product

1. In your new app dashboard, go to **"Add Product"**
2. Find **"Instagram Graph API"** and click **"Set Up"**
3. Complete the setup wizard

### Step 3: Configure OAuth Settings

1. Go to **"Settings"** → **"Basic"**
2. Add **App Domains:** `trendpulse.3kpro.services`
3. Add **Privacy Policy URL:** `https://trendpulse.3kpro.services/privacy`
4. Add **Terms of Service URL:** `https://trendpulse.3kpro.services/terms`
5. Save changes

### Step 4: Add OAuth Redirect URIs

1. Go to **"Products"** → **"Facebook Login"** → **"Settings"**
2. Add **Valid OAuth Redirect URIs:**
   ```
   https://trendpulse.3kpro.services/api/social-connections/oauth/instagram/callback
   ```
3. Save changes

### Step 5: Get App Credentials

1. Go to **"Settings"** → **"Basic"**
2. Copy **App ID** (this is your Client ID)
3. Copy **App Secret** (click "Show" first)

### Step 6: Request Instagram Permissions

1. Go to **"App Review"** → **"Permissions and Features"**
2. Request these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`
3. Submit for review (may take 1-3 days)

### Step 7: Add to Environment Variables

```bash
# Vercel Environment Variables
vercel env add INSTAGRAM_CLIENT_ID production
# Paste: <Your App ID>

vercel env add INSTAGRAM_CLIENT_SECRET production
# Paste: <Your App Secret>
```

**Testing Before Approval:**
- While permissions are pending review, the app works in Development Mode
- You and up to 5 test users can connect
- After approval, all users can connect

---

## 2. TikTok Setup

### Step 1: Create TikTok Developer Account

1. Go to https://developers.tiktok.com
2. Sign in with TikTok account
3. Complete developer registration

### Step 2: Create App

1. Go to **"Manage apps"** → **"Connect an app"**
2. Fill in details:
   - **App Name:** `3K Pro Services`
   - **App Type:** `Web`
3. Submit application

### Step 3: Enable Content Posting API

1. In app dashboard, go to **"Add products"**
2. Enable **"Content Posting API"**
3. Configure redirect URI:
   ```
   https://trendpulse.3kpro.services/api/social-connections/oauth/tiktok/callback
   ```

### Step 4: Get Credentials

1. Go to **"Settings"** → **"Basic information"**
2. Copy **Client Key** (this is your Client ID)
3. Copy **Client Secret**

### Step 5: Add to Environment Variables

```bash
vercel env add TIKTOK_CLIENT_ID production
# Paste: <Your Client Key>

vercel env add TIKTOK_CLIENT_SECRET production
# Paste: <Your Client Secret>
```

---

## 3. YouTube Setup (via Google Cloud)

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create new project: **"3K Pro Services"**

### Step 2: Enable YouTube Data API

1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"YouTube Data API v3"**
3. Click **"Enable"**

### Step 3: Create OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (for public users)
3. Fill in:
   - **App name:** `3K Pro Services`
   - **User support email:** your-email@3kpro.services
   - **Developer contact:** your-email@3kpro.services
4. Add scopes:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube`
5. Save and continue

### Step 4: Create OAuth Credentials

1. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. Application type: **"Web application"**
3. Name: `3K Pro Services Web`
4. Add **Authorized redirect URIs:**
   ```
   https://trendpulse.3kpro.services/api/social-connections/oauth/youtube/callback
   ```
5. Click **"Create"**

### Step 5: Get Credentials

1. Copy **Client ID**
2. Copy **Client Secret**

### Step 6: Add to Environment Variables

```bash
vercel env add YOUTUBE_CLIENT_ID production
# Paste: <Your Client ID>

vercel env add YOUTUBE_CLIENT_SECRET production
# Paste: <Your Client Secret>
```

---

## 4. Facebook Setup

*Note: If you already created a Facebook app for Instagram, you can reuse it. Just add the Facebook Login product and additional redirect URI.*

### Option A: Reuse Instagram App

1. Go to your existing Facebook app
2. Add **Facebook Login** product if not already added
3. Add redirect URI:
   ```
   https://trendpulse.3kpro.services/api/social-connections/oauth/facebook/callback
   ```
4. Use the same App ID and Secret

### Option B: Create Separate App

Follow the same steps as Instagram setup, but:
- Select **"Consumer"** app type (for posting to personal profiles)
- Add **Facebook Login** product instead of Instagram Graph API
- Request permissions: `pages_manage_posts`, `pages_read_engagement`

### Add to Environment Variables

```bash
vercel env add FACEBOOK_CLIENT_ID production
# Paste: <Your App ID>

vercel env add FACEBOOK_CLIENT_SECRET production
# Paste: <Your App Secret>
```

---

## 5. LinkedIn Setup

### Step 1: Create LinkedIn App

1. Go to https://www.linkedin.com/developers
2. Click **"Create app"**
3. Fill in:
   - **App name:** `3K Pro Services`
   - **LinkedIn Page:** Select your company page
4. Upload logo and agree to terms

### Step 2: Configure Products

1. Go to **"Products"** tab
2. Request access to **"Share on LinkedIn"**
3. Request access to **"Sign In with LinkedIn"**

### Step 3: Add Redirect URI

1. Go to **"Auth"** tab
2. Add **Redirect URLs:**
   ```
   https://trendpulse.3kpro.services/api/social-connections/oauth/linkedin/callback
   ```

### Step 4: Get Credentials

1. Go to **"Auth"** tab
2. Copy **Client ID**
3. Copy **Client Secret** (click "Show")

### Step 5: Add to Environment Variables

```bash
vercel env add LINKEDIN_CLIENT_ID production
# Paste: <Your Client ID>

vercel env add LINKEDIN_CLIENT_SECRET production
# Paste: <Your Client Secret>
```

---

## 6. Twitter/X Setup

### Step 1: Create Twitter Developer Account

1. Go to https://developer.twitter.com/en/portal
2. Sign up for developer account
3. Complete application (describe your use case)

### Step 2: Create App

1. In developer portal, create **"Standalone App"**
2. Name: `3K Pro Services`
3. Select **"Read and Write"** permissions

### Step 3: Enable OAuth 2.0

1. Go to app settings → **"User authentication settings"**
2. Enable **"OAuth 2.0"**
3. Set **Type:** `Web App, Automated App or Bot`
4. Add **Callback URI:**
   ```
   https://trendpulse.3kpro.services/api/social-connections/oauth/twitter/callback
   ```
5. Add **Website URL:** `https://trendpulse.3kpro.services`

### Step 4: Get Credentials

1. Go to **"Keys and tokens"**
2. Copy **Client ID** (OAuth 2.0)
3. Copy **Client Secret** (OAuth 2.0)

### Step 5: Add to Environment Variables

```bash
vercel env add TWITTER_CLIENT_ID production
# Paste: <Your Client ID>

vercel env add TWITTER_CLIENT_SECRET production
# Paste: <Your Client Secret>
```

---

## Complete Environment Variables Checklist

After completing all setups, verify you have these in Vercel:

```bash
# Instagram (via Facebook)
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...

# TikTok
TIKTOK_CLIENT_ID=...
TIKTOK_CLIENT_SECRET=...

# YouTube (via Google)
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...

# Facebook
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# LinkedIn
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Twitter/X
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...

# Existing (already set)
NEXT_PUBLIC_APP_URL=https://trendpulse.3kpro.services
ENCRYPTION_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Testing the OAuth Flows

### Test Each Platform:

1. Go to https://trendpulse.3kpro.services/settings
2. Click **"Connections"** tab
3. For each platform:
   - Click **"Connect [Platform]"**
   - Verify redirect to platform OAuth page
   - Authorize the app
   - Verify redirect back to Settings
   - Check connection appears as "Connected"
   - Click **"Test"** to validate

### Troubleshooting:

**Redirect URI Mismatch:**
- Double-check redirect URIs in platform settings
- Must match exactly: `https://trendpulse.3kpro.services/api/social-connections/oauth/[platform]/callback`

**Invalid Client Credentials:**
- Verify environment variables in Vercel
- Check for extra spaces or line breaks
- Redeploy after adding env vars: `vercel --prod`

**Permission Denied:**
- Some platforms require app review before public use
- Use test/developer accounts while waiting
- Submit for review early (can take 1-7 days)

---

## App Review Checklist

**Platforms Requiring Review:**
- ✅ **Instagram** - Submit for review immediately (1-3 days)
- ✅ **LinkedIn** - Auto-approved for most permissions
- ✅ **YouTube** - May require review for certain scopes
- ⚠️ **Twitter** - Elevated access required for posting (apply separately)

**What Reviewers Look For:**
- Privacy policy published
- Terms of service published
- Clear description of how you use user data
- Video demo of your app (optional but recommended)

**Templates Provided:**
- `docs/PRIVACY_POLICY.md` - Customize for your use case
- `docs/TERMS_OF_SERVICE.md` - Standard SaaS terms

---

## Security Best Practices

1. **Never commit credentials to git**
   - All secrets stored in Vercel env vars
   - Use `.env.local` for local development only

2. **Rotate secrets regularly**
   - Every 6-12 months
   - Immediately if compromised

3. **Monitor OAuth usage**
   - Check `publishing_activity` table for anomalies
   - Set up alerts for unusual API usage

4. **Validate state parameter**
   - Already implemented in OAuth callback
   - Prevents CSRF attacks

---

**END OF ADMIN SETUP GUIDE**
