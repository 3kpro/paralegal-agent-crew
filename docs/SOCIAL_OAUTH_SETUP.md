# Social Media OAuth Setup Guide

## Overview
This guide explains how to configure OAuth credentials for all supported social media platforms. The Connect buttons on the Social Accounts page require these credentials to be properly configured in your environment variables.

---

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Twitter OAuth 2.0
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn OAuth 2.0
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Facebook OAuth 2.0
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Instagram OAuth 2.0
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# TikTok OAuth 2.0
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

---

## Platform Setup Instructions

### 1. Twitter (X) OAuth Setup

**Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App (or select existing)
3. Go to **App Settings** → **User authentication settings**
4. Configure OAuth 2.0:
   - **App permissions**: Read and Write
   - **Type of App**: Web App
   - **Callback URI**: `http://localhost:3000/api/auth/callback/twitter` (dev) or `https://yourdomain.com/api/auth/callback/twitter` (prod)
   - **Website URL**: Your app URL
5. Save your **Client ID** and **Client Secret**
6. Add to `.env.local`:
   ```bash
   TWITTER_CLIENT_ID=your_actual_client_id
   TWITTER_CLIENT_SECRET=your_actual_client_secret
   ```

**Required Scopes:**
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access`

---

### 2. LinkedIn OAuth Setup

**Steps:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new App
3. Go to **Auth** tab
4. Add **Redirect URLs**:
   - Dev: `http://localhost:3000/api/auth/callback/linkedin`
   - Prod: `https://yourdomain.com/api/auth/callback/linkedin`
5. Request access to **Sign In with LinkedIn using OpenID Connect** product
6. Copy **Client ID** and **Client Secret**
7. Add to `.env.local`:
   ```bash
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   ```

**Required Scopes:**
- `openid`
- `profile`
- `email`
- `w_member_social` (for posting)

---

### 3. Facebook OAuth Setup

**Steps:**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new App → Choose **Business** type
3. Add **Facebook Login** product
4. Configure OAuth settings:
   - **Valid OAuth Redirect URIs**:
     - Dev: `http://localhost:3000/api/auth/callback/facebook`
     - Prod: `https://yourdomain.com/api/auth/callback/facebook`
5. Go to **Settings** → **Basic**
6. Copy **App ID** and **App Secret**
7. Add to `.env.local`:
   ```bash
   FACEBOOK_CLIENT_ID=your_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
   ```

**Required Permissions:**
- `pages_manage_posts` (to post on behalf of pages)
- `pages_read_engagement` (to read page stats)
- `public_profile` (basic user info)

**Note**: Facebook requires app review for most permissions. Start with basic permissions for testing.

---

### 4. Instagram OAuth Setup

**Steps:**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Use the same app as Facebook or create new one
3. Add **Instagram Basic Display** product (for basic access)
4. Configure OAuth:
   - **Valid OAuth Redirect URIs**:
     - Dev: `http://localhost:3000/api/auth/callback/instagram`
     - Prod: `https://yourdomain.com/api/auth/callback/instagram`
   - **Deauthorize Callback URL**: Same as redirect URI
   - **Data Deletion Request URL**: Same as redirect URI
5. Copy **Instagram App ID** and **Instagram App Secret**
6. Add to `.env.local`:
   ```bash
   INSTAGRAM_CLIENT_ID=your_instagram_app_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
   ```

**Required Scopes:**
- `user_profile` (basic profile info)
- `user_media` (access to user's media)

**Note**: For publishing capabilities, you need **Instagram Graph API** which requires a Facebook Page connected to an Instagram Business account.

---

### 5. TikTok OAuth Setup

**Steps:**
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new App
3. Go to **Login Kit** settings
4. Add **Redirect URI**:
   - Dev: `http://localhost:3000/api/auth/callback/tiktok`
   - Prod: `https://yourdomain.com/api/auth/callback/tiktok`
5. Copy **Client Key** and **Client Secret**
6. Add to `.env.local`:
   ```bash
   TIKTOK_CLIENT_KEY=your_tiktok_client_key
   TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
   ```

**Required Scopes:**
- `user.info.basic`
- `video.list`
- `video.upload`

---

## Testing the Connection

1. **Start your dev server**: `npm run dev`
2. **Navigate to**: `http://localhost:3000/social-accounts`
3. **Click** any platform's Connect button
4. **You should be redirected** to that platform's OAuth consent screen
5. **After authorization**, you'll be redirected back with the account connected

---

## Troubleshooting

### Error: "OAuth credentials not configured"
**Solution**: Add the required `CLIENT_ID` and `CLIENT_SECRET` environment variables for that platform.

### Error: "redirect_uri_mismatch"
**Solution**: Make sure the callback URL in your platform's OAuth settings exactly matches:
- Dev: `http://localhost:3000/api/auth/callback/[platform]`
- Prod: `https://yourdomain.com/api/auth/callback/[platform]`

### Error: "insufficient_scope"
**Solution**: Request the required permissions/scopes for that platform in your OAuth app settings.

### Error: "Platform not supported"
**Solution**: This platform's OAuth flow hasn't been implemented yet. Contact support.

---

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Use different credentials** for development and production
3. **Rotate secrets** regularly, especially if exposed
4. **Request minimum scopes** needed for functionality
5. **Store tokens encrypted** in database (already implemented via AES-256-GCM)

---

## Production Deployment

When deploying to production (e.g., Vercel):

1. Update **all OAuth redirect URIs** in platform settings to your production domain
2. Add **all environment variables** to your hosting platform (Vercel → Settings → Environment Variables)
3. Update `NEXT_PUBLIC_APP_URL` to your production domain
4. Test each platform connection in production before going live

---

## Current Implementation Status

| Platform | OAuth Flow | Token Exchange | Profile Fetch | Publishing |
|----------|-----------|----------------|---------------|------------|
| Twitter | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| LinkedIn | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| Facebook | ✅ Complete | ✅ Complete | ✅ Complete | ⚠️ Partial |
| Instagram | ✅ Complete | ✅ Complete | ✅ Complete | ⚠️ Partial |
| TikTok | ✅ Complete | ✅ Complete | ✅ Complete | ⚠️ Partial |

---

## Support & Resources

- **Twitter API Docs**: https://developer.twitter.com/en/docs/authentication/oauth-2-0
- **LinkedIn API Docs**: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
- **Facebook API Docs**: https://developers.facebook.com/docs/facebook-login
- **Instagram API Docs**: https://developers.facebook.com/docs/instagram-basic-display-api
- **TikTok API Docs**: https://developers.tiktok.com/doc/login-kit-web

For implementation questions, see `app/api/auth/connect/[platform]/route.ts` and `app/api/auth/callback/[platform]/route.ts`
