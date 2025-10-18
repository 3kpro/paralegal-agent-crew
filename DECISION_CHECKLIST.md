# BASELINE RESTORATION - DECISION CHECKLIST
**Date:** October 18, 2025  
**Status:** AWAITING USER INPUT

---

## CRITICAL DECISIONS REQUIRED

### Decision 1: Git Baseline
**Question:** Which version should be the new foundation?

- [ ] **Option A:** code-review-opus (12 commits ahead, latest fixes, but untested)
  - Contains: Dark theme, optimizations, params fix
  - Risk: Recent build errors, not merged to main
  - Action if selected: Merge to main, delete code-review-opus branch

- [ ] **Option B:** main (stable, official, but missing recent work)
  - Contains: E2E tests pass, clean state
  - Risk: Missing 12 commits, no dark theme, no recent fixes
  - Action if selected: Reset code-review-opus to main, start fresh

- [ ] **Option C:** Test both locally, pick the one that builds successfully
  - Recommended: YES - let's verify which builds first

**Status:** ⏳ PENDING USER CHOICE

---

### Decision 2: Vercel Projects
**Question:** Which Vercel project should be PRODUCTION?

- [ ] **landing-page** (most recent activity, Oct 6)
  - Recommendation: KEEP THIS ONE
  - Action: Delete 3kpro-landing and content-cascade-ai-landing

- [ ] **3kpro-landing** (Oct 4, unclear purpose)
  - Recommendation: DELETE (stale, redundant)

- [ ] **content-cascade-ai-landing** (Oct 3, very stale)
  - Recommendation: DELETE (oldest, unused)

**Status:** ⏳ PENDING USER CHOICE

---

### Decision 3: Routing Strategy
**Question:** Subdomain or directory for CCAI?

- [ ] **Subdomain:** ccai.3kpro.services
  - Pros: Clean separation, independent analytics, easierscaling
  - Cons: DNS setup required, separate SSL cert
  - Next.js Config: basePath not needed

- [ ] **Directory:** 3kpro.services/ccai
  - Pros: Single domain, simpler DNS, shared SSL
  - Cons: Shared analytics, more routing complexity
  - Next.js Config: basePath: '/ccai'

**Status:** ⏳ PENDING USER CHOICE

---

### Decision 4: Git Branch Cleanup
**Question:** Which branches should be deleted?

**DELETE (experimental/stale):**
- [ ] `origin/ui-polish-modern` (duplicate effort)
- [ ] `origin/copilot/add-campaign-detail-page` (stale campaign work)
- [ ] `origin/fix/campaign-detail-page` (redundant with above)
- [ ] `code-review-opus` (after merging to main)

**KEEP:**
- [ ] `origin/main` (production)

**Status:** ⏳ PENDING USER CONFIRMATION

---

## PROPOSED EXECUTION ORDER

Once decisions made:

### Phase 1: Verify Stability (READ-ONLY)
1. Test main branch build locally
2. Test code-review-opus build locally
3. Pick the one that builds
4. Identify exact commit hash for baseline

### Phase 2: Git Cleanup (DESTRUCTIVE - NEEDS APPROVAL)
1. Reset main to stable baseline commit
2. Force push to origin/main
3. Delete experimental branches (local + remote)
4. Prune dangling refs

### Phase 3: Vercel Consolidation (DASHBOARD)
1. Delete 3kpro-landing from Vercel
2. Delete content-cascade-ai-landing from Vercel
3. Reconfigure landing-page to deploy only from main
4. Verify auto-deploy enabled

### Phase 4: Restructuring (FOLDER + CONFIG)
1. Scaffold new directory structure (based on subdomain/directory decision)
2. Update Next.js config (basePath if using directory)
3. Update DNS records (if using subdomain)
4. Test routing locally

### Phase 5: Documentation
1. Create BASELINE_RESTORED.md
2. Update TASK_QUEUE.md for post-baseline work
3. Create AGENT_PROTOCOLS.md for new handoff workflow

---

## QUICK SUMMARY FOR YOUR DECISION

**Git Status:**
- ✅ Audited: 3 branches, 8 total refs, 333 files different
- ✅ Fixed: TypeScript params error in latest code-review-opus
- ❓ Unknown: Which branch builds successfully

**Vercel Status:**
- ✅ Identified: 3 projects, landing-page recommended for primary
- ❓ Unknown: Which is actually production target
- ❓ Unknown: Auto-deploy settings for each

**Your Decisions:**
1. Use code-review-opus or main as baseline?
2. Keep landing-page, delete other 2 from Vercel?
3. Subdomain (ccai.3kpro.services) or directory (3kpro.services/ccai)?
4. Delete all experimental branches?

**Timeline:**
- Once you decide: 2-3 hours to complete full restoration
- Then: 1 day for restructuring & testing
- Then: CCAI launch ready by Oct 23

---

## CONFIRMATION NEEDED

Please answer these 4 questions:

**Q1:** code-review-opus or main? (or test both?)  
**Answer:** _________________

**Q2:** Keep landing-page, delete others?  
**Answer:** _________________

**Q3:** Subdomain or directory for CCAI?  
**Answer:** _________________

**Q4:** Delete all experimental branches?  
**Answer:** _________________

Once confirmed, I will execute Phase 1 (test builds) and report back with recommendation.

