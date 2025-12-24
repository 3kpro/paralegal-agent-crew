# TikTok Integration - Quick Start Guide

> **Note**: This integration uses **your TikTok Developer App** credentials. Your users will authorize **your app** (TrendPulse) to post on their behalf. You manage the app, they just click "Connect TikTok" and authorize. This is a **paid platform feature** - users who subscribe to your service get access to TikTok video publishing through your centralized app.

## ✅ What's Already Done

All the code is ready! TikTok OAuth and posting are already implemented:

- ✅ OAuth connect route: `/api/auth/connect/tiktok`
- ✅ OAuth callback route: `/api/auth/callback/tiktok`
- ✅ Token exchange logic (using TikTok OAuth API)
- ✅ Profile fetch (gets TikTok username, display name, avatar)
- ✅ TikTok video posting API (Content Posting API v2)
- ✅ Database integration with encrypted token storage
- ✅ UI components (ConnectionCard, PublishButton)

**OAuth Scopes Requested:**
- `user.info.basic` - Get user profile info (open_id, display_name, username, avatar_url)
- `video.publish` - Publish videos directly

**Important: Scopes must be space-separated in OAuth URL**

## 🔧 Configuration Needed

### Step 1: Create TikTok Developer App

1. Go to https://developers.tiktok.com/
2. Sign in with your TikTok account
3. Click **"Manage Apps"** → **"Create an app"**
4. Fill in app details:
   - **App name**: TrendPulse
   - **App description**: AI-powered social media content management platform
   - **App type**: Web
   - **Category**: Social

### Step 2: Get API Credentials

1. In your TikTok app dashboard, go to **"Basic Information"**
2. Copy the **Client Key** (this is your CLIENT_ID)
3. Copy the **Client Secret** (keep this secure!)
4. Add to `.env.local`:
   ```
   TIKTOK_CLIENT_KEY=your_client_key_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   ```

### Step 3: Configure Redirect URIs

1. In your TikTok app dashboard, go to **"Login Kit"** settings
2. Add these **Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/tiktok
   https://trendpulse.3kpro.services/api/auth/callback/tiktok
   ```
3. Click **"Save"**

### Step 4: Request Content Posting API Access

⚠️ **CRITICAL**: TikTok's Content Posting API requires approval.

1. In your app dashboard, go to **"Add products"**
2. Find **"Content Posting API"** and click **"Apply"**
3. Fill out the application:
   - **Use case**: Social media management platform for businesses
   - **Video source**: User-generated content from AI tools
   - **Publishing frequency**: Up to 25 videos per day per user
4. Submit the application

**Approval Timeline**: 3-7 business days

**While waiting for approval**, you can:
- ✅ Test OAuth connection (works immediately)
- ✅ Fetch user profile
- ❌ Cannot publish videos (returns 403/401 error)

## 🧪 Testing

### Test OAuth Connection (Works Now!)

1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/settings → **Connections** tab
3. Click **Connect** on TikTok
4. Authorize the app on TikTok
5. You should be redirected back with TikTok connected! ✅

### Test Video Posting (Requires API Approval)

TikTok posting requires:
- ✅ TikTok account (personal or business)
- ✅ At least one video URL (publicly accessible MP4)
- ✅ Content Posting API approval ⚠️

**Video Requirements:**
- Format: MP4, WebM, or MOV
- Duration: 3 seconds to 10 minutes
- File size: Max 4GB
- Resolution: Minimum 720p, recommended 1080p
- Aspect ratio: 9:16 (vertical), 16:9 (horizontal), or 1:1 (square)

## 📊 How It Works

### OAuth Flow
1. User clicks "Connect TikTok" in Settings
2. Redirects to `/api/auth/connect/tiktok`
3. Redirects to TikTok OAuth page
4. User authorizes app with scopes: `user.info.basic`, `video.list`, `video.upload`
5. TikTok redirects to `/api/auth/callback/tiktok`
6. Exchanges authorization code for access token
7. Fetches user profile (display name, username, avatar, followers)
8. Stores encrypted token in `user_social_connections` table
9. Redirects to Settings > Connections tab

### Posting Flow
1. User creates campaign with generated video content
2. Clicks "Publish" button
3. `/api/social/post` endpoint receives request with video URL
4. Fetches valid access token from database
5. **Calls TikTok Content Posting API v2**:
   - Endpoint: `https://open.tiktokapis.com/v2/post/publish/video/init/`
   - Sends video URL, title, privacy settings
6. TikTok processes and publishes video
7. Returns TikTok video URL
8. Shows success toast with clickable link

## ⚠️ TikTok API Limitations

### Account Requirements
- Any TikTok account works (personal or business)
- No special account type required (unlike Instagram)

### Content Posting API Requirements
- **App Review Required** (3-7 days) ⚠️
- Must explain use case and video source
- TikTok may request a demo video

### Rate Limits
- **25 videos per day** per user
- **100 API calls per hour** per app
- **1000 API calls per day** per app

### Video Requirements
- Must be **publicly accessible URL** (HTTPS)
- Cannot be copyrighted content
- Must comply with TikTok Community Guidelines
- Cannot contain prohibited content (see TikTok docs)

## 🎯 Next Steps

1. ✅ **Create TikTok Developer App** at https://developers.tiktok.com/
2. ✅ **Get Client Key and Secret** from app dashboard
3. ✅ **Add credentials** to `.env.local`
4. ✅ **Add redirect URIs** to TikTok app settings
5. ⚠️ **Apply for Content Posting API access** (wait 3-7 days)
6. ✅ **Test OAuth** connection (works immediately)
7. ⏳ **Wait for API approval** before testing posting

## 🐛 Troubleshooting

### "Client key not found" or OAuth fails
- Check `TIKTOK_CLIENT_KEY` is set in `.env.local`
- Verify redirect URIs match exactly in TikTok app settings
- Make sure app is in "Live" mode (not "Development")

### "Content Posting API access denied"
- You need to apply for Content Posting API access
- This requires manual approval from TikTok
- Cannot test posting until approved

### "Invalid video URL" error
- Video must be publicly accessible (HTTPS)
- Video must meet format requirements (MP4, 720p+)
- Video must be under 4GB
- URL must be direct video link (not page link)

### Token expired errors
- TikTok access tokens expire after 24 hours
- Refresh tokens are valid for 1 year
- Token refresh is implemented in `getValidToken()` function

## 📚 Resources

- [TikTok Developers Portal](https://developers.tiktok.com/)
- [Content Posting API Docs](https://developers.tiktok.com/doc/content-posting-api-get-started/)
- [Login Kit Documentation](https://developers.tiktok.com/doc/login-kit-web/)
- [API Rate Limits](https://developers.tiktok.com/doc/rate-limits/)
- [Community Guidelines](https://www.tiktok.com/community-guidelines)

## 🔐 Security Notes

**For Your Platform Users:**
- Users authorize **your app** (TrendPulse), not their own apps
- You manage one centralized TikTok Developer App
- User tokens are encrypted in your database
- Users can revoke access anytime in TikTok settings
- This is a **premium feature** for paid subscribers

**Token Security:**
- Access tokens expire after 24 hours (refreshed automatically)
- Refresh tokens valid for 1 year
- All tokens encrypted with AES-256 before database storage
- Users can disconnect anytime from Settings > Connections

## 💡 Pro Tips

### Testing Before Approval
While waiting for Content Posting API approval:
1. ✅ Test OAuth flow (works immediately)
2. ✅ Show "TikTok connected" in UI
3. ✅ Display user's TikTok username and followers
4. ⚠️ Disable posting button with message: "TikTok posting pending API approval"

### Preparing Your Application
For faster TikTok approval:
- Provide clear screenshots of your platform
- Explain you're a B2B SaaS for businesses
- Mention content is AI-generated, user-reviewed
- Emphasize compliance with Community Guidelines
- Show your content moderation process

### Alternative During Wait Period
If you need video posting immediately:
- Focus on Twitter, Instagram, LinkedIn first (faster approval)
- TikTok connection shows as "Connected" but posting disabled
- Update users: "TikTok posting coming soon after API approval"
