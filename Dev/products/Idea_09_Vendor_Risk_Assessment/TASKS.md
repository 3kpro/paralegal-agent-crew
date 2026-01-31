# TASKS - Idea 09: Vendor Risk Assessment (VendorScope)


## NOW
- [ ] **Recurring Assessments** 🔄
      - **Goal:** Automate annual re-assessments.
      - **Action:** Create `SchedulerService` to check pending re-assessments.

## NEXT
  - [ ] **Integration with Google Drive/OneDrive** 📁

## COMPLETED
- [x] **Data Encryption at Rest** 🔐 ✅
      - **Goal:** Encrypt sensitive fields (API Keys, PII) in the database.
      - **Action:** Implemented `EncryptedString` SQLAlchemy type using `fernet` encryption and applied it to `User.full_name`.

- [x] **Customizable Risk Frameworks (UI)** ⚙️ ✅
      - **Goal:** Allow users to build and edit framework controls.
      - **Action:** Enhanced `page_framework_builder` with `st.data_editor` to allow full CRUD on controls (Add/Remove rows, edit weights).

- [x] **Integration with Slack/Teams** 💬 ✅
      - **Goal:** Send real-time alerts to team channels.
      - **Action:** Updated `NotificationService` to POST to `SLACK_WEBHOOK_URL` if configured.

- [x] **Auto-Generated Executive Reports** 📊 ✅
      - **Goal:** Create downloadable PDF risk assessment reports.
      - **Action:** Integrated `ReportGenerator` into Vendor Directory to allow on-demand PDF generation.

- [x] **Vendor Portal (External Access)** 🌐 ✅
      - **Goal:** Allow vendors to upload missing evidence directly.
      - **Action:** Created `page_vendor_portal` and added token-based authentication (`?token=inv-XYZ`) to bypass standard login.

- [x] **AI-Powered Mitigation Suggestions** 🤖 ✅
      - **Goal:** Suggest remediation steps for high-risk findings.
      - **Action:** Created `MitigationGenerator` and updated `RiskScorer` to provide AI-driven remediation plans for failed controls.

- [x] **Notification Center** 🔔 ✅
      - **Goal:** Alert users of critical events (new findings, contract renewals).
      - **Action:** Created `src/notifications/` module with `NotificationService` (Mock JSON persistence) and added "Notification Center" to Dashboard.

- [x] **Dashboard Filtering & Search** 🔍 ✅
      - **Goal:** Improve usability for large vendor lists.
      - **Action:** Added sidebar filters for Score, Certification, and Status in `page_vendor_directory`.

- [x] **End-to-End Testing (Playwright)** 🧪 ✅
      - **Goal:** Verify critical flows (Login -> Assessment -> Export) before release.
      - **Action:** Created `tests/e2e/test_flows.py` using `playwright` to test Login, Assessment creation, and Data Export.

      - **Goal:** Verify critical flows (Login -> Assessment -> Export) before release.
      - **Action:** Created `tests/e2e/test_flows.py` using `playwright` to test Login, Assessment creation, and Data Export.

- [x] **Self-Hosted Deployment Guide** 📘 ✅
      - **Goal:** Comprehensive guide for deploying to customer VPC.
      - **Action:** Created `DEPLOY_GUIDE.md` covering Docker Compose, Environment Config, and Operations.

- [x] **Audit Trail** 📝 ✅
      - **Goal:** Track important user actions (who did what, when).
      - **Action:** Created `AuditEvent` model and `AuditLogger`. Integrated into dashboard actions (Start Assessment, Export/Import, Framework Save).

- [x] **Multi-Tenant Support** 🏢 ✅
      - **Goal:** Data isolation for different customer organizations.
      - **Action:** Added `Organization` model and `org_id` column to all core tables (`vendors`, `contracts`, `assessments`, `documents`, `invitations`, `users`).

- [x] **Security Question Bank** 🔒 ✅
      - **Goal:** Centralized repository of standard security questions (SIG, VSA).
      - **Action:** Created `Question` model, `page_question_bank` UI, and updated `AutoFiller` to accept guidance.

- [x] **User Role Management** 👥 ✅
      - **Goal:** Permission-based access (Admin, Viewer, Auditor).
      - **Action:** Added `User` and `Role` models, and implemented RBAC in dashboard sidebar using new Login flow.

- [x] **Advanced Analytics** 📈 ✅
      - **Goal:** Trend analysis and detailed reporting.
      - **Action:** Added `page_analytics` with historical trend charts to dashboard.

- [x] **Data Export/Import Module** 📤 ✅
      - **Goal:** Enable bulk data handling (CSV/JSON).
      - **Action:** Added `page_data_manager` to dashboard with CSV/JSON export and import capabilities.

- [x] **API Gateway** 🌐 ✅
      - **Goal:** Create a REST API for external integrations.
      - **Action:** Created `src/api/` with `FastAPI` app, `vendors`, and `assessments` routes.

- [x] **Contract Management Module** 📜 ✅
      - **Goal:** Track vendor contracts and renewal dates.
      - **Action:** Created `src/models/contract.py` and added `page_contracts` to dashboard.

- [x] **Custom Risk Framework Builder** 🛠️ ✅
      - **Goal:** Allow users to define custom control frameworks.
      - **Action:** Added `page_framework_builder` to `src/dashboard/app.py` with `st.data_editor` for dynamic control definition.

- [x] **Integration with Jira** 🔗 ✅
      - **Goal:** Create Jira tickets from high-risk findings.
      - **Action:** Created `src/integrations/jira_connector.py` with `jira` client and mock fallback.

- [x] **Post-Launch Monitoring** 📊 ✅
      - **Goal:** Track usage and exceptions.
      - **Action:** Implemented `src/monitoring` with `sentry-sdk` and file logging. Added to app startup.

- [x] **Launch** 🚀 ✅
      - **Goal:** Public release and marketing.
      - **Action:** Released v1.0.0. Updated README and bumped version in app.

- [x] **Deployment Prep** 🚀 ✅
      - **Goal:** Prepare for cloud deployment (Dockerfile, Render/Railway config).
      - **Action:** Created `Dockerfile` and `docker-compose.yml`. Checked for Docker CLI (not present, but files are ready).

- [x] **Report Generator** 📄 ✅
      - **Goal:** Create downloadable PDF risk assessment reports.
      - **Action:** Created `src/reporting/` with `ReportGenerator` using `reportlab`.

- [x] **Vector Database Indexing** 🗄️ ✅
      - **Goal:** Index scraped docs in Pinecone/Chroma for RAG.
      - **Action:** Created `src/vector/` with Pinecone client wrapper and Mock options.

- [x] **Dashboard Auth Integration** 🔐 ✅
      - **Goal:** Secure the dashboard with login.
      - **Action:** Implement simple session-based password auth in `src/dashboard/auth.py`.

- [x] **Email-based Vendor Invite** 📧 ✅
      - **Goal:** Allow users to invite vendors to upload their own docs.
      - **Action:** Created `src/invite/` with secure link generation and `Invitation` model.
- [x] **SOC 2 Report Parser** 📋 ✅
      - **Goal:** Deep parsing of SOC 2 Type II reports to extract controls and exceptions.
      - **Action:** Created `src/parser/soc2_parser.py` with regex-based control extraction.

- [x] **Comparison View** ⚖️ ✅
      - **Goal:** Compare 2-3 vendors side-by-side on risk factors.
      - **Action:** Added "Compare Vendors" page to Streamlit dashboard.

- [x] **Dashboard UI** 📈 ✅
      - **Goal:** Visualize risk scores and parsed data.
      - **Action:** Created `src/dashboard/app.py` using Streamlit.

- [x] **Questionnaire Auto-Fill** 📝 ✅
      - **Goal:** Use LLM to answer standard security questionnaires (VSA, SIG Lite) using available snippets.
      - **Action:** Created `src/auto_fill/` with `AutoFiller` class using `Claude-3-Haiku`.
      
- [x] **Risk Scoring Engine** 🧠 ✅
      - **Goal:** Implement logic to compare scraped Intelligence against a standard risk framework.
      - **Action:** Created `src/engine/` with `RiskScorer` and `Standard Framework`.

- [x] **Document Parser Pipeline** 📄 ✅
      - **Goal:** Ingest PDFs (SOC2, Whitepapers) and extract key risk controls.
      - **Action:** Created `src/parser/` with `PDFParser` class using `pdfplumber`.

- [x] **Trust Center Scraper** 🔍 ✅
      - **Goal:** Build a scraper to extract compliance certifications (SOC2, ISO) and document links from public trust centers.
      - **Action:** Created `src/scraper/` with `TrustCenterScraper` class using Playwright.

- [x] **Vendor Database Schema** 📊 ✅
      - **Goal:** Define PostgreSQL (SQLAlchemy) models for Vendors, Intelligence, and Assessments.
      - **Action:** Created `src/models/` with `Vendor`, `VendorIntelligence`, `Document`, `Assessment` models.

- [x] **Project Scaffolding** ✅
