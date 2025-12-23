# OAuth Platform Compliance Checklist

**Last Updated:** December 20, 2024

This document tracks compliance requirements for all OAuth integrations.

---

## ✅ General Requirements (All Platforms)

### Website & Legal Pages
- [x] **Privacy Policy** exists at `/privacy`
- [x] **Terms of Service** exists at `/terms`
- [x] **Both linked from homepage footer** (required for all platforms)
- [x] **Website URL:** https://xelora.app
- [x] **App Icon/Logo:** Available in `/public` folder

### Technical Setup
- [x] **HTTPS enabled** (via Vercel)
- [x] **Valid SSL certificate**
- [x] **DMARC record configured** (prevents email spoofing)
- [ ] **SPF/DKIM configured** (when email is set up)

---

## 🐦 Twitter/X OAuth 2.0

### App Settings
- **Client Type:** Confidential Client
- **Redirect URI:** `https://xelora.app/api/auth/callback/twitter`
- **Permissions:** Read, Write, Direct Messages (optional)

### Compliance Requirements
- [x] Privacy Policy URL: `https://xelora.app/privacy`
- [x] Terms of Service URL: `https://xelora.app/terms`
- [x] PKCE implementation (code_challenge/code_verifier)
- [x] OAuth 2.0 with PKCE flow

### Status
✅ **Live** - OAuth approved and working

---

## 📘 Facebook OAuth

### App Settings
- **App ID:** `${FACEBOOK_APP_ID}`
- **Redirect URI:** `https://xelora.app/api/auth/callback/facebook`
- **Permissions:** email, public_profile
- **Note:** For Page publishing, same permissions as Instagram can be used

### Compliance Requirements
- [x] Privacy Policy URL: `https://xelora.app/privacy`
- [x] Terms of Service URL: `https://xelora.app/terms`
- [x] **Data Deletion Callback URL:** `https://xelora.app/api/data-deletion`
- [x] App icon (1024x1024px)
- [x] Data deletion callback configured
- [ ] App Review submission for advanced Page permissions (if needed)

### Status
✅ **Ready** - Basic OAuth working, data deletion endpoint configured

---

## 📷 Instagram OAuth

### App Settings
- **App ID:** Same as Facebook (Instagram is part of Meta)
- **Redirect URI:** `https://xelora.app/api/auth/callback/instagram`
- **Permissions (Development):** email, public_profile
- **Permissions (Production):** email, public_profile, pages_show_list, pages_manage_posts
- **Note:** Publishing requires App Review approval for `pages_manage_posts`

### Compliance Requirements
- [x] Privacy Policy URL: `https://xelora.app/privacy`
- [x] Terms of Service URL: `https://xelora.app/terms`
- [x] **Data Deletion Callback URL:** `https://xelora.app/api/data-deletion`
- [x] App icon (1024x1024px)
- [x] Instagram Business account linked to Facebook Page
- [ ] **PENDING:** App Review submission for `pages_manage_posts` permission (required for publishing)

### Status
🟡 **Testing** - Using basic permissions in Development Mode. Will submit `pages_manage_posts` for App Review before launch.

---

## 🎵 TikTok OAuth

### App Settings
- **Client Key:** `${TIKTOK_CLIENT_KEY}`
- **Redirect URI:** `https://xelora.app/api/auth/callback/tiktok`
- **Permissions:** user.info.basic, video.publish

### Compliance Requirements
- [x] Privacy Policy URL: `https://xelora.app/privacy`
- [x] Terms of Service URL: `https://xelora.app/terms`
- [x] **Header navigation links** ✅ (immediately visible, no scrolling needed)
- [x] **Footer links** ✅ (secondary location)
- [x] App icon

### Status
🟢 **APPROVED** - TikTok OAuth permissions active!

**Approval Date:** Dec 22, 2024
**Previous Rejection:** Privacy Policy and Terms links not easily accessible from homepage
**Fix Applied:**
- PRIMARY: Added Privacy and Terms links to header navigation ✅ Immediately visible
- SECONDARY: Footer links also present ✅
**Result:** Approved on resubmission ✅
**Next Step:** Test TikTok integration with real user accounts

---

## 💼 LinkedIn OAuth

### App Settings
- **Client ID:** `${LINKEDIN_CLIENT_ID}`
- **Redirect URI:** `https://xelora.app/api/auth/callback/linkedin`
- **Permissions:** r_liteprofile, w_member_social

### Compliance Requirements
- [x] Privacy Policy URL: `https://xelora.app/privacy`
- [x] Terms of Service URL: `https://xelora.app/terms`
- [x] App logo (100x100px minimum)

### Status
✅ **Live** - OAuth approved and working

---

## 📺 YouTube OAuth (Google)

### App Settings
- **Client ID:** `${GOOGLE_CLIENT_ID}`
- **Redirect URI:** `https://xelora.app/api/auth/callback/youtube`
- **Scopes:** youtube.upload, youtube.readonly

### Compliance Requirements
- [x] Privacy Policy URL: `https://xelora.app/privacy`
- [x] Terms of Service URL: `https://xelora.app/terms`
- [x] OAuth consent screen configured
- [ ] App verification (if requesting sensitive/restricted scopes)

### Status
🟡 **Pending** - OAuth implemented, needs testing

---

## 🔧 Implementation Checklist

### Endpoints Created
- [x] `/api/auth/connect/[platform]` - Initiates OAuth flow
- [x] `/api/auth/callback/[platform]` - Handles OAuth callback
- [x] `/api/data-deletion` - Facebook/Instagram data deletion callback ✨ NEW
- [x] `/data-deletion-status/[code]` - Status page for deletion requests ✨ NEW

### Security Features
- [x] PKCE for Twitter OAuth 2.0
- [x] State parameter validation
- [x] Token encryption (AES-256-GCM)
- [x] Secure token storage in Supabase
- [x] HTTPS-only cookies
- [x] CSRF protection via state parameter

### Error Handling
- [x] OAuth errors logged to console
- [x] User-friendly error messages
- [x] Redirect to dashboard on success
- [x] Redirect to error page on failure

---

## 📝 Platform-Specific URLs

### URLs to Configure in OAuth Apps

**Privacy Policy:**
```
https://xelora.app/privacy
```

**Terms of Service:**
```
https://xelora.app/terms
```

**Data Deletion Callback (Facebook/Instagram only):**
```
https://xelora.app/api/data-deletion
```

**Redirect URIs (one per platform):**
```
https://xelora.app/api/auth/callback/twitter
https://xelora.app/api/auth/callback/facebook
https://xelora.app/api/auth/callback/instagram
https://xelora.app/api/auth/callback/tiktok
https://xelora.app/api/auth/callback/linkedin
https://xelora.app/api/auth/callback/youtube
```

---

## 🚨 Common Rejection Reasons & Fixes

### "Privacy Policy not accessible from homepage"
**Fix:** Added footer links in `components/Footer.tsx`
**Platforms affected:** TikTok (rejected), all others (proactively fixed)

### "Missing data deletion callback"
**Fix:** Created `/api/data-deletion` endpoint
**Platforms affected:** Facebook, Instagram

### "Invalid redirect URI"
**Fix:** Ensure exact match (including https://, trailing slashes)
**Platforms affected:** All

### "App icon missing or wrong size"
**Fix:** Use 1024x1024px PNG with transparency
**Platforms affected:** Facebook, Instagram, TikTok

---

## ✅ Next Steps

1. **Wait for Vercel deployment** (footer links)
2. **Test data deletion endpoint:**
   ```bash
   curl https://xelora.app/api/data-deletion
   ```
3. **Resubmit TikTok app** with correct URLs
4. **Submit Facebook/Instagram app review** with data deletion URL
5. **Configure data deletion URL in Facebook App Dashboard:**
   - Go to Settings > Basic
   - Add URL under "Data Deletion Instructions URL"

---

## 📞 Support Contacts

**Email:** support@xelora.app
**Website:** https://xelora.app
**Documentation:** This file

---

**Document Status:** ✅ Active
**Owner:** Engineering Team
**Review Frequency:** On OAuth rejections or platform policy changes
