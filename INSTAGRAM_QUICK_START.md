# Instagram Integration - Quick Start Guide

> **Note**: This integration uses **your Facebook Developer App** credentials. Your users will authorize **your app** (TrendPulse) to post on their behalf. You manage the app, they just click "Connect Instagram" and authorize. This is a **paid platform feature** - users who subscribe to your service get access to Instagram publishing through your centralized app.

## ✅ What's Already Done

All the code is ready! Instagram OAuth and posting are already implemented:

- ✅ OAuth connect route: `/api/auth/connect/instagram`
- ✅ OAuth callback route: `/api/auth/callback/instagram`
- ✅ Token exchange logic (using Instagram Graph API)
- ✅ Profile fetch (gets Instagram username)
- ✅ Instagram posting API (2-step: create container → publish)
- ✅ Database integration with encrypted token storage
- ✅ UI components (ConnectionCard, PublishButton)

## 🔧 Configuration Needed

### Step 1: Get Your App Secret

1. Go to https://developers.facebook.com/apps/4229064840746963/settings/basic/
2. Click **"Show"** next to **App Secret**
3. Copy the secret
4. Open `.env.local` in your project
5. Replace `YOUR_APP_SECRET_HERE` with the actual secret:
   ```
   INSTAGRAM_CLIENT_SECRET=your_actual_secret_here
   ```

### Step 2: Configure OAuth Redirect URIs

1. Go to https://developers.facebook.com/apps/4229064840746963/fb-login/settings/
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:3000/api/auth/callback/instagram
   https://trendpulse.3kpro.services/api/auth/callback/instagram
   ```
3. Click **"Save Changes"**

### Step 3: Verify Permissions

Check that your app has these permissions approved:
- `instagram_basic` - View profile info
- `instagram_content_publish` - Post to Instagram
- `pages_show_list` - List Facebook Pages
- `pages_read_engagement` - Read Page info

If not approved, you may need to submit for App Review. However, you can test with your own account first in Development Mode.

## 🧪 Testing

### Test OAuth Connection

1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/settings
3. Click on the **Connections** tab
4. Click **Connect** on Instagram
5. You should be redirected to Facebook/Instagram OAuth
6. Authorize the app
7. You'll be redirected back to Settings with Instagram connected!

### Test Posting (Requirements)

Instagram posting requires:
- ✅ Instagram Business or Creator account (not personal)
- ✅ Instagram account linked to a Facebook Page
- ✅ At least one image URL (publicly accessible)

**Note**: If you're testing with a personal Instagram account, you'll need to convert it to a Business account first:
1. Open Instagram app
2. Go to Settings → Account → Switch to Professional Account
3. Choose "Business"
4. Link it to your Facebook Page

## 📊 How It Works

### OAuth Flow
1. User clicks "Connect Instagram" in Settings
2. Redirects to `/api/auth/connect/instagram`
3. Redirects to Facebook OAuth (Instagram uses Facebook auth)
4. User authorizes app
5. Facebook redirects to `/api/auth/callback/instagram`
6. Exchanges code for access token
7. Fetches Instagram profile
8. Stores encrypted token in `user_social_connections` table
9. Redirects to Settings > Connections tab

### Posting Flow
1. User creates campaign with generated content
2. Clicks "Publish" button
3. `/api/social/post` endpoint receives request
4. Fetches valid access token from database
5. Gets Instagram Business Account ID via Facebook Page
6. **Step 1**: Creates media container with image URL + caption
7. **Step 2**: Publishes the container
8. Returns Instagram post URL
9. Shows success toast with clickable link

## ⚠️ Known Limitations

### Image Requirements
- Must be **publicly accessible URL** (HTTPS)
- JPEG or PNG format
- Aspect ratio: 1:1 (square), 4:5 (portrait), or 1.91:1 (landscape)
- Minimum resolution: 600x600px
- Maximum file size: 8MB

### Account Requirements
- Must be Instagram **Business** or **Creator** account
- Must be linked to a Facebook Page
- Cannot post to personal Instagram accounts via API

### Rate Limits
- 25 posts per day per Instagram account
- 50 API calls per hour per user

## 🎯 Next Steps

1. **Get App Secret** and add to `.env.local`
2. **Add redirect URIs** to Facebook App settings
3. **Convert to Business Account** if needed
4. **Test OAuth** connection
5. **Test posting** with a campaign

## 🐛 Troubleshooting

### "No Instagram Business Account found"
- Make sure Instagram is Business/Creator account
- Verify it's linked to a Facebook Page
- Check that the Facebook Page has the Instagram account connected

### "Instagram posts require at least one image"
- Instagram API requires at least one image
- Text-only posts are not supported
- Ensure you have an image URL in your campaign

### OAuth redirect fails
- Check redirect URIs are configured correctly in Facebook App settings
- Verify App Secret is correct in `.env.local`
- Make sure app is in Development or Live mode (not Inactive)

### Token exchange errors
- Check that `INSTAGRAM_CLIENT_ID` matches your App ID (4229064840746963)
- Verify `INSTAGRAM_CLIENT_SECRET` is correct
- Check Facebook App is active

## 📚 Resources

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
- [Content Publishing Guide](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Facebook Login Settings](https://developers.facebook.com/apps/4229064840746963/fb-login/settings/)
- [App Review (if needed)](https://developers.facebook.com/docs/app-review)
