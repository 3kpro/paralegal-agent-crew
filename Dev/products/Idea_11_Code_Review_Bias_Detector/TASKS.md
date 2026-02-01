# TASKS - Idea 11: Code Review Bias Detector (ReviewLens)

## NOW
- [ ] **Debug Analysis Endpoint "Subscription Required" Error** 🔍 (2026-02-01)
      - **Goal:** Investigate and fix why the `/analysis` endpoint still returns 402 "Subscription required" error even after disabling subscription checks
      - **Current Status:**
        - GitHub OAuth flow working (user can connect and get token)
        - User can enter repo name and click "Start Analysis"
        - Still getting "Error: Subscription required to start analysis"
        - Subscription check in `backend/src/dependencies.py` was disabled (commit b3650913)
        - Network tab shows "only network condition" - request may not be reaching backend
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

## NEXT
- [x] **GitLab Integration** 🦊 ✅ (2026-01-29)
      - **Details:** OAuth, `GitLabIngestionService`, and platform toggle in Dashboard.
      - **Assigned:** Gemini
- [x] **Export Reports** 📋 ✅ (2026-01-29)
      - **Details:** PDF (ReportLab) and CSV export options.
      - **Assigned:** Gemini

## BACKLOG
(empty)

## COMPLETED
- [x] **Integrate Shared Auth** 🔐 ✅ (2026-01-29)
      - **Details:** Connected frontend to Marketplace Supabase instance.
      - **Implementation:** `AuthContext.tsx` provider and `useAuth` hook in Dashboard.
