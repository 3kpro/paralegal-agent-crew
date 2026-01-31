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

## 2026-01-15 — Project Scaffolding
- Scaffolded React/Vite dashboard
- Set up FastAPI backend structure
- Created `requirements.txt` and `.env.example`

## 2026-01-15 — GitHub OAuth Integration
- Implemented `Login` and `AuthCallback` pages in React
- Created `/auth/login/github` and `/auth/callback/github` endpoints in FastAPI
- Configured JSON Web Token (JWT) session handling
- Added TailwindCSS styling to auth screens

## 2026-01-15 — PR History Ingestion
- Created SQLAlchemy models for `Repository`, `User`, `PullRequest`, `Review`, `Comment`
- Implemented `GitHubIngestor` class using `httpx`
- Added `/ingest/{owner}/{repo}` endpoint with background task processing
- Configured SQLite database connection for local development

## 2026-01-15 — Review Pattern Analysis
- Implemented `Analyzer` class in `src/analysis.py`
- Added metrics calculation for:
  - Average Review Speed (Hours)
  - Reviewer Matrix (Who reviews whom)
  - Bias Anomaly Detection (Slower/harsher than baseline)
- Exposed `/repos/{owner}/{repo}/analysis` endpoint using Pandas and SQLAlchemy

## 2026-01-15 — Comment Classifier
- Integrated Anthropic (Claude 3 Haiku) API via `CommentClassifier` class
- Implemented `classify_batch` method to process unclassified comments
- Defined classification categories (nitpick, logic, architecture, etc.) and tone (constructive, harsh, neutral)
- Added `/classify/trigger` endpoint to run background classification job

## 2026-01-15 — Bias Detection Algorithm
- Implemented `Analyzer.detect_bias` to identify interpersonal friction
- Added "Nitpick Ratio" analysis (when a reviewer focuses disproportionately on minor issues for specific authors)
- Added "Harsh Tone" analysis (when a reviewer uses "harsh" tone more frequently with specific authors)
- Updated `/repos/{owner}/{repo}/analysis` to return `bias_risks` list

## 2026-01-15 — Dashboard Visualizations
- Implemented `Dashboard.tsx` with:
  - High-level KPI cards (PRs, Speed, Anomalies, Risks)
  - `Recharts` bar chart for Review Interactions
  - Risk Feed component showing anomalies and bias detections
  - Repository selector dropdown
- Integrated `axios` for fetching analysis data from FastAPI backend

## 2026-01-15 — GitLab Integration
- Updated `Repository` model to support multi-platform (`platform`, `external_id`).
- Implemented `GitLabIngestor` to fetch Merge Requests and Notes/Discussions.
- Mapped GitLab schemas (MRs, Notes) to common `PullRequest`/`Comment` models.
- Added `/ingest/gitlab/{project_id_or_path}` endpoint.

## 2026-01-15 — Export Reports
- Implemented `ReportExporter` class for generating data dumps.
- Enabled **JSON** export for full repository audit trails.
- Enabled **CSV** export for "High Risk" anomaly reports.
- Added `/repos/{owner}/{repo}/export?format={json|csv}` endpoint.
