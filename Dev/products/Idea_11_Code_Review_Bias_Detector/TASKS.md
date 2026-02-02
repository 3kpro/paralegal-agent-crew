# TASKS - Idea 11: Code Review Bias Detector (ReviewLens)

## NOW
## Task: Fix Dashboard State Persistence and Deep Analysis Auto-Refresh

**Issues:**

1. **Dashboard loses state on page refresh**
   - When user refreshes the page, all analysis results disappear
   - User has to re-enter repo and re-run analysis
   - Need to persist current repo name (at minimum) in localStorage or URL params

2. **"Run Deep Analysis" doesn't update charts**
   - User clicks "Run Deep Analysis" button
   - Gets success message: "Successfully classified comments using Claude"
   - But Comment Categories and Comment Tone sections still show "No data available"
   - Dashboard needs to auto-refetch analysis results after classification completes

**Expected Behavior:**
- After page refresh: Dashboard should remember the last analyzed repo and show results
- After "Run Deep Analysis": Comment Categories and Tone charts should populate with classification data

**Files to Modify:**
- `frontend/src/pages/Dashboard.tsx` - Add localStorage persistence and post-classification refetch
- Consider: Store `repoName` in localStorage on analysis, restore on mount

**Priority:** MEDIUM (UX improvement)





- [x] **Fix Black Screen on Analysis - Use Browser Testing** 🐛 (2026-02-01)
      - **Goal:** Debug and fix the black screen that appears when clicking "Start Analysis" button
      - **Current Status:**
        - **Fixed:** Backend route `reports/health-check` was missing `:path` converter for slashes. Frontend `MetricCard` hardened.
        - **Verified:** Local backend test confirmed endpoint returns data.
      - **IMPORTANT - USE BROWSER FOR TESTING:**
        - User enters repo name (e.g., "facebook/react")
        - Clicks "Start Analysis"
        - Black screen appears immediately
        - Console shows JavaScript errors
      - **IMPORTANT - USE BROWSER FOR TESTING:**
        - **YOU HAVE BROWSER ACCESS** - Use it to test and debug this issue
        - Open the deployed app in browser: https://frontend-mzbvwww3e-3kpros-projects.vercel.app
        - Test the analysis flow: Enter "facebook/react" and click "Start Analysis"
        - Use browser DevTools to inspect console errors
        - Check Network tab for failed requests
        - Identify the root cause before attempting fixes
      - **Console Errors Reported:**
        ```
        index-DYpO0zWi.js:85 Uncaught TypeError: r.slice is not a function
        GET https://striking-liberation-production.up.railway.app/reports/health-check/facebook%2Freact 404 (Not Found)
        The width(-1) and height(-1) of chart should be greater than 0
        ```
      - **Investigation Steps:**
        1. Use browser to reproduce the issue at deployed URL
        2. Check console for actual error stack trace
        3. Check Network tab to see what API responses look like
        4. Identify which component is calling `.slice()` on non-array data
        5. Check if API endpoints are returning data in expected format
        6. Verify `trendsResult`, `insights`, `analysisResult` data structures
      - **Potential Issues:**
        - API returning data in unexpected format (not arrays)
        - Component trying to render before data is ready
        - Missing error boundaries causing full crash
        - Backend `/reports/health-check` endpoint doesn't exist (404)
      - **Files to Check:**
        - `frontend/src/pages/Dashboard.tsx` - Main analysis flow
        - `frontend/src/components/AIInsightPanel.tsx` - May be calling `.map()` on bad data
        - `frontend/src/components/Sparkline.tsx` - May be causing chart errors
        - `frontend/src/components/MetricCard.tsx` - Handles trend data
        - `backend/src/routers/analysis.py` - Check trends endpoint response format
      - **Success Criteria:**
        - User can click "Start Analysis" without black screen
        - Analysis results display properly
        - No JavaScript errors in console
        - All charts render correctly
      - **Priority:** CRITICAL (blocks core feature)
      - **Assigned:** Gemini
      - **Notes:** Multiple fixes attempted by Claude (array safety checks for insights, trendsResult, bias_alerts) but issue persists. Use browser testing to identify the actual root cause.

- [x] **Debug Analysis Endpoint "Subscription Required" Error** 🔍 (2026-02-01)
      - **Goal:** Investigate and fix why the `/analysis` endpoint still returns 402 "Subscription required" error even after disabling subscription checks
      - **Current Status:**
        - **Fixed:** Found and removed a redundant client-side subscription check in `Dashboard.tsx`.
        - **Verified:** User can now run analysis and export reports successfully.
        - **Note:** Backend and frontend bypasses are active for testing.
      - **Investigation Steps:**
        1. Check if request is actually reaching the backend (look for /analysis endpoint hits in Railway logs)
        2. Trace the exact error response from `/analysis/{repo}` endpoint
        3. Check if there's a CORS issue preventing the request
        4. Verify the Authorization header is being sent correctly from frontend
        5. Check if the error is coming from a different endpoint (not /analysis)
        6. Review ingestion endpoint flow - might be returning 402 from there instead
      - **Potential Issues:**
        - CORS blocking the request from Vercel → Railway
        - Authorization header not being sent/validated
        - Error coming from `/ingest` endpoint (which is called before `/analysis`)
        - Backend not fully redeployed with latest code changes
        - Request timeout or network connectivity issue
      - **Files to Check:**
        - `backend/src/routers/analysis.py` - Main analysis endpoint
        - `backend/src/routers/ingestion.py` - PR ingestion endpoint
        - `backend/src/dependencies.py` - Auth/subscription checks (already fixed)
        - `frontend/src/pages/Dashboard.tsx` lines 83-99 - Analysis fetch logic
      - **Success Criteria:**
        - Backend receives the request and processes it
        - Repo analysis starts running (shows loading state)
        - Results display on dashboard or error message comes from backend analysis (not subscription)
      - **Priority:** HIGH (blocks core feature testing)
      - **Assigned:** Gemini
      - **Notes:** User reports Network tab only shows "network condition", suggesting request may not be completing

- [x] **Fix GitHub OAuth "Connect GitHub" Button** 🐙 (2026-01-31)
      - **Goal:** Complete the GitHub OAuth flow so users can authorize repository access
      - **Problem:** Clicking "Connect GitHub" button on dashboard doesn't redirect to GitHub
      - **Fixed:** Robust `API_URL` fallback and lazy state initialization for token ingestion.
      - **Current Status:**
        - Frontend deployed to Vercel: `https://frontend-psi-jade-94.vercel.app`
        - Backend deployed to Railway: `https://striking-liberation-production.up.railway.app`
        - Backend `/auth/login` endpoint exists and works
        - VITE_API_URL env var set on Vercel, frontend rebuilt
      - **Investigation Needed:**
        1. Verify frontend is actually sending requests to Railway backend (check Network tab in DevTools)
        2. Test clicking "Connect GitHub" and report what URL it attempts to navigate to
        3. Check if Railway backend `/auth/login` returns proper GitHub OAuth redirect
        4. Verify GitHub OAuth app callback URL is still configured correctly
        5. Test full OAuth flow: click button → GitHub login → redirect back to dashboard with token
      - **Success Criteria:**
        - Button click redirects to GitHub authorization page
        - After authorization, redirects back to dashboard with `token` and `platform` URL params
        - Token stored in localStorage and user can analyze repositories
      - **Files:**
        - Frontend: `frontend/src/pages/Dashboard.tsx` (line 315, "Connect GitHub" button)
        - Backend: `backend/src/routers/auth.py` (/auth/login endpoint)
        - Config: Check Railway env vars (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, API_URL, FRONTEND_URL)
      - **Priority:** HIGH (blocks all repository analysis)
      - **Assigned:** Gemini
      - **Notes:** Database transaction bug in `github_service.py` was fixed (commit 8cc96457). This is separate OAuth connection issue.

- [x] **Build "Bottleneck" List** 🚨 ✅ (2026-01-31)
      - **Goal:** Table of PRs open >48 hours without review
      - **Action Items:**
        1. Query PRs where `first_review_at - created_at > 48 hours`
        2. Show: PR title, author, staleness (hours), assigned reviewers
        3. Sort by staleness (oldest first)
        4. Action button: "Nudge Reviewers" (send Slack/email reminder)
      - **Priority:** MEDIUM
      - **Assigned:** Gemini
      - **Spec Reference:** VELOCITY_PIVOT_SPEC.md Section 3A

- [x] **Phase 1: Dashboard UI/UX Foundation** 🎨 (2026-02-01)
      - **Goal:** Add contextual help and improve visual presentation to justify $149/month pricing
      - **Action Items:**
        1. Create `InfoTooltip.tsx` - Reusable tooltip with question mark icon
        2. Create `HelpModal.tsx` - Full explanation modal for metrics
        3. Create `MetricCard.tsx` - Premium card component with sparklines
        4. Create `Sparkline.tsx` - Mini trend chart using Recharts
        5. Modify `Dashboard.tsx` - Add tooltips to all metrics, redesign KPI cards
        6. Modify `ReviewStatsCharts.tsx` - Add explanatory text above charts
        7. Create backend endpoint `GET /analysis/{repo}/trends?days=7` (daily metric snapshots)
      - **Files to Create:**
        - `frontend/src/components/InfoTooltip.tsx`
        - `frontend/src/components/HelpModal.tsx`
        - `frontend/src/components/MetricCard.tsx`
        - `frontend/src/components/Sparkline.tsx`
      - **Files to Modify:**
        - `frontend/src/pages/Dashboard.tsx`
        - `frontend/src/components/ReviewStatsCharts.tsx`
        - `backend/src/routers/analysis.py`
        - `backend/src/services/analysis_service.py`
      - **Success Criteria:**
        - Every metric has explanatory tooltip
        - KPI cards show 7-day sparkline trends
        - Hover effects and smooth animations work
        - Dashboard feels premium and worth $149/month
      - **Priority:** HIGH (quick wins, immediate value)
      - **Assigned:** Gemini
      - **Spec Reference:** C:\Users\mark\.claude\plans\twinkling-chasing-rainbow.md Phase 1










- [x] **Build "Velocity Killer" Gauge** 🎯 ✅ (2026-01-31)
- [x] **Security: OAuth Scope Verification** 🔒 ✅ (2026-01-31)
- [x] **Create Health Check Aggregation Endpoint** 📊 ✅ (2026-01-31)
- [x] **Project Scaffolding** ✅
- [x] **GitHub OAuth Integration** 🐙
- [x] **PR History Ingestion** 📥
- [x] **Review Pattern Analysis** 📊
- [x] **Comment Classifier** 🧠
- [x] **Implement Stripe Integration** 💳 ✅ (2026-01-29)
- [x] **Bias Detection Algorithm** ⚖️ ✅ (2026-01-29)
- [x] **Dashboard Visualizations** 📈 ✅ (2026-01-29)
      - **Details:** Implemented D3/Recharts for interaction metrics and comment breakdown.
      - **Assigned:** Gemini


- [x] **Phase 3: AI Integration** 🤖 (2026-02-01)
      - **Goal:** Add AI-powered insights and "Ask AI" feature (differentiation for $149/month)
      - **Action Items:**
        1. Create `backend/src/services/insights_service.py` - AI insights engine
           - `generate_dashboard_insights(repo, data)` - Auto-generate top 3-5 insights
           - `explain_metric(metric, value, context)` - Natural language explanation
           - `detect_patterns(repo)` - Pattern detection (ghost PRs, bias, velocity drops)
        2. Create `AIInsightPanel.tsx` - Display auto-generated insights
        3. Create `AskAIButton.tsx` - Contextual AI query button
        4. Create `AIExplanationModal.tsx` - Show AI explanation in modal
        5. Create `InsightCard.tsx` - Individual insight card (Alert/Opportunity/Recognition)
        6. Add endpoints: `GET /insights/{repo}`, `POST /insights/ask`
        7. Extend `ai_service.py` for structured insights (JSON mode)
      - **Files to Create:**
        - `backend/src/services/insights_service.py`
        - `frontend/src/components/AIInsightPanel.tsx`
        - `frontend/src/components/AskAIButton.tsx`
        - `frontend/src/components/AIExplanationModal.tsx`
        - [x] Integrate AI components into `Dashboard.tsx` <!-- id: 8 -->
        - [x] Create `frontend/src/components/ReviewVelocityChart.tsx` <!-- id: 7 -->
        - `frontend/src/components/InsightCard.tsx`
      - **Files to Modify:**
        - [x] Verify AI features <!-- id: 9 -->
        - `frontend/src/pages/Dashboard.tsx` - Add insights section above KPIs
        - `backend/src/services/ai_service.py` - Extend for structured insights
        - `backend/src/routers/analysis.py` - Add insights endpoints
      - **Success Criteria:**
        - AI insights load within 3 seconds
        - "Ask AI" provides relevant explanations
        - Insights cached for 1 hour to reduce API costs
        - Users find insights actionable
      - **Priority:** HIGH (key differentiator, justifies pricing)
      - **Assigned:** Gemini
      - **Notes:** Estimated cost: $0 for testing (free tier), $7.50/month for 100 customers
      - **Spec Reference:** C:\Users\mark\.claude\plans\twinkling-chasing-rainbow.md Phase 3



- [x] **Phase 2: Data Enrichment** 📊 (2026-02-01)
      - **Goal:** Add time-series analysis and surface hidden backend metrics
      - **Action Items:**
        1. Add `MetricSnapshot` model to `backend/src/models.py` (store daily snapshots)
        2. Create `backend/src/services/snapshot_service.py`
           - `create_snapshot(repo)` - Store current metrics
           - `get_snapshots(repo, start, end)` - Retrieve historical data
        3. Create endpoints: `GET /analysis/{repo}/time-series`, `POST /analysis/{repo}/snapshot`
        4. Create `TimeSeriesChart.tsx` - Line/area chart for trends
        5. Create `ComparisonPanel.tsx` - Side-by-side period comparison
        6. Create `DateRangePicker.tsx` - Date range selector (7d, 30d, Quarter)
        7. Create `StalePRsTable.tsx` - Display PRs waiting >48hrs (uses existing `/bottlenecks/stale-prs`)
        8. Create `PickupTimeChart.tsx` - Histogram showing pickup time distribution
      - **Files to Create:**
        - `backend/src/services/snapshot_service.py`
        - `frontend/src/components/TimeSeriesChart.tsx`
        - `frontend/src/components/ComparisonPanel.tsx`
        - `frontend/src/components/DateRangePicker.tsx`
        - `frontend/src/components/StalePRsTable.tsx`
        - `frontend/src/components/PickupTimeChart.tsx`
      - **Files to Modify:**
        - `backend/src/models.py` - Add MetricSnapshot model
        - `frontend/src/pages/Dashboard.tsx` - Add date range state, integrate charts
        - `backend/src/services/analysis_service.py` - Add date filtering
        - `frontend/src/components/InteractionHeatmap.tsx` - Add color scale legend
        - `backend/src/routers/analysis.py` - Add time-series endpoints
      - **Success Criteria:**
        - Users can view 30+ day trends
        - Comparison shows week-over-week deltas
        - Stale PRs table shows actionable items
        - Pickup time histogram reveals bottlenecks
      - **Priority:** MEDIUM (depth, more backend work required)
      - **Assigned:** Gemini
      - **Spec Reference:** C:\Users\mark\.claude\plans\twinkling-chasing-rainbow.md Phase 2



- [x] **Phase 4: Polish & Mobile Optimization** ✨ (2026-02-01)
      - **Goal:** Animations, mobile optimization, final touches
      - **Action Items:**
        1. Add skeleton loading states (replace spinners)
        2. Add staggered card entry animations (framer-motion)
        3. Add number count-up animations (react-countup)
        4. Make grid responsive (Desktop: 4-col → Tablet: 2-col → Mobile: 1-col)
        5. Touch-friendly interactions (min 44px tap targets)
        6. Chart responsiveness (reduced font sizes, simplified tooltips on mobile)
        7. Enable Recharts animations (`isAnimationActive={true}`)
        8. Add mobile media queries to `frontend/src/index.css`
      - **Files to Modify:**
        - `frontend/src/pages/Dashboard.tsx` - Add animations, responsive breakpoints
        - All chart components - Enable animations
        - `frontend/src/index.css` - Mobile media queries
      - **Success Criteria:**
        - Smooth animations on load and updates
        - Dashboard usable on mobile (iPhone/Android tested)
        - No layout shifts or jank
        - Loading states appear before data loads
      - **Priority:** LOW (nice-to-have, polish layer)
      - **Assigned:** Gemini
      - **Spec Reference:** C:\Users\mark\.claude\plans\twinkling-chasing-rainbow.md Phase 4

## NEXT

- [x] **GitLab Integration** 🦊 ✅ (2026-01-29)
      - **Details:** OAuth, `GitLabIngestionService`, and platform toggle in Dashboard.
      - **Assigned:** Gemini
- [x] **Export Reports** 📋 ✅ (2026-02-01)
      - **Details:** PDF (ReportLab), CSV, and Markdown export options.
      - **Assigned:** Gemini

## BACKLOG
(empty)

## COMPLETED
- [x] **Integrate Shared Auth** 🔐 ✅ (2026-01-29)
      - **Details:** Connected frontend to Marketplace Supabase instance.
      - **Implementation:** `AuthContext.tsx` provider and `useAuth` hook in Dashboard.
