# TASKS.md - XELORA Product
Last Updated: 2026-01-19

This file lists XELORA product-specific tasks only.

**Task Organization:**
- **XELORA tasks:** This file (landing-page/docs/SYSTEM/TASKS.md)
- **Company tasks:** `3kpro-website/docs/SYSTEM/TASKS.md` (Google setup, marketplace, SEO)
- **Dev/ products:** `Dev/products/[product]/TASKS.md` (per-product tasks)

---

## NOW

- [ ] **Campaign Creation UI/UX: Command Center Overhaul** 🚀
      - **Problem:** Current campaign creation flow feels like a standard form. Users need to feel like they're engineering virality, not just filling out text boxes.
      - **Goal:** Transform `/campaigns/create` into a "Viral Prediction Command Center" with real-time feedback, live previews, and instant AI scoring.
      - **Action:**
        - Build 3-column layout: Config (20%) | Editor (45%) | Preview+Score (35%)
        - Implement Viral Score Gauge with instant local heuristic scoring + debounced AI validation (2s)
        - Create live platform previews (Twitter/LinkedIn/Facebook) that update on every keystroke
        - Add "Supercharge" button with AI-powered content variations modal
        - Build mobile FAB (floating action button) + bottom sheet for score display
        - Use Zustand for state management, Framer Motion for animations
      - **Reference:**
        - `docs/features/New_UI_UX.md` (Design vision + technical specs)
        - `docs/features/COMMAND_CENTER_IMPLEMENTATION_PLAN.md` (Step-by-step guide)
      - **Timeline:** 3-5 days (7 phases: dependencies → components → integration → mobile → supercharge → testing → polish)
      - **Location:** `app/(portal)/dashboard/campaigns/create/page.tsx` and new components in `components/campaign/`
      - **Priority:** HIGH - Core Product Differentiator
      - **Assigned:** Gemini

---



## COMPLETED

- [x] **Final Gemini Model Sweep & Cleanup** 🧹 ✅
      - **Problem:** Scattered references to legacy `gemini-1.5` and `vertex-ai` SDKs could cause inconsistency or future breakage.
      - **Action:**
        - Updated legacy scripts (`enrich-viral-data-vertex.ts`, `generate-training-data.ts`) to `gemini-2.0-flash`.
        - Updated test scripts and Supabase default config.
        - Verified production fix via debug endpoint (`gemini-2.0-flash` confirmed working).
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page`
      - **Assigned:** Antigravity

- [x] **Fix Gemini AI Model Rate Limits (429 Error)** 🤖 ✅
      - **Problem:** `localhost:3000` was giving generic data due to `429 Too Many Requests` errors from the Gemini API. The code was attempting to use `gemini-2.5-flash` which is invalid or causing issues, and hitting rate limits on the free tier.
      - **Action:**
        - Updated `lib/gemini.ts`, `app/api/trends/route.ts`, `lib/viral-score.ts`, `app/api/generate/route.ts`, and `app/api/test-gemini/route.ts` to use `gemini-1.5-flash` (valid model).
        - Increased rate limit delay in `app/api/trends/route.ts` from 1500ms to 4000ms to respect the 15 RPM limit of the free tier.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page`
      - **Assigned:** Antigravity

- [x] **Fix Data Inconsistency in Campaign Saving (Issue #1)** 💾 ✅
      - **Problem:** Campaign saving involved multiple database calls, risking partial failures (zombie campaigns).
      - **Action:**
        - Created SQL RPC function `upsert_campaign_with_posts` for atomic transactions.
        - Refactored `saveCampaign` in `app/(portal)/campaigns/create/page.tsx` to use the RPC.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page`
      
      - **Assigned:** Antigravity

- [x] **Harden AI-Powered Features (Viral Score & Trend Generation)** 🛡️ ✅
      - **Problem:** The Viral Score and AI-generated trends were fragile due to regex-based parsing and decentralized client logic.
      - **Goal:** Make AI features resilient for beta users.
      - **Action:**
        - Created `lib/gemini.ts` for centralized client management with fail-fast logic.
        - Refactored `viral-score.ts` and `app/api/trends/route.ts` to use Gemini JSON mode (`responseMimeType: "application/json"`).
        - Improved error handling and fallback degradation (no more 20 vs 70 cliffs).
      - **Reference:** `docs/GE_SUGGESTIONS.md` Issue #2
      - **Assigned:** Gemini

- [x] **Scaffold Idea 11: Code Review Bias Detector (ReviewLens)** 🛠️ ✅
      - **Goal:** Initialize project structure and core stack for code review analysis.
      - **Action:** Created `src/` (FastAPI), `dashboard` (React+Vite), `TRUTH.md`, and requirements.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **GitHub OAuth Integration for ReviewLens** 🐙 ✅
      - **Goal:** Enable users to log in with GitHub to access their repositories.
      - **Action:** Implemented OAuth endpoints in FastAPI and React auth flow.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **PR History Ingestion for ReviewLens** 📥 ✅
      - **Goal:** Fetch and store pull request history for analysis.
      - **Action:** Built `GitHubIngestor` service and `SQLAlchemy` models for PRs/Reviews/Comments.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **Review Pattern Analysis for ReviewLens** 📊 ✅
      - **Goal:** Calculate key metrics to identify review bottlenecks and potential bias.
      - **Action:** Implemented `Analyzer` service with matrix generation and anomaly detection algorithms.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **Comment Classifier for ReviewLens** 🧠 ✅
      - **Goal:** Automatically categorize review comments and detect tone.
      - **Action:** Integrated Anthropic API (Claude 3 Haiku) to classify comments (Nitpick vs. Architecture) and tone (Constructive vs. Harsh).
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **Bias Detection Algorithm for ReviewLens** ⚖️ ✅
      - **Goal:** Identify statistically significant bias in review patterns.
      - **Action:** Implemented logic to detect "Nitpick Focus" and "Harsh Tone" anomalies between specific Reviewer-Author pairs.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **Dashboard Visualizations for ReviewLens** 📈 ✅
      - **Goal:** Provide actionable insights via a visual interface.
      - **Action:** Built React dashboard with KPI cards, interaction charts, and a prioritized Risk Feed.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **GitLab Integration for ReviewLens** 🦊 ✅
      - **Goal:** Expand support to GitLab repositories.
      - **Action:** Implemented `GitLabIngestor` to normalize GitLab MRs/Notes into the ReviewLens schema using `httpx`.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **Export Reports for ReviewLens** 📋 ✅
      - **Goal:** Allow users to download audit data.
      - **Action:** Created `ReportExporter` to serialize analysis results into CSV/JSON formats.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page\Dev\products\Idea_11_Code_Review_Bias_Detector`
      - **Assigned:** Antigravity

- [x] **Helix AI: Context-Aware Workflow Integration** 🤖 ✅
      - **Problem:** Helix feels like a generic chatbot, not an intelligent assistant integrated into Xelora workflows.
      - **Action:** 
        - Created `HelixContext` to manage cross-application state.
        - Wrapped Portal Layout in `HelixProvider`.
        - Updated `HelixWidget.tsx` and `HelixChatInterface.tsx` to send rich context (selections, page content) and render Action Buttons.
        - Updated `/api/helix/chat` to consume context and use it in system prompts.
        - Implemented deep integration in `campaigns/create/page.tsx` with registered Actions (`select_highest_trend`, `optimize_settings`).
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page`
      - **Assigned:** Antigravity

- [x] **Fix Xelora Site Logo** 🎨 ✅
      - **Problem:** Xelora.app was displaying an incorrect/outdated logo.
      - **Action:** Updated `components/XeloraLogo.tsx` to use `WH_TR_LOGO.png`.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page`
      - **Assigned:** Antigravity


- [x] **Contract Analyzer (Tool 2): Testing & UI Refinement** ✅
      - **Goal:** Robustly test the AI risk analysis engine and polish the UI/UX for launch.
      - **Action:** Implemented comprehensive test suite, multi-format parsing verification, and high-fidelity UI animations. Verified mobile responsiveness and legal disclaimer integration.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\idea_04_MICRO_SAAS_TOOLS\contract-analyzer`
      - **Assigned:** Antigravity

- [x] **Severity Filtering for Idea 10** ⚠️ ✅
      - **Goal:** Filter noise to focus on critical changes.
      - **Action:** Added backend query filtering and frontend UI controls.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **Timeline Calendar UI for Idea 10** 📅 ✅
      - **Goal:** Visualize change timeline for users.
      - **Action:** Built React dashboard with Tailwind+Framer Motion.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **Slack Integration for Idea 10** 🔔 ✅
      - **Goal:** Real-time alerts for breaking changes.
      - **Action:** Implemented `SlackNotifier` with block-kit formatting.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **GitHub Release Monitor for Idea 10** 🐙 ✅
      - **Goal:** Direct monitoring of GitHub Releases for tech stack updates.
      - **Action:** Implemented `GithubMonitor` interacting with GitHub's REST API.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **Classification Engine for Idea 10** 🧠 ✅
      - **Goal:** AI-powered analysis of changelog entries to detect breaking changes.
      - **Action:** Implemented `ChangeClassifier` using Claude 3 Haiku and integrated into pipeline.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **RSS Feed Parser for Idea 10** 📡 ✅
      - **Goal:** Support standard RSS/Atom feeds for changelog monitoring.
      - **Action:** Implemented `RssParser` and integrated it into the scan pipeline.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **Changelog Scraper for Idea 10** 🔍 ✅
      - **Goal:** Extract changelog entries from standard HTML pages.
      - **Action:** Implemented Playwright/BeautifulSoup scraper with header-based heuristics.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **API Registry Schema for Idea 10: API Deprecation Watchdog** 📊 ✅
      - **Goal:** Define data models for APIs and their changes.
      - **Action:** Implemented SQLAlchemy models (`ApiRegistry`, `ApiChange`) and FastAPI endpoints.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **Scaffold Idea 10: API Deprecation Watchdog (BreakingChange)** 🛡️ ✅
      - **Goal:** Initialize project structure and core stack for API monitoring.
      - **Action:** Created `src/backend` (FastAPI), `src/frontend` (React), `TRUTH.md`, and requirements.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog`
      - **Assigned:** Antigravity

- [x] **Implement Dashboard Auth for Idea 06: Trial Recovery Engine (TrialRevive)** 🔐 ✅
      - **Goal:** Secure the dashboard with a simple access control gateway.
      - **Action:** Implemented `LoginGateway` component and auth state logic.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_06_Trial_Recovery_Engine`
      - **Assigned:** Antigravity

- [x] **Implement Custom Playbook Editor UI for Idea 06: Trial Recovery Engine (TrialRevive)** 🎨 ✅
      - **Goal:** Allow product teams to customize recovery templates via dashboard.
      - **Action:** Built `PlaybookEditor` React component with realtime preview.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_06_Trial_Recovery_Engine`
      - **Assigned:** Antigravity

- [x] **Implement Advanced Cohort Analysis for Idea 06: Trial Recovery Engine (TrialRevive)** 📉 ✅
      - **Goal:** Group users by signup cohort to track long-term recovery LTV.
      - **Action:** Implemented `CohortAnalyzer` and analytics endpoints.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_06_Trial_Recovery_Engine`
      - **Assigned:** Antigravity

- [x] **Implement Direct CRM Sync for Idea 06: Trial Recovery Engine (TrialRevive)** 🗄️ ✅

- [x] **Implement Predictive Churn Scoring for Idea 06: Trial Recovery Engine (TrialRevive)** 🔮 ✅

- [x] **Implement Self-Service Trial Extensions for Idea 06: Trial Recovery Engine (TrialRevive)** 🛠️ ✅

- [x] **Implement Zapier/n8n Native Integration for Idea 06: Trial Recovery Engine (TrialRevive)** ⚡ ✅

- [x] **Implement Automated Retries & Robustness for Idea 06: Trial Recovery Engine (TrialRevive)** 🔄 ✅

- [x] **Implement Advanced ROI Dashboard for Idea 06: Trial Recovery Engine (TrialRevive)** 📊 ✅

- [x] **Implement Direct Slack Interactive Triggers for Idea 06: Trial Recovery Engine (TrialRevive)** 💬 ✅

- [x] **Implement Success Tracking & ROI loops for Idea 06: Trial Recovery Engine (TrialRevive)** 📈 ✅

- [x] **Implement Multi-Org Support for Idea 06: Trial Recovery Engine (TrialRevive)** 🏢 ✅

- [x] **Implement Advanced AI Personalization for Idea 06: Trial Recovery Engine (TrialRevive)** 🤖 ✅

- [x] **Project Idea 06: Trial Recovery Engine (TrialRevive) — MVP COMPLETE** 🚀 ✅

- [x] **Scaffold Idea 04: Invoice Generator (Tool 1)** ✅
      - **Goal:** Build full-stack MVP for Invoice Generator.
      - **Action:** Created Next.js app, implemented PDF Export (jspdf), Template System (5 themes), Email Delivery (Resend), and History (Supabase).
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\idea_04_MICRO_SAAS_TOOLS`
      - **Assigned:** Antigravity

- [x] **Scaffold Idea 04: Contract Analyzer (Tool 2)** ✅
      - **Goal:** Build MVP of AI Contract Analyzer.
      - **Action:** Created Next.js app, File Upload System (react-dropzone), and /analyze page.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\idea_04_MICRO_SAAS_TOOLS\contract-analyzer`
      - **Assigned:** Antigravity

- [x] **Scaffold Idea 08: Meeting Commitment Extractor (PactPull)** ✅
      - **Goal:** Initialize and build MVP for meeting commitment extraction agent.
      - **Action:** Created `src` structure, implemented Transcription (Deepgram), Extraction (Claude), and Integrations (Asana, Linear, Slack). Built React Dashboard.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_08_Meeting_Commitment_Extractor`
      - **Assigned:** Antigravity

- [x] **Migrate Demo Video to Cloud Storage** ☁️ ✅
      - **Goal:** Host the demo video on cloud storage (Supabase) to enable production access and reduce repo size.
      - **Action:** Uploaded video to `media` bucket, updated component with cloud URL, and deleted local file.
      - **Status:** Done. Video URL: `https://hvcmidkylzrhmrwyigqr.supabase.co/storage/v1/object/public/media/marketing/Xelora_demo_YT_final.mp4`
      - **Assigned:** Antigravity

- [x] **Embed Demo Video on Landing Page** 🎬 ✅
      - **Goal:** Replace placeholder video section with actual local demo video
      - **Video Location:** `C:\DEV\3K-Pro-Services\landing-page\public\media\DemoVideo\Xelora_demo_YT_final.mp4`
      - **Implementation:** HTML5 Video Tag (Local)
      - **File to Update:** `components/sections/DemoVideoSection.tsx`
      - **Requirements:**
        - Replace the mock play button/placeholder with a standard HTML5 video player
        - Use local source path `/media/DemoVideo/Xelora_demo_YT_final.mp4`
        - Keep the section header: "Watch How It Works"
        - Update duration badge from "2:34" to actual video length (~60 seconds)
        - Update label from "Full Product Demo" to "60-Second Demo"
        - **REMOVE AI-branded feature cards below video:**
          - Remove "XELORA™ Discovery" card
          - Remove "AI Cascade™ Generation" card
          - Remove "OmniFormat™ Publishing" card
        - **NO AI ICONS** - keep it clean and minimal
        - Keep the glassmorphism/tron aesthetic
        - Ensure video thumbnail shows before play (YouTube handles this)
        - Mobile responsive (16:9 aspect ratio maintained)
      - **Copy Updates:**
        - Subtitle: "See how XELORA decodes Viral DNA and generates content in seconds."
        - Remove any "publishing" claims (V1 doesn't publish)
      - **Optional Enhancement:** Add a "Watch on YouTube" text link below the embed
      - **Assigned:** Antigravity

- [x] **Add XELORA Demo Link to 3kpro.services** 🔗 ✅
      - **Goal:** Cross-promote XELORA demo video on the company website
      - **Location Options (pick one):**
        1. Add to XELORA card on `/marketplace` page - "Watch Demo" button/link
        2. Add a "Featured Product" banner on homepage with video thumbnail
        3. Add to the hero section as "See our flagship product in action"
      - **File:** `3kpro-website/app/marketplace/page.tsx` or `3kpro-website/lib/data/marketplace.ts`
      - **Requirements:**
        - Clean, minimal design - no flashy animations
        - Professional appearance matching 3kpro brand
        - Link should open xelora.app or YouTube video directly
        - **NO AI ICONS**
      - **Assigned:** Antigravity

- [x] **Update Site Logo** 🎨 ✅
      - **Goal:** Update the Xelora brand logo to the final version.
      - **Action:** Copied `LogoFinal_TR.png` and updated `XeloraLogo.tsx`.
      - **Location:** `C:\DEV\3K-Pro-Services\landing-page`
      - **Assigned:** Antigravity

- [x] **Scaffold Idea 1: n8n Workflow Marketplace** ✅
      - **Goal:** Initialize project structure for n8n workflow product.
      - **Action:** Created `TRUTH.md` from template, created `workflows`, `docs`, `assets` directories.
      - **Location:** `C:\DEV\3K-Pro-Services\Dev\products\Idea _01_N8N`
      - **Assigned:** Antigravity

- [x] **3kpro.services Marketplace Scaffolding** 🛍️ ✅
      - **Goal:** Add a component to showcase and sell applications, micro SaaS, workflows, etc. using Stripe.
      - **Solution:** Scaffolded a `/marketplace` route with a data-driven product list (`lib/data/marketplace.ts`), product detail pages, and Stripe Payment Link integration. Branch `feature/marketplace` created and tested.
      - **File:** `app/marketplace/page.tsx`, `lib/data/marketplace.ts`
      - **Assigned:** Antigravity


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
- [ ] **Social Media Publishing** 📱
      - **Reason:** Blocked on Meta Business Verification (requires LLC registration)
      - **Platforms:** Instagram, Facebook (TikTok, LinkedIn, Twitter have simpler auth but deprioritized)
      - **Decision:** XELORA V1 is Discovery + Validate only (no publishing)
      - **Revisit:** After LLC setup and Meta verification complete
- [ ] Marketplace for agents / workflows
- [ ] Agency reseller program
- [ ] Hardware appliance for local AI
