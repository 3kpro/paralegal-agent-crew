# TASKS - Idea 08: Meeting Commitment Extractor (PactPull)

## NOW
(none)

## NEXT
(none)

## BACKLOG
(none)

## COMPLETED
- [x] **Project Scaffolding** ✅
      - **Goal:** Initialize folder structure and core docs.
      - **Action:** Create TRUTH.md, TASKS.md, CHANGELOG.md, readme.md, opencode.md.

- [x] **Define Data Models** 📊
      - **Goal:** Establish core entities (Recording, Transcript, Commitment, Task).
      - **Action:** Create `src/models/` with types.

- [x] **Transcription Pipeline** 🎤
      - **Goal:** Accept audio upload, send to Deepgram, store transcript.
      - **Action:** Build `/api/recordings/upload` endpoint.

- [x] **Commitment Extraction** 🧠
      - **Goal:** Parse transcript with Claude to extract commitments.
      - **Action:** Create prompt templates and extraction logic using `anthropic` SDK.

- [x] **Confidence Scoring** 📊
      - **Goal:** Assign probability to extracted commitments.
      - **Action:** Integrated confidence scoring into the LLM extraction prompt (0.00-1.00).

- [x] **Asana Integration** ✅
      - **Goal:** Export extracted commitments to Asana as tasks.
      - **Action:** Built `src/services/asana_service.py` using `httpx` and created `/api/integrations/asana/export/{id}` endpoint.

- [x] **Linear Integration** 📋
      - **Goal:** Export extracted commitments to Linear as issues.
      - **Action:** Built `src/services/linear_service.py` using `httpx` (GraphQL) and created `/api/integrations/linear/export/{id}` endpoint.

- [x] **Dashboard UI** 📈
      - **Goal:** Simple React dashboard to upload files.
      - **Action:** Scaffolded UI with Vite, TailwindCSS, and Axios file upload logic.

- [x] **Slack Daily Digest** 🔔
      - **Goal:** Send a daily summary of commitments to a Slack channel.
      - **Action:** Built `SlackService` and `/api/integrations/slack/digest` endpoint to post formatted block messages.

- [x] **Team Workspace** 👥
      - **Goal:** Multi-user support with shared recording visibility.
      - **Action:** Added `User` and `Organization` models to `src/models/domain.py` and implemented Basic Auth middleware in `src/api/auth.py`.
