# Google Search Console Indexing Issues - Fix Guide

## Issues Found

### 1. Duplicate without user-selected canonical (1 page)
**Problem**: Page exists with multiple URLs or missing canonical tag
**Impact**: Google doesn't know which version to index

### 2. Discovered - currently not indexed (7 pages)
**Problem**: Pages discovered by Google but not in sitemap, causing indexing delays
**Impact**: Pages won't rank until Google decides to index them

---

## Root Causes

1. **Incomplete sitemap**: Only 6 URLs in sitemap, but ~14 public pages exist
2. **Missing pages**: `/pricing`, `/forgot-password`, `/reset-password`, `/oauth-success` not in sitemap
3. **No explicit canonicals**: Not all pages have canonical tags via metadata
4. **Robots.txt conflict**: `/pricing` is disallowed but discoverable via links

---

## Fixes Applied

### Fix #1: Updated Sitemap (sitemap.ts)
✅ Added all indexable public pages
✅ Excluded auth/utility pages (login, signup, password reset)
✅ Set proper priorities and change frequencies

### Fix #2: Add Canonical Tags to Pages
✅ Each page now exports explicit metadata with canonical URL
✅ Prevents duplicate content issues

### Fix #3: Updated robots.txt
✅ Clarified which pages should never be crawled
✅ Removed `/pricing` from disallow (should be indexed)

---

## Testing Checklist

After deployment:

- [ ] Visit `https://xelora.app/robots.txt` - verify it loads
- [ ] Visit `https://xelora.app/sitemap.xml` - verify all pages listed
- [ ] In Google Search Console:
  - [ ] Go to Sitemaps section
  - [ ] Submit `https://xelora.app/sitemap.xml`
  - [ ] Request indexing for specific pages with issues
- [ ] Wait 3-7 days for Google to re-crawl

---

## Expected Resolution Timeline

- **Immediate**: New sitemap goes live after deployment
- **24-48 hours**: Google discovers updated sitemap
- **3-7 days**: Pages start getting indexed
- **2 weeks**: Most issues should be resolved

---

## How to Request Manual Indexing

If specific pages still show "Discovered - not indexed" after 1 week:

1. Open [Google Search Console](https://search.google.com/search-console)
2. Go to "URL Inspection" tool (top of page)
3. Enter the full URL (e.g., `https://xelora.app/pricing`)
4. Click "Request Indexing"
5. Repeat for each affected page

---

## Monitoring

Check Google Search Console weekly:

- **Indexing > Pages**: Watch for decrease in "Not indexed" count
- **Sitemaps**: Verify all submitted URLs are discovered
- **Coverage**: Should see more pages in "Valid" category

---

## Prevention

Going forward, when adding new public pages:

1. Add to `app/sitemap.ts`
2. Add canonical metadata to the page's metadata export
3. Ensure page is not in robots.txt disallow list
4. Submit sitemap to Google Search Console after deployment
