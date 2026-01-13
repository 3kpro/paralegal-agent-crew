# CHANGELOG - Idea 01: n8n Workflow Marketplace

## 2026-01-09 — Beta Testing Preparation

**Prepared environment and workflows for beta testing.**

- Set up local n8n instance via npm.
- Validated all workflow JSON files for syntax.
- Refreshed dist/ folder with latest files.
- Attempted API import of workflows (failed due to auth issues).
- Recommended manual import in n8n UI for testing.

**Issues:**
- API import failed with "Unauthorized" error despite API key.
- Manual import required for testing workflows.

## 2026-01-09 — Agent Integration

**Added PowerShell agent support.**

- Created `opencode.md` with specific setup instructions for the OpenCode agent.

## 2026-01-07 — Initial Workflow & Marketplace Structure

**Project Documentation & MVP Complete**

- Updated `readme.md` with product overview and quick links.
- Created `docs/WORKFLOW_MANUAL.md` covering all 3 MVP packs.
- Verified project integrity and links.
- Created `docs/TESTING.md` for internal validation.
- Packaged release artifacts to `dist/`.
- Created `assets/marketing_copy.md` with product headlines.
- Completed agent handoff and cleanup.

**Added core MVP workflows.**

- Added `workflows/social_scheduler.json` (Social Media Pack).
- Added `workflows/lead_capture.json` (Small Business Pack).
- Added `workflows/youtube_to_blog.json` (Content Creator Pack).
- Added `workflows/hello_world_workflow.json` (Baseline).
- Updated task list for next steps.

## 2026-01-07 — Project Initialization

**Scaffolded the project structure for independent development.**

- Initialized `TRUTH.md`
- Created `workflows/`, `docs/`, `assets/` directories
- Established local `TASKS.md` and `CHANGELOG.md` for Federated Agent Workflow.
