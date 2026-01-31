# CHANGELOG - Idea 11: Code Review Bias Detector (ReviewLens)



## 2026-01-31
- **Security**: Verified OAuth scopes are minimal (`repo`, `user:email`, `read:org`) and do not include high-risk write permissions.
- **Feature**: Implemented "Nuke Data" functionality.
  - Added `DELETE /settings/nuke` endpoint to wipe all ingested data.
  - Added "Danger Zone" in Dashboard with a button to trigger data deletion.
- **Feature**: Implemented "Velocity Killer" Gauge 🎯.
  - Added `VelocityKillerGauge` component to visualize Nitpick Ratio.
  - Integrated with `/reports/health-check` API to drive the gauge on the Dashboard.
- **Health Check Endpoint**: Added `GET /reports/health-check/{repo_id}` to provide executive summary metrics. Verified with unit tests.
- **Feature**: Implemented "Bottleneck List" 🚨.
  - Added `GET /bottlenecks/stale-prs` endpoint to identify stale PRs (> 48h).
  - Wired up to main application.


## 2026-01-29 — Project Scaffolding
- Initialized Frontend: React + Vite + TypeScript in `frontend/`
- Implemented Core Design Phase: Premium Dark Mode UI in `index.css`
- Created Landing Page Skeleton in `App.tsx`
- Initialized Backend: Python structure in `backend/` with `requirements.txt` and `src/main.py`
- Implemented GitHub OAuth: Created `auth` router in backend and integrated Login flow in Frontend (`Landing.tsx`, `Dashboard.tsx`, `App.tsx`)
- Implemented **PR History Ingestion**:
    - Backend: Added `database.py`, `models.py` (PR, Review, Comment), `github_service.py` (PyGithub fetcher), and `/ingest` endpoint.
    - Frontend: Added "Analyze Repository" UI in `Dashboard.tsx`.
- Implemented **Review Pattern Analysis**:
    - Backend: Added `analysis_service.py` to calculate metrics (merge time, top reviewers) and `/analysis` endpoint.
    - Frontend: Updated `Dashboard.tsx` to visualize analysis results (Review Counts, Merge Stats).
- Implemented **Comment Classifier**:
    - Backend: Added `ai_service.py` using Claude API to classify comments into categories (nitpick, blocking, etc.) and tone.
    - Frontend: Added "Deep Analysis" section in Dashboard to trigger classification and visualize Breakdown.
- Implemented **Stripe Integration**:
    - Backend: Added `dependencies.py` to verify Supabase JWT and check `subscription_status` in shared `profiles` table.
    - Frontend: Integrated `AuthContext` with profile fetching. Added Pricing UI/Overlay for inactive users. Added `handleSubscribe` to trigger marketplace checkout.
    - Gated all analysis endpoints (402 Payment Required).
- Implemented **Bias Detection Algorithm**:
    - Backend: Created `bias_service.py` using pandas & scipy to identify statistical anomalies (z-scores) in reviewer behavior (rigor bias, rejection patterns).
    - Frontend: Added "Bias Detection Alerts" section to surface critical anomalies to managers.

## 2026-01-11 — Project Initialization
- Initialized `TRUTH.md` with core product spec
- Created directory structure and core docs
