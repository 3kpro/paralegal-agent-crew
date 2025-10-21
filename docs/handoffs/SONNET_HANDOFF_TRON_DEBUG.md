# TRON THEME DEBUGGING REQUIRED - Handoff Brief

**Status:** BROKEN - Needs immediate Sonnet analysis  
**Date:** October 19, 2025, Evening  
**Issue:** 100+ old Tailwind color classes on dark backgrounds = unreadable text

---

## THE PROBLEM

### What Happened
1. Applied dark backgrounds to all sections (working ✅)
2. Did NOT update text colors to Tron palette (failed ❌)
3. Components have `text-gray-900` (dark gray) on `bg-tron-dark` (#0f0f1e) = invisible
4. Components have `text-purple-600` on dark = blends together
5. Post-login specifically broken because dashboard still has blue/purple text

### Evidence
100+ grep matches found:
```
text-gray-900, text-gray-600, text-gray-700, text-gray-500, text-gray-400
text-purple-600, text-purple-700, text-purple-100
text-indigo-600, text-indigo-700, text-indigo-100
text-blue-600, text-blue-800
bg-white, bg-gray-100, bg-gray-200, bg-gray-50
```

All these exist on dark backgrounds now → unreadable

---

## WHY SONNET IS RECOMMENDED

**Sonnet can:**
1. Open browser DevTools on running site
2. Inspect actual rendered HTML
3. Calculate text contrast ratios (WCAG compliance)
4. Identify exactly which elements have bad contrast
5. Suggest precise Tailwind class replacements
6. Verify fixes with visual output

**Why NOT just grep/find:**
- We need VISUAL verification
- Need to understand component hierarchy
- Some colors may be intentional (badges, accents)
- Need to verify post-login sections specifically
- Need contrast ratio validation

---

## CURRENT SITUATION

**Git Status:**
- 7 commits ahead of origin/main
- Last 3 commits:
  ```
  63ed737 - Fixed invalid Tailwind color classes (partial fix)
  3602408 - Applied Tron theme to section components
  604c104 - Applied dark theme to root layout
  ```

**Dev Server:**
- Running on localhost:3000
- Ready for inspection
- All code changes already committed

**Valid Tron Palette (ALL that exists):**
```
text-tron-text: #ffffff (white - for primary text)
text-tron-text-muted: #cccccc (light gray - for secondary)
text-tron-cyan: #00ffff (cyan - for accents/buttons)
text-tron-green: #00ff00 (green - for success)
text-tron-magenta: #ff00ff (magenta - for warnings)

bg-tron-dark: #0f0f1e (primary background)
bg-tron-grid: #1a1a2e (secondary background)
```

---

## FILES WITH MOST ISSUES

Priority by severity (from grep results):

**CRITICAL (Main landing page sections):**
1. `components/sections/ModernHero.tsx` - text-gray-900, text-gray-600, text-purple-600, text-indigo-600
2. `components/sections/ModernFeatures.tsx` - text-gray-900, text-gray-600, text-purple-600
3. `components/sections/ModernPricing.tsx` - text-gray-900, text-gray-600, text-purple-600, text-indigo-100, bg-white
4. `components/sections/TestimonialsSection.tsx` - text-gray-900, text-gray-600, text-gray-700, text-indigo-700
5. `components/sections/DemoVideoSection.tsx` - text-gray-900, text-gray-600, text-purple-600, text-indigo-600

**HIGH (Dashboard/Authenticated areas):**
6. `components/DashboardClient.tsx` - text-indigo-600, hover:text-cyan-400
7. `components/sections/WaitlistSection.tsx` - text-purple-100, text-gray-400, text-gray-900, bg-yellow-400
8. `components/sections/ContactSection.tsx` - text-gray-800, text-gray-600

**MEDIUM (Other pages):**
9. `components/TrendDiscovery.tsx` - text-gray-600, text-blue-600, text-purple-600, text-blue-800, text-gray-800
10. `components/sections/ServicesGrid.tsx` - text-gray-800, text-gray-600, text-blue-600
11. `components/sections/PricingSection.tsx` - text-gray-800, text-gray-600
12. `components/sections/HeroSection.tsx` - text-gray-300, text-gray-600, text-blue-600

---

## RECOMMENDED APPROACH

### For Sonnet Analysis (30-60 minutes):
1. Connect to http://localhost:3000
2. Use DevTools to inspect bad contrast areas
3. Identify exact elements and current classes
4. Create mapping of:
   - `text-gray-900` → `text-tron-text`
   - `text-gray-600` → `text-tron-text-muted`
   - `text-purple-*`, `text-indigo-*` → `text-tron-cyan` or `text-tron-magenta`
   - `bg-white` → `bg-tron-grid` (secondary background)
5. Apply fixes with visual verification after each section
6. Test responsive breakpoints (375px, 768px, 1024px+)
7. Verify post-login sections specifically

### For Manual Audit (if Sonnet unavailable):
Use this command to find ALL instances:
```bash
grep -rn "text-gray\|text-indigo\|text-purple\|text-blue\|bg-white\|bg-gray-50\|bg-gray-100" components/ --include="*.tsx" | grep -v "__tests__"
```

Then systematically replace:
- `text-gray-[0-9]*` → `text-tron-text` (headers) or `text-tron-text-muted` (body)
- `text-purple-*` → `text-tron-cyan` (accents) or `text-tron-magenta` (warnings)
- `text-indigo-*` → `text-tron-cyan` (primary accents)
- `bg-white` → `bg-tron-grid` (if background needed)
- `bg-gray-*` → `bg-tron-grid` (secondary backgrounds)

---

## EXPECTED OUTCOME

After fixes:
- ✅ White text (#ffffff) on dark backgrounds → readable
- ✅ Cyan accents (#00ffff) pop on dark → visible
- ✅ Consistent Tron aesthetic throughout
- ✅ Post-login sections readable (blue/purple replaced with Tron colors)
- ✅ All contrast ratios WCAG compliant

---

## TIMELINE

- **Now:** Sonnet analysis (30-60 min)
- **Then:** Apply fixes with verification
- **Final:** QA responsive testing
- **Launch:** Oct 23 (4 days remaining)

**Action:** Hand this document + dev server URL to Sonnet for visual inspection and fix recommendations.

