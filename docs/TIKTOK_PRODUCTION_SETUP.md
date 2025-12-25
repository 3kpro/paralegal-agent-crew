# TikTok OAuth - PRODUCTION Configuration

## ⚠️ CRITICAL: Production vs Local Development

**Testing from production**: https://xelora.app/

Your TikTok Developer App must be configured with **production redirect URI**, not localhost!

---

## Production Setup Steps

### 1. Get Your Production Redirect URI

Your production callback URL is:

```
https://xelora.app/api/auth/callback/tiktok
```

**IMPORTANT:**
- ✅ https://xelora.app/api/auth/callback/tiktok
- ❌ http://localhost:3000/api/auth/callback/tiktok (this is for local dev only)

---

### 2. Update TikTok Developer App

Go to: https://developers.tiktok.com/ → **Your App** → **Login Kit** → **Redirect URIs**

**Add this exact URL:**

```
https://xelora.app/api/auth/callback/tiktok
```

**Remove or replace:**
```
http://localhost:3000/api/auth/callback/tiktok
```

**Save** the changes.

---

### 3. Verify Other Settings

In TikTok Developer Portal → **Your App**:

#### App Status
- Must be: **Live** (not Development)

#### Scopes
- Must have: `user.info.basic` (auto-approved for Login Kit apps)
- Optional: `video.publish` (requires Content Posting API approval)

#### Basic Information
- Copy your credentials for production environment:
  - **Client Key** → `TIKTOK_CLIENT_KEY`
  - **Client Secret** → `TIKTOK_CLIENT_SECRET`

---

### 4. Production Environment Variables

Your production environment (Vercel) needs these variables:

```env
TIKTOK_CLIENT_KEY=your_actual_client_key
TIKTOK_CLIENT_SECRET=your_actual_client_secret
NEXT_PUBLIC_APP_URL=https://xelora.app
```

**How to set in Vercel:**

1. Go to: https://vercel.com/3kpros-projects/landing-page/settings/environment-variables
2. Click **Add New**
3. Add `TIKTOK_CLIENT_KEY` with your actual value
4. Add `TIKTOK_CLIENT_SECRET` with your actual value
5. Verify `NEXT_PUBLIC_APP_URL` is set to `https://xelora.app`
6. Click **Save**
7. **Redeploy** (Vercel will automatically redeploy after saving)

---

### 5. Test Production OAuth

1. Go to: https://xelora.app/settings
2. Click **Connect TikTok**
3. You should see TikTok consent screen
4. Review: "Read your profile info (avatar, display name)"
5. Click **Authorize**
6. Connection should succeed!

---

## Debugging Production OAuth

### Check Production Logs

1. Go to Vercel dashboard
2. Click on your project
3. Click **Logs** tab
4. Select the most recent deployment
5. Look for `[tiktok]` prefixed logs

**What to look for:**
```
[tiktok] OAuth Configuration:
  Origin: https://xelora.app
  Callback URL: https://xelora.app/api/auth/callback/tiktok
  Client ID: xxx...
  Code Challenge: yyy...
```

```
[tiktok] OAuth callback started
  Code received: Yes
  Error param: None
  State validation: ✓ Valid
```

```
[tiktok] Token exchange response status: 200
  Granted scopes: user.info.basic
  Scope match: ✅
```

### Common Production Issues

| Issue | Cause | Solution |
|--------|--------|----------|
| "Redirect URI mismatch" | Using localhost URL in TikTok app | Add `https://xelora.app/api/auth/callback/tiktok` |
| "scope_not_authorized" | Scope not approved or denied | Check `user.info.basic` is in Scopes tab |
| "Client key not found" | Vercel env vars not set | Add to Vercel environment variables |
| "Forbidden" (403) | App in Development mode | Change to Live mode |

---

## Vercel Environment Variables Setup

### Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/3kpros-projects/landing-page/settings/environment-variables
2. Add each variable:
   - `TIKTOK_CLIENT_KEY` = your_client_key
   - `TIKTOK_CLIENT_SECRET` = your_client_secret
   - `NEXT_PUBLIC_APP_URL` = `https://xelora.app`
3. Click **Save**
4. Wait for auto-redeploy (2-3 minutes)

### Via CLI

```bash
vercel env add TIKTOK_CLIENT_KEY production
# Enter your actual client key when prompted

vercel env add TIKTOK_CLIENT_SECRET production
# Enter your actual client secret when prompted

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://xelora.app
```

Then redeploy:
```bash
vercel --prod
```

---

## Verification Checklist

After configuring, verify:

- [ ] TikTok app has `https://xelora.app/api/auth/callback/tiktok` in Redirect URIs
- [ ] TikTok app is in **Live** mode
- [ ] TikTok app has `user.info.basic` scope approved
- [ ] Vercel has `TIKTOK_CLIENT_KEY` environment variable
- [ ] Vercel has `TIKTOK_CLIENT_SECRET` environment variable
- [ ] Vercel has `NEXT_PUBLIC_APP_URL=https://xelora.app`
- [ ] Latest deployment has finished (check Vercel dashboard)
- [ ] Accessing https://xelora.app/settings
- [ ] Clicking "Connect TikTok" redirects to TikTok

---

## Production URL Reference

| Environment | NEXT_PUBLIC_APP_URL | Redirect URI in TikTok App |
|--------------|---------------------|---------------------------|
| Local Dev | `http://localhost:3000` | `http://localhost:3000/api/auth/callback/tiktok` |
| Production | `https://xelora.app` | `https://xelora.app/api/auth/callback/tiktok` |

---

## Quick Fix: Update Production Env Vars

If TikTok OAuth fails on production, run:

```bash
# 1. Set Vercel env vars (replace with your actual values)
vercel env add TIKTOK_CLIENT_KEY production
# Paste: your_actual_client_key

vercel env add TIKTOK_CLIENT_SECRET production
# Paste: your_actual_client_secret

# 2. Redeploy to production
vercel --prod
```

---

**Production URL**: https://xelora.app
**TikTok Developer Portal**: https://developers.tiktok.com/
**Vercel Dashboard**: https://vercel.com/3kpros-projects/landing-page

---

Last Updated: December 24, 2025
