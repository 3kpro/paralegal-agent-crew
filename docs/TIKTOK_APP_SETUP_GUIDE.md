# TikTok Developer App - Quick Setup Guide

## Step-by-Step Configuration

### 1. Create the App
✅ Done - You already created the app

### 2. Configure Basic Information

In TikTok Developer Portal → **Your App** → **Basic Information**:

1. **App Name**: TrendPulse (or your app name)
2. **App Description**: AI-powered social media content management platform
3. **App Type**: Web
4. **Category**: Social
5. **Save** the changes

---

### 3. Add Login Kit Product

In TikTok Developer Portal → **Your App**:

1. Click **Add products** or **Products**
2. Find **Login Kit** and click **Add**
3. Click **Configure** on Login Kit
4. Set up:
   - **Redirect URIs** (see step 4 below)
5. **Save**

---

### 4. Configure Redirect URIs

In TikTok Developer Portal → **Your App** → **Login Kit** → **Redirect URIs**:

Add these **EXACT** URLs (no trailing slash):

```
http://localhost:3000/api/auth/callback/tiktok
```

For production (when ready):

```
https://yourdomain.com/api/auth/callback/tiktok
```

**IMPORTANT:**
- ❌ Wrong: `http://localhost:3000/api/auth/callback/tiktok/`
- ❌ Wrong: `http://localhost:3000/api/auth/callback/tiktok?test=1`
- ✅ Correct: `http://localhost:3000/api/auth/callback/tiktok`

---

### 5. Verify Scopes

In TikTok Developer Portal → **Your App** → **Scopes**:

**Required scope (should be auto-approved):**
- ✅ `user.info.basic` - Get user profile info

**Optional scope (for publishing later):**
- ⏳ `video.publish` - Requires manual approval (3-7 days)
  - Apply at: https://developers.tiktok.com/doc/content-posting-api-get-started/

**If `user.info.basic` is missing:**
1. Click **Add Scopes**
2. Search for "user.info.basic"
3. Click **Add**
4. Should auto-approve instantly

---

### 6. Set App to Live Mode

In TikTok Developer Portal → **Your App** → **Overview**:

Check **App Status**:
- Should be: **Live**
- NOT: Development, Testing, or Sandbox

If not Live:
1. Look for **Go Live** or **Publish** button
2. Follow the prompts
3. Wait for status to change

---

### 7. Get Your Credentials

In TikTok Developer Portal → **Your App** → **Basic Information**:

Copy these to `.env.local`:

```env
TIKTOK_CLIENT_KEY=awxyz123456789...
TIKTOK_CLIENT_SECRET=RSTuvwxyz987654...
```

---

### 8. Update Your Environment

Create or update `.env.local`:

```env
TIKTOK_CLIENT_KEY=your_actual_client_key_here
TIKTOK_CLIENT_SECRET=your_actual_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Restart your dev server:**
```bash
npm run dev
```

---

### 9. Test the OAuth Flow

1. Clear any existing TikTok connection in your app's Settings
2. Click **Connect TikTok**
3. You should see TikTok's consent screen
4. Review permissions: "Read your profile info (avatar, display name)"
5. Click **Authorize**
6. Popup should close
7. Connection should appear!

---

## Verification Checklist

After configuring, verify:

- [ ] App is in **Live** mode
- [ ] **Login Kit** is enabled
- [ ] Redirect URI `http://localhost:3000/api/auth/callback/tiktok` is added
- [ ] Scope `user.info.basic` is in Scopes list
- [ ] `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` are in `.env.local`
- [ ] Dev server restarted after adding credentials

---

## Troubleshooting

### "We couldn't log in with TikTok"
**Cause:** Redirect URI doesn't match or app doesn't have scope

**Fix:**
1. Verify Redirect URI is EXACT (no trailing slash)
2. Verify `user.info.basic` scope is approved
3. Wait 1-2 minutes after changing Redirect URIs
4. Try again

### "scope_not_authorized" error
**Cause:** Access token doesn't have required scope

**Fix:**
1. Check Scopes tab - is `user.info.basic` listed?
2. If missing, add it via "Add Scopes"
3. Verify app is in Live mode
4. Try connecting with a different TikTok account

### "Client key not found"
**Cause:** Environment variables not set

**Fix:**
1. Add `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` to `.env.local`
2. Restart dev server: `npm run dev`

---

## OAuth Flow Diagram

```
User clicks "Connect TikTok"
    ↓
GET https://www.tiktok.com/v2/auth/authorize/
  ?client_key=YOUR_KEY
  &scope=user.info.basic
  &response_type=code
  &redirect_uri=http://localhost:3000/api/auth/callback/tiktok
  &state=RANDOM
    ↓
TikTok shows consent screen:
  "Read your profile info (avatar, display name)"
    ↓
User clicks "Authorize"
    ↓
TikTok redirects to:
  http://localhost:3000/api/auth/callback/tiktok?code=xxx&state=xxx
    ↓
Server exchanges code for token:
  POST https://open.tiktokapis.com/v2/oauth/token/
    ↓
Server fetches user profile:
  GET https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,avatar_url
    ↓
Connection saved to database!
    ↓
OAuth success page closes popup
    ↓
Parent window refreshes and shows connection
```

---

## Need Help?

1. Run diagnostic: `npm run check:tiktok`
2. Check server logs: Look for `[tiktok]` prefix
3. Check browser console: F12 → Console tab
4. Verify TikTok Developer Portal settings
5. Check documentation:
   - https://developers.tiktok.com/doc/login-kit-web/
   - https://developers.tiktok.com/doc/tiktok-api-scopes

---

**Created:** December 24, 2025
**Last Updated:** December 24, 2025
