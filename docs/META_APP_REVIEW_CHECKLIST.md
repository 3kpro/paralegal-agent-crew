# Meta App Review Submission Checklist
**App Name:** Xelora
**Submission Date:** TBD
**Status:** Pre-submission verification

---

## ✅ Current Status

### What's Working:
- ✅ Facebook OAuth (basic `public_profile` permission)
- ✅ Instagram OAuth (connected via Facebook Page)
- ✅ Data Deletion Callback endpoint configured
- ✅ Privacy Policy published at https://xelora.app/privacy
- ✅ Terms of Service published at https://xelora.app/terms
- ✅ Footer links visible on homepage
- ✅ DMARC record configured for email security

### What Needs App Review:
- ⏳ `instagram_content_publish` - Required for Instagram publishing
- ⏳ `pages_manage_posts` - Required for Facebook Page publishing
- ⏳ `pages_read_engagement` - Optional for analytics

---

## 📋 Submission Requirements Checklist

### 1. App Information
- [x] **App Name:** Xelora
- [x] **App Icon:** 1024x1024px (in `/public`)
- [x] **Category:** Social Media Management
- [x] **Website:** https://xelora.app
- [x] **Privacy Policy URL:** https://xelora.app/privacy
- [x] **Terms of Service URL:** https://xelora.app/terms

### 2. Technical Setup
- [x] **Facebook Login** enabled
- [x] **Valid OAuth Redirect URIs:**
  - `https://xelora.app/api/auth/callback/facebook`
  - `https://xelora.app/api/auth/callback/instagram`
- [x] **Data Deletion Callback URL:** `https://xelora.app/api/data-deletion`
- [x] **SSL Certificate:** Valid (via Vercel)
- [x] **HTTPS Enforced:** Yes

### 3. Permissions Justification

#### `instagram_content_publish`
**Use Case:** Allow users to publish AI-generated content directly to their Instagram Business accounts

**Why Needed:**
- Users create marketing content with Xelora's AI
- One-click publishing saves time vs manual copy-paste
- Content is scheduled for optimal engagement times

**User Benefit:**
- Seamless workflow from content creation to publishing
- Analytics tracking for post performance
- Multi-platform publishing from single dashboard

#### `pages_manage_posts`
**Use Case:** Allow users to publish AI-generated content to their Facebook Pages

**Why Needed:**
- Similar to Instagram - streamlined publishing workflow
- Supports Facebook Page content scheduling
- Enables cross-platform content distribution

**User Benefit:**
- Unified social media management
- Time-saving automation
- Professional content scheduling

### 4. Demo Video Requirements
- [ ] **Screen recording** showing complete user flow:
  1. User logs in to Xelora
  2. Connects Instagram (Business account)
  3. Connects Facebook Page
  4. Generates AI content
  5. Publishes to Instagram/Facebook
  6. Views published post on platforms

- [ ] **Duration:** 3-5 minutes
- [ ] **Format:** MP4, max 50MB
- [ ] **Narration:** Clear explanation of each permission's use

### 5. Business Verification (Optional for Development Mode)
- [ ] **Business Manager:** Not required for initial submission
- [ ] **LLC Documentation:** Not required for app review
- [ ] **Domain Verification:** Completed via Vercel

---

## 📝 Submission Preparation

### Step-by-Step Instructions:

1. **Go to Facebook App Dashboard**
   - Navigate to App Review → Permissions and Features
   - Request `instagram_content_publish`
   - Request `pages_manage_posts`

2. **Provide Use Case Details**
   - Paste justifications from Section 3 above
   - Upload demo video
   - Add screenshots of permission prompts

3. **Testing Instructions for Reviewers**
   ```
   Test Account: (Create a test user in App Roles → Test Users)

   Steps to Test:
   1. Visit https://xelora.app
   2. Click "Sign Up" and create an account
   3. Complete onboarding wizard
   4. On Step 4, click "Connect Instagram"
   5. Login with test account
   6. Grant requested permissions
   7. Verify connection appears in dashboard
   8. Generate sample content
   9. Click "Publish to Instagram"
   10. Verify content appears on Instagram
   ```

4. **Platform Policy Compliance**
   - [x] No data selling or unauthorized sharing
   - [x] Data deletion capability implemented
   - [x] Privacy policy clearly states data usage
   - [x] User consent obtained before publishing
   - [x] No misleading permission requests

---

## 🎯 User Flow Documentation

### Instagram Publishing Flow:

1. **Account Setup (User Side):**
   - Instagram account must be Business or Creator
   - Account must be linked to a Facebook Page
   - User must be admin/editor of the Page

2. **OAuth Connection (Xelora Side):**
   - User clicks "Connect Instagram"
   - Redirects to Facebook OAuth dialog
   - Requests permissions: `public_profile`, `instagram_content_publish`, `pages_manage_posts`
   - User grants permissions
   - Xelora stores access token (encrypted)

3. **Publishing (API Call):**
   ```
   POST /{page_id}/media
   {
     "image_url": "...",
     "caption": "AI-generated content",
     "access_token": "..."
   }

   POST /{page_id}/media_publish
   {
     "creation_id": "...",
     "access_token": "..."
   }
   ```

---

## ⚠️ Common Rejection Reasons & Prevention

### Rejection Reason: "Insufficient justification"
**Prevention:** Provide detailed use case with real-world examples

### Rejection Reason: "Missing demo video"
**Prevention:** Record comprehensive demo showing every permission in use

### Rejection Reason: "Privacy policy incomplete"
**Prevention:** Ensure privacy policy mentions Instagram/Facebook data handling

### Rejection Reason: "Data deletion not working"
**Prevention:** Test `/api/data-deletion` endpoint thoroughly

---

## 🔄 Post-Approval Steps

Once approved:
1. Update OAuth scopes in production:
   - Add `instagram_content_publish`
   - Add `pages_manage_posts`
2. Deploy updated code to Vercel
3. Test with real user accounts
4. Monitor for API errors
5. Update documentation

---

## 📞 Support & Resources

- **Meta Developer Support:** https://developers.facebook.com/support
- **Instagram API Docs:** https://developers.facebook.com/docs/instagram-api
- **App Review Guidelines:** https://developers.facebook.com/docs/app-review

---

**Last Updated:** December 21, 2024
**Owner:** 3K Pro Services
**Next Review:** After App Approval
