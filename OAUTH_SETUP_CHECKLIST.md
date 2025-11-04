# OAuth Setup Checklist

## Pre-Setup ✓
- [x] Vercel CLI installed
- [x] Logged in as `3kpro`
- [x] Project deployed to Vercel
- [x] Production URL identified

## Platform Registration

### Twitter/X OAuth
- [ ] App created at https://developer.twitter.com
- [ ] OAuth 2.0 enabled
- [ ] Callback URL added: `https://[YOUR-DOMAIN]/api/auth/callback/twitter`
- [ ] Client ID obtained
- [ ] Client Secret obtained
- [ ] Credentials added to Vercel

### LinkedIn OAuth
- [ ] App created at https://www.linkedin.com/developers/apps
- [ ] Redirect URL added: `https://[YOUR-DOMAIN]/api/auth/callback/linkedin`
- [ ] Sign In with LinkedIn product added
- [ ] Share on LinkedIn product added
- [ ] Client ID obtained
- [ ] Client Secret obtained
- [ ] Credentials added to Vercel

### Facebook OAuth (Instagram)
- [ ] App created at https://developers.facebook.com/apps
- [ ] Facebook Login product added
- [ ] Instagram Basic Display product added
- [ ] Redirect URI added: `https://[YOUR-DOMAIN]/api/auth/callback/facebook`
- [ ] App ID obtained
- [ ] App Secret obtained
- [ ] Credentials added to Vercel

### TikTok OAuth
- [ ] App created at https://developers.tiktok.com
- [ ] Login Kit enabled
- [ ] Video Kit enabled
- [ ] Redirect URI added: `https://[YOUR-DOMAIN]/api/auth/callback/tiktok`
- [ ] App submitted for review
- [ ] App approved ⚠️ (may take 1-2 days)
- [ ] Client Key obtained
- [ ] Client Secret obtained
- [ ] Credentials added to Vercel

## Vercel Environment Variables

Run: `vercel env ls` to verify all are added

- [ ] TWITTER_CLIENT_ID (production)
- [ ] TWITTER_CLIENT_SECRET (production)
- [ ] LINKEDIN_CLIENT_ID (production)
- [ ] LINKEDIN_CLIENT_SECRET (production)
- [ ] FACEBOOK_APP_ID (production)
- [ ] FACEBOOK_APP_SECRET (production)
- [ ] TIKTOK_CLIENT_KEY (production)
- [ ] TIKTOK_CLIENT_SECRET (production)

## Deployment

- [ ] All ENV variables verified: `vercel env ls`
- [ ] Production deployment: `vercel --prod`
- [ ] Deployment successful (check Vercel dashboard)

## Testing

Test each OAuth flow on production:

- [ ] Twitter OAuth popup works
- [ ] LinkedIn OAuth popup works
- [ ] Facebook OAuth popup works
- [ ] TikTok OAuth popup works (after approval)

For each platform:
- [ ] Popup opens correctly
- [ ] User can authorize
- [ ] Popup closes after auth
- [ ] Account shows as "Connected"
- [ ] Profile info displays (name, username, followers)
- [ ] Can disconnect and reconnect

## Post-Launch Monitoring

- [ ] Check Vercel logs for OAuth errors
- [ ] Monitor Supabase for token storage
- [ ] Test token refresh (after 1 hour for Twitter/LinkedIn)
- [ ] Verify posting works from connected accounts

## Quick Commands Reference

```bash
# Check who you're logged in as
vercel whoami

# List deployments
vercel ls

# List environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME production

# Deploy to production
vercel --prod

# View logs
vercel logs [deployment-url]
```

## Your Production URL

Replace `[YOUR-DOMAIN]` above with: ___________________________

(Find it by running `vercel ls` and copying the "Ready" production URL)

---

**Status:** Not Started  
**Next Action:** Register Twitter OAuth app  
**Estimated Time:** 2-3 hours for all platforms  
**Blocker:** TikTok review (1-2 days)
