# Meta App Review Submission Guide

**App Name:** Xelora
**Submission Date:** [TO BE FILLED]
**Permissions Requested:** `instagram_content_publish`, `pages_manage_posts`

---

## 🎯 Quick Submission Steps

1. Go to [Facebook App Dashboard](https://developers.facebook.com/apps/)
2. Select "Xelora" app
3. Navigate to **App Review** → **Permissions and Features**
4. Click **Request Advanced Access** for each permission below
5. Copy-paste the pre-written text from this document
6. Upload demo videos (create these first)
7. Submit for review

---

## 📝 Submission Form Fields

### Permission 1: `instagram_content_publish`

#### **Tell us how you'll use this permission**
```
Xelora is a social media management platform that helps businesses and creators publish AI-generated content to Instagram.

Our users create marketing content (posts, captions, hashtags) using our AI content generation tools. They can then publish this content directly to their Instagram Business or Creator accounts with one click, eliminating the need to manually copy and paste content between platforms.

This permission is essential for our core publishing feature, which allows users to:
- Publish AI-generated images and captions to Instagram feeds
- Schedule posts for optimal engagement times
- Manage multi-platform content distribution from a single dashboard

User Benefit:
Users save significant time by avoiding manual content transfer. Instead of generating content in Xelora, copying it, switching to Instagram, and pasting it manually, they can publish directly with one click. This streamlined workflow enables efficient social media management for busy professionals.

Technical Implementation:
When a user clicks "Publish to Instagram," Xelora uses the Instagram Graph API to create a media container with the user's content and publishes it to their connected Instagram Business account. We only publish content that the user explicitly approves and initiates.

Privacy & Security:
- We store Instagram access tokens securely (encrypted with AES-256-GCM)
- Users can revoke access at any time via their Instagram settings or our dashboard
- We never post content without explicit user action
- All user data can be deleted via our data deletion callback endpoint
```

#### **Provide step-by-step instructions on how to use this feature**
```
TESTING INSTRUCTIONS FOR REVIEWERS:

Prerequisites:
- Instagram account must be converted to Business or Creator account
- Instagram must be linked to a Facebook Page (we provide setup instructions in our onboarding)

Test Steps:
1. Visit https://xelora.app
2. Click "Sign Up" and create a test account
3. Complete the onboarding wizard (Steps 1-3)
4. On Step 4 "Connect Platforms," click "Connect Instagram"
5. You will be redirected to Facebook OAuth dialog
6. Grant the requested permissions (instagram_content_publish, pages_show_list)
7. You will be redirected back to Xelora with Instagram connected
8. Navigate to Dashboard → Content Generator
9. Generate sample social media content using the AI tools
10. Click "Publish" and select "Instagram" from the platform options
11. Review the preview and click "Confirm & Post"
12. Open Instagram app or web to verify the post appears in your feed
13. The published post should match the content generated in Xelora

Expected Outcome:
The content generated in Xelora appears as a published post on the connected Instagram Business account, demonstrating successful use of the instagram_content_publish permission.

Test Account Details:
[Provide test user credentials if required by Meta]
```

---

### Permission 2: `pages_manage_posts`

#### **Tell us how you'll use this permission**
```
Xelora is a social media management platform that enables businesses to publish AI-generated marketing content to their Facebook Pages.

Our users manage Facebook Pages for their businesses and need to post content regularly. They use Xelora's AI tools to generate engaging posts, images, and captions optimized for Facebook. This permission allows them to publish this content directly to their Facebook Pages with one click.

This permission is essential for our multi-platform publishing feature, which allows users to:
- Publish AI-generated content to Facebook Pages they manage
- Maintain consistent brand presence across Facebook and Instagram
- Schedule Facebook Page posts for optimal reach
- Edit or update posts after publishing if needed

User Benefit:
Business owners and social media managers can streamline their content workflow. Instead of creating content in Xelora, manually copying it, switching to Facebook, and posting it there, they can publish to multiple platforms (Instagram + Facebook) simultaneously from one dashboard. This saves time and reduces human error in content distribution.

Technical Implementation:
When a user clicks "Publish to Facebook," Xelora uses the Facebook Pages API to create a post on the user's connected Facebook Page. The user must be an admin or editor of the Page. We retrieve the list of Pages the user manages using pages_show_list, allow them to select which Page to publish to, and then use pages_manage_posts to create the post.

Privacy & Security:
- We only access Pages where the user is admin/editor
- We store Page access tokens securely (encrypted with AES-256-GCM)
- Users can disconnect Pages at any time via our dashboard
- We never post content without explicit user action
- All user data can be deleted via our data deletion callback endpoint
```

#### **Provide step-by-step instructions on how to use this feature**
```
TESTING INSTRUCTIONS FOR REVIEWERS:

Prerequisites:
- User must have a Facebook Page where they are admin or editor
- If you don't have a Page, create one at facebook.com/pages/create

Test Steps:
1. Visit https://xelora.app
2. Click "Sign Up" and create a test account
3. Complete the onboarding wizard (Steps 1-3)
4. On Step 4 "Connect Platforms," click "Connect Facebook"
5. You will be redirected to Facebook OAuth dialog
6. Grant the requested permissions (pages_manage_posts, pages_show_list)
7. Select which Facebook Page(s) to connect to Xelora
8. You will be redirected back to Xelora with Facebook Page connected
9. Navigate to Dashboard → Content Generator
10. Generate sample social media content using the AI tools
11. Click "Publish" and select "Facebook" from the platform options
12. Choose which connected Page to publish to (if multiple)
13. Review the preview and click "Confirm & Post"
14. Open Facebook and navigate to your Page to verify the post appears
15. The published post should match the content generated in Xelora

Expected Outcome:
The content generated in Xelora appears as a published post on the connected Facebook Page, demonstrating successful use of the pages_manage_posts permission.

Test Account Details:
[Provide test user credentials if required by Meta]
```

---

## 🎥 Demo Video Script

### Video 1: Instagram Publishing Demo (3-4 minutes)

**Opening (0:00-0:15)**
> "Hi, I'm demonstrating Xelora's Instagram publishing feature for Meta App Review. This video shows how we use the instagram_content_publish permission."

**User Login (0:15-0:30)**
- Show Xelora login screen
- Sign in with test account
- Navigate to dashboard

**Instagram Connection (0:30-1:15)**
- Click "Settings" → "Connected Accounts"
- Click "Connect Instagram"
- **SHOW OAUTH DIALOG CLEARLY** - Point out `instagram_content_publish` permission
- Narrate: "Notice the permission dialog requesting instagram_content_publish access"
- Grant permission
- Show successful connection confirmation

**Content Creation (1:15-2:30)**
- Navigate to Content Generator
- Enter a topic (e.g., "New product launch for sustainable water bottles")
- Click "Generate Content"
- Show AI-generated post with image and caption
- Narrate: "Our AI has created Instagram-optimized content"

**Publishing (2:30-3:15)**
- Click "Publish to Instagram"
- Show preview modal
- Click "Confirm & Post"
- Show success notification
- Narrate: "Using the instagram_content_publish permission, we've posted to the user's Instagram"

**Verification (3:15-3:45)**
- Open Instagram app or instagram.com
- Navigate to the connected Business account
- **SHOW THE PUBLISHED POST** - scroll to it, click on it
- Narrate: "Here's the published post on Instagram, matching exactly what we created in Xelora"

**Closing (3:45-4:00)**
> "This demonstrates our compliant use of instagram_content_publish to enable one-click publishing for our users. Thank you."

---

### Video 2: Facebook Page Publishing Demo (3-4 minutes)

**Opening (0:00-0:15)**
> "Hi, I'm demonstrating Xelora's Facebook Page publishing feature for Meta App Review. This video shows how we use the pages_manage_posts permission."

**User Login (0:15-0:30)**
- Show Xelora login screen
- Sign in with test account
- Navigate to dashboard

**Facebook Page Connection (0:30-1:15)**
- Click "Settings" → "Connected Accounts"
- Click "Connect Facebook"
- **SHOW OAUTH DIALOG CLEARLY** - Point out `pages_manage_posts` permission
- Narrate: "Notice the permission dialog requesting pages_manage_posts access"
- Grant permission
- Select which Page to connect
- Show successful connection confirmation

**Content Creation (1:15-2:30)**
- Navigate to Content Generator
- Enter a topic (e.g., "Upcoming webinar on social media marketing")
- Select "Facebook" as target platform
- Click "Generate Content"
- Show AI-generated post with image and caption
- Narrate: "Our AI has created Facebook-optimized content"

**Publishing (2:30-3:15)**
- Click "Publish to Facebook"
- Select which Page to publish to (if multiple connected)
- Show preview modal
- Click "Confirm & Post"
- Show success notification
- Narrate: "Using the pages_manage_posts permission, we've posted to the user's Facebook Page"

**Verification (3:15-3:45)**
- Open Facebook (facebook.com)
- Navigate to the connected Page
- **SHOW THE PUBLISHED POST** - scroll to it, click on it
- Narrate: "Here's the published post on the Facebook Page, matching exactly what we created in Xelora"

**Closing (3:45-4:00)**
> "This demonstrates our compliant use of pages_manage_posts to enable efficient Facebook Page management for our users. Thank you."

---

## 📸 Required Screenshots

Prepare these screenshots before submitting:

### Screenshot 1: Instagram OAuth Permission Dialog
- Show the Facebook OAuth dialog with `instagram_content_publish` checkbox/permission visible
- Ensure "Xelora" app name is visible
- Ensure permission name is clearly readable

### Screenshot 2: Instagram Connected Confirmation
- Show Xelora dashboard with Instagram account successfully connected
- Display connected account details (username, profile picture)

### Screenshot 3: Instagram Publish Preview
- Show Xelora's publish modal with Instagram post preview
- Include generated image and caption
- Show "Publish to Instagram" button

### Screenshot 4: Published Instagram Post
- Show the actual Instagram app/web with the published post visible
- Ensure it matches the content from Screenshot 3
- Include timestamp to prove it's a real published post

### Screenshot 5: Facebook OAuth Permission Dialog
- Show the Facebook OAuth dialog with `pages_manage_posts` permission visible
- Ensure "Xelora" app name is visible
- Ensure permission name is clearly readable

### Screenshot 6: Facebook Page Connected Confirmation
- Show Xelora dashboard with Facebook Page successfully connected
- Display connected Page details (name, profile picture)

### Screenshot 7: Facebook Publish Preview
- Show Xelora's publish modal with Facebook post preview
- Include generated content
- Show "Publish to Facebook" button

### Screenshot 8: Published Facebook Post
- Show the actual Facebook Page with the published post visible
- Ensure it matches the content from Screenshot 7
- Include timestamp to prove it's a real published post

---

## 🧪 Creating Test Users

Meta may require you to create test users for their review team:

1. Go to **Facebook App Dashboard** → **Roles** → **Test Users**
2. Click **Add Test Users**
3. Create 2 test users:
   - **Test User 1:** For Instagram testing (must have Instagram Business account)
   - **Test User 2:** For Facebook Page testing (must be admin of a test Page)
4. For each test user:
   - Generate password
   - Log in as test user
   - Set up Instagram Business account (for Test User 1)
   - Create Facebook Page (for Test User 2)
5. In App Review submission, provide credentials:
   ```
   Instagram Test Account:
   Email: [test user 1 email]
   Password: [test user 1 password]
   Instagram Handle: @xelora_test

   Facebook Test Account:
   Email: [test user 2 email]
   Password: [test user 2 password]
   Facebook Page: Xelora Test Page
   ```

---

## ✅ Pre-Submission Checklist

Before clicking "Submit for Review," verify:

### App Configuration
- [x] Privacy Policy live at https://xelora.app/privacy
- [x] Terms of Service live at https://xelora.app/terms
- [x] Both linked in footer of https://xelora.app
- [x] Data deletion callback live at https://xelora.app/api/data-deletion
- [x] App icon uploaded (1024x1024px)
- [x] App name: "Xelora"
- [x] App category: "Social Media Management" or "Business Tools"

### Videos & Screenshots
- [ ] Instagram demo video recorded (<50MB, MP4 format)
- [ ] Facebook demo video recorded (<50MB, MP4 format)
- [ ] All 8 screenshots captured and labeled
- [ ] Videos show OAuth permission dialogs clearly
- [ ] Videos show published content on Instagram/Facebook
- [ ] Clear narration explaining each step

### Submission Text
- [ ] Copied use case justification for `instagram_content_publish`
- [ ] Copied use case justification for `pages_manage_posts`
- [ ] Copied testing instructions for both permissions
- [ ] Reviewed for typos and clarity

### Test Accounts
- [ ] Test Instagram account created with Business account setup
- [ ] Test Facebook Page created
- [ ] Test user credentials documented
- [ ] Verified test accounts can access the app

### Testing
- [ ] Manually tested Instagram publishing flow end-to-end
- [ ] Manually tested Facebook Page publishing flow end-to-end
- [ ] Verified data deletion endpoint returns proper response
- [ ] Checked all OAuth redirect URIs are correct

---

## 📅 Timeline & Expectations

### Review Timeline
- **Submission:** Day 0
- **Initial Review:** Day 1-3 (Meta reviews submission completeness)
- **In-Depth Review:** Day 3-7 (Meta tests the permissions)
- **Decision:** Day 5-10 (Approved, Rejected, or More Info Requested)

### If Approved ✅
1. Permissions become available immediately in Live Mode
2. Update OAuth scopes in code to include new permissions
3. Deploy to production
4. Test with real user accounts
5. Monitor for any API errors

### If Rejected ❌
1. Read rejection reason carefully
2. Address the specific issue mentioned
3. Update demo video, text, or app functionality as needed
4. Resubmit with explanation of changes made
5. Typical resubmission review time: 3-5 days

### If More Info Requested ℹ️
1. Respond within 7 days to avoid auto-rejection
2. Provide additional screenshots, videos, or clarification
3. Be specific and thorough in responses
4. Review continues after you respond

---

## 🔗 Useful Links

- **Facebook App Dashboard:** https://developers.facebook.com/apps/
- **App Review Status:** https://developers.facebook.com/apps/[APP_ID]/app-review/
- **Permission Reference:** https://developers.facebook.com/docs/permissions/reference
- **Instagram API Docs:** https://developers.facebook.com/docs/instagram-api
- **App Review Guidelines:** https://developers.facebook.com/docs/app-review/guidelines

---

## 📞 Support

If you encounter issues during submission:
1. Check [Meta Developer Support](https://developers.facebook.com/support)
2. Review [App Review FAQs](https://developers.facebook.com/docs/app-review/faq)
3. Post in [Meta Developer Community](https://developers.facebook.com/community/)

---

**Ready to Submit?** Follow the steps at the top of this document and paste the pre-written text into the App Review form. Good luck! 🚀

---

**Document Status:** ✅ Ready for use
**Last Updated:** December 21, 2024
**Next Update:** After App Review decision
