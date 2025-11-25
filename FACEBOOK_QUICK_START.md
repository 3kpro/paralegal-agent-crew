# Facebook Integration - Quick Start Guide

> **Note**: This integration allows users to post to **Facebook Pages and Groups** they manage. Personal timeline posting is not supported by Facebook's API.

## ✅ What's Already Done

All the code is ready! Facebook OAuth and posting are already implemented:

- ✅ OAuth connect route: `/api/auth/connect/facebook`
- ✅ OAuth callback route: `/api/auth/callback/facebook`
- ✅ Token exchange logic
- ✅ Profile fetch via Graph API
- ✅ Scopes configured for Pages and Business management

## 📋 Setup Steps

### 1. Get Your Facebook App Credentials

Go to your **TrendPulse** app in [Facebook Developers Dashboard](https://developers.facebook.com/apps):

1. Click on your **TrendPulse** app
2. Go to **Settings → Basic**
3. Copy these values:
   - **App ID** → This is your `FACEBOOK_CLIENT_ID`
   - **App Secret** → Click "Show", then copy as `FACEBOOK_CLIENT_SECRET`

### 2. Add Credentials to `.env.local`

Update your `.env.local` file:

```bash
# Facebook OAuth 2.0 (TrendPulse App)
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
```

### 3. Configure OAuth Redirect URIs

In your Facebook app dashboard:

1. Go to **Facebook Login → Settings**
2. Add these **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://trendpulse.3kpro.services/api/auth/callback/facebook
   ```
3. Click **Save Changes**

### 4. Enable Required Permissions

Your app needs these permissions approved:

#### Standard Access (Available Now):
- `public_profile` - User's basic profile info
- `pages_show_list` - List pages user manages

#### Advanced Access (Requires App Review):
- `pages_read_engagement` - Read page engagement metrics
- `pages_manage_posts` - Create and manage posts on pages
- `business_management` - Required for pages_* permissions

**To request Advanced Access:**
1. Go to **App Review → Permissions and Features**
2. Request each advanced permission
3. Provide use case explanation (similar to what you provided for TikTok)

### 5. Set App Type to Business

**Important**: Only Business-type apps can use `pages_*` permissions.

1. Go to **Settings → Basic**
2. Check **App Type** - it should be "Business" not "Consumer"
3. If it's "Consumer", you may need to create a new Business app

### 6. Test the Integration

1. Restart your dev server: `npm run dev`
2. Navigate to Settings → Connections
3. Click "Connect" for Facebook
4. Authorize the app
5. Connection should show as "Connected"

## 🎯 What Users Can Do

Once connected, users can:
- ✅ Post to Facebook Pages they manage
- ✅ Post to Facebook Groups they manage (with group admin permissions)
- ✅ Schedule posts
- ✅ Include images and videos
- ❌ Cannot post to personal timeline (Facebook API restriction)

## 🔧 Current OAuth Scopes

```javascript
scope: 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,business_management'
```

## 📝 App Review Tips

When submitting for App Review, explain:

> "TrendPulse is a B2B SaaS social media management platform. We need pages_manage_posts and business_management permissions to allow our paid subscribers to publish content to their Facebook Business Pages and Groups through our centralized platform. Users authenticate with Facebook OAuth and authorize our app to post on their behalf."

Include screenshots of:
- Your OAuth flow
- The posting interface
- A successful post to a Facebook Page

## 🚨 Troubleshooting

### Error: "Invalid Scopes: pages_manage_posts"
- **Cause**: Your app is set to "Consumer" type
- **Fix**: Create a new Business-type app or convert existing app

### Error: "This content isn't available right now"
- **Cause**: App hasn't been approved for advanced permissions
- **Fix**: Request Advanced Access in App Review

### Error: "No Facebook pages found"
- **Cause**: User doesn't manage any Facebook Pages
- **Fix**: User needs to create or be admin of a Facebook Page

## 📚 Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/overview)
- [Pages API](https://developers.facebook.com/docs/pages)
- [App Review Process](https://developers.facebook.com/docs/app-review)

## 🔐 Security Notes

- All tokens are encrypted with AES-256 before database storage
- Tokens are automatically refreshed when expired
- Users can revoke access anytime from Settings → Connections
- Privacy Policy covers Facebook data handling: [/privacy](https://trendpulse.3kpro.services/privacy)
