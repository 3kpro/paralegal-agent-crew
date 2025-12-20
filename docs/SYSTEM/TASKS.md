# TASKS.md
Last Updated: 2025-12-18

This file lists the ONLY work that should be actively considered.
If it's not here, it's not a task.

---
## NOW (One at a time only)
- [ ] **Configure OAuth credentials for seamless platform publishing**
      - [ ] TikTok
      - [ ] Facebook/Instagram
      - [ ] Add CLIENT_ID and CLIENT_SECRET to environment
      - [ ] Test all OAuth flows

## COMPLETED
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
