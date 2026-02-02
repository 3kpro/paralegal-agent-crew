# Google Search Console Migration Checklist
**Domain Migration: xelora.app → getxelora.com**
**Date: 2026-02-02**

---

## ✅ Completed Code Updates

All critical SEO files have been updated in the codebase:

### Layout Files (Metadata/Canonical URLs)
- ✅ [app/pricing/layout.tsx](app/pricing/layout.tsx) - Updated to `getxelora.com`
- ✅ [app/trend-gen/layout.tsx](app/trend-gen/layout.tsx) - Updated to `getxelora.com`
- ✅ [app/demo/layout.tsx](app/demo/layout.tsx) - Updated to `getxelora.com`
- ✅ [app/reset-password/layout.tsx](app/reset-password/layout.tsx) - Updated to `getxelora.com`
- ✅ [app/forgot-password/layout.tsx](app/forgot-password/layout.tsx) - Updated to `getxelora.com`

### Configuration Files
- ✅ [.env.example](.env.example) - Updated template URLs
- ✅ [vercel.json](vercel.json) - Already has redirects configured
- ✅ [app/sitemap.ts](app/sitemap.ts) - Already using `getxelora.com`
- ✅ [app/robots.ts](app/robots.ts) - Already using `getxelora.com`

### Contact/Support
- ✅ [components/sections/FAQSection.tsx](components/sections/FAQSection.tsx) - Updated to `support@getxelora.com`
- ✅ [app/data-deletion-status/[code]/page.tsx](app/data-deletion-status/[code]/page.tsx) - Updated to `support@getxelora.com`

---

## 🚀 Deployment Steps

### 1. Deploy Updated Code to Production
```bash
# Commit all changes
git add .
git commit -m "SEO: Update all domain references from xelora.app to getxelora.com"

# Push to production
git push origin main
```

**⏰ Wait for Vercel deployment to complete** (Usually 2-3 minutes)

---

## 📊 Google Search Console Updates

### Step 1: Add New Property (getxelora.com)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"** in the top-left dropdown
3. Select **"URL prefix"** property type
4. Enter: `https://getxelora.com`
5. Verify ownership using one of these methods:
   - ✅ **HTML file upload** (easiest)
   - DNS record (TXT)
   - HTML meta tag
   - Google Analytics
   - Google Tag Manager

### Step 2: Submit New Sitemap

1. In the new `getxelora.com` property, go to **Sitemaps** (left sidebar)
2. In the "Add a new sitemap" field, enter:
   ```
   https://getxelora.com/sitemap.xml
   ```
3. Click **SUBMIT**
4. ✅ Verify status shows "Success" (may take a few minutes)

### Step 3: Submit Change of Address (301 Redirects)

1. In **OLD property** (`xelora.app`), go to **Settings** (gear icon, bottom-left)
2. Click **"Change of address"**
3. Follow the wizard:
   - Select new site: `https://getxelora.com`
   - Confirm 301 redirects are in place (already configured in `vercel.json`)
   - Confirm new site is verified
   - Submit request

**⚠️ Important:** This tells Google to transfer all SEO signals from old domain to new domain.

### Step 4: Update URL Parameters (if any)

If you had custom URL parameter settings in old property:
1. Go to old property → **Settings** → **URL Parameters**
2. Note any custom parameters
3. Re-add them in new property (`getxelora.com`)

### Step 5: Request Re-indexing of Key Pages

After 24-48 hours, request re-indexing for critical pages:

1. In new property (`getxelora.com`), go to **URL Inspection** (top search bar)
2. Enter these URLs one by one and click "Request Indexing":
   ```
   https://getxelora.com/
   https://getxelora.com/demo
   https://getxelora.com/trend-gen
   https://getxelora.com/pricing
   ```

---

## 🔍 Verification & Monitoring

### Immediate Checks (Day 1)

- [ ] Visit `https://getxelora.com` - site loads correctly
- [ ] Visit `https://xelora.app` - redirects to `getxelora.com` (301)
- [ ] Check `https://getxelora.com/sitemap.xml` - loads properly
- [ ] Check `https://getxelora.com/robots.txt` - shows correct sitemap URL
- [ ] View page source on homepage - verify meta tags show `getxelora.com`

### Week 1 Monitoring

- [ ] Google Search Console shows new sitemap discovered pages
- [ ] Old domain (`xelora.app`) click-through rate drops (expected)
- [ ] New domain (`getxelora.com`) impressions start appearing
- [ ] No 404 errors in new property

### Week 2-4 Monitoring

- [ ] Search rankings maintained or improved
- [ ] Organic traffic returns to baseline
- [ ] Most pages re-indexed under new domain
- [ ] Old domain redirects still working

---

## 📧 Email Migration

### Update Email Forwarding

If you have email forwarding set up:
- [ ] Set up `support@getxelora.com` email address
- [ ] Forward `support@xelora.app` → `support@getxelora.com`
- [ ] Update email signature with new domain
- [ ] Update support documentation

---

## 🎯 Expected Timeline

| Event | Timeline |
|-------|----------|
| Code deployment | Immediate |
| Google discovers new sitemap | 1-3 days |
| Change of address processed | 3-7 days |
| Key pages re-indexed | 1-2 weeks |
| Full migration complete | 4-8 weeks |
| SEO signals fully transferred | 6-12 weeks |

---

## ⚠️ Troubleshooting

### "Couldn't fetch" Error on Sitemap
- **Cause:** Sitemap URL not accessible or returns 404/500
- **Fix:**
  1. Test `https://getxelora.com/sitemap.xml` in browser
  2. If 404, redeploy Next.js app (sitemap should be auto-generated)
  3. If 500, check server logs in Vercel

### Old Domain Still Ranking
- **Expected:** Google takes 4-8 weeks to transfer signals
- **Action:** Be patient, ensure 301 redirects are working
- **Monitor:** Use "Change of address" status in GSC

### Traffic Drop
- **Expected:** 10-20% temporary drop during migration is normal
- **Timeline:** Should recover within 2-4 weeks
- **Action:** Request re-indexing of top-performing pages

---

## 📝 Notes

### Redirects Already Configured
Your `vercel.json` already has permanent (301) redirects:
- `xelora.app/*` → `https://getxelora.com/*`
- `www.xelora.app/*` → `https://getxelora.com/*`
- `xelorahq.com/*` → `https://getxelora.com/*`
- `www.xelorahq.com/*` → `https://getxelora.com/*`

### Domain Ownership
Make sure you maintain ownership of `xelora.app` domain for at least 6-12 months to ensure:
- 301 redirects continue working
- Email forwarding remains active
- No competitor takes the domain

---

## 🔗 Helpful Resources

- [Google: Change Your Site Address](https://developers.google.com/search/docs/advanced/crawling/site-move-with-url-changes)
- [Google: Site Migrations](https://developers.google.com/search/docs/advanced/crawling/site-migrations)
- [Vercel: Domain Migration](https://vercel.com/docs/projects/domains)

---

**Created:** 2026-02-02
**Last Updated:** 2026-02-02
**Status:** Ready for deployment ✅
