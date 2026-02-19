# TASKS - Idea 11: Code Review Bias Detector (ReviewLens)

## NOW
(empty)

## NEXT
(empty)

## BACKLOG
(empty)

## COMPLETED
- [x] **Implement Unit Tests for AI Service** 🧠 ✅ (2026-02-06)
      - **Goal:** Verify AI parsing and insight generation logic.
      - **Action:** Created `backend/tests/test_ai_service.py` with mocks for Google Generative AI.
      - **Result:** all 4 tests passed. "Comment Quality Scoring" is now verifiable.
      - **Assigned:** Antigravity

- [x] **Implement Unit Tests for Bias Service** 🧪 ✅ (2026-02-06)
      - **Goal:** Verify statistical anomaly detection logic (Z-score algorithm).
      - **Action:** Created `backend/tests/test_bias_service.py` with 95% coverage for `detect_anomalies`.
      - **Verified:** All tests passing.
      - **Assigned:** Antigravity

- [x] **Improve Deep Analysis UX - Sequential Display** ✨ (2026-02-02)
      - **Goal:** Show Deep Analysis results in a new section below basic analysis instead of replacing data
      - **Completed:**
        - Created `DeepAnalysisCharts` component for dedicated visualization.
        - Updated `Dashboard.tsx` to display Deep Analysis results in a separate, sequentially appearing section.
        - Improved success message to be accurate ("using Gemini AI").
        - Ensures basic stats (Reviewers, etc.) remain visible while adding new insights below.
      - **Assigned:** Gemini

- [x] **Fix Dashboard State Persistence and Deep Analysis Auto-Refresh** 🔄 (2026-02-01)
      - **Fixed:** Dashboard now restores session from `localStorage` on load.
      - **Fixed:** `classify` endpoint invalidates analysis cache, ensuring fresh data on frontend refresh.
      - **Assigned:** Gemini

- [x] **Fix Black Screen on Analysis - Use Browser Testing** 🐛 (2026-02-01)
      - **Goal:** Debug and fix the black screen that appears when clicking "Start Analysis" button
      - **Current Status:**
        - **Fixed:** Backend route `reports/health-check` was missing `:path` converter for slashes. Frontend `MetricCard` hardened.
        - **Verified:** Local backend test confirmed endpoint returns data.

- [x] **Debug Analysis Endpoint "Subscription Required" Error** 🔍 (2026-02-01)
      - **Fixed:** Found and removed a redundant client-side subscription check in `Dashboard.tsx`.

- [x] **Fix GitHub OAuth "Connect GitHub" Button** 🐙 (2026-01-31)
      - **Fixed:** Robust `API_URL` fallback and lazy state initialization for token ingestion.

- [x] **Build "Bottleneck" List** 🚨 ✅ (2026-01-31)
- [x] **Phase 1: Dashboard UI/UX Foundation** 🎨 (2026-02-01)
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
- [x] **Phase 3: AI Integration** 🤖 (2026-02-01)
- [x] **Phase 2: Data Enrichment** 📊 (2026-02-01)
- [x] **Phase 4: Polish & Mobile Optimization** ✨ (2026-02-01)
- [x] **GitLab Integration** 🦊 ✅ (2026-01-29)
- [x] **Export Reports** 📋 ✅ (2026-02-01)
- [x] **Integrate Shared Auth** 🔐 ✅ (2026-01-29)
