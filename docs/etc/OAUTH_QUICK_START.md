# OAuth Setup - Quick Start

## 🔧 For You: Vercel CLI Commands

**First, decide which domain you're using:**
- **Option 1**: `ccai.3kpro.services` (current)
- **Option 2**: `trendpulse.3kpro.services` (planned)

### Step 1: Add OAuth Credentials to Vercel

Run these commands (paste credentials when prompted):

```bash
# Twitter
vercel env add TWITTER_CLIENT_ID production
vercel env add TWITTER_CLIENT_SECRET production

# LinkedIn
vercel env add LINKEDIN_CLIENT_ID production
vercel env add LINKEDIN_CLIENT_SECRET production

# Facebook (also used for Instagram)
vercel env add FACEBOOK_CLIENT_ID production
vercel env add FACEBOOK_CLIENT_SECRET production

# Instagram (usually same as Facebook)
vercel env add INSTAGRAM_CLIENT_ID production
vercel env add INSTAGRAM_CLIENT_SECRET production

# TikTok
vercel env add TIKTOK_CLIENT_KEY production
vercel env add TIKTOK_CLIENT_SECRET production

# Reddit
vercel env add REDDIT_CLIENT_ID production
vercel env add REDDIT_CLIENT_SECRET production
```

### Step 2: Redeploy

```bash
vercel --prod
```

---

## 📋 For Gemini: Redirect URIs to Configure

**IMPORTANT:** Ask owner which domain to use, then configure ALL platforms with that same domain.

### If using ccai.3kpro.services:

**Copy/paste these exact URLs into each platform:**

| Platform | Redirect URI |
|----------|-------------|
| **Twitter** | `https://ccai.3kpro.services/api/auth/callback/twitter` |
| **LinkedIn** | `https://ccai.3kpro.services/api/auth/callback/linkedin` |
| **Facebook** | `https://ccai.3kpro.services/api/auth/callback/facebook` |
| **Instagram** | `https://ccai.3kpro.services/api/auth/callback/instagram` |
| **TikTok** | `https://ccai.3kpro.services/api/auth/callback/tiktok` |
| **Reddit** | `https://ccai.3kpro.services/api/auth/callback/reddit` |

**Twitter Website URL:** `https://ccai.3kpro.services`

---

### If using trendpulse.3kpro.services:

**Copy/paste these exact URLs into each platform:**

| Platform | Redirect URI |
|----------|-------------|
| **Twitter** | `https://trendpulse.3kpro.services/api/auth/callback/twitter` |
| **LinkedIn** | `https://trendpulse.3kpro.services/api/auth/callback/linkedin` |
| **Facebook** | `https://trendpulse.3kpro.services/api/auth/callback/facebook` |
| **Instagram** | `https://trendpulse.3kpro.services/api/auth/callback/instagram` |
| **TikTok** | `https://trendpulse.3kpro.services/api/auth/callback/tiktok` |
| **Reddit** | `https://trendpulse.3kpro.services/api/auth/callback/reddit` |

**Twitter Website URL:** `https://trendpulse.3kpro.services`

---

## Platform Links (for Gemini)

1. **Twitter**: https://developer.twitter.com/en/portal/dashboard
2. **LinkedIn**: https://www.linkedin.com/developers/apps
3. **Facebook**: https://developers.facebook.com/apps
4. **Instagram**: https://developers.facebook.com/apps (same as Facebook)
5. **TikTok**: https://developers.tiktok.com/
6. **Reddit**: https://www.reddit.com/prefs/apps

---

## Full Details

- **Complete setup guide**: [VERCEL_OAUTH_SETUP_GUIDE.md](VERCEL_OAUTH_SETUP_GUIDE.md)
- **Platform-specific instructions**: [OAUTH_REDIRECT_URIS_SETUP.md](OAUTH_REDIRECT_URIS_SETUP.md)
