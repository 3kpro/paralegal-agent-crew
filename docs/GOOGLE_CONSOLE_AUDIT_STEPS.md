# Google Cloud Console Cleanup - Step by Step

**Goal:** Eliminate all unnecessary Google Cloud projects, APIs, and OAuth apps to prevent surprise billing.

---

## 📍 Phase 1: Project Audit

### Step 1: List All Your Google Cloud Projects

1. Go to: https://console.cloud.google.com/
2. Click the project dropdown at the top (next to "Google Cloud")
3. Take a screenshot or note down ALL project names you see

**Expected Projects:**
- `3kpro-gemini` (mentioned in vertex script)
- Possibly others created for testing

### Step 2: For EACH Project - Check Billing Status

For each project you found:

1. Select the project from dropdown
2. Go to: **Billing** → **Account Management**
3. Check if billing is enabled
4. Note the billing account name

**Action Items:**
- [ ] List all projects with billing enabled
- [ ] Identify which project has the $50 charge

### Step 3: For EACH Project - Check Enabled APIs

For each project:

1. Go to: **APIs & Services** → **Enabled APIs & services**
2. Review the list - look for:
   - ⚠️ **Vertex AI API** (PAID - causes charges)
   - ⚠️ **Cloud Video Intelligence API** (PAID - video generation)
   - ⚠️ **Cloud Vision API** (PAID)
   - ✅ **Generative Language API** (FREE - Gemini API)
   - ✅ **YouTube Data API v3** (FREE with quotas)
   - ✅ **Google Drive API** (FREE with quotas)

**Action Items:**
- [ ] Screenshot enabled APIs for each project
- [ ] Identify projects with Vertex AI enabled

---

## 📍 Phase 2: Consolidation Plan

### Decision Matrix

| Project | Billing? | Vertex AI? | Action |
|---------|----------|------------|--------|
| `3kpro-gemini` | Yes | Yes | DISABLE billing or DELETE |
| (others) | ? | ? | Review individually |

### Recommended Final Setup

**ONE PROJECT ONLY:**
- **Name:** `xelora-production` (or rename existing)
- **Billing:** FREE tier only (remove credit card if possible)
- **Enabled APIs:**
  - ✅ Generative Language API (Gemini)
  - ✅ YouTube Data API v3 (for YouTube OAuth, if needed)
  - ✅ Google Drive API (for Drive Picker, if needed)
  - ✅ People API (for Google Sign-In profile data)
- **DISABLED APIs:**
  - ❌ Vertex AI API
  - ❌ Cloud Video Intelligence API
  - ❌ All other paid services

---

## 📍 Phase 3: API Cleanup

### Step 4: Disable Vertex AI

For EACH project with Vertex AI enabled:

1. Go to: **APIs & Services** → **Enabled APIs & services**
2. Find "Vertex AI API" in the list
3. Click it → Click **"DISABLE API"** button
4. Confirm the disable action

**Why:** This immediately stops ALL Vertex AI billing.

### Step 5: Enable Generative Language API (if not already)

In your ONE production project:

1. Go to: **APIs & Services** → **Library**
2. Search for: "Generative Language API"
3. Click it → Click **"ENABLE"**
4. This is the FREE Gemini API

### Step 6: Review Other Enabled APIs

For each other enabled API:

Ask yourself: "Does Xelora actually use this?"

**Keep these if you use them:**
- YouTube Data API v3 (if you have YouTube OAuth)
- Google Drive API (if you use Drive Picker)
- People API (if you use Google Sign-In)

**Disable these (not needed for Gemini API):**
- Cloud Resource Manager API
- Service Usage API
- Cloud Logging API
- (Any others you don't recognize)

---

## 📍 Phase 4: OAuth Credentials Cleanup

### Step 7: Audit OAuth 2.0 Client IDs

In your ONE production project:

1. Go to: **APIs & Services** → **Credentials**
2. Look at "OAuth 2.0 Client IDs" section
3. Count how many exist

**Expected:**
- You should have 1-2 OAuth clients maximum
- One for local dev (localhost redirect)
- One for production (xelora.app redirect)

**If you have 5+ OAuth clients:** You have duplicates from testing

### Step 8: Identify Which OAuth Clients Are Used

For each OAuth 2.0 Client ID:

1. Click the pencil (edit) icon
2. Check "Authorized JavaScript origins" and "Authorized redirect URIs"
3. Note which domains they point to:
   - `http://localhost:3000` → Local dev
   - `https://xelora.app` → Production
   - Others → DELETE

**Action Items:**
- [ ] List all OAuth client IDs and their redirect URIs
- [ ] Identify unused/duplicate OAuth clients

### Step 9: Delete Unused OAuth Clients

For each OAuth client that is NOT being used:

1. Click the trash can icon next to it
2. Confirm deletion

**Warning:** Make sure you don't delete the one used by `.env.local`!

Check your `.env.local` to see which OAuth clients are referenced:
```env
FACEBOOK_CLIENT_ID=1433622738420736
TWITTER_CLIENT_ID=cTd1STFLbms1RXRaSWFmQnBPaFQ6MTpjaQ
TIKTOK_CLIENT_KEY=awor4roxingfnfin
LINKEDIN_CLIENT_ID=86ajcfglpco29h
```

**These are NOT Google OAuth clients** - they're for other platforms (Facebook, Twitter, etc.)

For Google OAuth: You're looking for a client ID that looks like:
```
123456789012-abc123def456.apps.googleusercontent.com
```

---

## 📍 Phase 5: API Key Audit

### Step 10: Count Your API Keys

1. Go to: **APIs & Services** → **Credentials**
2. Look at "API Keys" section
3. Count how many exist

**Expected:** 1-2 keys maximum

### Step 11: Identify Which Key Is in Use

Check your `.env.local`:
```env
GOOGLE_API_KEY=AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI
```

In Google Cloud Console:
1. For each API key, click "Show Key"
2. Compare to the value in `.env.local`
3. The matching key is your active key

### Step 12: Restrict Your API Key

For your active API key:

1. Click the pencil (edit) icon
2. Under "API restrictions":
   - Select **"Restrict key"**
   - Check ONLY: **"Generative Language API"**
   - Uncheck everything else (especially Vertex AI)
3. Under "Application restrictions":
   - Select **"HTTP referrers (web sites)"**
   - Add: `https://xelora.app/*`
   - Add: `http://localhost:3000/*` (for local dev)
4. Click **"SAVE"**

**Why:** This prevents the key from being used for ANY paid services.

### Step 13: Delete Unused API Keys

For each API key that is NOT in `.env.local`:

1. Click the trash can icon
2. Confirm deletion

---

## 📍 Phase 6: Project Deletion (Optional)

### Step 14: Delete Unused Projects

If you have multiple Google Cloud projects and want to consolidate:

1. Go to: **IAM & Admin** → **Settings**
2. Scroll to "Shut down this project"
3. Type the project ID to confirm
4. Click **"SHUT DOWN"**

**Warning:** This is PERMANENT. Only do this if you're 100% sure the project is not being used.

**Recommended approach:** Instead of deleting immediately, just disable billing first and monitor for 1 week to ensure nothing breaks.

---

## 📍 Phase 7: Billing Protection

### Step 15: Set Up Budget Alerts

In your ONE production project:

1. Go to: **Billing** → **Budgets & alerts**
2. Click **"CREATE BUDGET"**
3. Configure:
   - Name: "Xelora Free Tier Protection"
   - Budget type: **Specified amount**
   - Amount: **$1.00**
   - Alert thresholds: **50%, 100%**
   - Email recipients: (your email)
4. Click **"FINISH"**

**Why:** If you accidentally exceed $1 in a month, you'll get an email alert immediately.

### Step 16: Remove Credit Card (Optional)

If you want ZERO risk of charges:

1. Go to: **Billing** → **Account Management**
2. Click **"CLOSE BILLING ACCOUNT"**

**Warning:** This will disable the project entirely. Only do this if you're okay with Xelora stopping working until you re-add the free tier.

**Better approach:** Just keep the budget alert active and monitor usage weekly.

---

## 📍 Phase 8: Quota Monitoring

### Step 17: Check Gemini API Quotas

1. Go to: **APIs & Services** → **Enabled APIs & services**
2. Click **"Generative Language API"**
3. Click **"Quotas & System Limits"** tab
4. Review the free tier limits:
   - ✅ **15 requests per minute**
   - ✅ **1M tokens per minute**
   - ✅ **1500 requests per day**

**Current Xelora usage:**
- Trend Discovery: ~1-5 requests per campaign
- Content Generation: ~1-10 requests per campaign
- Viral Score: ~1 request per campaign

**Estimated daily usage:** 20-100 requests (well within free tier)

### Step 18: Set Up Quota Alerts (Optional)

If you want to monitor quota usage:

1. In the Quotas page, find "Queries per minute"
2. Click **"MANAGE QUOTA OVERRIDES"**
3. Request an alert at 80% of quota

**Note:** This is optional - free tier limits are generous and you're unlikely to hit them.

---

## ✅ Final Checklist

After completing all steps, verify:

- [ ] Only ONE Google Cloud project exists (or only one has billing enabled)
- [ ] Vertex AI API is DISABLED in all projects
- [ ] Generative Language API is ENABLED in production project
- [ ] API key is restricted to Generative Language API only
- [ ] Unused OAuth clients deleted
- [ ] Budget alert set to $1.00
- [ ] No surprise charges in billing dashboard

---

## 🆘 Troubleshooting

### "I can't find the Generative Language API"

- Search for "Gemini API" instead
- Or search for "generativelanguage.googleapis.com"

### "My API key doesn't work after restricting it"

- Wait 5 minutes for restrictions to propagate
- Check that "Generative Language API" is checked in restrictions
- Verify HTTP referrer matches your domain

### "I deleted the wrong OAuth client!"

- You can recreate it in: APIs & Services → Credentials → Create Credentials
- Update `.env.local` with the new client ID/secret

### "Xelora stopped working after changes"

- Check browser console for error messages
- Verify `GOOGLE_API_KEY` is still in `.env.local`
- Restart the dev server: `npm run dev`
- Check API key restrictions allow localhost

---

## 📞 Need Help?

If you get stuck during cleanup:
1. Take a screenshot of the error/confusion
2. Document which step you're on
3. We can troubleshoot together

**Do NOT delete anything if you're unsure** - we can review together first.
