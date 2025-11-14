# Social Media OAuth - Simple Setup Guide

## How It Works (Like Every Other Website)

1. **User clicks "Connect Twitter"** → OAuth popup opens
2. **User authorizes in popup** → Twitter/LinkedIn/etc. authorization
3. **Popup closes automatically** → Redirects back to your app
4. **Account appears as connected** → Shows username, followers, etc.
5. **User publishes** → Content goes to connected accounts

**No encryption keys. No .env file editing. No manual setup required.**

---

## What's Already Working

### Twitter/X ✅
- OAuth credentials configured in `.env.local`
- Ready to test immediately
- Just click "Connect Twitter" on `/social-accounts` page

### Other Platforms (Need Credentials)
- LinkedIn - Need to create app at https://www.linkedin.com/developers/
- Facebook - Need to create app at https://developers.facebook.com/
- Instagram - Uses Facebook app (same credentials)
- TikTok - Need to create app at https://developers.tiktok.com/

---

## Testing Twitter Right Now

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to**: `http://localhost:3000/social-accounts`

3. **Click "Connect Twitter"**:
   - Popup opens with Twitter authorization
   - Click "Authorize app"
   - Popup closes automatically
   - Page refreshes showing connected account

4. **Publish test**:
   - Go to create post page
   - Select Twitter
   - Write content
   - Click publish
   - Check Twitter to see post

---

## How Tokens Are Stored

**In Supabase `social_accounts` table**:
- `access_token` - Used to post to platform
- `refresh_token` - Used to get new access token when expired
- `token_expires_at` - When access token expires
- `is_active` - Whether account is connected

**Security**: Supabase Row Level Security (RLS) ensures users only see their own tokens.

---

## Adding Other Platforms

### LinkedIn

1. **Create LinkedIn App**:
   - Go to https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in details (name, company, logo)
   - Click "Create app"

2. **Get Credentials**:
   - Go to "Auth" tab
   - Copy "Client ID"
   - Copy "Client Secret"

3. **Add Redirect URI**:
   ```
   http://localhost:3000/api/auth/callback/linkedin
   ```

4. **Request Products**:
   - Click "Products" tab
   - Request "Sign In with LinkedIn using OpenID Connect"
   - Request "Share on LinkedIn"

5. **Add to `.env.local`**:
   ```env
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

6. **Restart server** and test!

### Facebook & Instagram

1. **Create Facebook App**:
   - Go to https://developers.facebook.com/apps/
   - Click "Create App"
   - Choose "Business" type
   - Fill in details

2. **Add Facebook Login**:
   - Click "Add Product"
   - Select "Facebook Login"
   - Click "Set Up"

3. **Configure OAuth Redirect**:
   - Settings → Basic → Add Platform → Website
   - OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`

4. **Get Credentials**:
   - Settings → Basic
   - Copy "App ID" and "App Secret"

5. **Add to `.env.local`**:
   ```env
   FACEBOOK_CLIENT_ID=your_app_id
   FACEBOOK_CLIENT_SECRET=your_app_secret
   
   # Instagram uses same Facebook app
   INSTAGRAM_CLIENT_ID=your_app_id
   INSTAGRAM_CLIENT_SECRET=your_app_secret
   ```

### TikTok

1. **Create TikTok App**:
   - Go to https://developers.tiktok.com/
   - Register as developer
   - Create new app

2. **Add Login Kit**:
   - Enable "Login Kit"
   - Add redirect URL: `http://localhost:3000/api/auth/callback/tiktok`

3. **Get Credentials**:
   - Copy "Client Key"
   - Copy "Client Secret"

4. **Add to `.env.local`**:
   ```env
   TIKTOK_CLIENT_KEY=your_client_key
   TIKTOK_CLIENT_SECRET=your_client_secret
   ```

---

## API Endpoints

### Connect Account
```
GET /api/auth/connect/[platform]
```
Opens OAuth authorization for the platform.

### OAuth Callback
```
GET /api/auth/callback/[platform]
```
Receives OAuth code, exchanges for token, stores in database.

### Post to Social Media
```
POST /api/social/post
{
  "platforms": ["twitter", "linkedin"],
  "content": "Hello world!",
  "mediaUrls": ["https://example.com/image.jpg"]
}
```

---

## Common Issues

### "Authentication failed"
- Check platform credentials in `.env.local`
- Verify redirect URI matches exactly
- Make sure app has required permissions

### "Token expired"
- Tokens automatically refresh (handled in code)
- If refresh fails, user needs to reconnect account
- Account will show as inactive

### Popup blocked
- Browser blocked popup
- Allow popups for your domain
- Or use redirect flow instead

---

## Production Checklist

Before deploying to production:

1. ✅ Update all redirect URIs to production domain
   - Replace `http://localhost:3000` with `https://yourdomain.com`
   - Update in each platform's developer console

2. ✅ Use HTTPS
   - Required for OAuth security
   - Most platforms won't work with HTTP in production

3. ✅ Submit for app review (if required)
   - LinkedIn: Required for production access
   - Instagram: Required for public app
   - TikTok: Required for production

4. ✅ Set up monitoring
   - Track OAuth failures
   - Monitor token refresh errors
   - Alert on API rate limits

---

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── connect/[platform]/route.ts   # Starts OAuth flow
│   │   └── callback/[platform]/route.ts  # Handles OAuth callback
│   └── social/
│       └── post/route.ts                  # Posts to platforms
│
├── (portal)/
│   └── social-accounts/page.tsx          # UI for managing accounts
│
lib/
└── auth/
    └── oauth.ts                          # OAuth utility functions
```

---

## Next Steps

1. **Test Twitter** (already configured)
2. **Add LinkedIn** credentials and test
3. **Add Facebook/Instagram** credentials and test
4. **Add TikTok** credentials and test
5. **Update for production** URLs
6. **Submit for app review** (LinkedIn, Instagram, TikTok)

---

That's it! No encryption keys, no manual token management, just standard OAuth like every other website.
