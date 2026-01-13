# TASKS - Idea 07: SOC 2 Evidence Autopilot (ComplianceGhost)

## NOW
(none)

## NEXT

## COMPLETED
- [x] **Dashboard MVP** 📈 ✅
      - **Goal:** Visualize compliance percentage.
      - **Action:** Build master dashboard.

- [x] **Auditor Export (ZIP)** 📦 ✅
      - **Goal:** Bundle all evidence into an auditor-friendly package.
      - **Action:** Build ZIP generation service.

- [x] **Evidence Gap Detection** 🔍 ✅
      - **Goal:** Identify controls with no recent evidence.
      - **Action:** Build logic to analyze evidence vs controls.

- [x] **Control Mapping UI** 🗺️ ✅
      - **Goal:** Dashboard to manually/auto map evidence to controls.
      - **Action:** Build React components for control matrix.

- [x] **Capture Scheduler** ⏰ ✅
      - **Goal:** Execute capture jobs via Cron.
      - **Action:** Setup Bull/Redis queue.

- [x] **Okta Integration** 🔐 ✅
      - **Goal:** Connect to Okta to audit user lists and MFA policies.
      - **Action:** Build Okta connector module.

- [x] **GitHub Integration** 🐙 ✅
      - **Goal:** Capture branch protection rules, PR requirements.
      - **Action:** Build GitHub connector module.

- [x] **AWS Integration** ☁️ ✅
      - **Goal:** OAuth connection to AWS, capture IAM policies and CloudTrail samples.
      - **Action:** Build AWS connector module.

- [x] **Define Evidence Data Model** 📊 ✅
      - **Goal:** Establish core entities (Evidence, Control, Integration, CaptureJob).
      - **Action:** Create `src/models/` with types.

- [x] **Project Scaffolding** ✅
      - **Goal:** Initialize folder structure and core docs.
      - **Action:** Create TRUTH.md, TASKS.md, CHANGELOG.md, readme.md, opencode.md.
