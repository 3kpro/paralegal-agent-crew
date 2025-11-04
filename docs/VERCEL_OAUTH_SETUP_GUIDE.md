# OAuth Setup Guide - Vercel Deployment

## Overview

This guide walks you through setting up **centralized OAuth credentials** for all social media platforms. This enables **one-click social account connection** for all users without them needing to create their own OAuth apps.

## Prerequisites

✅ Vercel CLI installed and logged in (`vercel whoami` shows `3kpro`)  
✅ Project deployed to Vercel (`landing-page` project exists)  
✅ Production deployment running

## Phase 1: Register OAuth Applications

You need to register **ONE OAuth app per platform** that will serve ALL users.

### 1. Twitter/X OAuth App

**Register at:** https://developer.twitter.com/en/portal/dashboard

**Steps:**
1. Create new app or use existing
2. Go to **App settings** → **User authentication settings**
3. Enable **OAuth 2.0**
4. App type: **Web App, Automated App or Bot**
5. Callback URL: `https://your-production-domain.vercel.app/api/auth/callback/twitter`
6. Website URL: `https://your-production-domain.vercel.app`
7. **Save credentials:**
   - Client ID
   - Client Secret

**Permissions needed:**
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access` (for refresh tokens)

---

### 2. LinkedIn OAuth App

**Register at:** https://www.linkedin.com/developers/apps

**Steps:**
1. Click **Create app**
2. Fill in app details
3. Go to **Auth** tab
4. Add Redirect URL: `https://your-production-domain.vercel.app/api/auth/callback/linkedin`
5. Request access to **Sign In with LinkedIn** and **Share on LinkedIn** products
6. **Save credentials:**
   - Client ID
   - Client Secret

**Permissions (OAuth 2.0 scopes):**
- `openid`
- `profile`
- `email`
- `w_member_social` (for posting)

---

### 3. Facebook OAuth App (also for Instagram)

**Register at:** https://developers.facebook.com/apps

**Steps:**
1. Click **Create App** → Choose **Business** type
2. Add **Facebook Login** product
3. Go to **Facebook Login** → **Settings**
4. Add Valid OAuth Redirect URI: `https://your-production-domain.vercel.app/api/auth/callback/facebook`
5. Add **Instagram Basic Display** product (for Instagram)
6. **Save credentials:**
   - App ID
   - App Secret

**Permissions needed:**
- `pages_manage_posts` (Facebook posting)
- `instagram_basic` (Instagram profile)
- `instagram_content_publish` (Instagram posting)

---

### 4. TikTok OAuth App

**Register at:** https://developers.tiktok.com/

**Steps:**
1. Go to **My Apps** → **Create App**
2. Add **Login Kit** capability
3. Configure **Redirect URIs**: `https://your-production-domain.vercel.app/api/auth/callback/tiktok`
4. Enable **Video Kit** for posting
5. Submit for review (may take 1-2 days)
6. **Save credentials:**
   - Client Key
   - Client Secret

**Scopes needed:**
- `user.info.basic`
- `video.upload`
- `video.publish`

---

## Phase 2: Add Credentials to Vercel

### Option A: Interactive PowerShell Script (Recommended)

```powershell
# Navigate to project
cd C:\DEV\3K-Pro-Services\landing-page

# Run the setup script
.\scripts\setup-oauth-env.ps1
```

The script will prompt you to paste each credential one by one.

### Option B: Manual Commands

```bash
# Twitter
vercel env add TWITTER_CLIENT_ID production
vercel env add TWITTER_CLIENT_SECRET production

# LinkedIn
vercel env add LINKEDIN_CLIENT_ID production
vercel env add LINKEDIN_CLIENT_SECRET production

# Facebook
vercel env add FACEBOOK_APP_ID production
vercel env add FACEBOOK_APP_SECRET production

# TikTok
vercel env add TIKTOK_CLIENT_KEY production
vercel env add TIKTOK_CLIENT_SECRET production
```

### Verify Environment Variables

```bash
vercel env ls
```

You should see all 8 new variables listed as "Encrypted" in "Production" environment.

---

## Phase 3: Deploy to Production

After adding all environment variables:

```bash
# Deploy to production
vercel --prod
```

This will rebuild your app with the new OAuth credentials.

---

## Phase 4: Test OAuth Flows

1. Visit your production site: `https://your-domain.vercel.app`
2. Log in to your account
3. Go to **Settings** or **Social Accounts** page
4. Click **Connect Twitter** (or any platform)
5. **Expected flow:**
   - OAuth popup opens
   - Platform's authorization page loads
   - You grant permission
   - Popup closes
   - Account shows as "Connected" ✅

---

## Callback URLs Reference

Make sure these EXACT URLs are configured in each platform:

| Platform | Callback URL |
|----------|-------------|
| Twitter | `https://your-domain.vercel.app/api/auth/callback/twitter` |
| LinkedIn | `https://your-domain.vercel.app/api/auth/callback/linkedin` |
| Facebook | `https://your-domain.vercel.app/api/auth/callback/facebook` |
| TikTok | `https://your-domain.vercel.app/api/auth/callback/tiktok` |

⚠️ **Important:** Replace `your-domain.vercel.app` with your actual production URL

---

## Security Notes

✅ **Environment variables are encrypted** by Vercel  
✅ **Client secrets never exposed** to frontend  
✅ **Tokens stored encrypted** in Supabase (AES-256-GCM)  
✅ **OAuth state validation** prevents CSRF attacks  
✅ **Automatic token refresh** before expiration  

---

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution:** Verify the callback URL in platform settings matches EXACTLY (including https://)

### Issue: "Invalid client credentials"
**Solution:** 
1. Check environment variables: `vercel env ls`
2. Verify you added to "production" environment
3. Redeploy: `vercel --prod`

### Issue: OAuth popup closes immediately
**Solution:** Check browser console for errors, verify app is approved/live on platform

### Issue: "App not approved" (TikTok)
**Solution:** TikTok requires app review. Submit for review in TikTok Developer Portal (1-2 days)

---

## Current Status

**Code Status:** ✅ 100% Complete  
**Database Schema:** ✅ Ready  
**API Endpoints:** ✅ Implemented  
**UI Components:** ✅ Built  

**Credentials Status:**
- ⏸️ Twitter: Not yet registered
- ⏸️ LinkedIn: Not yet registered  
- ⏸️ Facebook: Not yet registered
- ⏸️ TikTok: Not yet registered

---

## Next Steps

1. ☐ Register OAuth apps on all 4 platforms (use this guide)
2. ☐ Run `.\scripts\setup-oauth-env.ps1` to add credentials
3. ☐ Deploy to production: `vercel --prod`
4. ☐ Test each OAuth flow
5. ☐ Monitor error logs in Vercel dashboard

---

## Files Reference

- **Setup Script:** `scripts/setup-oauth-env.ps1`
- **Template:** `.env.production.template`
- **OAuth Code:** `app/api/auth/connect/[platform]/route.ts`
- **Callback Handler:** `app/api/auth/callback/[platform]/route.ts`
- **UI Component:** `app/(portal)/social-accounts/page.tsx`

---

**Questions?** Check the existing implementation in `/docs/SOCIAL_OAUTH_SETUP.md`
