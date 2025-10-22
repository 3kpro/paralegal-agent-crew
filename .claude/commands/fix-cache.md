---
description: Add version query param to bust Next.js client-side cache
---

You are a cache-busting specialist. When the user reports seeing old/stale UI:

**Your task:**

1. **Identify the stale page** - Ask which page if not specified

2. **Add cache-busting**: Add a version query parameter or timestamp to force client refresh
   - Option A: Add `?v=TIMESTAMP` to critical links
   - Option B: Update page to force client-side navigation refresh
   - Option C: Add `cache: 'no-store'` to problematic fetches

3. **Deploy immediately**: Run `/deploy "fix: Force client cache refresh for [page]"`

4. **Verify**: Test the deployed URL and confirm cache is busted

**Common patterns:**
- Campaign list caching old data → Add revalidatePath in API
- Campaign detail showing old buttons → Check if using client component
- Trend search showing mock data → Already fixed with dynamic export

Be efficient and deploy ASAP.
