# CHANGELOG - Idea 10: API Deprecation Watchdog (BreakingChange)

## 2026-01-13 — Severity Filtering
- Implemented backend filtering by `severity` query parameter in `GET /changes`
- Added interactive pill-style filter controls to React dashboard
- Updated backend to map string parameters to `Severity` enum

## 2026-01-13 — Timeline Calendar UI
- Implemented `GET /changes` endpoint to list recent updates
- Created React/Vite dashboard with `framer-motion` for animated feed
- Styled with standard Tailwind dark mode (shadcn/ui compatible)
- Added `CORS` middleware to backend for local development

## 2026-01-13 — Slack Integration
- Implemented `SlackNotifier` service for real-time alerting
- Created color-coded message blocks based on change `Severity` and `ChangeType`
- Integrated notification trigger into the main ingestion loop

## 2026-01-13 — GitHub Release Monitor
- Implemented `GithubMonitor` using `httpx` to fetch releases via API
- Integrated `GITHUB_RELEASE` monitoring method into `scan_api` pipeline
- Parses repo URLs (e.g. `owner/repo`) and extracts version tags + bodies

## 2026-01-13 — Classification Engine
- Implemented `ChangeClassifier` using Anthropic Claude 3 Haiku API
- Integrated classification step into `scan_api` ingestion pipeline
- Maps unstructured text to `change_type` (breaking, feature, etc) and `severity`

## 2026-01-13 — RSS Feed Parser
- Implemented `RssParser` using `feedparser` library
- Integrated RSS logic into `scan_api` endpoint
- Updated duplicates detection using `original_id`

## 2026-01-13 — Changelog Scraper
- Implemented `ChangelogScraper` using Playwright and BeautifulSoup
- Created `POST /apis/{id}/scan` endpoint
- Added heuristic parsing for version headers and dates

## 2026-01-13 — API Registry Schema
- Created `src/backend/database.py` for SQLAlchemy setup
- Created `src/backend/models.py` with `ApiRegistry` and `ApiChange` models
- Updated `src/backend/main.py` to auto-create tables and added CRUD endpoints

## 2026-01-13 — Scaffolding Implementation
- Created `src/backend` with FastAPI setup and `requirements.txt`
- Created `src/frontend` with Vite React setup
- Updated documentation

## 2026-01-11 — Project Initialization
- Initialized `TRUTH.md` with core product spec
- Created directory structure and core docs
