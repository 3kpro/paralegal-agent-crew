# Quick Google Cloud Cleanup Checklist

**Project:** 3kpro-gemini (or your single project)
**Goal:** Ensure ONLY free tier APIs are enabled, no surprises

---

## ✅ Step 1: Review ALL Enabled APIs

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Click **"View all"** or scroll through the list

### Check each enabled API:

| API Name | Keep or Remove? | Why |
|----------|----------------|-----|
| **Generative Language API** | ✅ KEEP | This is FREE Gemini API |
| **Vertex AI API** | ❌ REMOVE | Already disabled - PAID service |
| **Cloud Video Intelligence API** | ❌ REMOVE | PAID - used for Veo video generation |
| **Cloud Vision API** | ❌ REMOVE | PAID - image analysis |
| **Cloud Natural Language API** | ❌ REMOVE | PAID - text analysis |
| **YouTube Data API v3** | ✅ KEEP (if used) | FREE with quotas |
| **Google Drive API** | ✅ KEEP (if used) | FREE with quotas |
| **People API** | ✅ KEEP (if used) | FREE - for Google Sign-In |
| **Cloud Storage API** | ⚠️ CHECK | Can be expensive if storing large files |
| **Cloud Run API** | ⚠️ CHECK | Can incur charges if you deployed services |

### How to disable an API:
1. Click on the API name
2. Click **"DISABLE API"** button at top
3. Confirm

---

## ✅ Step 2: Audit Credentials (API Keys)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Look at the **"API keys"** section

### You should have:
- **1-2 API keys maximum**
- One matches your `.env.local`: `AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI`

### For your ACTIVE API key:
1. Click the pencil (edit) icon
2. **API restrictions:**
   - Select "Restrict key"
   - Check ONLY: "Generative Language API"
   - Uncheck everything else
3. **Application restrictions:**
   - Select "HTTP referrers (web sites)"
   - Add: `https://xelora.app/*`
   - Add: `http://localhost:3000/*`
4. Click **SAVE**

### Delete unused keys:
- Any key NOT in your `.env.local` → Click trash icon → Delete

---

## ✅ Step 3: Audit OAuth 2.0 Clients

1. Still in: https://console.cloud.google.com/apis/credentials
2. Look at **"OAuth 2.0 Client IDs"** section

### Common cleanup:
- You likely have 1-3 OAuth clients from testing
- Check each one's "Authorized redirect URIs"
- Keep: Ones that point to `xelora.app` or `localhost:3000`
- Delete: Old test clients, duplicates, or unknown URIs

**Note:** The OAuth clients for Facebook, Twitter, TikTok are managed on those platforms' developer consoles, NOT Google Cloud.

---

## ✅ Step 4: Set Up Budget Alert ($1 Protection)

1. Go to: https://console.cloud.google.com/billing/budgets
2. Click **"CREATE BUDGET"**
3. Configure:
   - **Name:** Xelora Free Tier Alert
   - **Budget type:** Specified amount
   - **Amount:** $1.00
   - **Alert thresholds:** 50%, 90%, 100%
   - **Email:** (your email)
4. Click **"FINISH"**

**Why $1?** You should be at $0/month with free tier. If you hit $1, something is wrong.

---

## ✅ Step 5: Check for Running Services

### Cloud Run (if you deployed anything):
1. Go to: https://console.cloud.google.com/run
2. Check if any services are running
3. If you see services you don't recognize → Delete them

### Cloud Storage (if you uploaded files):
1. Go to: https://console.cloud.google.com/storage/browser
2. Check for large buckets
3. Delete unnecessary files/buckets

**Note:** These services charge for running/storage time.

---

## ✅ Step 6: Review January Billing Details

1. Go to: https://console.cloud.google.com/billing/reports
2. Filter to: January 2026
3. Click **"View report"** under "Usage cost"
4. Look at the breakdown by SKU (service)

### Questions to answer:
- [ ] What exact service caused the $219 charge?
- [ ] Was it Vertex AI API calls?
- [ ] Or Cloud Video Intelligence (Veo)?
- [ ] Or something else?

Take a screenshot of the SKU breakdown and share it - I can help interpret.

---

## ✅ Step 7: Verify Promotional Credits Status

1. Still in: https://console.cloud.google.com/billing
2. Click on your billing account
3. Look for **"Credits"** or **"Promotional credits"** section

### Check:
- How much credit is left? ($158 was used in January)
- When do they expire?
- Are there any restrictions on what they can be used for?

**Important:** Don't rely on credits - they run out. Setup should work with $0/month.

---

## ✅ Step 8: Final Verification

After completing all steps above:

- [ ] Only Generative Language API is enabled
- [ ] API key is restricted to Generative Language API only
- [ ] Budget alert is set to $1
- [ ] No Cloud Run services are running
- [ ] No large Cloud Storage buckets exist
- [ ] All unused OAuth clients deleted

---

## 🧪 Step 9: Test Xelora Engine

After cleanup, verify everything still works:

```bash
cd C:\DEV\3K-Pro-Services\landing-page
npx tsx scripts/test-xelora-engine.ts
```

Expected output: All tests pass, $0.00 cost

---

## 📊 Expected Final State

### Monthly Cost: $0.00
- Gemini API free tier: 1500 requests/day (more than enough)
- Your typical usage: ~50-100 requests/day
- Buffer: 15x headroom

### APIs Enabled (FREE only):
- ✅ Generative Language API
- ✅ YouTube Data API v3 (if needed)
- ✅ Google Drive API (if needed)
- ✅ People API (if needed)

### APIs Disabled (PAID):
- ❌ Vertex AI API
- ❌ Cloud Video Intelligence API
- ❌ Cloud Vision API
- ❌ Cloud Natural Language API

---

## 🆘 If You Get Stuck

**Common issues:**

### "I can't find the API to disable"
- Use the search bar at top of console
- Type the API name exactly as shown

### "My API key restrictions won't save"
- Wait 5 minutes and try again (propagation delay)
- Make sure you selected "Restrict key" not "Don't restrict key"

### "Xelora stops working after restricting key"
- Verify "Generative Language API" is checked in restrictions
- Verify HTTP referrer includes `http://localhost:3000/*`
- Restart dev server: `npm run dev`

---

## ⏱️ Time Estimate

- Step 1-3: ~10 minutes (API/credential cleanup)
- Step 4-5: ~5 minutes (budget + services check)
- Step 6-7: ~5 minutes (billing review)
- Step 8-9: ~5 minutes (testing)

**Total:** ~25 minutes for complete cleanup

---

Start with Step 1 and work through sequentially. Report back after Step 6 with the SKU breakdown screenshot - I want to see exactly what caused the $219 charge.
