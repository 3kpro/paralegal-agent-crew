# Social OAuth Testing Guide

## Quick Start Testing

### 1. Generate Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to `.env.local`:
```bash
ENCRYPTION_KEY=<your_generated_64_char_hex_key>
```

### 2. Test Twitter OAuth (Already Configured)

Your `.env.local` already has Twitter credentials:
```bash
TWITTER_CLIENT_ID=UUlMY0pmdWh6d200Q1RSY1BuN2M6MTpjaQ
TWITTER_CLIENT_SECRET=fafDWpntdc7OcLMwPZXmvJCHZGQSsHBsQTEI5bW9Ty3DVp1Ajp
```

**Test Steps:**
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/social-accounts`
3. Click "Connect Twitter"
4. Popup should open with Twitter authorization
5. After auth, popup closes and UI updates

**Verify:**
```sql
-- Check Supabase database
SELECT 
  platform, 
  platform_username, 
  is_active,
  LEFT(access_token, 20) as token_preview,  -- Should be encrypted gibberish
  token_expires_at
FROM social_accounts
WHERE platform = 'twitter';
```

### 3. Test Posting to Twitter

After connecting Twitter account:

```javascript
// Test from browser console on /social-accounts page
const response = await fetch('/api/social/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'twitter',
    content: 'Testing OAuth integration from Content Cascade AI! 🚀'
  })
});

const result = await response.json();
console.log(result);
// Should return: { success: true, postId: "...", url: "https://twitter.com/..." }
```

### 4. Test Token Encryption

Check that tokens are actually encrypted:

```sql
-- In Supabase SQL Editor
SELECT 
  platform,
  platform_username,
  access_token,  -- Should NOT be readable
  LENGTH(access_token) as token_length  -- Should be much longer than original
FROM social_accounts
LIMIT 1;
```

The `access_token` should look like:
```
a1b2c3d4e5f6...  (long encrypted hex string)
```

NOT like:
```
ya29.a0AfH6SMB...  (readable OAuth token)
```

### 5. Test Token Refresh

**Manual Test:**
```javascript
// In browser console
import { getValidToken } from '@/lib/auth/oauth';

// This should return a valid token (auto-refreshing if needed)
const token = await getValidToken('your-user-id', 'twitter');
console.log('Token retrieved:', token.substring(0, 20) + '...');
```

**Automatic Test:**
1. Wait for token to get close to expiration (or manually set expiration in DB)
2. Make a post request
3. Check logs - should see token refresh happening automatically

### 6. Test OAuth for Other Platforms

#### LinkedIn
1. Get credentials from [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Add to `.env.local`:
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```
3. Update redirect URI in LinkedIn app settings:
   - `http://localhost:3000/api/auth/callback/linkedin`
4. Test connection at `/social-accounts`

#### Facebook
1. Get credentials from [Meta for Developers](https://developers.facebook.com/)
2. Add to `.env.local`:
```bash
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
```
3. Update redirect URI:
   - `http://localhost:3000/api/auth/callback/facebook`
4. Test connection

#### Instagram
Uses same credentials as Facebook:
```bash
INSTAGRAM_CLIENT_ID=<same_as_facebook>
INSTAGRAM_CLIENT_SECRET=<same_as_facebook>
```

⚠️ **Requirements:**
- Instagram Business or Creator account
- Facebook Page connected to Instagram
- App Review required for production

#### TikTok
1. Register at [TikTok for Developers](https://developers.tiktok.com/)
2. Add credentials:
```bash
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
```
3. ⚠️ Requires app approval before testing

## Testing Checklist

- [ ] Encryption key generated and added to .env
- [ ] Twitter OAuth flow works
- [ ] Tokens are encrypted in database
- [ ] Can post to Twitter
- [ ] Connected account shows in UI with profile info
- [ ] Can disconnect account
- [ ] Token refresh works automatically
- [ ] LinkedIn credentials configured (if needed)
- [ ] Facebook credentials configured (if needed)
- [ ] Instagram prerequisites met (if needed)
- [ ] TikTok app approved (if needed)

## Debugging OAuth Issues

### Popup Blocked
```javascript
// Check if popup was blocked
const popup = window.open(url, name, features);
if (!popup || popup.closed || typeof popup.closed == 'undefined') {
  console.error('Popup blocked!');
  alert('Please allow popups for this site');
}
```

### Check Server Logs
```bash
# Terminal running dev server shows detailed OAuth logs
[twitter] OAuth callback started
[twitter] Code received: Yes
[twitter] User authenticated: user@example.com
[twitter] Tokens received: Yes
[twitter] Profile fetched: @username
[twitter] Encrypting and saving to database...
[twitter] ✅ Account saved successfully with encrypted tokens!
```

### Verify Environment Variables
```javascript
// Check which platforms are configured
console.log('Twitter:', !!process.env.TWITTER_CLIENT_ID);
console.log('LinkedIn:', !!process.env.LINKEDIN_CLIENT_ID);
console.log('Facebook:', !!process.env.FACEBOOK_CLIENT_ID);
console.log('Encryption:', !!process.env.ENCRYPTION_KEY);
```

### Test Database Connection
```sql
-- Check social_accounts table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'social_accounts';
```

## Common Errors

### "Invalid redirect URI"
**Solution:** Ensure redirect URI in platform settings matches exactly:
```
http://localhost:3000/api/auth/callback/twitter
                                    ^^^^^^^^
                                    Platform name must match
```

### "Token encryption failed"
**Solution:** Check ENCRYPTION_KEY:
```bash
# Should be 64 hex characters (32 bytes)
echo $ENCRYPTION_KEY | wc -c
# Should output: 64
```

### "Connection failed"
**Solution:** Check browser console and server logs for specific error message

### "Popup closed without completing auth"
**Solution:** User may have closed popup manually or OAuth failed. Check server logs.

## Success Indicators

✅ **OAuth Working:**
- Popup opens with platform's authorization page
- User can authorize the app
- Popup closes automatically
- UI updates to show "Connected" status
- Profile info displayed (@username, followers)

✅ **Encryption Working:**
- Tokens in database are unreadable hex strings
- Token length is ~2-3x original length
- No readable "Bearer" or OAuth tokens in database

✅ **Posting Working:**
- API returns success with postId and URL
- Post appears on social platform
- Post tracked in social_posts table

✅ **Token Refresh Working:**
- Expired tokens automatically refresh
- No manual reconnection needed
- Logs show "last_token_refresh" timestamp updates

## Next Steps After Testing

1. ✅ Verify all platforms work locally
2. Submit apps for review (LinkedIn, Instagram, TikTok)
3. Update redirect URIs for production domain
4. Deploy to production
5. Test OAuth on production URL
6. Monitor error logs for OAuth issues
7. Set up alerts for token refresh failures

## Support

If you encounter issues:
1. Check server logs (most detailed info)
2. Check browser console
3. Verify environment variables
4. Check platform developer console for errors
5. Review `docs/SOCIAL_OAUTH_SETUP.md` for platform-specific setup
