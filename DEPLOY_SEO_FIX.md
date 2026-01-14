# SEO Fix Deployment Checklist

## Quick Summary

Fixed 2 Google Search Console issues:
- ✅ **Duplicate without user-selected canonical** - Removed hash fragments from sitemap
- ✅ **Discovered - currently not indexed** - Added canonical URLs and proper sitemap

## Deploy Commands

```bash
# 1. Review changes
git status

# 2. Commit
git add .
git commit -m "fix: resolve Google Search Console indexing issues

- Remove hash fragments from sitemap
- Add canonical URLs to all public pages
- Update robots.txt to exclude protected pages
- Add metadata to demo, trend-gen, privacy, and terms pages"

# 3. Push to deploy
git push
```

## After Deployment (in Google Search Console)

### Step 1: Submit Sitemap
1. Go to https://search.google.com/search-console
2. Select **Sitemaps**
3. Submit: `https://xelora.app/sitemap.xml`

### Step 2: Request Indexing
Go to **URL Inspection** and request indexing for:
- ✅ https://xelora.app/about
- ✅ https://xelora.app/demo
- ✅ https://xelora.app/trend-gen
- ✅ https://xelora.app/privacy
- ✅ https://xelora.app/terms

### Step 3: Monitor (3-7 days)
Check **Indexing** → **Pages** to verify issues are resolved.

---

## What Was Fixed

1. **Sitemap** - Removed hash fragments (`/#demo`), added real pages
2. **Canonical URLs** - Added to all 6 public pages
3. **Robots.txt** - Blocked protected pages from crawling

See [docs/SEO_INDEXING_FIXES.md](docs/SEO_INDEXING_FIXES.md) for full details.
