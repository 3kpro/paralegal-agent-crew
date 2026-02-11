# Google Cloud Cleanup - Eliminate Surprise Billing

**Date:** 2026-02-08
**Issue:** $50 surprise bill from mixed Vertex AI (PAID) and Gemini API (FREE) usage
**Goal:** Consolidate to ONE app using ONLY free tier Gemini API

---

## 🔍 Current State Audit

### Installed SDKs
- ✅ `@google/generative-ai@0.24.1` (FREE - API Key based)
- ⚠️ `@google-cloud/vertexai@1.10.0` (PAID - Cloud billing)

### API Keys in Use
All three variables use the SAME key: `AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI`

```env
GOOGLE_API_KEY=AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI
GEMINI_API_KEY=AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI
```

### Files Using PAID Vertex AI (Causing Charges)
1. **`scripts/enrich-viral-data-vertex.ts`**
   - Project: `3kpro-gemini`
   - Model: `gemini-1.5-pro-preview-0409` (EXPENSIVE)
   - Purpose: Enrich viral content data
   - **Status:** 🔴 ACTIVELY BILLING

2. **`scripts/test-vertex-connection.ts`**
   - Testing script for Vertex AI
   - **Status:** 🔴 CHARGES IF RUN

### Files Using FREE Gemini API (Good!)
- ✅ `lib/gemini.ts` - Main library (FREE)
- ✅ `app/actions/gemini-actions.ts` - Campaign generation
- ✅ `app/api/trends/route.ts` - Trend discovery
- ✅ `app/api/generate/route.ts` - Content generation
- ✅ `app/api/helix/chat/route.ts` - Helix AI chat
- ✅ `lib/viral-score.ts` - Viral score calculation

### Gemini Models in Use
- ✅ `gemini-2.0-flash` - FREE tier (primary model)
- ⚠️ `gemini-1.5-pro-preview-0409` - PAID (in Vertex script only)
- ✅ `gemini-1.5-flash` - FREE tier (legacy scripts)

---

## 🎯 Cleanup Actions

### 1. Replace Vertex AI Script
**File:** `scripts/enrich-viral-data-vertex.ts`

**Current:** Uses Vertex AI SDK + Pro model (PAID)
**New:** Use free Gemini API SDK + Flash model (FREE)

**Implementation:**
- Copy to: `scripts/enrich-viral-data-free.ts`
- Replace `@google-cloud/vertexai` with `@google/generative-ai`
- Change model from `gemini-1.5-pro-preview-0409` → `gemini-2.0-flash`
- Remove PROJECT_ID and LOCATION config
- Use API key authentication only

### 2. Remove Vertex AI Package
```bash
npm uninstall @google-cloud/vertexai
```

### 3. Archive Old Scripts
Move to `scripts/archive/` (don't delete, just prevent accidental runs):
- `scripts/enrich-viral-data-vertex.ts`
- `scripts/test-vertex-connection.ts`

### 4. Google Cloud Console Cleanup

#### Step A: Audit Google Cloud Projects
1. Go to: https://console.cloud.google.com/
2. List all projects (likely: `3kpro-gemini`, maybe others)
3. For each project:
   - Check enabled APIs
   - Check billing account
   - Check OAuth apps

#### Step B: Consolidate to ONE Project
**Recommended Setup:**
- **Project Name:** `xelora-production`
- **Billing:** Free tier only (no credit card if possible)
- **Enabled APIs:**
  - Generative Language API (Gemini)
  - YouTube Data API v3 (for OAuth)
  - Google Drive API (if needed for Drive picker)
  - People API (for profile data)
- **DISABLE ALL OTHER APIs** (especially Vertex AI)

#### Step C: OAuth Apps Cleanup
Current OAuth apps in `.env.local`:
- Twitter (x2: v1.1 + OAuth 2.0)
- Facebook
- Instagram
- TikTok
- LinkedIn

**Action:**
1. Audit which ones are actually being used
2. Delete unused OAuth apps from Google Cloud Console
3. Keep only ONE OAuth 2.0 client ID per platform

### 5. API Key Consolidation
**Current:** 3 variables with same key (confusing)
**Target:** 1 variable

```env
# Single source of truth
GOOGLE_API_KEY=AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI

# Remove these duplicates:
# GEMINI_API_KEY=...
# GOOGLE_GENERATIVE_AI_API_KEY=...
```

**Code Updates:**
- Update `lib/gemini.ts` line 7 to only check `GOOGLE_API_KEY`
- Search codebase for `GEMINI_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY`
- Replace all references with `GOOGLE_API_KEY`

---

## 💰 Cost Monitoring Setup

### Free Tier Limits (Gemini API)
- **gemini-2.0-flash:** 15 RPM, 1M TPM, 1500 RPD (FREE)
- **gemini-1.5-flash:** 15 RPM, 1M TPM, 1500 RPD (FREE)

### Set Up Quota Alerts
1. Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. Set alert thresholds:
   - 80% of daily quota
   - 100% of daily quota
3. Alert email: (your email)

### Monitor Usage
- Dashboard: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/metrics
- Check weekly to ensure staying within free tier

---

## ✅ Testing Checklist

After cleanup, test these Xelora features:

- [ ] Viral Trend Discovery (Campaign Create → Step 3)
- [ ] Viral Score Calculation (Campaign Create → Results)
- [ ] AI Content Generation (Campaign Create → Generate)
- [ ] Helix AI Chat (Portal → Helix widget)
- [ ] Supercharge Variations (Campaign Command Center)
- [ ] Benchmark Score (Viral data enrichment)

All should work without any billing charges.

---

## 📋 Google Cloud Console Actions

### Delete These (if they exist):
1. Any Vertex AI API enablement
2. Unused OAuth 2.0 client IDs
3. Service account keys (if any exist)
4. Old/test projects

### Keep These:
1. ONE project with Generative Language API
2. ONE OAuth 2.0 client ID (for social logins)
3. API key: `AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI`

---

## 🔐 Security Note

**IMPORTANT:** The API key `AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI` is now exposed in this document and the conversation. After cleanup:

1. Rotate the API key in Google Cloud Console
2. Update `.env.local` with new key
3. Never commit `.env.local` to git

---

## 🎯 Expected Outcome

- ✅ $0/month billing (100% free tier)
- ✅ ONE Google Cloud project
- ✅ ONE API key
- ✅ NO Vertex AI usage
- ✅ Xelora engine working perfectly
- ✅ Cost monitoring alerts active
