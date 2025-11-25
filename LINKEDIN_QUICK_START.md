# LinkedIn Integration - Quick Start Guide

> **Note**: This integration uses **your LinkedIn Developer App** credentials. Your users will authorize **your app** (TrendPulse) to post on their behalf. You manage the app, they just click "Connect LinkedIn" and authorize. This is a **paid platform feature** - users who subscribe to your service get access to LinkedIn publishing through your centralized app.

## ✅ What's Already Done

All the code is ready! LinkedIn OAuth and posting are already implemented:

- ✅ OAuth connect route: `/api/auth/connect/linkedin`
- ✅ OAuth callback route: `/api/auth/callback/linkedin`
- ✅ Token exchange logic (using LinkedIn OAuth 2.0)
- ✅ Profile fetch (gets LinkedIn name, email, profile picture)
- ✅ LinkedIn posting API (UGC Post API with image support)
- ✅ Media upload support (images)
- ✅ Database integration with encrypted token storage
- ✅ UI components (ConnectionCard, PublishButton)

**OAuth Scopes Requested:**
- `openid` - OpenID Connect authentication
- `profile` - Basic profile information
- `email` - User's email address
- `w_member_social` - Post content on behalf of user

## 🔧 Configuration Needed

### Step 1: Create LinkedIn Developer App

1. Go to https://www.linkedin.com/developers/apps
2. Sign in with your LinkedIn account
3. Click **"Create app"**
4. Fill in app details:
   - **App name**: TrendPulse
   - **LinkedIn Page**: Your company page (required)
   - **App logo**: Upload your logo (required)
   - **Legal agreement**: Check the box
5. Click **"Create app"**

### Step 2: Get API Credentials

1. In your LinkedIn app dashboard, go to **"Auth"** tab
2. Copy the **Client ID**
3. Copy the **Client Secret** (keep this secure!)
4. Add to `.env.local`:
   ```
   LINKEDIN_CLIENT_ID=your_client_id_here
   LINKEDIN_CLIENT_SECRET=your_client_secret_here
   ```

### Step 3: Configure Redirect URIs

1. In the **"Auth"** tab, find **"Authorized redirect URLs for your app"**
2. Click **"Add redirect URL"**
3. Add these URLs:
   ```
   http://localhost:3000/api/auth/callback/linkedin
   https://trendpulse.3kpro.services/api/auth/callback/linkedin
   ```
4. Click **"Update"**

### Step 4: Request Products & Permissions

LinkedIn requires you to request access to products before you can use certain APIs.

1. Go to the **"Products"** tab
2. Click **"Request access"** for these products:
   - **Sign In with LinkedIn using OpenID Connect** (Usually auto-approved)
   - **Share on LinkedIn** (Usually auto-approved for companies)

**Approval Timeline**: Usually instant, but can take 1-2 days for verification.

### Step 5: Verify OAuth Scopes

1. Go to the **"Auth"** tab
2. Under **"OAuth 2.0 scopes"**, verify these are listed:
   - `openid`
   - `profile`
   - `email`
   - `w_member_social`

If `w_member_social` is missing:
- You need "Share on LinkedIn" product approved
- Wait for product approval, then it will appear

## 🧪 Testing

### Test OAuth Connection

1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/settings → **Connections** tab
3. Click **Connect** on LinkedIn
4. Authorize the app on LinkedIn
5. You should be redirected back with LinkedIn connected! ✅

### Test Posting

LinkedIn posting requires:
- ✅ LinkedIn account (personal or company)
- ✅ "Share on LinkedIn" product approved
- ✅ `w_member_social` scope authorized
- ✅ (Optional) Image URLs for posts with images

**Post Types Supported:**
- ✅ Text-only posts
- ✅ Posts with single image
- ✅ Posts with multiple images (up to 9)
- ❌ Video posts (not yet implemented)
- ❌ Article posts (not yet implemented)

## 📊 How It Works

### OAuth Flow
1. User clicks "Connect LinkedIn" in Settings
2. Redirects to `/api/auth/connect/linkedin`
3. Redirects to LinkedIn OAuth page
4. User authorizes app with scopes: `openid`, `profile`, `email`, `w_member_social`
5. LinkedIn redirects to `/api/auth/callback/linkedin`
6. Exchanges authorization code for access token
7. Fetches user profile (name, email, profile picture)
8. Stores encrypted token in `user_social_connections` table
9. Redirects to Settings > Connections tab

### Posting Flow
1. User creates campaign with generated content
2. Clicks "Publish" button
3. `/api/social/post` endpoint receives request
4. Fetches valid access token from database
5. **Fetches user's LinkedIn URN** (author identifier)
6. **If images**: Uploads images to LinkedIn (3-step process):
   - Register upload
   - Upload binary data
   - Add to post metadata
7. **Creates UGC Post** with content and media
8. Returns LinkedIn post URL
9. Shows success toast with clickable link

## ⚠️ LinkedIn API Limitations

### Account Requirements
- Any LinkedIn account works (personal or company)
- No special account type required
- Company pages need separate authorization (not yet implemented)

### Rate Limits
- **100 API calls per day** per user for free apps
- **500 API calls per day** per user for verified apps
- Posts are limited to prevent spam (LinkedIn doesn't specify exact limits)

### Content Requirements
- Text posts: 3,000 character limit
- Image posts: Must be JPG or PNG
- Image size: Max 5MB per image
- Image dimensions: Recommended 1200x627px (1.91:1 ratio)
- Up to 9 images per post

### Visibility
- Posts appear on user's personal feed
- Visibility: Public or Connections only (defaults to public)
- Cannot post to company pages (requires additional implementation)

## 🎯 Next Steps

1. ✅ **Create LinkedIn Developer App** at https://www.linkedin.com/developers/apps
2. ✅ **Get Client ID and Secret** from Auth tab
3. ✅ **Add credentials** to `.env.local`
4. ✅ **Add redirect URIs** to LinkedIn app settings
5. ✅ **Request Products**: "Sign In with LinkedIn" and "Share on LinkedIn"
6. ✅ **Test OAuth** connection
7. ✅ **Test posting** after products approved

## 🐛 Troubleshooting

### "Client ID not found" or OAuth fails
- Check `LINKEDIN_CLIENT_ID` is set in `.env.local`
- Verify redirect URIs match exactly in LinkedIn app settings
- Make sure you're using the correct Client ID (not Organization ID)

### "Insufficient permissions" error
- You need "Share on LinkedIn" product approved
- Check that `w_member_social` scope is authorized
- User must re-authorize after product approval

### "Invalid redirect URI" error
- Redirect URIs must match exactly (including http/https)
- Don't include trailing slashes
- Must be added in LinkedIn app settings first

### Image upload fails
- Image must be JPG or PNG (not GIF, WebP, etc.)
- Image must be under 5MB
- Image URL must be publicly accessible (HTTPS)
- LinkedIn's upload process has 3 steps - check which step fails

### Token expired errors
- LinkedIn access tokens expire after 60 days
- Token refresh is implemented in `getValidToken()` function
- If refresh fails, user needs to reconnect

## 📚 Resources

- [LinkedIn Developers Portal](https://www.linkedin.com/developers/)
- [OAuth 2.0 Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [UGC Post API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api)
- [Share on LinkedIn Product](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [Image Upload Guide](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/images-videos-documents)

## 🔐 Security Notes

**For Your Platform Users:**
- Users authorize **your app** (TrendPulse), not their own apps
- You manage one centralized LinkedIn Developer App
- User tokens are encrypted in your database
- Users can revoke access anytime in LinkedIn settings
- This is a **premium feature** for paid subscribers

**Token Security:**
- Access tokens expire after 60 days
- Refresh tokens valid for 1 year
- All tokens encrypted with AES-256 before database storage
- Users can disconnect anytime from Settings > Connections

## 💡 Pro Tips

### Optimizing for LinkedIn Algorithm
LinkedIn favors:
- ✅ Native content (not links to other sites)
- ✅ Posts with 1-3 hashtags (not 10+)
- ✅ Engaging questions
- ✅ Professional images
- ✅ Posts 150-300 characters (sweet spot)

### Image Recommendations
- Use 1200x627px (1.91:1 ratio) for best display
- Include text overlay for engagement
- Professional, high-quality images perform better
- Avoid overly promotional content

### Testing Strategy
1. Test with text-only posts first
2. Then test with single image
3. Test with multiple images (up to 9)
4. Monitor LinkedIn's response times (can be slow)

### Company Page Posting (Future Enhancement)
Current implementation posts to **user's personal feed**.
To post to **company pages**, you need:
- Additional OAuth scope: `w_organization_social`
- "Share on LinkedIn" product with company pages
- Different API endpoint: `/organizations/{id}/shares`
- Users must be admins of the company page
