# DESIGN UPGRADE PROPOSAL TEMPLATE
**Use this template for ALL design/UI upgrade work**  
**Baseline:** commit 228d6b4 (stable, builds successfully)  
**Workflow:** Fill this template → Paste in chat → Get approval → Implement → Test → Submit PR

---

## 🎬 TRON AESTHETIC REFERENCE

**Design Direction:** Tron Legacy/Ares universe visual language

### Color Palette (Core)
```
Primary Dark:    #0f0f1e (deep space black)
Neon Cyan:       #00ffff (electric blue - primary accent)
Neon Green:      #00ff00 (digital green - data/success)
Neon Magenta:    #ff00ff (purple - warnings/highlights)
Grid Gray:       #1a1a2e (grid patterns)
Text Primary:    #ffffff (clean white)
Text Secondary:  #cccccc (muted for hierarchy)
```

### Visual Elements
- Grid backgrounds (animated)
- Glow effects on interactive elements
- Light trails on hover/transitions
- Geometric shapes (circles, grids, hexagons)
- Digital typography (geometric sans-serif fonts)
- High contrast, bold shadows
- Smooth, responsive animations

### Interaction Philosophy
- Everything responds to user input with glows/highlights
- Transitions are smooth but snappy (200-400ms)
- Feedback is immediate and visual
- Dark backgrounds make neon accents pop

**APPLY THIS AESTHETIC TO EVERY DESIGN DECISION**

---

## PROPOSAL DETAILS

**Title:** [What are you changing?]  
**Proposed By:** [Your name/agent]  
**Date:** October 18, 2025  
**Priority:** [High/Medium/Low]  
**Estimated Time:** [Hours]  
**Phase:** [1-Aesthetic / 2-Launch / 3-Optimization]  
**References:** TASK_QUEUE.md (specific task being addressed)  
**Tron Alignment:** How does this match Tron aesthetic? [High/Medium/Low]

---

## PHASE 1 SPECIFIC (Oct 19-20)

**If you're doing Dark Theme (Task 1):**
- Reference colors from BASELINE_RESTORED.md (Tron-inspired palette)
- Update tailwind.config.js with color variables
- Modify globals.css for dark theme base styles
- Update layout.tsx to apply theme provider if needed

**If you're doing Animations (Task 2):**
- Add Framer Motion animations
- Reference components that need polish
- Define keyframes in tailwind or CSS
- Test performance on low-end devices

**If you're doing Responsive Testing (Task 3):**
- Test at 3 breakpoints: 375px (mobile), 768px (tablet), 1024px+ (desktop)
- Document any layout issues found
- Provide screenshots for each breakpoint

---

## 1. VISUAL CHANGES

### What colors/theme are you introducing?

**TRON LEGACY/ARES COLOR PALETTE (Apply to all tasks):**
```
🎨 Primary Dark:      #0f0f1e (Deep space - main backgrounds)
🎨 Neon Cyan:         #00ffff (Electric - primary interactive, glows)
🎨 Neon Green:        #00ff00 (Digital success, data highlights)
🎨 Neon Magenta:      #ff00ff (Warnings, accent highlights)
🎨 Grid Gray:         #1a1a2e (Subtle grid patterns, secondary BG)
🎨 Text Primary:      #ffffff (Maximum contrast, body text)
🎨 Text Secondary:    #cccccc (Hierarchy, muted labels)

Visual Language: Grids, light trails, geometric shapes, high contrast, glowing accents
Transition timing: 200-400ms cubic-bezier (for smooth digital feel)
```

Your proposal (describe changes specific to YOUR task):
```
[Fill in which components/sections you're modifying and why]
```

---

## 2. COMPONENT IMPACTS

**List each component that will change (check all that apply):**

**CORE COMPONENTS (Required - Apply Tron colors):**
- [ ] Layout (bg: #0f0f1e, border: #1a1a2e grid patterns)
- [ ] Navigation/Header (bg: #0f0f1e, text: #ffffff, hover: #00ffff glow)
- [ ] Dashboard page (dark background, Tron color accents)
- [ ] Cards/PostCard (border: #00ffff, shadow: glow effect)
- [ ] Buttons (bg: #0f0f1e, border: #00ffff, hover: cyan glow)
- [ ] Forms (input: #1a1a2e bg, text: #ffffff, focus: #00ffff glow)
- [ ] Modals (bg: #0f0f1e overlay, border: #1a1a2e)

**INTERACTIVE ELEMENTS (Tron animations):**
- [ ] Hover states (Add cyan glow: box-shadow: 0 0 10px #00ffff)
- [ ] Focus states (Add cyan ring: outline 2px solid #00ffff)
- [ ] Transitions (Use 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) for digital feel)
- [ ] Loading states (Animate with #00ffff or #00ff00)

**OTHER:**
- [ ] Other: _________________

---

## 3. FILE CHANGES

**Which files will be modified? (Update the list below with YOUR specific files)**

**BASELINE (Most Dark Theme tasks will touch these):**
```
tailwind.config.js
  └─ Add Tron colors to extend.colors:
     - darkBg: #0f0f1e
     - neonCyan: #00ffff
     - neonGreen: #00ff00
     - neonMagenta: #ff00ff
     - gridGray: #1a1a2e

app/
  ├─ globals.css (add Tron base styles, grid patterns, glow effects)
  ├─ layout.tsx (add dark mode provider wrapper if needed)
  └─ (portal)/dashboard/page.tsx (apply Tron classes)

components/
  ├─ trendpulse/
  │  ├─ PostCard.tsx (apply Tron border/hover glow)
  │  ├─ DashboardHeader.tsx (apply Tron colors)
  │  └─ (other components)
  └─ ...
```

Your file list (delete above, replace with YOUR files):
```
[List files you'll modify]
```

---

## 4. ANIMATIONS/INTERACTIONS

**Are you adding animations? (Use Tron aesthetic principles)**

**TRON ANIMATION PATTERNS (Reference for all tasks):**
```
🎬 GLOW EFFECTS (Primary):
   - Hover: box-shadow: 0 0 10px #00ffff
   - Focus: outline: 2px solid #00ffff
   - Active: box-shadow: 0 0 20px #00ffff, inset 0 0 5px rgba(0,255,255,0.3)

🎬 TRANSITIONS (All interactions):
   - Duration: 200-400ms (faster = more digital)
   - Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) (smooth acceleration)
   - Apply to: color, background, border, box-shadow

🎬 ENTRANCE (Page/Component load):
   - Fade in: opacity 0 → 1 (300ms)
   - Slide in: transform translateY(10px) → 0 (300ms)
   - Glow pulse: box-shadow pulse effect on mount

🎬 MICRO-INTERACTIONS (Success/feedback):
   - Success: Green glow pulse (#00ff00) + scale 1.05 (200ms)
   - Error: Magenta glow pulse (#ff00ff) + scale 0.95 (200ms)
   - Loading: Cyan rotating border or pulsing glow
```

Your animations (describe what YOU'RE adding):
```
[Describe animations if any]
```

---

## 5. ACCESSIBILITY CHECK

- [ ] Colors pass WCAG AA contrast ratio
- [ ] Dark theme has sufficient contrast for text
- [ ] No critical accessibility regressions
- [ ] Tested with keyboard navigation

---

## 6. RESPONSIVE DESIGN

- [ ] Mobile (375px): Tested
- [ ] Tablet (768px): Tested
- [ ] Desktop (1024px): Tested
- [ ] No layout breaks

---

## 7. IMPLEMENTATION SCHEDULE

**Phase breakdown (if large upgrade):**

Phase 1: Core colors + CSS variables (1 hour)
Phase 2: Apply to main layout components (2 hours)
Phase 3: Apply to dashboard/cards (1 hour)
Phase 4: Testing + refinement (1 hour)

---

## 8. ROLLBACK PLAN

**If this goes wrong, how do we revert?**

- Branch to use for rollback: main (current commit hash: _______)
- Critical files to backup: [List files]

---

## 9. TESTING CHECKLIST

Before submitting for merge:
- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] Local testing at 3 breakpoints (mobile/tablet/desktop)
- [ ] Dashboard page loads without errors
- [ ] All buttons/links work
- [ ] Theme applies consistently across pages

---

## 10. SIGN-OFF

**Designer/Agent:** ___________________  
**Date Started:** October 18, 2025  
**Date Completed:** ___________________  
**Approved By User:** [ ] Yes [ ] No

---

## COMMENTS FROM USER (IF ANY)

```
[User feedback/changes requested]
```

---

## 11. IMPLEMENTATION DETAILS (IF APPROVED)

**Git Workflow:**
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/design-upgrade-[short-name]

# 2. Make changes referencing this proposal
# 3. Test locally
npm run build

# 4. Commit with descriptive message
git commit -m "feat(design): [What changed] - Implements Design Proposal #[title]"

# 5. Push and create PR
git push origin feature/design-upgrade-[short-name]
# Then create PR with link to this proposal
```

**Files You'll Likely Edit:**
- `tailwind.config.js` - Add colors/themes
- `app/globals.css` - Add global styles
- `app/layout.tsx` - Add theme provider/wrapper
- `components/trendpulse/*.tsx` - Apply theme classes
- `app/(portal)/dashboard/page.tsx` - Apply theme classes

**Key Commands:**
- Build test: `npm run build`
- Dev server: `npm run dev`
- Type check: `npx tsc --noEmit`

---

## SUBMISSION INSTRUCTIONS

1. Fill out entire template completely
2. Paste complete template in chat as code block
3. **Wait for user approval** (this step is mandatory)
4. Once approved, checkout main and create feature branch
5. Implement exactly as described in proposal
6. Run `npm run build` locally (must pass)
7. Commit with reference to this proposal
8. Push branch and create GitHub PR
9. Link this proposal in PR description
10. **Do NOT merge** - wait for user to merge after verification

