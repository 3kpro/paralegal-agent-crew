# Meta Platform Permissions Reference

**Last Updated:** December 21, 2024
**App Name:** Xelora
**Facebook App ID:** `${FACEBOOK_APP_ID}`

---

## 📊 Permission Status Overview

### ✅ Currently Available (Development Mode)
These permissions are available immediately without App Review:

| Permission | Platform | Purpose | Status |
|------------|----------|---------|--------|
| `public_profile` | Facebook | Access user's public profile info (name, profile picture) | ✅ Active |
| `email` | Facebook | Access user's email address | ✅ Active |
| `user_profile` | Instagram | Access Instagram user profile info | ✅ Active |
| `user_media` | Instagram | Read Instagram media (images, videos) | ✅ Active |

**Current Capabilities:**
- ✅ Users can log in with Facebook
- ✅ Users can connect Instagram accounts
- ✅ We can read basic user profile information
- ❌ Cannot publish to Facebook Pages
- ❌ Cannot publish to Instagram

---

### ⏳ Pending App Review (Required for Publishing)
These permissions require Meta's App Review approval:

| Permission | Platform | Purpose | App Review Required | Priority |
|------------|----------|---------|-------------------|----------|
| `instagram_content_publish` | Instagram | Publish photos and videos to Instagram | ✅ Yes | 🔴 Critical |
| `pages_manage_posts` | Facebook | Create, edit, and delete posts on Facebook Pages | ✅ Yes | 🔴 Critical |
| `pages_read_engagement` | Facebook | Read engagement data (likes, comments, shares) | ✅ Yes | 🟡 Optional |
| `pages_show_list` | Facebook | View list of Facebook Pages user manages | ✅ Yes | 🟡 Optional |

---

## 🔍 Detailed Permission Breakdown

### 1. `instagram_content_publish`

**What it does:**
- Allows Xelora to publish photos, videos, and carousels to user's Instagram Business or Creator account
- Supports caption text, hashtags, and location tags
- Enables Instagram Stories publishing

**Why we need it:**
- Core feature: One-click publishing of AI-generated content to Instagram
- Saves users time vs manual copy-paste workflow
- Enables scheduled posting for optimal engagement times

**Use Case (for App Review):**
> "Xelora is a social media management platform that uses AI to generate marketing content. Users create content with our AI tools and publish directly to Instagram with one click. This permission allows us to post on behalf of the user to their Instagram Business/Creator account, eliminating the need to manually copy and paste content."

**Technical Details:**
- **API Endpoint:** `POST /{ig-user-id}/media`
- **Required Account Type:** Instagram Business or Creator account
- **Additional Requirements:** Account must be linked to a Facebook Page
- **Scopes Needed Together:** `instagram_content_publish`, `pages_show_list`

**Review Requirements:**
- ✅ Demo video showing content creation → Instagram publishing flow
- ✅ Screenshot of permission prompt during OAuth
- ✅ Privacy Policy stating Instagram data usage
- ✅ Data Deletion callback configured

---

### 2. `pages_manage_posts`

**What it does:**
- Allows Xelora to create, edit, and delete posts on Facebook Pages the user manages
- Supports text posts, images, videos, and links
- Enables scheduling and editing of Page posts

**Why we need it:**
- Core feature: Multi-platform publishing from single dashboard
- Users can publish AI-generated content to Facebook Pages
- Supports Facebook Page content strategy alongside Instagram

**Use Case (for App Review):**
> "Xelora enables users to publish AI-generated marketing content to their Facebook Pages. Users manage business Pages and need to post content efficiently. This permission allows us to publish posts on behalf of the user to Pages they manage, enabling unified social media management across Instagram and Facebook."

**Technical Details:**
- **API Endpoint:** `POST /{page-id}/feed`
- **Required:** User must be admin/editor of the Facebook Page
- **Works With:** Personal Facebook accounts managing business Pages
- **Scopes Needed Together:** `pages_manage_posts`, `pages_show_list`

**Review Requirements:**
- ✅ Demo video showing content creation → Facebook Page publishing flow
- ✅ Screenshot of permission prompt during OAuth
- ✅ Privacy Policy stating Facebook Page data usage
- ✅ Data Deletion callback configured

---

### 3. `pages_read_engagement` (Optional)

**What it does:**
- Allows reading engagement metrics (likes, comments, shares, reactions)
- Provides post performance analytics
- Enables insights into audience behavior

**Why we need it:**
- Enhancement: Show users how their published content is performing
- Analytics dashboard for post engagement tracking
- Helps users optimize content strategy

**Use Case (for App Review):**
> "Xelora provides content performance analytics to help users understand what content resonates with their audience. This permission allows us to retrieve engagement metrics (likes, comments, shares) for posts published through our platform, enabling data-driven content decisions."

**Technical Details:**
- **API Endpoint:** `GET /{page-id}/insights`, `GET /{post-id}/insights`
- **Data Retrieved:** Like count, comment count, share count, reach, impressions
- **Retention:** Metrics are stored temporarily for dashboard display

**Review Requirements:**
- ✅ Demo video showing analytics dashboard with engagement data
- ✅ Privacy Policy stating how engagement data is used
- ⚠️ Priority: Lower (can be submitted in future update)

---

### 4. `pages_show_list` (Optional)

**What it does:**
- Allows retrieving a list of Facebook Pages the user manages
- Shows Page ID, name, access token for each Page

**Why we need it:**
- User Experience: Display which Pages user can publish to
- Account selection: Let users choose which Page to connect
- Required for: Both `instagram_content_publish` and `pages_manage_posts` workflows

**Use Case (for App Review):**
> "Xelora needs to show users which Facebook Pages they manage so they can select which Page to use for publishing. This permission retrieves the list of Pages the user has admin/editor access to, enabling them to connect the correct Page for Instagram and Facebook publishing."

**Technical Details:**
- **API Endpoint:** `GET /me/accounts`
- **Returns:** Array of Pages with `id`, `name`, `access_token`
- **Used In:** OAuth connection flow, account selection UI

**Review Requirements:**
- ✅ Demo video showing Page selection interface
- ✅ Screenshot of permission prompt during OAuth
- ⚠️ Usually approved automatically with `pages_manage_posts`

---

## 🔄 Development Mode vs Live Mode

### Development Mode (Current Status)
- **Available Permissions:** Basic permissions only (`public_profile`, `email`, `user_profile`, `user_media`)
- **Testers:** Limited to app admins, developers, and testers added in App Roles
- **Publishing:** ❌ Not available
- **User Limit:** Up to 1,000 test users
- **Data Access:** Read-only for most APIs

### Live Mode (After App Review)
- **Available Permissions:** All approved permissions including publishing
- **Users:** Any Facebook/Instagram user can connect
- **Publishing:** ✅ Fully functional
- **User Limit:** Unlimited
- **Data Access:** Full API access per approved permissions

**Note:** You can continue developing and testing in Development Mode while waiting for App Review. Once approved, simply update environment variables and deploy—no code changes needed.

---

## 📋 App Review Submission Checklist

Before submitting for App Review, ensure:

### Required for All Permissions
- [x] Privacy Policy published at https://xelora.app/privacy
- [x] Terms of Service published at https://xelora.app/terms
- [x] Both linked from homepage footer
- [x] Data Deletion callback configured at https://xelora.app/api/data-deletion
- [x] App icon (1024x1024px) uploaded
- [x] Valid HTTPS on all endpoints

### Required for `instagram_content_publish`
- [ ] Demo video showing Instagram publishing flow (3-5 minutes)
- [ ] Screenshot of permission prompt during Instagram OAuth
- [ ] Detailed use case justification (see above)
- [ ] Instagram Business account set up for testing
- [ ] Test user created and granted tester access

### Required for `pages_manage_posts`
- [ ] Demo video showing Facebook Page publishing flow (3-5 minutes)
- [ ] Screenshot of permission prompt during Facebook OAuth
- [ ] Detailed use case justification (see above)
- [ ] Facebook Page created for testing
- [ ] Test user created with Page admin access

### Optional (Recommended)
- [ ] Privacy Policy mentions Instagram and Facebook data handling
- [ ] Privacy Policy specifies data retention period
- [ ] Testing instructions document for reviewers
- [ ] Screenshots of published content on Instagram/Facebook

---

## 🎥 Demo Video Requirements

Meta requires a screencast demo showing each permission in use:

### Video Specs
- **Format:** MP4, MOV, or AVI
- **Max Size:** 50MB
- **Duration:** 3-5 minutes per permission
- **Quality:** 720p minimum, clear narration

### Content to Include

**For `instagram_content_publish`:**
1. User logs into Xelora
2. User clicks "Connect Instagram"
3. Facebook OAuth dialog appears, showing `instagram_content_publish` permission request
4. User grants permission
5. Instagram account appears as connected in Xelora dashboard
6. User generates AI content (show the interface)
7. User clicks "Publish to Instagram"
8. **CRITICAL:** Show Instagram app/web with the published post visible
9. Narration explaining each step

**For `pages_manage_posts`:**
1. User logs into Xelora
2. User clicks "Connect Facebook Page"
3. Facebook OAuth dialog appears, showing `pages_manage_posts` permission request
4. User grants permission
5. Facebook Page appears as connected in Xelora dashboard
6. User generates AI content (show the interface)
7. User clicks "Publish to Facebook"
8. **CRITICAL:** Show Facebook Page with the published post visible
9. Narration explaining each step

### Common Mistakes to Avoid
- ❌ Not showing the actual published content on Instagram/Facebook
- ❌ Using pre-recorded video instead of live demonstration
- ❌ Not showing permission prompt during OAuth
- ❌ Poor audio quality or no narration
- ❌ Video too long (>5 minutes) or too short (<2 minutes)

---

## 🚨 Common Rejection Reasons

### "Insufficient Use Case Justification"
**Why it happens:** Generic or vague explanation of why the permission is needed

**How to fix:**
- Provide specific, detailed use case with real-world example
- Explain user benefit, not just technical capability
- Include workflow: before (manual) vs after (automated)

### "Permission Not Used in Demo"
**Why it happens:** Demo video doesn't clearly show the permission being used

**How to fix:**
- Show OAuth permission prompt explicitly
- Demonstrate end-to-end flow from permission grant to published content
- Include narration pointing out when permission is being used

### "Privacy Policy Incomplete"
**Why it happens:** Privacy Policy doesn't mention Instagram/Facebook data handling

**How to fix:**
- Add section specifically about social media integrations
- Mention what data is collected (access tokens, profile info)
- Explain how long data is retained
- Describe how users can revoke access

### "Data Deletion Not Working"
**Why it happens:** Data deletion callback returns error or doesn't actually delete data

**How to fix:**
- Test `/api/data-deletion` endpoint thoroughly
- Return proper JSON response with `confirmation_code` and `url`
- Implement actual data deletion logic in Supabase
- Provide status page at `/data-deletion-status/[code]`

---

## 📞 Next Steps

1. **Create Demo Videos**
   - Record Instagram publishing demo
   - Record Facebook Page publishing demo
   - Edit and compress to <50MB each

2. **Test Data Deletion**
   - Verify endpoint works: `curl https://xelora.app/api/data-deletion`
   - Test with real OAuth tokens
   - Confirm Supabase data deletion executes

3. **Submit for Review**
   - Navigate to Facebook App Dashboard → App Review
   - Request `instagram_content_publish` permission
   - Request `pages_manage_posts` permission
   - Upload demo videos and screenshots
   - Paste use case justifications
   - Submit for review

4. **Monitor Review Status**
   - Reviews typically take 3-7 business days
   - Check App Dashboard for updates
   - Respond promptly to any Meta feedback

5. **Post-Approval Deployment**
   - Update OAuth scopes in `app/api/auth/connect/[platform]/route.ts`
   - Deploy to Vercel
   - Test with real user accounts
   - Monitor for API errors

---

## 📚 Resources

- **Meta App Review Docs:** https://developers.facebook.com/docs/app-review
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **Facebook Pages API:** https://developers.facebook.com/docs/pages-api
- **Permission Reference:** https://developers.facebook.com/docs/permissions/reference

---

**Document Owner:** Engineering Team
**Review Frequency:** Before each App Review submission
**Status:** ✅ Active
