# BASELINE RESTORATION PLAN - EXECUTION
**Date:** October 18, 2025  
**Status:** APPROVED BY USER

---

## USER DECISIONS FINALIZED

✅ **Q1: Git Baseline** → C - Test both locally, pick stable one  
✅ **Q2: Vercel Projects** → A - Keep landing-page, delete others  
✅ **Q3: Routing** → A - Subdomain (ccai.3kpro.services)  
✅ **Q4: Branch Cleanup** → Rollback to pre-design-upgrade point + establish .md template workflow  

---

## IDENTIFIED ROLLBACK POINT

**Pre-Design-Upgrade Commit:**
- **Hash:** `228d6b4`
- **Message:** "feat: implement onboarding social media connection system"
- **Date:** Before dark mode/design upgrade
- **Next Commit:** `4640e32` (Complete dark mode implementation) ← This started the design changes

**This is the stable baseline** - before the Tron theme and UI polish work.

---

## EXECUTION PLAN

### PHASE 1: Test Builds (IN PROGRESS)
- [ ] Test current main branch (14055ac) - likely **WILL FAIL** (params type issue)
- [ ] Test commit 228d6b4 - should **BUILD OK** (before design upgrade)
- [ ] Verify which is stable

### PHASE 2: Git Reset (PENDING APPROVAL)
Once stable baseline confirmed:
```bash
git reset --hard 228d6b4
git push --force origin main
```

### PHASE 3: Branch Cleanup (PENDING APPROVAL)
Delete all experimental branches:
```bash
# Local
git branch -D code-review-opus ui-polish-modern

# Remote  
git push origin --delete code-review-opus ui-polish-modern copilot/add-campaign-detail-page fix/campaign-detail-page

# Prune
git remote prune origin
```

### PHASE 4: Vercel Consolidation (MANUAL - DASHBOARD)
1. Login to Vercel.com
2. Delete: 3kpro-landing project
3. Delete: content-cascade-ai-landing project
4. Keep: landing-page project
5. Verify: landing-page connects to main branch with auto-deploy enabled

### PHASE 5: Subdomain Configuration (PENDING)
1. Add DNS record: ccai.3kpro.services → landing-page-*.vercel.app
2. Update Vercel project: Add custom domain ccai.3kpro.services
3. Update Next.js config if needed (likely no changes needed)

### PHASE 6: Documentation
1. Create BASELINE_RESTORED.md
2. Update TASK_QUEUE.md
3. Create DESIGN_UPGRADE_TEMPLATE.md for future design work

---

## DESIGN UPGRADE WORKFLOW (FOR FUTURE)

**Instead of committing design changes directly:**

1. User creates **DESIGN_PROPOSAL.md** documenting:
   - What visual changes?
   - Which components affected?
   - Color scheme/theme details
   - Animation/interaction changes

2. User submits .md file to Design Agent

3. Design Agent reviews, proposes implementation schedule

4. Agents implement changes with proper testing

5. Once verified → merge to main with single "Design Upgrade" commit

**This prevents the chaotic divergence that happened with code-review-opus.**

---

## CURRENT BLOCKERS

🔴 **Build Testing:** Need to verify if main branch or 228d6b4 actually builds  
⏳ **Awaiting:** Confirmation that rollback to 228d6b4 is acceptable (loses all design/optimization work on main)

---

## WHAT GETS LOST IN ROLLBACK

If we reset main to 228d6b4, the following work disappears:
- ❌ All dark theme (Tron) CSS/styling
- ❌ All UI polish and animations
- ❌ All Redis optimization work
- ❌ All analytics tracking improvements
- ❌ Campaign detail page
- ✅ But we keep: Core TrendPulse functionality, E2E tests, authentication system

**This is intentional** - you want a clean baseline to re-do the design upgrade properly.

---

## TIMELINE

- **NOW (Oct 18):** Test builds, get confirmation
- **In 1 hour:** Execute Phase 1-3 (Git cleanup)
- **In 2 hours:** Execute Phase 4 (Vercel)
- **In 3 hours:** Execute Phase 5 (DNS)
- **By end of today:** Baseline stable, ready for design re-work
- **Oct 19-22:** Design upgrade via proper workflow
- **Oct 23:** Launch

---

## NEXT STEP

**I need to:** Verify main branch build status

If main fails to build → Use 228d6b4 as baseline  
If 228d6b4 fails to build → Find earlier working commit

Once verified, you confirm final rollback and I execute Phase 2-5.

Ready to proceed? (Yes/No)

