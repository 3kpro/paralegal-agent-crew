# TASKS.md
Last Updated: 2026-01-06

This file lists the ONLY work that should be actively considered.
If it's not here, it's not a task.

---
## NOW (One at a time only)

<!-- No active tasks -->


---


## COMPLETED

- [x] **Campaign Creation: Schedule vs Publish (Production Fix)** 📅 ✅
      - **Action:** Replaced "Publish Now" button with "Schedule for Later" at the end of the wizard.
      - **Goal:** Align with V1 Simplification strategy and fix production regression.
      - **File:** `app/(portal)/campaigns/create/page.tsx`
      - **Assigned:** Gemini


- [x] **Fix Dashboard Stats 404 Error** 🐛 ✅
      - **Problem:** Dashboard stats API returning 404 on localhost (Turbopack).
      - **Solution:** Added `export const dynamic = 'force-dynamic'` to `app/api/dashboard/stats/route.ts` to prevent static optimization failure.
      - **File:** `app/api/dashboard/stats/route.ts`
      - **Assigned:** Antigravity


- [x] **Campaign Creation: Schedule vs Publish** 📅 ✅
      - **Action:** Replaced "Publish Now" button with "Schedule for Later" at the end of the wizard.
      - **Goal:** Align with V1 Simplification strategy (Create now, Publish later).
      - **File:** `app/(portal)/campaigns/create/page.tsx`
      - **Assigned:** Gemini

- [x] **Onboarding Copy Update & Flow Simplification** 🎓 ✅
      - **Problem:** Onboarding text was outdated and included a "Connect Social Accounts" step that is no longer part of the V1 simplified flow.
      - **Solution:** Updated onboarding verbiage to reflect "Viral DNA" messaging (Version C). Removed the social connection step, reducing friction.
      - **File:** `app/(portal)/onboarding/page.tsx`, `components/onboarding/InterestSelection.tsx`, `components/onboarding/TrendingTopicsPreview.tsx`
      - **Assigned:** Gemini

- [x] **Transfer Masterclass Redesign** 🎨 ✅
      - **Problem:** Transfer Masterclass showed a cluttered list and was missing guides for Facebook/Reddit. Was also restricted to mobile platforms in Wizard.
      - **Solution:** Redesigned as context-aware single view. Added FB/Reddit guides. Enabled for ALL platforms in Campaign Wizard.
      - **File:** `components/TransferMasterclass.tsx`, `app/(portal)/campaigns/create/page.tsx`
      - **Assigned:** Gemini

- [x] **Fix Vertical Alignment for Spinners** 🎨 ✅
      - **Problem:** "Finding trends..." and "Generating" spinners were slightly above center (approx 300px vs 540px fade center).
      - **Solution:** Replaced `min-h-[600px]` with `min-h-[calc(100vh-4rem)]` for both containers to center them vertically in the viewport.
      - **File:** `app/(portal)/campaigns/create/page.tsx`
      - **Assigned:** Gemini

- [x] **Redesign "Shape Your Content" UI for Vertical Compactness** 🎨 ✅
      - **Location:** Campaign Create → Step 4 (Shape Your Content)
      - **Problem:** Current layout requires excessive scrolling. Multiple multi-choice sections (Tone, Length, Focus, Target Audience, CTA) are stacked vertically, causing UI fatigue.
      - **Goal:** Maintain ALL options but redesign layout to fit on single viewport (~no scrolling). "Simplicity is the ultimate form of sophistication."
      - **Results:**
        - Implemented tabbed interface: "Style & Voice" and "Target & Goal".
        - Grouped Creativity, Length, Tone under "Style & Voice".
        - Grouped Audience, Focus, CTA under "Target & Goal".
        - Used compact grid layouts for all options.
        - Split long lists into multi-column grids.
      - **File:** `app/(portal)/campaigns/create/page.tsx` (Step 4)
      - **Assigned:** Gemini

- [x] **Fix "Same for All" AI Optimize Bug** 🐛 ✅
      - **Location:** Campaign Create → Step 4 (Shape Your Content)
      - **Problem:** When "Same for All" toggle is ON and user clicks "AI Optimize (A)", all platform cards become IDENTICAL instead of applying platform-specific AI optimization
      - **Results:**
        - Updated `handleAIOptimize` to calculate platform-specific settings for EACH selected platform.
        - Enabled "Per Platform" mode automatically when optimizing multiple platforms.
        - Verified that optimizations are now distinct (e.g. LinkedIn=Pro, Twitter=Casual) even if "Same for All" was initially ON.
      - **File:** `app/(portal)/campaigns/create/page.tsx` (Content Preferences step)
      - **Assigned:** Gemini

- [x] **Improve Onboarding "Choose Starting Point" Screen** 🎓 ✅
      - **Location:** Step 2 of onboarding (`/onboarding` page - "Choose your starting point")
      - **Problem:** First-time users see two generic options ("Discover Viral" and "Validate Idea") with minimal explanation. This is a critical decision point where we should educate them about Viral DNA™ science.
      - **Results:**
        - Added "Viral DNA™ Science" mini-explainer with BrainCircuit icon.
        - Added "Example Output" preview badges for both paths (Hook/Emotion/Value).
        - Upgraded copy to be more benefit-driven and authoritative.
        - Preserved premium glassmorphism design.
      - **File:** `app/(portal)/campaigns/create/page.tsx` (Step 2 section)
      - **Assigned:** Gemini

- [x] **Video Prompts Enhancement for Veo** 🎬 ✅
      - **Action:** Enhanced 18 video prompts in `docs/Marketing/VIDEO_PROMPTS.md` for Vertex AI/Veo.
      - **Details:** Added cinematic lighting, camera movement, and high-fidelity texture descriptors. Injected trendy TikTok/Instagram content into screen-based scenes.
      - **Assigned:** Gemini

- [x] **Campaign Creation Video Script** 🎬 ✅
      - **Action:** Created an 8-second punchy video script focused on "Viral DNA" and predictable success.
      - **Deliverable:** `docs/VIDEO_SCRIPT.md` with full screenshot instructions.
      - **Assigned:** Gemini

- [x] **UX/UI Improvements** 🎨 ✅
      - **Problem:** Cards with choices are  too big.  User has to turn down the zoom when to fit the options or scroll.  Options and text need to be tighted to fit and not waste any room to make it laptop and mobile friendly.  Keep the same look and feel but make it more compact.
      - **Expected:** Campaign creation should be more compact and user friendly.
      - **File:** `app/(portal)/campaigns/create/page.tsx` (Content Preferences step)
      - **Assigned:** Gemini

- [x] **Fix Per-Platform Settings Bug** 🐛 ✅
      - **Problem:** When "Per Platform" toggle is ON, changing Tone/Length/Focus still applies to ALL platforms instead of just the selected one
      - **Expected:** Settings should only apply to the platform with "EDITING" badge
      - **File:** `app/(portal)/campaigns/create/page.tsx` (Content Preferences step)
      - **Assigned:** Gemini


- [x] **Center Loading Spinner on Trend Discovery** 🎨 ✅
      - **Problem:** "Finding trends..." spinner is slightly above center - off from the fade point of the dotted background
      - **Goal:** Perfectly center the spinner vertically and horizontally
      - **File:** `components/TrendDiscovery.tsx` (or wherever the loading state is rendered)
      - **Assigned:** Gemini

- [x] **Continue Button Width Fix** 🎨 ✅
      - **Problem:** Continue button on Platform Selection (Step 2) spans full width, doesn't match platform card grid
      - **Goal:** Align button width with the 3-column platform grid (~max-w-4xl)
      - **File:** `app/(portal)/campaigns/create/page.tsx`
      - **Assigned:** Gemini

- [x] **Reactor Landing Page Redesign** 🎨 ✅
      - **Problem:** Current `/ai-studio` page uses a dark transparent overlay on full content. Looks unprofessional and cluttered.
      - **Goal:** Build a dedicated, minimalistic "Coming Soon" landing page that builds anticipation.
      - **Design:**
        - Centered, vertical, clean layout
        - Animated Brain icon (subtle pulse)
        - "REACTOR" title with coral→purple→cyan gradient
        - "50+ AI Models. One Interface." subtitle
        - Coming Soon pill badge
        - AI provider logos strip (8 logos, grayscale, glow on hover)
        - 3 feature teaser cards (Multi-Model, Smart Routing, Cost Control)
        - Footer tagline
      - **Keep:** Auth check, BGPattern, provider logo images
      - **Remove:** Dark overlay, detailed provider cards, AI_CAPABILITIES section, "What You'll Create" section
      - **File:** `app/(portal)/ai-studio/page.tsx`
      - **Handoff:** `docs/handoffs/REACTOR_LANDING_PAGE_REDESIGN.md` (full spec + code template)
      - **Assigned:** Gemini

- [x] **Viral DNA 2.0 Landing Page Alignment** ✅ (2026-01-04)
      - **Goal:** Update all marketing copy to reflect Viral DNA psychometric analysis upgrade
      - **Completed:**
        - [x] Updated `ModernFeatures.tsx` - Viral Score card now shows "Psychometric Viral Analysis"
        - [x] Updated `ModernHero.tsx` - Key features now say "Viral DNA decoded", capability pills updated
        - [x] Updated `/demo` page - New title, Viral DNA breakdown cards, updated CTAs
        - [x] Updated `XELORA_PRESS_PACK.md` - Added Taglines & One-Liners section, updated VPI section
        - [x] Created `docs/MARKETING_OVERHAUL_PLAN.md` - Full asset audit and production checklist
      - **Key Messaging:** "Every viral post has DNA. We decode it." / "Stop guessing. Start engineering."

- [x] **Add "Select All" Button to Platform Selection** ✅
      - **Goal:** Quick way to select all 6 platforms at once.
      - **Location:** Campaign Create → Step 2 (Choose Content Formats)
      - **Action:**
        - Add a subtle "Select All" button that fits the page's dark coral aesthetic.
        - Should toggle all platforms on/off.
        - Position: Above or beside the platform grid, not intrusive.
      - **Why:** UX convenience - users often want multi-platform campaigns.
      - **Status:** Done. "Select All" / "Deselect All" button added to wizard header.

- [x] **Visualize Viral DNA in Discovery UI** ✅
      - **Goal:** Show the user *why* a trend is viral using the new psychometric tags.
      - **Action:**
        - Update `TrendDiscovery.tsx` or `TrendingTopicsPreview.tsx` to fetch `viral_dna`.
        - Display tags (e.g. "Hook: Contrarian", "Emotion: Greed") as sleek badges.
        - Add tooltips explaining the mechanic.
      - **Why:** Delivers the "OMG" moment where the AI explains the psychology.
      - **Status:** Done. Interfaces updated, AI prompt enhanced, UI badges added.

---

## COMPLETED
- [x] **Configure Apify Viral Data Collector** ✅
      - **Goal:** Switch from raw scraping to "Safe" Apify API integration.
      - **Results:**
        - ✅ Setup `fatihtahta/reddit-scraper-search-fast` actor ($1.49/1k cost).
        - ✅ Bypassed monthly rental fees using usage-based actor.
        - ✅ Integrated `collect-viral-data-apify.ts` with Supabase.
      - **Impact:** Legal, compliant, and scalable viral data pipeline.

- [x] **Integrate Benchmark Score into Viral Score Algorithm** ✅
      - **Goal:** Wire the new `viral-benchmarks.ts` library into the existing Viral Score calculation.
      - **Results:**
        - ✅ Updated `lib/viral-score.ts` to call `getBenchmarkScore`.
        - ✅ Added "Benchmark Score" (0-20 pts) to the calculation logic.
        - ✅ Updated `TrendWithViralScore` interfaces in `TrendDiscovery.tsx` and `TrendingTopicsPreview.tsx` to prevent type errors.
        - ✅ Updated UI copy to explain "Proven Viral Patterns".
      - **Impact:** Viral Scores now boosted by real-world performance data.

- [x] **Build Reddit Viral Data Collector** ✅
      - **Goal:** Create a dataset of "Proven Viral Hits" to train the Viral Score™ algorithm.
      - **Source:** Reddit JSON API (`r/all`, `r/entrepreneur`, `r/marketing`, `r/technology`, `r/business`).
      - **Deliverable:** A populated database table with ~10,000+ high-performance headlines.
      - **Results:**
        - ✅ Script validated and running (Daily + Backfill modes working).
        - ✅ Database migration verified.
        - ✅ Benchmarking logic library integrated.
      - **Why:** Moves Viral Score from "Heuristic Guessing" to "Statistical Pattern Matching".

- [x] **Stripe Payment Integration Testing** ✅
      - **Problem:** Subscription sync failing after successful Stripe checkout
      - **Root Cause:** `profiles` table was missing `subscription_started_at` column
      - **Fix:** Removed references to non-existent columns in sync-session and webhook routes
      - **Status:** WORKING - Test payments now successfully upgrade user tier
      - **Reference:** See `docs/SYSTEM/STRIPE_TESTING.md` for full details

- [x] **Standardize Spinner: Use BouncingDots Everywhere** ✅
      - **Problem:** Multiple spinner styles exist (rotating circles with fire, etc.). Inconsistent UX.
      - **Solution:** Replace ALL loading spinners with the BouncingDots component (three bouncing dots)
      - **Component:** `components/ui/bouncing-dots.tsx`
      - **Files to Audit:**
        - Campaign creation wizard (loading states)
        - Trend discovery loading
        - Content generation loading
        - Any other loading states throughout the app
      - **Requirement:** BouncingDots is the ONLY spinner for user-facing loading states

- [x] **Campaign Creation Aesthetics Upgrade** ✅
      - **Problem:** Campaign wizard needed capitalization on premium SaaS feel.
      - **Solution:**
        - **Card 1 (Name):** Implementing glassmorphism, removing heavy neon borders, adding subtle mesh gradients.
        - **Card 3 (Path):** Converted large buttons to interactive Feature Cards with grid layout and rich hover states.
      - **Result:** Visuals now match the high-end landing page aesthetic without altering functionality.
      - **Files:** `app/(portal)/campaigns/create/page.tsx`
- [x] **Campaign UI Cleanup** 🎨
      - **Branch:** `ui/campaign-cleanup` (safe rollback available)
      - **Problem:** Campaign creation wizard needs polish and V1 alignment
      - **V1 SIMPLIFICATION CHANGES (CRITICAL):**
        - [x] **REMOVE "Promote" option entirely** - Not part of V1 (see V1_Simplification.md)
        - [x] **Rename "Trending Now"** → "Discover Viral" or "Viral Discovery"
          - Description: "AI predicts what will go viral" (NOT "what's trending now")
        - [x] **Keep "Your Trend"** → Consider "Validate Idea"
          - Description: "Check if your idea will go viral before posting"
      - **UI Polish:**
        - [x] Clean up Campaign Name step (Step 1)
          - Better placeholder text
          - More polished input styling
          - Button styling consistency
        - [x] Audit all campaign wizard steps for visual consistency
        - [x] Ensure all steps match the coral/tron theme
        - [x] Check button states (hover, disabled, active)
        - [x] Improve spacing and typography
        - [x] Add subtle animations/transitions where appropriate
        - [x] Test responsive layout (mobile-first)
      - **Files to Audit:**
        - `app/(portal)/campaigns/create/page.tsx`
        - `app/(portal)/campaigns/create/components/*.tsx`
        - `app/(portal)/campaigns/[id]/CampaignDetailClient.tsx`
        - `components/TrendDiscovery.tsx` (Card 3 direction options)
      - **Guiding Principle:** V1 = Discovery + Validate. No Promote. Modern, clean, professional.
- [x] **Restore Viral Trend Discovery UI to Production State** ✅
      - Restored 7-card wizard flow from production
      - Added Promote as 3rd option on Card 3 ("Which direction do you want to go?")
      - Added Card 8 for PromoteInput wizard
      - Updated generateContent() and saveCampaign() for promote campaigns
- [x] **Landing Page Copy Update: Align with Current Product Reality** ✅
      - **Problem:** Landing page makes publishing promises that are currently DISABLED. Missing new features (Promote, Google Drive).
      - **Files to Update:**
        - `components/sections/StatsSection.tsx`
        - `components/sections/FAQSection.tsx`
        - `components/sections/ModernFeatures.tsx`
        - `components/sections/ModernHero.tsx`
      - **Requirements:**
        - [x] **StatsSection.tsx:** Change "100% Automated Publishing" to something honest (e.g., "100% AI-Powered" or "Full Campaign Creation")
        - [x] **FAQSection.tsx:** Update "Which platforms does it support?" answer - remove publishing claims, focus on content creation + scheduling coming soon
        - [x] **FAQSection.tsx:** Update "Can I schedule content in advance?" - soften to "coming soon" or remove
        - [x] **FAQSection.tsx:** Review all answers for publishing promises and update to reflect current reality
        - [x] **ModernFeatures.tsx:** ContentFlow™ claims "One-click publishing to 6 platforms" - mark as "Coming Soon" or update description
        - [x] **ModernHero.tsx:** Consider adding "Promote" feature mention (AI-powered content creation with media analysis)
        - [x] **Optional:** Add Google Drive integration / media analysis as a feature highlight
        - [x] **Optional:** Mention guided wizard UX as a selling point
      - **Guiding Principle:** Be honest about current capabilities. Use "Coming Soon" badges where appropriate. Highlight what DOES work: trend discovery, AI content generation, Promote feature, Viral Score predictions.
      - **Reference:** See `docs/SYSTEM/VISION.md` for current feature status

- [x] **Promote UX: Target Audience Preset Options** ✅
      - **File:** `app/(portal)/campaigns/create/components/PromoteInput.tsx`
      - **Step:** Step 5 (Target Audience / "Who is this for?")
      - **Problem:** User has to type audience manually - friction and requires thinking
      - **Solution:** Add clickable preset chips/buttons that auto-fill the field, plus manual entry option
      - **Requirements:**
        - [x] Add preset audience options as clickable chips (e.g., "Professionals", "Small Business Owners", "Entrepreneurs", "Marketers", "Developers", "Creatives", "Students", "Gen Z", "Parents", etc.)
        - [x] Clicking a chip inserts that value into the Target Audience field
        - [x] Allow selecting multiple chips (comma-separated in field)
        - [x] Keep the text input for custom/manual entry
        - [x] Chips should have selected/unselected visual states
        - [x] Consider a "Custom" chip that focuses the text input
      - **Design:** Match existing Tron theme - chips with cyan/magenta accent on select
      - **Reference:** Similar to tag selection UIs

- [x] **Site-Wide Icon Upgrade: Lucide → Phosphor Icons** ✅
      - Replaced 69 files with Phosphor Icons (duotone weight)
      - Modernized icon aesthetic to complement Tron theme
- [x] **Promote UX: Remaster Content Focus for Promotion Campaigns** ✅
      - Replaced generic content options with promotion-focused angles
      - New options: Product Launch, Feature Highlight, Customer Success, etc.
- [x] **Promote UX: Multi-Step Wizard Flow** ✅
      - Converted PromoteInput to 6-step wizard with Back/Next navigation
      - Progress indicator (Step X of 6) with progress bar
      - Smooth animations between steps
- [x] **Promote Phase 2: Add User Guidance for Google Drive Integration** ✅
      - Added "How Xelora analyzes your media" info section
      - Explained Option 1 (Google Drive) and Option 2 (Direct Upload)
      - Added "Zero Storage Policy" indicator
- [x] **Configure OAuth credentials for seamless platform publishing** ✅
      - TikTok, Facebook/Instagram credentials configured
      - Routes verified and active
- [x] Facebook OAuth Setup for Xelora SaaS ✅
      - Pivoted to basic authentication flow (`email, public_profile`) for initial login
      - Prepared infrastructure for incremental permissions after Business Verification
      - Aligned entire publisher and callback stack with Graph API v13.0
      - Verified local development redirect and environment configuration
      - **STATUS**: ON HOLD (Awaiting LLC registration and Meta Business Verification)
- [x] Add YouTube OAuth and publishing ✅
- [x] Analytics dashboard v2 (visual analytics + progress tracking)
      - Created ActivityChart component with Recharts (7-day area chart) ✅
      - Created QuickWins component (achievement celebration cards) ✅
      - Created ProgressTracker component (milestone checklist) ✅
      - Built useDashboardStats hook for API integration ✅
      - Integrated all V2 components into DashboardClient ✅
      - Created ANALYTICS_DASHBOARD_V2.md (comprehensive strategy doc) ✅

- [x] Unified onboarding flow (strategic, re-accessible product tour)
      - Created Step 0: Value Prop Intro with WelcomeAnimation hooks ✅
      - Integrated 5 punchy slides: Viral Score, trending topics, AI content ✅
      - Removed WelcomeAnimation from dashboard (now in onboarding only) ✅
      - Added "Take Product Tour" button to FirstTimeHelpBanner ✅
      - Updated middleware to allow tour re-access via ?tour=true ✅
      - Created UNIFIED_ONBOARDING.md (comprehensive strategy doc) ✅

- [x] Analytics dashboard v1 (simple, confidence-building metrics)
      - Created ANALYTICS_DASHBOARD_V1.md (comprehensive strategy document) ✅
      - Created /api/dashboard/stats endpoint for real-time metrics ✅
      - Enhanced DashboardClient with confidence-building copy ✅
      - Shows real data: Campaigns, Content Pieces, Platform Posts, Days Building ✅
      - No more placeholder zeros - all metrics meaningful ✅

- [x] Improve XELORA onboarding copy (first-time user clarity)
      - Created XELORA_ONBOARDING_COPY.md (comprehensive onboarding guide) ✅
      - Updated WelcomeAnimation to be clearer and faster ✅
      - Fixed OnboardingTour branding (CCAI → XELORA) ✅
      - Improved OnboardingTour copy with clear value props ✅
      - Added value props to onboarding page steps ✅
      - Updated localStorage keys (ccai → xelora) ✅

- [x] Helix capability surface (explain what it can do today vs later)
      - Created HELIX_CAPABILITIES.md (comprehensive capability doc) ✅
      - Created HELIX_USER_COPY.md (user-facing copy library) ✅
      - Updated HelixWidget welcome message for clarity ✅
      - Updated session limit messaging ✅

- [x] Update press packs to align with approved VISION.md
      - Rename TrendPulse → XELORA ✅
      - Verify pricing tiers ✅
      - Keep CCAI as enterprise mothership ✅
      - Fixed: Founder name → James Lawson ✅

---

## LATER (Vision-aligned, not urgent)
- [ ] AI Studio (brand-trained agents per customer)
- [ ] Workflow automation & scheduling
- [ ] White-label / middleware APIs for SMBs
- [ ] Local / private AI option for businesses

---

## PARKED (Ideas only, no commitment)
- [ ] Marketplace for agents / workflows
- [ ] Agency reseller program
- [ ] Hardware appliance for local AI
