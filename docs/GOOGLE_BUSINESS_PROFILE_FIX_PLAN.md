# Google Business Profile Fix Plan

**Date:** 2026-02-05
**Objective:** Systematically fix Google Business Profiles for xelora and 3kpro.services
**Status:** 🔴 In Progress

---

## 🎯 Issues to Fix

### XELORA Profile
- ❌ **OLD DOMAIN:** Still showing xelora.app (needs update to getxelora.com)
- ❌ **CONTACT INFO:** May have placeholder phone/address
- ⚠️ **BRAND CONFUSION:** Old domain creates bad association (user feedback)

### 3KPRO.SERVICES Profile
- ❌ **PHYSICAL ADDRESS:** Listed (user works from home - needs removal)
- ❌ **PHONE NUMBER:** Needs to be set to **918.816.8832**
- ❌ **EMAIL:** Needs to be **james@3kpro.services**
- ⚠️ **BAD FEEDBACK:** People can't reach properly, listing needs cleanup

---

## 📋 Current Business Information

### XELORA (Product Brand)
```yaml
Business Name: XELORA
Website: https://getxelora.com (UPDATED - was xelora.app)
Email:
  - hello@getxelora.com
  - support@getxelora.com
Phone: [TO BE DETERMINED - currently placeholder]
Address: [TO BE DETERMINED - online only]
Category: Software Company / SaaS Product
Description: AI-powered content prediction and creation platform

Social Media:
  - Twitter: @XELORA_APP
  - LinkedIn: linkedin.com/company/xelora
  - Facebook: facebook.com/xelora
  - Instagram: @xelora_app
```

### 3KPRO.SERVICES (Parent Company)
```yaml
Business Name: 3K Pro Services (or 3KPRO.SERVICES)
Website: https://3kpro.services
Email: james@3kpro.services (REQUIRED UPDATE)
Phone: 918.816.8832 (REQUIRED UPDATE)
Address: REMOVE or set to "Service Area Business" (Tulsa, Oklahoma)
Category: IT Service Provider / Software Development Company
Description: Professional SaaS development and digital infrastructure solutions

Social Media:
  - Twitter: @3KPRO_SAAS
  - LinkedIn: linkedin.com/company/3k-pro-services

Business Type: Service Area Business (no physical storefront)
Service Areas: Remote / Nationwide (or specify Tulsa metro if needed)
```

---

## 🔧 Action Plan

### Phase 1: Access & Audit (Manual)

#### Step 1.1: Access Google Business Profile Manager
1. Go to **https://business.google.com**
2. Sign in with **james.lawson@gmail.com** (already authenticated)
3. View all business profiles

#### Step 1.2: Identify Existing Listings
Document for each profile:
- [ ] Current business name as listed
- [ ] Current website URL
- [ ] Current phone number
- [ ] Current address (if any)
- [ ] Current email
- [ ] Current categories
- [ ] Verification status
- [ ] Number of reviews/ratings

**Screenshot these for reference**

---

### Phase 2: Fix XELORA Profile

#### Step 2.1: Update Domain (xelora.app → getxelora.com)
1. **In Business Profile Manager:**
   - Edit business profile for XELORA
   - Update "Website" field to: `https://getxelora.com`
   - Update any social media links if needed

2. **Verify Domain Ownership:**
   - Google may require verification of new domain
   - Use existing verification: `google861a1d34210911d1.html` (already deployed)
   - Or use meta tag: `Yl16_c5k1ifJGYWUuy5Tmh2uShFD1COlwAsalez_e4c`

#### Step 2.2: Update Contact Information
1. **Phone Number:**
   - Decide: Remove, use placeholder, or use 3KPRO number?
   - Recommendation: Either remove or use 918.816.8832 (same as parent company)

2. **Email Address:**
   - Set to: `support@getxelora.com`

3. **Address:**
   - Remove physical address
   - Set business type to "Online only" or "Service area business"

#### Step 2.3: Optimize Listing
1. **Business Description:**
   ```
   XELORA is an AI-powered SaaS platform that predicts content performance before you publish.
   Get real-time recommendations, optimize your content strategy, and make data-driven decisions
   with advanced machine learning insights. Try XELORA at getxelora.com
   ```

2. **Categories:**
   - Primary: Software Company
   - Secondary: Internet Marketing Service, Business Consultant

3. **Add Business Hours:**
   - Online: Available 24/7
   - Support: Monday-Friday 9AM-5PM CST

---

### Phase 3: Fix 3KPRO.SERVICES Profile

#### Step 3.1: Update Contact Information (CRITICAL)
1. **Phone Number:** `918.816.8832`
2. **Email:** `james@3kpro.services`
3. **Website:** `https://3kpro.services`

#### Step 3.2: Remove/Hide Physical Address
Two options:

**Option A: Convert to Service Area Business (RECOMMENDED)**
1. Edit business profile
2. Change business type from "Physical location" to "Service area business"
3. This removes the address from public view
4. Set service areas: "Tulsa, Oklahoma" or "United States"

**Option B: Remove Physical Location**
1. If profile shows home address, remove it
2. Set to "Online only" business
3. Location shows as "Tulsa, Oklahoma" (city only)

#### Step 3.3: Optimize Listing
1. **Business Description:**
   ```
   3K Pro Services delivers precision-engineered SaaS solutions and digital infrastructure
   for modern businesses. We specialize in full-stack development, cloud architecture,
   and AI-powered business tools. Based in Tulsa, Oklahoma, serving clients nationwide.
   Stop Guessing. Start Engineering. → 3kpro.services
   ```

2. **Categories:**
   - Primary: Software Company
   - Secondary: IT Service, Web Development, Business Consultant

3. **Business Hours:**
   - Monday-Friday: 9:00 AM – 6:00 PM CST
   - Saturday-Sunday: Closed (or by appointment)

4. **Attributes:**
   - Online appointments
   - Remote services
   - LGBTQ+ friendly (if applicable)
   - Identifies as Black-owned (if applicable)

---

### Phase 4: Handle Old xelora.app References

#### Step 4.1: Search for Old Listings
1. **Google Search:**
   - Search "xelora.app business profile"
   - Search "xelora site:google.com business"
   - Identify any duplicate or outdated listings

2. **If duplicate listing found:**
   - Claim ownership if needed
   - Mark as "Permanently closed" or "Duplicate"
   - Request Google to merge with new getxelora.com listing

#### Step 4.2: Update Google Search Console
1. **Add new property:**
   - Go to search.google.com/search-console
   - Add property: `https://getxelora.com` (already done based on context)
   - Verify with existing verification code

2. **301 Redirects:**
   - Ensure xelora.app redirects to getxelora.com (check vercel.json)
   - Add to Google Search Console: Settings → Address Change
   - Tell Google the site moved from xelora.app to getxelora.com

---

### Phase 5: Post-Update Verification

#### Step 5.1: Verify Public Listings (Wait 24-72 hours)
Run these searches and verify correct information appears:

**For XELORA:**
```
Google: "XELORA"
Google: "getxelora"
Google: "xelora content prediction"
```

**For 3KPRO.SERVICES:**
```
Google: "3kpro.services"
Google: "3K Pro Services Tulsa"
Google: "3kpro engineering"
```

#### Step 5.2: Check Knowledge Panel
- Verify website URL is getxelora.com (not xelora.app)
- Verify phone number: 918.816.8832
- Verify email: james@3kpro.services
- Verify no home address is showing

#### Step 5.3: Monitor Reviews & Questions
- Set up Google My Business app on phone
- Enable notifications for new reviews
- Respond to any negative feedback about contact issues

---

## 🚨 Common Issues & Solutions

### Issue 1: "Can't edit business address"
**Solution:** You may need to verify ownership first or contact Google Support

### Issue 2: "Old domain still appears in search"
**Solution:** Google cache takes 4-6 weeks to fully update. Use:
- Google URL Removal Tool (Search Console)
- Submit updated sitemap
- Request re-crawl of pages

### Issue 3: "Multiple listings for same business"
**Solution:**
1. Claim both listings
2. Mark one as "Duplicate"
3. Use this form: https://support.google.com/business/contact/gmb_merge_request

### Issue 4: "Can't verify new domain"
**Solution:**
- HTML file method: Already have `google861a1d34210911d1.html` in place
- Meta tag method: Already in layout.tsx
- DNS TXT record: May need to add via domain registrar

---

## 📊 Success Metrics

After 1 week:
- [ ] xelora searches show getxelora.com (not xelora.app)
- [ ] 3kpro.services shows correct phone: 918.816.8832
- [ ] 3kpro.services shows correct email: james@3kpro.services
- [ ] No home address visible on 3kpro.services listing
- [ ] Both profiles show "Verified" badge
- [ ] Knowledge panels updated with correct info

After 1 month:
- [ ] Zero customer complaints about "can't find contact info"
- [ ] Increase in profile views
- [ ] New reviews mention correct contact methods

---

## 🔗 Useful Links

- **Google Business Profile Manager:** https://business.google.com
- **Google Search Console:** https://search.google.com/search-console
- **GBP Support:** https://support.google.com/business
- **Report Duplicate Listing:** https://support.google.com/business/contact/gmb_merge_request
- **Request Review Removal:** https://support.google.com/business/contact/gmb_inappropriate_content

---

## 📝 Next Steps for Implementation

### Manual Steps (Requires User Action):
1. **NOW:** Access business.google.com and audit both profiles
2. **NOW:** Update 3kpro.services contact info (phone + email)
3. **NOW:** Remove/hide physical address from 3kpro.services
4. **NOW:** Update xelora website to getxelora.com
5. **Within 24h:** Search for duplicate xelora.app listings and mark as duplicates
6. **Within 1 week:** Monitor Google searches to verify changes appear
7. **Within 1 month:** Request customer feedback to confirm issues resolved

### API/Automation Steps (If API access granted):
```bash
# Once API quota is enabled, we can use:
# - List all locations programmatically
# - Bulk update contact information
# - Monitor review responses automatically
# - Track listing performance metrics
```

---

## 💡 Pro Tips

1. **Use Google My Business App:** Download on phone for quick responses to reviews
2. **Post Regular Updates:** Add posts/updates to keep profile active (improves ranking)
3. **Add Photos:** Business logo, product screenshots, team photos
4. **Enable Messaging:** Let customers contact via Google Search directly
5. **Use Q&A Section:** Pre-populate FAQs to reduce confusion
6. **Monitor Insights:** Check weekly stats on profile views, searches, actions

---

**STATUS:** Ready for execution - awaiting user action at business.google.com

**ESTIMATED TIME:** 30-45 minutes for initial updates, 2-4 weeks for full propagation
