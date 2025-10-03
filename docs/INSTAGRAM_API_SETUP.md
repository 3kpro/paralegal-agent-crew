# Instagram API Setup for 3KPRO.AI

## Prerequisites
- Instagram account: @3KPRO.AI
- Email access for verification
- Facebook account (to create Page + App)

## Step 1: Convert to Business Account

1. Open Instagram app
2. Go to Profile → Settings → Account
3. Tap "Switch to Professional Account"
4. Choose "Creator" or "Business"
5. Select category (Technology/Marketing)
6. Complete setup

## Step 2: Create Facebook Page

1. Go to facebook.com/pages/create
2. Page Name: "3KPRO.AI" or "3K Pro Services"
3. Category: Technology Company / Marketing Agency
4. Add description matching Instagram bio
5. Publish page

## Step 3: Link Instagram to Facebook Page

1. Instagram → Settings → Account → Linked Accounts
2. Tap Facebook
3. Login and link to your 3KPRO.AI Facebook Page
4. Confirm connection

## Step 4: Create Meta Developer App

1. Go to developers.facebook.com
2. Click "My Apps" → "Create App"
3. Select "Business" type
4. App Name: "3KPRO Content Automation"
5. Contact Email: your-email@3kpro.ai
6. Create App

## Step 5: Add Instagram Product

1. In App Dashboard → Add Product
2. Find "Instagram" → Click "Set Up"
3. Follow setup wizard
4. Select your Facebook Page
5. Grant permissions:
   - instagram_basic
   - instagram_content_publish
   - pages_read_engagement

## Step 6: Get Access Token

1. App Dashboard → Tools → Graph API Explorer
2. Select your app
3. Select "Get User Access Token"
4. Check permissions:
   - instagram_basic
   - instagram_content_publish  
   - pages_read_engagement
5. Click "Generate Access Token"
6. **SAVE THIS TOKEN SECURELY**

## Step 7: Get Instagram Business Account ID

Using Graph API Explorer:
```
GET /me/accounts
```

This returns your Facebook Page ID. Then:

```
GET /{page-id}?fields=instagram_business_account
```

This returns your Instagram Business Account ID.

**SAVE THIS ID**

## Step 8: Test API Access

In Graph API Explorer:

```
GET /{instagram-account-id}?fields=id,username
```

Should return:
```json
{
  "id": "your-instagram-id",
  "username": "3kpro.ai"
}
```

## What to Save

Add to .env.local:

```env
# Instagram API
INSTAGRAM_ACCOUNT_ID=your-instagram-business-id
INSTAGRAM_ACCESS_TOKEN=your-access-token
FACEBOOK_PAGE_ID=your-facebook-page-id
```

## API Limitations

### ✅ Can Do:
- Post photos with captions
- Post carousels (multiple images)
- Schedule posts
- Get post insights/analytics

### ❌ Can't Do:
- Post Stories (not available via API)
- Post Reels (limited API access)
- Post videos directly (requires video URL)

## Important Notes

1. **Access Token Expiry**: Tokens expire after 60 days
   - You'll need to refresh tokens periodically
   - We'll build auto-refresh into the app

2. **Rate Limits**: 
   - 25 posts per 24 hours per account
   - 200 API calls per hour

3. **Review Process**:
   - For production, app needs Meta review
   - For personal use, skip review (but limited to your account)

## Next Steps

Once you have:
- Instagram Business Account ID
- Access Token  
- Facebook Page ID

We'll integrate this into Content Cascade AI for automated posting!

---

**Need Help?** 
- Meta Docs: developers.facebook.com/docs/instagram-api
- Graph API Explorer: developers.facebook.com/tools/explorer
