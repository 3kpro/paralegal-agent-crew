# CHANGELOG - Idea 08: Meeting Commitment Extractor (PactPull)

## 2026-01-11 — Project Initialization

**Scaffolded the project structure for independent development.**

- Initialized `TRUTH.md` with core product spec
- Created `src/`, `docs/`, `assets/`, `dist/` directories
- Established local `TASKS.md` and `CHANGELOG.md` for Federated Agent Workflow
- Created `readme.md` and `opencode.md` for agent handoff
- **Data Models Defined:**
  - Created SQLAlchemy models for `Recording`, `Transcript`, `Commitment`, and `Task`.
  - Set up `src/models/` structure.
- **Transcription Pipeline Implemented:**
  - Implemented `api/recordings/upload` endpoint with background processing.
  - Integrated `deepgram-sdk` for async transcription.
  - Created `src/services/transcription.py` and connected DB persistence.
  - Added `.env.example` and `requirements.txt`.
- **Commitment Extraction Engine (Claude):**
  - Integrated `anthropic` SDK for LLM processing.
  - Created `src/services/extraction.py` to parse transcripts.
  - Implemented logic to extract Description, Assignee, Due Date, and Confidence Score (0-1).
  - Wired extraction into the background processing pipeline.
- **Asana Integration:**
  - Implemented `src/services/asana_service.py` using `httpx` for lightweight API interaction.
  - Created `src/api/routers/integrations.py` to handle export logic.
  - Added endpoint `POST /api/integrations/asana/export/{commitment_id}`.
  - Connected `Task` entity to track external IDs.
- **Linear Integration:**
  - Implemented `src/services/linear_service.py` using `httpx` and GraphQL mutations.
  - Added endpoint `POST /api/integrations/linear/export/{commitment_id}`.
  - Configured config and env settings for Linear API Key and Team ID.
- **Dashboard UI (MVP):**
  - Scaffolded React frontend using Vite.
  - Configured TailwindCSS styling with Indigo/Violet theme.
  - Implemented file upload component connecting to `POST /api/recordings/upload`.
- **Slack Daily Digest:**
  - Implemented `src/services/slack_service.py` using `slack-sdk/async`.
  - Created logic to filter commitments from the last 24h.
  - Added `POST /api/integrations/slack/digest` to trigger formatted delivery.
- **Team Workspace Architecture:**
  - Extended domain models with `User` and `Organization`.
  - Added multi-tenancy support to `Recording` entity.
  - Implemented `src/api/auth.py` with mock JWT/token validation logic for MVP.
