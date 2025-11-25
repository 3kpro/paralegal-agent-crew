# Instagram OAuth Setup Guide

## Overview
Instagram uses Facebook's Graph API and requires a Facebook App. This is MORE complex than Twitter OAuth.

## Prerequisites
- Facebook Developer Account
- Business Instagram Account (Personal accounts won't work for posting)
- Facebook Page connected to your Instagram account

## Key Differences from Twitter
1. **Two-step connection**: Must connect Facebook Page → Instagram Account
2. **Account type requirement**: Instagram must be a Business or Creator account
3. **Page requirement**: Instagram must be linked to a Facebook Page
4. **Token type**: Long-lived tokens (60 days) vs short-lived (1 hour)
5. **Permissions**: More restrictive - must go through App Review for posting

## Current Code Status

### ✅ What's Already Built (from Twitter implementation):
- OAuth connect route: `/api/auth/connect/[platform]` - works for Instagram
- OAuth callback route: `/api/auth/callback/[platform]` - works for Instagram
- Token encryption system
- Database schema in `user_social_connections` table
- PublishButton component
- Settings > Connections UI

### ⚠️ What Needs Instagram-Specific Changes:

1. **Token Exchange** (in `app/api/auth/callback/[platform]/route.ts`):
   - Already has Instagram config at line 186-190
   - Uses `client_id` and `client_secret` in body (correct for Instagram)

2. **User Profile Fetch** (in `app/api/auth/callback/[platform]/route.ts`):
   - Already has Instagram profile fetch at line 331-347
   - Fetches basic profile info

3. **Publishing API** (in `app/api/social/post/route.ts`):
   - Need to implement Instagram-specific posting
   - Must handle image uploads differently than Twitter

## Step-by-Step Setup

### Part 1: Create Facebook App

1. Go to https://developers.facebook.com
2. Click "My Apps" > "Create App"
3. Choose "Business" as app type
4. Fill in:
   - App Name: "TrendPulse Social Manager"
   - Contact Email: your email
   - Business Account: (optional)

### Part 2: Configure Instagram Basic Display

1. In your app dashboard, go to "Add Products"
2. Find "Instagram Basic Display" and click "Set Up"
3. Click "Create New App" in the Instagram Basic Display section
4. Note: This gives you READ access only - not enough for posting!

### Part 3: Add Instagram Graph API (for posting)

⚠️ **CRITICAL**: Instagram Basic Display API cannot post content! You need Instagram Graph API.

1. Go to "Add Products" again
2. Add "Instagram" (not "Instagram Basic Display")
3. This requires:
   - Business verification
   - Instagram Business account
   - App Review for permissions

### Part 4: Required Permissions

For posting to Instagram, you need these permissions (require App Review):
- `instagram_basic` - See profile info
- `instagram_content_publish` - Create posts
- `pages_read_engagement` - Read Page info
- `pages_show_list` - List Pages

### Part 5: App Configuration

1. **OAuth Redirect URIs**:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/instagram
   http://localhost:3000/api/auth/callback/instagram
   ```

2. **Valid OAuth Redirect URIs** (in Facebook Login settings):
   - Same as above

3. **Environment Variables** (add to Vercel & `.env.local`):
   ```
   INSTAGRAM_CLIENT_ID=your_facebook_app_id
   INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret
   ```

### Part 6: Get Long-Lived Token

Instagram tokens expire after 1 hour. You need to exchange for a 60-day token.

The callback should:
1. Get short-lived token from OAuth
2. Exchange for long-lived token immediately
3. Store long-lived token in database

**Add this to the callback route** after getting the initial token:

```typescript
if (platform === 'instagram' || platform === 'facebook') {
  // Exchange short-lived token for long-lived token (60 days)
  const longLivedResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${process.env.INSTAGRAM_CLIENT_ID}&` +
    `client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&` +
    `fb_exchange_token=${tokens.access_token}`
  );

  const longLivedData = await longLivedResponse.json();
  tokens.access_token = longLivedData.access_token;
  tokens.expires_in = longLivedData.expires_in; // ~5184000 (60 days)
}
```

## Instagram Posting Implementation

### Get Instagram Business Account ID

Before posting, you need the Instagram Business Account ID:

```typescript
// 1. Get user's Facebook Pages
const pagesResponse = await fetch(
  `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
);
const pagesData = await pagesResponse.json();

// 2. For each page, get connected Instagram account
for (const page of pagesData.data) {
  const igAccountResponse = await fetch(
    `https://graph.facebook.com/v18.0/${page.id}?` +
    `fields=instagram_business_account&access_token=${page.access_token}`
  );
  const igAccountData = await igAccountResponse.json();

  if (igAccountData.instagram_business_account) {
    const instagramAccountId = igAccountData.instagram_business_account.id;
    // Store this ID in user_social_connections.account_id
  }
}
```

### Create Instagram Media Container

Instagram posting is a 2-step process:

**Step 1: Create media container**
```typescript
const containerResponse = await fetch(
  `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl, // Must be publicly accessible URL
      caption: content,
      access_token: accessToken,
    }),
  }
);

const containerData = await containerResponse.json();
const creationId = containerData.id;
```

**Step 2: Publish the container**
```typescript
const publishResponse = await fetch(
  `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: accessToken,
    }),
  }
);

const publishData = await publishResponse.json();
const mediaId = publishData.id;
```

## Limitations & Gotchas

### 1. App Review Required
- Instagram content publishing requires Facebook App Review
- This can take 3-7 days
- You need to provide:
  - Screencast demonstrating the feature
  - Detailed use case explanation
  - Test credentials

### 2. Image Requirements
- Images must be publicly accessible URLs
- JPEG or PNG format
- Aspect ratio: 1:1 (square), 4:5 (portrait), or 1.91:1 (landscape)
- Minimum resolution: 600x600px
- Maximum file size: 8MB

### 3. Rate Limits
- 25 posts per day per Instagram account
- 50 API calls per hour per user

### 4. Account Requirements
- Must be Instagram Business or Creator account
- Must be linked to a Facebook Page
- Cannot post to personal Instagram accounts

## Testing Strategy

### Phase 1: Basic OAuth (Can test immediately)
1. Connect Facebook app
2. Get user profile
3. Store encrypted tokens
4. List connected Facebook Pages

### Phase 2: Get Instagram Account (Can test immediately)
1. Fetch Pages from token
2. Get Instagram Business Account ID for each Page
3. Display in UI which Page → Instagram connection

### Phase 3: Publishing (Requires App Review)
1. Submit app for review with required permissions
2. Once approved, implement posting
3. Test with public image URLs first

## Recommended Approach

### Option A: Start with Facebook Pages
Since Facebook and Instagram use the same OAuth:
1. Implement Facebook Page posting first (easier, no App Review)
2. Use it to validate OAuth flow
3. Then add Instagram posting after App Review

### Option B: Use Instagram Basic Display for Testing
1. Connect accounts with Basic Display (no review needed)
2. Show "Instagram connected" in UI
3. Disable posting until App Review approved
4. Shows users the integration works

### Option C: Manual Testing with Graph API Explorer
1. Use Facebook's Graph API Explorer tool
2. Generate long-lived tokens manually
3. Test posting API calls
4. Then implement OAuth flow

## Questions for Meta AI / Facebook Support

1. **App Review**: What's the typical timeline for `instagram_content_publish` approval?

2. **Image Hosting**: Do you recommend using Facebook CDN or can we use our own?

3. **Token Refresh**: How do we handle the 60-day token expiration? Auto-refresh process?

4. **Multiple Instagram Accounts**: Can one Facebook Page be linked to multiple Instagram accounts?

5. **Carousel Posts**: Do you support multi-image posts via API? What's the process?

6. **Video Posts**: What are the requirements for posting videos? Different from images?

7. **Reels**: Can we post Reels via API? What permissions are needed?

8. **Stories**: Can we post Stories via API?

## Next Steps

1. **Create Facebook App** - Get CLIENT_ID and CLIENT_SECRET
2. **Add Instagram product** - Configure in Facebook Developer Dashboard
3. **Test OAuth Flow** - Connect and get tokens
4. **Implement Instagram Account Lookup** - Get Instagram Business Account ID
5. **Submit for App Review** - Request `instagram_content_publish` permission
6. **Implement Posting** - Add Instagram-specific code to `/api/social/post`
7. **Test End-to-End** - Create campaign → Generate content → Post to Instagram

## Code Changes Needed

### 1. Update OAuth callback to get Instagram Business Account ID
File: `app/api/auth/callback/[platform]/route.ts`

Add after getting user profile for Instagram:
```typescript
// Get Instagram Business Account
const pagesResponse = await fetch(
  `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
);
// ... (code from above)
```

### 2. Add Instagram posting to social post API
File: `app/api/social/post/route.ts`

Add Instagram case to the switch statement.

### 3. Update database schema
Add to metadata in `user_social_connections`:
```typescript
metadata: {
  facebook_page_id: string;
  facebook_page_name: string;
  instagram_account_id: string;
  instagram_username: string;
}
```

## Success Criteria

- [ ] User can connect Instagram via OAuth
- [ ] System stores encrypted long-lived token
- [ ] UI shows Instagram account connected in Settings
- [ ] Can fetch Instagram Business Account ID
- [ ] App Review approved for posting permissions
- [ ] Can create media container with image URL
- [ ] Can publish container to Instagram
- [ ] PublishButton works for Instagram
- [ ] Toast shows Instagram post link
- [ ] Can handle token refresh before 60-day expiry

## Estimated Timeline

- Facebook App Setup: 30 minutes
- OAuth Implementation: 2 hours (mostly done from Twitter)
- Instagram Account ID Fetch: 1 hour
- App Review Submission: 1 hour
- **App Review Wait Time: 3-7 days** ⚠️
- Publishing Implementation: 3 hours
- Testing & Polish: 2 hours

**Total: ~9 hours of work + 3-7 days waiting for approval**

## Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [Content Publishing Guide](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/overview)
- [App Review Process](https://developers.facebook.com/docs/app-review)
