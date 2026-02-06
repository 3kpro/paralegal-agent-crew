# 🚀 Google Business Profile Fix - Quick Action Summary

**Date:** 2026-02-05
**Status:** ⚡ Ready for Immediate Action

---

## ✅ What's Been Done

### 1. Codebase Updates (COMPLETED)
- ✅ Updated contact email: `info@3kpro.services` → `james@3kpro.services`
- ✅ Added phone number to structured data: `+1-918-816-8832`
- ✅ Files updated:
  - [components/StructuredData.tsx](../components/StructuredData.tsx#L93)
  - [components/Footer.tsx](../components/Footer.tsx#L72)
  - [app/about/page.tsx](../app/about/page.tsx#L106)

### 2. Documentation Created (COMPLETED)
- ✅ [GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md](GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md) - Comprehensive step-by-step guide
- ✅ [XELORA_APP_DOMAIN_MIGRATION.md](XELORA_APP_DOMAIN_MIGRATION.md) - Fix for old domain redirects
- ✅ [verify-business-profiles.ps1](../scripts/verify-business-profiles.ps1) - Verification script

### 3. Environment Setup (COMPLETED)
- ✅ Google Cloud CLI authenticated
- ✅ Proper OAuth scopes configured
- ✅ API access tested (quota limited - use web interface)

---

## 🎯 What YOU Need to Do Next

### STEP 1: Deploy Code Changes (5 minutes)

**Option A: Use Deploy Hook (RECOMMENDED)**
```powershell
cd C:\DEV\3K-Pro-Services\landing-page
git add -A
git commit -m "Update 3KPRO contact info: james@3kpro.services + phone 918.816.8832

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
curl --ssl-no-revoke -X POST "https://api.vercel.com/v1/integrations/deploy/prj_AQl8FdSzVdBBB3ORZti2pxDZsDSP/IXNodqb5fN"
```

**Option B: Use Deploy Skill**
```
/deploy
```

---

### STEP 2: Fix Google Business Profiles (15-30 minutes)

#### A. Access Google Business Profile Manager
1. Open browser and go to: **https://business.google.com**
2. Sign in with: **james.lawson@gmail.com**
3. You should see listings for both XELORA and 3K Pro Services

#### B. Update XELORA Profile
- [ ] **Website:** Change from `xelora.app` → `https://getxelora.com`
- [ ] **Email:** Set to `support@getxelora.com`
- [ ] **Phone:** Set to `918.816.8832` (or remove if XELORA-specific)
- [ ] **Address:** Remove or set to "Online only"
- [ ] **Business Type:** Set to "Service Area Business" or "Online only"

#### C. Update 3KPRO.SERVICES Profile ⭐ CRITICAL
- [ ] **Phone:** Set to `918.816.8832` ⚡ REQUIRED
- [ ] **Email:** Set to `james@3kpro.services` ⚡ REQUIRED
- [ ] **Website:** Verify shows `https://3kpro.services`
- [ ] **Address:** REMOVE physical address or convert to "Service Area Business"
  - If "Service Area Business": Set service area to "Tulsa, Oklahoma" or "United States"
  - This prevents home address from showing publicly
- [ ] **Categories:**
  - Primary: Software Company or IT Service
  - Secondary: Web Development, Business Consultant

---

### STEP 3: Fix Old xelora.app Domain (10 minutes)

**Current Problem:** xelora.app returns 404 (not redirecting to getxelora.com)

**Solution:** Add xelora.app to Vercel project

1. Go to: https://vercel.com/dashboard
2. Select project: `content-cascade-ai-landing`
3. Go to: **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `xelora.app`
6. Follow Vercel's instructions to update DNS at your domain registrar

**DNS Records to Add (at domain registrar):**
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Note:** The redirect rules are already in [vercel.json](../vercel.json#L45-54), so once the domain is connected, redirects will work automatically.

---

### STEP 4: Verify Changes (Wait 24-48 hours, then test)

**Run Verification Script:**
```powershell
cd C:\DEV\3K-Pro-Services\landing-page
.\scripts\verify-business-profiles.ps1
```

**Manual Checks:**
1. Google Search: "3kpro.services" → Verify phone and email are correct
2. Google Search: "XELORA" → Verify website shows getxelora.com
3. Visit: https://xelora.app → Should redirect to https://getxelora.com
4. Check: No home address visible on 3kpro.services listing

---

## 🚨 Critical Issues Found

### Issue 1: xelora.app Domain Not Redirecting
- **Status:** 🔴 404 Error
- **Impact:** Old links are broken, bad user experience
- **Fix:** See STEP 3 above
- **Timeline:** 5-60 minutes after DNS update

### Issue 2: Home Address May Be Visible
- **Status:** ⚠️ Unverified (need to check business.google.com)
- **Impact:** Privacy concern, user doesn't want home address public
- **Fix:** Convert to "Service Area Business" in Google Business Profile
- **Timeline:** Immediate after update

### Issue 3: Contact Info Mismatch
- **Status:** ⚠️ Likely incorrect in Google listings
- **Impact:** Users can't reach you properly (your complaint)
- **Fix:** Update in Google Business Profile Manager (STEP 2)
- **Timeline:** 24-72 hours for search results to update

---

## 📋 Final Checklist

### Immediate (Today)
- [ ] Commit and deploy code changes
- [ ] Access business.google.com
- [ ] Update 3KPRO phone to 918.816.8832
- [ ] Update 3KPRO email to james@3kpro.services
- [ ] Remove/hide 3KPRO physical address
- [ ] Update XELORA website to getxelora.com
- [ ] Add xelora.app domain to Vercel

### Within 24 Hours
- [ ] Update DNS records for xelora.app
- [ ] Test xelora.app redirect works
- [ ] Monitor Vercel deployment logs

### Within 1 Week
- [ ] Run verification script
- [ ] Google search both businesses
- [ ] Verify Knowledge Panels show correct info
- [ ] Respond to any new reviews/questions

### Within 1 Month
- [ ] Monitor customer feedback
- [ ] Check analytics for old domain traffic
- [ ] Request customer confirmation issues are resolved

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Google Business Profile Manager | https://business.google.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Google Search Console | https://search.google.com/search-console |
| Detailed Plan | [GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md](GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md) |
| Domain Migration Guide | [XELORA_APP_DOMAIN_MIGRATION.md](XELORA_APP_DOMAIN_MIGRATION.md) |

---

## 💬 Key Information Summary

### XELORA
- **Website:** https://getxelora.com ✅
- **Email:** support@getxelora.com ✅
- **Phone:** 918.816.8832 (or none)
- **Type:** Online/Service Area Business
- **Old Domain:** xelora.app (needs redirect fix)

### 3KPRO.SERVICES
- **Website:** https://3kpro.services ✅
- **Email:** james@3kpro.services ⚡ NEW
- **Phone:** 918.816.8832 ⚡ NEW
- **Location:** Tulsa, Oklahoma (NO street address)
- **Type:** Service Area Business (remote work)

---

## ❓ Need Help?

If you get stuck:
1. **Deployment Issues:** Check [Next_Sesh_Context.md](../Dev/docs/SYSTEM/Next_Sesh_Context.md) for deploy hook
2. **DNS Questions:** See [XELORA_APP_DOMAIN_MIGRATION.md](XELORA_APP_DOMAIN_MIGRATION.md)
3. **Google Business Questions:** See [GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md](GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md)

---

**ESTIMATED TOTAL TIME:** 30-45 minutes of active work
**RESULTS VISIBLE:** 24-72 hours for Google Search, immediately in Business Profile Manager

**🎯 PRIORITY ORDER:**
1. Deploy code changes (5 min)
2. Update 3KPRO contact in business.google.com (10 min)
3. Fix xelora.app redirect (15 min)
4. Update XELORA profile (10 min)

**GO! 🚀**
