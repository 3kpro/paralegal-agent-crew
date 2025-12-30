# TASKS.md
Last Updated: 2025-12-29

This file lists the ONLY work that should be actively considered.
If it's not here, it's not a task.

---
## NOW (One at a time only)

- [x] **Standardize Spinner: Use BouncingDots Everywhere**
      - **Problem:** Multiple spinner styles exist (rotating circles with fire, etc.). Inconsistent UX.
      - **Solution:** Replace ALL loading spinners with the BouncingDots component (three bouncing dots)
      - **Component:** `components/ui/bouncing-dots.tsx`
      - **Files to Audit:**
        - Campaign creation wizard (loading states)
        - Trend discovery loading
        - Content generation loading
        - Any other loading states throughout the app
      - **Requirement:** BouncingDots is the ONLY spinner for user-facing loading states

---

## COMPLETED
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
