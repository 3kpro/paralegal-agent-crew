# Meta App Setup Checklist - TrendPulse

Based on Meta AI's response, here's your step-by-step checklist:

## ✅ Key Findings from Meta AI

**IMPORTANT**:
- Use **ONE app** (846908931167911) for both Facebook and Instagram
- Use the **SAME** App ID and Secret for both OAuth flows
- The different App ID you saw (4229064840746963) is just an Instagram-specific identifier within the same app

## 📋 Setup Steps

### Step 1: Get App Credentials ⬜
**Location**: Meta for Developers > My Apps > TrendPulse > Settings > Basic

1. ☐ Copy **App ID**: `846908931167911`
2. ☐ Click "Show" next to **App Secret**
3. ☐ Copy the App Secret
4. ☐ Save both to `.env.local`:
   ```bash
   FACEBOOK_CLIENT_ID=846908931167911
   FACEBOOK_CLIENT_SECRET=<your_secret_here>

   # Instagram uses the SAME credentials
   INSTAGRAM_CLIENT_ID=846908931167911
   INSTAGRAM_CLIENT_SECRET=<your_secret_here>
   ```

### Step 2: Configure Instagram OAuth Redirect URI ⬜
**Location**: Meta for Developers > My Apps > TrendPulse > Instagram API > Settings > OAuth Settings

1. ☐ Navigate to Instagram API in left sidebar
2. ☐ Click "Settings" tab
3. ☐ Find "OAuth Settings" section
4. ☐ Click "Add Redirect URI"
5. ☐ Enter: `https://trendpulse.3kpro.services/api/auth/callback/instagram`
6. ☐ Enter: `http://localhost:3000/api/auth/callback/instagram` (for dev)
7. ☐ Click "Save Changes"

### Step 3: Configure Facebook OAuth Redirect URI ⬜
**Location**: Meta for Developers > My Apps > TrendPulse > Facebook Login > Settings

1. ☐ Navigate to "Facebook Login" in left sidebar (or add it as a Use Case)
2. ☐ Click "Settings" tab
3. ☐ Find "Client OAuth Settings" section
4. ☐ In "Valid OAuth Redirect URIs" field, add:
   ```
   https://trendpulse.3kpro.services/api/auth/callback/facebook
   http://localhost:3000/api/auth/callback/facebook
   ```
5. ☐ Click "Save Changes"
6. ☐ Select "Facebook Login for Business" as Use Case

### Step 4: Set Up Instagram Test Account ⬜
**Prerequisites**: Your Instagram account must be a **Business Account** linked to a **Facebook Page**

**If you need to convert your Instagram to Business:**
1. ☐ Open Instagram app on mobile
2. ☐ Go to Settings > Account > Switch to Professional Account
3. ☐ Choose "Business"
4. ☐ Connect to your Facebook Page

**Add as Tester:**
**Location**: Meta for Developers > My Apps > TrendPulse > Roles

1. ☐ Click "Roles" in left sidebar
2. ☐ Click "Add Instagram Tester"
3. ☐ Enter your Instagram Business Account username
4. ☐ Click "Add"
5. ☐ Assign "Tester" role
6. ☐ Accept the invite in your Instagram app

### Step 5: Request Advanced Access (For Production) ⬜
**Location**: Meta for Developers > My Apps > TrendPulse > App Review > Permissions and Features

**Permissions needed**:
- `pages_show_list` - List pages user manages
- `pages_read_engagement` - Read engagement data
- `pages_manage_posts` - Create and manage posts
- `business_management` - Required for pages_* permissions
- `instagram_basic` - Basic Instagram info
- `instagram_content_publish` - Publish Instagram content

**Steps**:
1. ☐ Navigate to App Review > Permissions and Features
2. ☐ Find each permission listed above
3. ☐ Click "Request Advanced Access" for each
4. ☐ Fill out the form:
   - **App use case**: Social media management platform
   - **Description**: "TrendPulse allows businesses to schedule and publish content to their Instagram Business Accounts and Facebook Pages through our centralized platform"
   - **Screenshots**: Include OAuth flow and posting interface
   - **Video**: Show connecting account and publishing a post

## 🧪 Testing (After Setup)

### Test Instagram Connection ⬜
1. ☐ Start dev server: `npm run dev`
2. ☐ Go to Settings > Connections
3. ☐ Click "Connect Instagram"
4. ☐ Authorize with your Instagram Business Account
5. ☐ Verify connection shows as "Connected"
6. ☐ Check database for saved token

### Test Facebook Connection ⬜
1. ☐ Go to Settings > Connections
2. ☐ Click "Connect Facebook"
3. ☐ Authorize and select a Facebook Page
4. ☐ Verify connection shows as "Connected"
5. ☐ Check database for saved token

### Test Publishing ⬜
1. ☐ Create a test campaign
2. ☐ Generate content
3. ☐ Click "Publish" to Instagram
4. ☐ Click "Publish" to Facebook
5. ☐ Verify posts appear on both platforms

## 📝 Environment Variables Summary

After completing Step 1, your `.env.local` should have:

```bash
# Use SAME credentials for both Facebook and Instagram
FACEBOOK_CLIENT_ID=846908931167911
FACEBOOK_CLIENT_SECRET=<your_secret_here>

INSTAGRAM_CLIENT_ID=846908931167911
INSTAGRAM_CLIENT_SECRET=<your_secret_here>
```

## ⚠️ Important Notes

1. **Multi-tenant Setup**: ✅ Confirmed - ONE app serves all your customers
2. **Same Credentials**: ✅ Use App ID 846908931167911 for BOTH platforms
3. **Development Mode**: You can test with your own accounts before App Review
4. **App Review Required**: For production use by other businesses
5. **Instagram Business Required**: Personal Instagram accounts cannot be used for posting via API

## 🚀 Next Steps After Setup

Once all checkboxes are completed:
1. Update CHANGELOG.md
2. Commit changes
3. Deploy to production
4. Submit for App Review (if needed)
5. Test with real customer accounts

---

**Questions?** Refer back to [META_AI_HANDOFF.txt](./META_AI_HANDOFF.txt) or contact Meta support.
