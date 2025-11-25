# Social Media Platforms Setup - Master Guide

This guide covers setup for all social media integrations in TrendPulse.

> **Platform Model**: Your users authorize **your centralized apps** (TrendPulse) to post on their behalf. You create one app per platform, manage the credentials, and your paid subscribers get instant access to multi-platform publishing without creating their own developer apps.

## 📊 Platform Status Overview

| Platform | OAuth | Posting | Setup Difficulty | API Approval Required | Estimated Time |
|----------|-------|---------|-----------------|----------------------|----------------|
| ✅ **Twitter** | ✅ Done | ✅ Done | Easy | ❌ No | **5 min** |
| ✅ **Instagram** | ✅ Done | ✅ Done | Medium | ⚠️ Maybe* | **30 min** |
| ✅ **LinkedIn** | ✅ Done | ✅ Done | Easy | ⚠️ Usually instant | **15 min** |
| ✅ **TikTok** | ✅ Done | ✅ Done | Medium | ⚠️ Yes (3-7 days) | **20 min + wait** |
| ❌ **Facebook** | ✅ Done | ✅ Done | Easy | ⚠️ Maybe* | **20 min** |

\* Instagram and Facebook may work in Development Mode without App Review, but require review for production.

## 🎯 Recommended Setup Order

### Phase 1: Quick Wins (Day 1)
1. ✅ **Twitter** - Works immediately, no approval needed
   - See: [CHANGELOG.md](CHANGELOG.md) - Already completed!
2. ✅ **LinkedIn** - Usually instant approval
   - See: [LINKEDIN_QUICK_START.md](LINKEDIN_QUICK_START.md)

### Phase 2: Moderate Setup (Day 1-2)
3. ⚠️ **Instagram** - Test in Development Mode
   - See: [INSTAGRAM_QUICK_START.md](INSTAGRAM_QUICK_START.md)
   - Can test with your own account immediately
   - Submit for review when ready for production
4. ⚠️ **Facebook** - Similar to Instagram
   - Can test with your own account immediately

### Phase 3: Long Wait (Week 1)
5. ⏳ **TikTok** - Requires Content Posting API approval
   - See: [TIKTOK_QUICK_START.md](TIKTOK_QUICK_START.md)
   - OAuth works immediately
   - Posting requires 3-7 day approval

## 📝 Platform-Specific Guides

### Twitter / X ✅
**Status**: Fully working (completed 2024-11-24)

**What it does:**
- OAuth 2.0 with PKCE
- Post tweets with text and images
- Automatic token refresh
- Encrypted token storage

**Setup:** Already done! See [CHANGELOG.md](CHANGELOG.md)

---

### Instagram 📸
**Status**: Code ready, needs credentials

**What it does:**
- OAuth via Facebook
- Post photos with captions
- 2-step posting (create container → publish)
- Instagram Business Account support

**Requirements:**
- Facebook Developer App
- Instagram Business/Creator account
- Account linked to Facebook Page

**Setup Guide:** [INSTAGRAM_QUICK_START.md](INSTAGRAM_QUICK_START.md)

**Quick Start:**
1. Get App Secret from Facebook: https://developers.facebook.com/apps/4229064840746963/settings/basic/
2. Add to `.env.local`: `INSTAGRAM_CLIENT_SECRET=your_secret`
3. Add redirect URIs to Facebook app
4. Test connection!

---

### LinkedIn 💼
**Status**: Code ready, needs credentials

**What it does:**
- OAuth 2.0 with OpenID Connect
- Post to user's feed (text + images)
- Multi-image support (up to 9)
- Professional profile integration

**Requirements:**
- LinkedIn Developer App
- Company Page (for app creation)
- "Share on LinkedIn" product approval

**Setup Guide:** [LINKEDIN_QUICK_START.md](LINKEDIN_QUICK_START.md)

**Quick Start:**
1. Create app: https://www.linkedin.com/developers/apps
2. Get Client ID and Secret
3. Add to `.env.local`
4. Request "Share on LinkedIn" product
5. Test connection!

---

### TikTok 🎵
**Status**: Code ready, needs credentials + API approval

**What it does:**
- OAuth 2.0
- Post videos with titles
- Content Posting API v2
- Auto token refresh

**Requirements:**
- TikTok Developer App
- Content Posting API approval (3-7 days)
- Video content (MP4, 720p+)

**Setup Guide:** [TIKTOK_QUICK_START.md](TIKTOK_QUICK_START.md)

**Quick Start:**
1. Create app: https://developers.tiktok.com/
2. Get Client Key and Secret
3. Add to `.env.local`
4. Apply for Content Posting API
5. Test OAuth (works now!)
6. Test posting (after approval)

---

### Facebook 📘
**Status**: Code ready, needs credentials

**What it does:**
- OAuth via Facebook Graph API
- Post to Pages (not personal timeline)
- Photo + text posts
- Page access token support

**Requirements:**
- Facebook Developer App (same as Instagram)
- Facebook Page
- Pages manage permissions

**Setup:** Similar to Instagram (uses same app)

## 🔧 Environment Variables

Add these to `.env.local`:

```bash
# Twitter (✅ Already configured)
TWITTER_CLIENT_ID=cTd1STFLbms1RXRaSWFmQnBPaFQ6MTpjaQ
TWITTER_CLIENT_SECRET=6QVXUiWzcl59bpYeWtdyzyGfFIxuLzVF_7oqJptBlMQEQ1TeOw

# LinkedIn (⏳ Needs credentials)
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here

# Instagram/Facebook (⏳ Partially configured)
INSTAGRAM_CLIENT_ID=4229064840746963
INSTAGRAM_CLIENT_SECRET=YOUR_APP_SECRET_HERE

# Facebook (⏳ Needs credentials)
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# TikTok (⏳ Needs credentials)
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

## 🧪 Testing Checklist

For each platform, test:

### 1. OAuth Connection ✅
- [ ] Click "Connect [Platform]" in Settings > Connections
- [ ] Redirected to platform OAuth page
- [ ] Authorize app
- [ ] Redirected back to Settings with success message
- [ ] Connection shows in list with username

### 2. Connection Management ✅
- [ ] "Test" button shows connection works
- [ ] "Reconnect" button works
- [ ] "Remove" button deletes connection
- [ ] Connection status badge shows correct state

### 3. Publishing ✅
- [ ] Create campaign with generated content
- [ ] Click "Publish" button
- [ ] Success toast with clickable link
- [ ] Post appears on platform
- [ ] Redirects to campaigns list

## 🚀 Production Deployment

### Before Going Live:

1. **Add Production Redirect URIs** to all apps:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/twitter
   https://trendpulse.3kpro.services/api/auth/callback/instagram
   https://trendpulse.3kpro.services/api/auth/callback/linkedin
   https://trendpulse.3kpro.services/api/auth/callback/tiktok
   https://trendpulse.3kpro.services/api/auth/callback/facebook
   ```

2. **Update Environment Variables** in Vercel:
   - Add all platform credentials
   - Verify encryption key is set
   - Test on staging first

3. **App Review Status**:
   - ✅ Twitter: No review needed
   - ⚠️ Instagram: Submit for review if needed
   - ⚠️ LinkedIn: Usually instant
   - ⏳ TikTok: Wait for approval
   - ⚠️ Facebook: Submit for review if needed

4. **Move Apps to Live Mode**:
   - Instagram/Facebook: Switch from Development to Live
   - TikTok: Submit for production review
   - LinkedIn: Already live after product approval

## 🎓 Architecture Overview

All platforms follow the same pattern:

```
User clicks "Connect"
  → /api/auth/connect/[platform]
  → Platform OAuth page
  → User authorizes
  → /api/auth/callback/[platform]
  → Exchange code for token
  → Fetch user profile
  → Encrypt & store in DB
  → Redirect to Settings ✅

User clicks "Publish"
  → /api/social/post
  → Get valid token (auto-refresh if expired)
  → Platform-specific posting API
  → Return post URL
  → Show success toast ✅
```

## 📊 Feature Comparison

| Feature | Twitter | Instagram | LinkedIn | TikTok | Facebook |
|---------|---------|-----------|----------|--------|----------|
| Text posts | ✅ Yes | ✅ Yes (with image) | ✅ Yes | ❌ No | ✅ Yes |
| Image posts | ✅ Yes | ✅ Yes (required) | ✅ Yes | ❌ No | ✅ Yes |
| Video posts | ❌ Not yet | ❌ Not yet | ❌ Not yet | ✅ Yes | ❌ Not yet |
| Multiple images | ✅ Up to 4 | ❌ Single only | ✅ Up to 9 | ❌ Single video | ✅ Yes |
| Auto-refresh tokens | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Character limit | 280 | 2,200 | 3,000 | Video title | 63,206 |

## 🐛 Common Issues

### All Platforms:
- **"Unauthorized" error**: Check credentials in `.env.local`
- **"Invalid redirect URI"**: Must match exactly in platform settings
- **Token expired**: Auto-refresh should handle this, check logs

### Platform-Specific:
- **Instagram**: Requires Business account, not personal
- **LinkedIn**: Need "Share on LinkedIn" product approved
- **TikTok**: Need Content Posting API approved
- **Facebook**: Need to select correct Page

## 📚 Additional Resources

- [Twitter OAuth 2.0 Docs](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [LinkedIn OAuth](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)

## 🎯 Next Steps

1. **Finish Instagram Setup**: Get App Secret, test connection
2. **Setup LinkedIn**: Create app, get credentials
3. **Setup TikTok**: Create app, apply for API access
4. **Test All Platforms**: Follow testing checklist
5. **Deploy to Production**: Add production redirect URIs
6. **Enable for Users**: Make available to paid subscribers

---

**Questions?** Check the platform-specific guides linked above for detailed troubleshooting and setup instructions.
