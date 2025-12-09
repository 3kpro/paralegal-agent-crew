# XELORA Rebrand Execution Roadmap

**Status:** Domain purchased (`xelora.app`) - Dec 9, 2025

**Mission:** Complete rebrand from TrendPulse → XELORA before Product Hunt launch

---

## Phase 1: Brand Foundation (30 min)

### Brand Story
- **Name:** XELORA
- **Tagline:** (TBD - suggest: "Viral Insights. Powered by Trends.")
- **Mission:** Help creators decode what makes content go viral
- **Positioning:** "The AI that sees trends before they peak"

### Visual Identity
- **Logo:** Current TrendPulse logo → update with XELORA wordmark
  - Keep gradient arrow concept
  - Update text to XELORA
  - Consider X as design element
- **Color Palette:** Retain current (coral/teal/dark)
- **Typography:** Modern, clean (Montserrat or Inter)

### Domain Setup
- **Primary:** xelora.app (just purchased)
- **Alt:** xelora.ai (should purchase for backup)
- **Vercel:** Add xelora.app to project domains
- **Redirect:** trendpulse.3kpro.services → xelora.app (301)

---

## Phase 2: Landing Page Rebrand (1.5-2 hours)

### Files to Update

**Header/Navigation:**
- [ ] Logo image: TrendPulse → XELORA
- [ ] Logo text/wordmark
- [ ] Meta description (page title, og:title)
- [ ] Favicon (if branded)

**Hero Section:**
- [ ] Main headline: "TrendPulse" → "XELORA"
- [ ] Subheading/tagline: Update to XELORA positioning
- [ ] CTA buttons: "Get TrendPulse" → "Get XELORA"

**Feature Sections:**
- [ ] Find/replace all "TrendPulse" → "XELORA"
- [ ] Update feature descriptions if needed
- [ ] Screenshots/images: Logo overlays

**Footer:**
- [ ] Company branding
- [ ] Links/CTAs
- [ ] Copyright/legal

**Metadata Files:**
- [ ] `next.config.js` - sitemap, canonical URLs
- [ ] `app/layout.tsx` - og:title, og:description
- [ ] `robots.txt` - sitemap reference
- [ ] `sitemap.xml` - domain references

### Search & Replace Targets
```
Find: "TrendPulse"
Replace: "XELORA"

Find: "trendpulse.3kpro.services"
Replace: "xelora.app"

Find: "Get started with TrendPulse"
Replace: "Get started with XELORA"
```

---

## Phase 3: Demo Video Re-edit (30 min - 1 hour)

### Check What Needs Updating

**If NO explicit mentions of "TrendPulse" in video:**
- [ ] Add XELORA intro/outro card (CapCut)
- [ ] Update logo animation outro to XELORA
- [ ] Update end card to "XELORA - Viral Insights for Creators"
- **Effort:** 30 min

**If voiceover mentions "TrendPulse":**
- [ ] Re-record voiceover with XELORA mentions (~15 min record)
- [ ] Update all text overlays mentioning TrendPulse
- [ ] Update intro/outro
- **Effort:** 1 hour

**If text overlays say "TrendPulse":**
- [ ] Edit Scene 1 text if applicable
- [ ] Edit end card
- [ ] Edit any step numbers if they reference the product
- **Effort:** 30-45 min

### CapCut Tasks
- [ ] Open FinalDemoVid_12_08_25_with_Audio.mp4
- [ ] Update logo in outro (if separate asset)
- [ ] Update any product name mentions in text
- [ ] Update final CTA card: "XELORA.APP - Viral Insights. Launching Now"
- [ ] Export as: `FinalDemoVid_XELORA_12_09_25.mp4`

---

## Phase 4: Code Updates (45 min - 1 hour)

### Files Requiring Updates

**Core Configuration:**
- [ ] `app/(portal)/layout.tsx` - brand name references
- [ ] `components/ui/floating-nav.tsx` - menu items, brand text
- [ ] `components/ui/header.tsx` - logo, brand name
- [ ] `app/page.tsx` - homepage content

**Feature Pages:**
- [ ] `/ai-studio` page description
- [ ] `/analyst` page description
- [ ] `/pricing` page (if mentions product name)

**API/Backend:**
- [ ] `app/api/*/route.ts` - any API response messages
- [ ] Email templates - if they mention TrendPulse
- [ ] Error messages - if they reference product name

**Search & Replace Commands:**
```bash
# Find all files with "TrendPulse"
grep -r "TrendPulse" . --include="*.tsx" --include="*.ts" --include="*.json"

# Replace in TypeScript/TSX files
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/TrendPulse/XELORA/g'
```

---

## Phase 5: Testing & QA (30 min)

### Checklist
- [ ] Homepage loads correctly with XELORA branding
- [ ] All links work
- [ ] Logo displays on all pages
- [ ] Forms submit correctly
- [ ] Mobile responsive (check on phone)
- [ ] Demo video plays correctly
- [ ] No broken images/assets
- [ ] No console errors

### Visual Check
- [ ] Logo looks good at all sizes
- [ ] Colors consistent
- [ ] Typography readable
- [ ] CTA buttons accessible

---

## Phase 6: Deployment (10 min)

### Steps
1. [ ] Commit all changes: `git add .`
2. [ ] Commit message: `feat: rebrand TrendPulse to XELORA`
3. [ ] Push to origin/main: `git push origin main`
4. [ ] Deploy to Vercel: `vercel deploy --prod`
5. [ ] Verify live: Visit `xelora.app`

### Post-Deploy
- [ ] Check Vercel deployment logs
- [ ] Verify domain resolves correctly
- [ ] Test all pages load
- [ ] Check analytics/tracking still working

---

## Phase 7: Domain & DNS (15 min)

### Vercel Setup
- [ ] Add `xelora.app` to project domains
- [ ] Set as primary domain
- [ ] Verify SSL certificate (auto-generated)

### Namecheap Setup
- [ ] Go to domain management
- [ ] Add DNS records for Vercel (A record + CNAME)
- [ ] Wait 5-10 min for propagation
- [ ] Refresh Vercel to verify

### Redirects
- [ ] Ensure `trendpulse.3kpro.services` 301 redirects to `xelora.app`
- [ ] Test old domain still works (redirects properly)

---

## Phase 8: Google & Search (Ongoing)

### Google Search Console
- [ ] Add new property: `xelora.app`
- [ ] Add DNS verification TXT record
- [ ] Submit sitemap
- [ ] Request indexing of homepage
- [ ] Monitor old domain (should redirect)

### Monitoring
- [ ] Check GSC daily for first week
- [ ] Monitor crawl errors
- [ ] Check indexing status

---

## Phase 9: Product Hunt Prep (30 min)

### Product Hunt Listing
- [ ] Update product name: XELORA
- [ ] Update tagline/description
- [ ] Update logo/cover image
- [ ] Link to `xelora.app`
- [ ] Update video URL (if uploaded elsewhere)
- [ ] Update all copy to reference XELORA

### Marketing Materials
- [ ] Update demo video description
- [ ] Update social media share text
- [ ] Update launch email (if applicable)
- [ ] Update any launch posts/scripts

---

## Timeline Summary

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Brand foundation | 30 min | ⏳ Pending |
| 2 | Landing page rebrand | 2 hrs | ⏳ Pending |
| 3 | Demo video re-edit | 45 min | ⏳ Pending |
| 4 | Code updates | 1 hr | ⏳ Pending |
| 5 | Testing & QA | 30 min | ⏳ Pending |
| 6 | Deployment | 10 min | ⏳ Pending |
| 7 | Domain & DNS | 15 min | ⏳ Pending |
| 8 | Google setup | 10 min | ⏳ Pending |
| 9 | Product Hunt | 30 min | ⏳ Pending |
| **TOTAL** | | **5-6 hours** | |

---

## Priority Order (If Time Crunched)

**Critical Path (2-3 hours):**
1. Landing page rebrand (obvious name change)
2. Code updates (backend consistency)
3. Demo video re-edit (if mentions TrendPulse)
4. Deployment + domain setup
5. Product Hunt listing

**Can Wait (Nice-to-have):**
- Google Search Console setup (will catch up naturally)
- Old domain monitoring (301 handles it)

---

## Notes

- **Product Hunt launch:** Can proceed immediately after Phase 6 (deployment)
- **Demo video:** Check if it explicitly mentions "TrendPulse" before full re-edit
- **Domain DNS:** Usually propagates within 30 min, but can take up to 24 hours
- **Vercel SSL:** Auto-generated, no action needed

---

**Ready to execute? Which phase should we start with?**
