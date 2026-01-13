# CHANGELOG - Idea 07: SOC 2 Evidence Autopilot (ComplianceGhost)

## 2026-01-11 — Project Initialization

**Scaffolded the project structure for independent development.**

- Initialized `TRUTH.md` with core product spec
- Created `src/`, `docs/`, `assets/`, `dist/` directories
- Established local `TASKS.md` and `CHANGELOG.md` for Federated Agent Workflow
- Created `readme.md` and `opencode.md` for agent handoff

### Data Model
- Defined core TypeScript interfaces in `src/models/types.ts`
- Mapped relationships between Integrations, Jobs, Evidence, and Controls

### Integrations
- **AWS Connector:** Implemented `AwsConnector` class in `src/connectors/aws/index.ts`
  - Validates credentials using STS
  - Scaffolds collectors for `aws.iam.policies` and `aws.cloudtrail.logs`
- **GitHub Connector:** Implemented `GitHubConnector` class in `src/connectors/github/index.ts`
  - Validates tokens using Octokit `users.getAuthenticated`
  - Scaffolds collectors for `github.branch_protection` and `github.pr_settings`
- **Okta Connector:** Implemented `OktaConnector` class in `src/connectors/okta/index.ts`
  - Validates API tokens using `client.getUser('me')`
  - Scaffolds collectors for `okta.users.inactive` and `okta.policies.mfa`

### Scheduler
- **Bull Queue:** Initialized Redis-backed queue in `src/scheduler/queue.ts`
- **Job Processor:** Created `processCaptureJob` to dynamically route jobs to the correct connector (AWS/GitHub/Okta)

### UI
- **Control Matrix:** Created `ControlMatrix.tsx` React component to visualize status and map evidence

### Analysis
- **Gap Detection:** Implemented `analyzeGaps` logic in `src/analysis/gapDetection.ts`
  - Calculates compliance score (0-100%)
  - Identifies missing or stale evidence (> 24h old)

### Exports
- **Package Generator:** Created `generateEvidencePackage` service using `archiver`
  - Bundles evidence into ZIP organized by Control Code
  - Generates `evidence_index.csv` for auditors

### Dashboard MVP
- **Main Dashboard:** Created `Dashboard.tsx`
  - Integrated `ControlMatrix`, `GapAnalysis`, and `Export` trigger
  - Added visual stats (Compliance Score, Total/Passing/Gaps)
  - Implemented "Recommended Actions" feed for quick fixes







