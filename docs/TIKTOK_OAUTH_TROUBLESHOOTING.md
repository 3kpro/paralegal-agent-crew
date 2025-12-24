# TikTok OAuth Troubleshooting Guide

## Quick Diagnostic
Run this command to verify your TikTok OAuth configuration:
```bash
npm run diagnose:tiktok
```

## Common Issues & Solutions

### 1. "OAuth credentials not configured"
**Symptom**: Button click shows error about missing credentials

**Solution**:
- Verify `.env.local` contains both `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`
- Ensure credentials are from TikTok Developer Portal > Your App > Basic Info
- Restart dev server after adding credentials: `npm run dev`

### 2. "Redirect URI mismatch" (400 error)
**Symptom**: OAuth fails during token exchange with 400 error

**Solution**:
- Go to TikTok Developer Portal > Your App > Login Kit
- Add these EXACT redirect URIs:
  - `http://localhost:3000/api/auth/callback/tiktok` (for local dev)
  - `https://yourdomain.com/api/auth/callback/tiktok` (for production)
- Make sure there are NO trailing slashes
- Save and wait a few seconds for TikTok to update
- Try OAuth flow again

### 3. "Unauthorized" (401 error)
**Symptom**: OAuth fails during token exchange with 401 error

**Solution**:
- Verify `TIKTOK_CLIENT_KEY` matches exactly in TikTok portal (no extra spaces)
- Verify `TIKTOK_CLIENT_SECRET` is correct (regenerate if unsure)
- Check your TikTok app is in "Live" mode, not "Development"

### 4. "Forbidden" (403 error)
**Symptom**: OAuth fails during token exchange with 403 error

**Solution**:
- Ensure your TikTok app has "Login Kit" enabled
- Verify your app has been approved by TikTok (for Content Posting API)
- Check IP whitelist settings in TikTok Developer Portal (if any)

### 5. OAuth succeeds but connection doesn't show
**Symptom**: Popup closes but no connection appears in UI

**Solution**:
- Check browser console (F12) for errors
- Check server logs for error messages
- Verify `NEXT_PUBLIC_APP_URL` in `.env.local` matches actual URL
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### 6. "Profile fetch failed"
**Symptom**: Connection saves but test fails with profile error

**Solution**:
- Verify OAuth scopes include `user.info.basic`
- Check TikTok API status: https://developers.tiktok.com/status/
- Try reconnecting TikTok account

### 7. Connection shows "Pending Test"
**Symptom**: Connection saved but shows "Pending Test" status

**Solution**:
- This is normal! Click the "Test" button on TikTok connection card
- If test succeeds, status changes to "Connected"
- If test fails, check error message and see relevant section above

## Verification Steps

After fixing any issue, verify the OAuth flow works:

1. **Environment Variables Check**:
   ```bash
   npm run diagnose:tiktok
   ```

2. **Redirect URI Check**:
   - Log into TikTok Developer Portal
   - Navigate to Your App > Login Kit
   - Verify redirect URIs are listed correctly

3. **Test OAuth Flow**:
   - Go to http://localhost:3000/settings
   - Click "Connect" on TikTok card
   - Authorize your app
   - Popup should close automatically
   - TikTok should appear as "Connected" or "Pending Test"
   - Click "Test" to verify full connection

## Debug Mode

To enable verbose logging:

1. Check browser console (F12) for client-side errors
2. Check server terminal for OAuth flow logs
3. Look for these log patterns:
   ```
   [tiktok] OAuth Configuration:
   [tiktok] Redirecting to OAuth URL
   [tiktok] OAuth callback started
   [tiktok] Exchanging code for tokens...
   [tiktok] Token exchange response status: 200
   [tiktok] Profile fetched
   [tiktok] Connection saved successfully!
   ```

## Getting Help

If issues persist after trying all solutions:

1. Run diagnostic and save output:
   ```bash
   npm run diagnose:tiktok > tiktok-diagnostic.txt
   ```

2. Collect logs:
   - Browser console output (screenshots preferred)
   - Server terminal output
   - Any error messages shown in UI

3. Check TikTok Developer documentation:
   - https://developers.tiktok.com/doc/login-kit-web/
   - https://developers.tiktok.com/doc/oauth-overview/

4. Check known issues:
   - https://developers.tiktok.com/faq/

## OAuth Flow Diagram

```
User clicks "Connect TikTok"
    ↓
Opens popup: /api/auth/connect/tiktok
    ↓
Redirects to: https://www.tiktok.com/v2/auth/authorize/
    ↓
User authorizes app on TikTok
    ↓
TikTok redirects to: /api/auth/callback/tiktok?code=...
    ↓
Server exchanges code for tokens (POST to: https://open.tiktokapis.com/v2/oauth/token/)
    ↓
Server fetches user profile (GET: https://open.tiktokapis.com/v2/user/info/)
    ↓
Server saves encrypted tokens to database
    ↓
OAuthSuccess page posts message and closes popup
    ↓
Parent window refreshes connections list
    ↓
Connection appears in UI with "Pending Test" or "Connected" status
```

## Environment Variables Reference

Required for TikTok OAuth:
```env
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional (for production):
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Recent Fixes Applied

1. ✅ Fixed token endpoint URL (`open-api.tiktok.com` → `open.tiktokapis.com`)
2. ✅ Increased OAuth success message delay (100ms → 500ms)
3. ✅ Enhanced error logging and display
4. ✅ Added OAuth error message handling in parent window
5. ✅ Improved diagnostic messages for common TikTok OAuth errors
6. ✅ Added redirect URI validation in connect route
