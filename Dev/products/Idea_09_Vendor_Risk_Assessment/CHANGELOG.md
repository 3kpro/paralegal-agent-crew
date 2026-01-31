# CHANGELOG - Idea 09: Vendor Risk Assessment (VendorScope)

## 2026-01-11 — SOC 2 Report Parser

**Implemented specialized parsing for SOC 2 Type II reports.**

- **Control Extraction**: Heuristic regex-based extraction of Trust Service Criteria (TSP) identifiers (e.g. CC1.1, A1.2).
- **Exception Detection**: Scans control blocks for "Exception noted" or "Deviation" language.
- **Metadata Extraction**: Identifies Report Period and CPA Firm name.
- **Data Structure**: Returns structured `SOC2Control` objects with exception status.

Files Created:
- `src/parser/soc2_parser.py`

---

## 2026-01-11 — Comparison View

**Added visual vendor comparison capabilities to the dashboard.**

- **Feature**: Side-by-side comparison of up to 3 vendors.
- **Metrics**: Visualizes score differences, certification gaps, and last assessment dates.
- **UI**: Implemented multi-select interface and responsive column layout in Streamlit.

Files Modified:
- `src/dashboard/app.py`

---

## 2026-01-11 — Dashboard UI

**Implemented the visualization layer using Streamlit.**

- **Tech Stack**: Built a reactive dashboard using `streamlit` and `pandas`.
- **Features**:
  - **Executive Overview**: High-level metrics (Vendors, Avg Risk Score) and recent activity.
  - **Vendor Directory**: Searchable list of vendors with quick risk score previews.
  - **Mock Integration**: Scaffolded UI components connected to a robust mock data service (ready for DB integration).
- **Navigation**: Implemented sidebar navigation for easy switching between views.

Files Created:
- `src/dashboard/app.py`

---

## 2026-01-11 — Questionnaire Auto-Fill

**Implemented AI-powered questionnaire answering module.**

- **Prompt Engineering**: Designed structured prompts for `Claude-3-Haiku` to answer security questions based on document context.
- **AutoFiller Engine**: Created `AutoFiller` class to manage API interactions and parse structured responses.
- **Output Data**: Standardized `Answer` object containing answer text, confidence level, reasoning, and source citations.

Files Created:
- `src/auto_fill/filler.py`
- `src/auto_fill/__init__.py`

---

## 2026-01-11 — Risk Scoring Engine

**Implemented standard risk scoring logic.**

- **Framework Definition**: Created `Standard Vendor Assessment Framework v1.0` with mapped controls (SOC2, ISO, Encryption, GDPR).
- **Scoring Logic**: Built `RiskScorer` engine that evaluates compliance based on:
  - Verified Certificates (High Confidence)
  - Document Text Keywords (Medium Confidence)
- **Output**: Generates a 0-100 risk score with detailed findings per control.

Files Created:
- `src/engine/framework.py`
- `src/engine/scorer.py`
- `src/engine/__init__.py`

---

## 2026-01-11 — Document Parser Pipeline

**Implemented the PDF ingestion and parsing pipeline.**

- **PDF Extraction**: Integrated `pdfplumber` to extract text from vendor documents (SOC2, Whitepapers).
- **Chunking Logic**: Implemented page-level chunking and metadata extraction.
- **Parser Architecture**: Created `BaseParser` interface and `PDFParser` implementation.

Files Created:
- `src/parser/base.py`
- `src/parser/pdf_parser.py`
- `src/parser/__init__.py`

---

## 2026-01-11 — Trust Center Scraper

**Implemented the web scraper for vendor trust centers.**

- **Scraper Engine**: Built `TrustCenterScraper` using Playwright and BeautifulSoup.
- **Extraction Capabilities**:
  - Compliance Certifications (SOC2, ISO, etc.)
  - Privacy Policy and Security Page links
  - Document downloads (PDFs)
  - Risk-relevant text snippets
- **Structure**: Defined `BaseScraper` interface and structured data using `dataclasses`.

Files Created:
- `src/scraper/base.py`
- `src/scraper/trust_center.py`
- `src/scraper/__init__.py`

---

## 2026-01-11 — Vendor Database Schema

**Defined the core data models for the Vendor Risk Assessment platform.**

- **Schema Definition**: Created SQLAlchemy models for `Vendor`, `VendorIntelligence`, `Document`, and `Assessment`.
- **Database Structure**:
  - `vendors`: Stores core vendor identity.
  - `vendor_intelligence`: Stores aggregated risk data and compliance certs.
  - `documents`: Tracks associated files (SOC2, Privacy Policy) and S3 keys.
  - `assessments`: Tracks user-initiated risk assessments and results.
- **Tech Stack**: Used SQLAlchemy with declarative base and UUIDs for primary keys.

Files Created:
- `src/models/base.py`
- `src/models/vendor.py`
- `src/models/document.py`
- `src/models/assessment.py`
- `src/models/__init__.py`

---

## 2026-01-11 — Project Initialization

**Scaffolded the project structure for independent development.**

- Initialized `TRUTH.md` with core product spec
- Created directory structure and core docs

---

## 2026-01-14 — Email-based Vendor Invite

**Implemented system for inviting vendors to upload security documentation.**

- **Features**:
  - Secure, time-limited token generation.
  - Invitation lifecycle management (Create, Send, Verify, Expire).
  - Testable "mock" email sending implementation.
- **Data Model**: Created `Invitation` model for tracking invite status and expiration.
- **Models**: Updated all models to use generic `JSON` type for better compatibility (SQLite/Postgres).

Files Created/Modified:
- `src/invite/manager.py`
- `src/invite/__init__.py`
- `src/models/invitation.py`
- `src/models/__init__.py`
- `src/models/vendor.py` (updated)
- `src/models/assessment.py` (updated)

---

## 2026-01-14 — Dashboard Auth Integration

**Added security layer to the dashboard.**

- **Features**:
  - Validates user password against environment variable or default.
  - Controls access to main dashboard views.
  - Added Logout functionality.
- **Components**: Created `check_password` utility using Streamlit session state.

Files Created/Modified:
- `src/dashboard/app.py`

---

## 2026-01-14 — Vector Database Indexing

**Implemented vector storage layer for RAG capabilities.**

- **Tech Stack**: Integrated `pinecone-client` for production vectors and `MockEmbedder` for testing.
- **Architecture**:
  - `VectorStore`: Wrapper around Pinecone index operations (upsert, query, delete).
  - `Embedder`: Abstract interface with Mock and Placeholder OpenAI implementations.
  - **Mock Mode**: Automatically falls back to in-memory fake storage if API keys are missing.
- **Testing**: Added test script to verify chunking and retrieval flow.

Files Created:
- `src/vector/store.py`
- `src/vector/embeddings.py`
- `src/vector/__init__.py`
- `src/vector/test_vector.py`

---

## 2026-01-14 — Report Generator

**Implemented PDF report generation for risk assessments.**

- **Tech Stack**: Integrated `reportlab` for programmatic PDF creation.
- **Features**:
  - Generates professional-grade PDF reports including Title Page, Executive Summary, Certification List, and Risk Findings.
  - Dynamically color-codes risk levels (Low/Medium/High).
  - Uses custom styles and tables for layout.
- **Testing**: validation script `test_report.py` ensures PDF is created successfully.

Files Created:
- `src/reporting/generator.py`
- `src/reporting/__init__.py`
- `src/reporting/test_report.py`

---

## 2026-01-14 — Deployment Prep

**Containerized the application for cloud deployment.**

- **Docker**:
  - Created optimized `Dockerfile` based on `python:3.11-slim`.
  - Installed system dependencies for Playwright and Postgres.
- **Orchestration**:
  - Added `docker-compose.yml` for local testing with Postgres service.
- **Cleanup**: Added `.gitignore` and `.dockerignore` for repository hygiene.

Files Created:
- `Dockerfile`
- `docker-compose.yml`
- `.gitignore`
- `.dockerignore`

---

## 2026-01-14 — Launch v1.0.0

**Official MVP Pull Release.**

- **Documentation**:
  - Updated `README.md` with features, installation, and deployment guides.
- **Versioning**:
  - Bumped application version to `v1.0.0` in `src/dashboard/app.py`.
  
Files Created/Modified:
- `README.md`
- `src/dashboard/app.py`

---

## 2026-01-14 — Post-Launch Monitoring

**Added observability layer to the application.**

- **Architecture**:
  - `Logger` module wraps standard Python logging and `sentry-sdk`.
  - Configured to log to file (`app.log`) and stdout.
  - Sentry integration automatically active if `SENTRY_DSN` env var is present.
- **Integration**:
  - Wired into `dashboard/app.py` to capture startup events and runtime errors.

Files Created:
- `src/monitoring/logger.py`
- `src/monitoring/__init__.py`
- `src/monitoring/test_monitor.py`

---

## 2026-01-14 — Integration with Jira

**Implemented ticketing system integration for risk remediation.**

- **Features**:
  - Programmable creation of Jira tickets (Tasks) for identified risks.
  - Supports `High`, `Medium`, `Low` priority mapping.
  - **Mock Mode**: Allows testing without credentials (returns simulated issue keys).
- **Libraries**: Integrated `jira` Python client.

Files Created:
- `src/integrations/jira_connector.py`
- `src/integrations/__init__.py`
- `src/integrations/test_jira.py`

---

## 2026-01-14 — Custom Risk Framework Builder

**Added capability for users to define their own risk assessment frameworks.**

- **Features**:
  - **Interactive Editor**: Used `st.data_editor` to allow adding, editing, and deleting controls dynamically.
  - **Custom Attributes**: Supports Control ID, Name, Description, Weight, and Keywords.
  - **Validation**: Ensures framework metadata is present before saving.
  - **Mock Persistence**: Simulates saving the framework JSON.

Files Modified:
- `src/dashboard/app.py`

---

## 2026-01-14 — Contract Management Module

**Implemented contract tracking and renewal management.**

- **Data Model**: Defined `Contract` model in `src/models/contract.py` with fields for value, duration, and status.
- **Dashboard**: Added `Contract Management` page to Streamlit app.
- **Features**:
  - Visual tracking of Active, Expired, and Renewal Due contracts.
  - Calculated metrics for total portfolio annual value.
  - Auto-highlighting of critical statuses.

Files Created:
- `src/models/contract.py`
Files Modified:
- `src/models/vendor.py`
- `src/models/__init__.py`
- `src/dashboard/app.py`

---

## 2026-01-14 — API Gateway

**Initialized the REST API layer for external integrations.**

- **Technology**: Built with `FastAPI` and `Uvicorn` for high performance.
- **Routes**:
  - `/api/v1/vendors`: CRUD operations for vendors (Mocked).
  - `/api/v1/assessments`: Trigger new assessments programmatically.
- **Structure**: Modularized routes into `src/api/routes`.
- **Testing**: Added functional tests using `TestClient`.

Files Created:
- `src/api/main.py`
- `src/api/routes/vendors.py`
- `src/api/routes/assessments.py`
- `src/api/routes/__init__.py`
- `src/api/__init__.py`
- `src/api/test_api.py`

---

## 2026-01-14 — Data Export/Import Module

**Implemented bulk data management capabilities.**

- **Export**: Users can download the vendor database as CSV or JSON.
- **Import**: Supports uploading CSV/JSON files to batch ingest vendor records.
- **UI**: Added "Data Manager" tab to the dashboard.

Files Modified:
- `src/dashboard/app.py`

---

## 2026-01-14 — Advanced Analytics

**Integrated historical reporting capabilities.**

- **Visualizations**: Added charts for "Risk Score Trend" (Line) and "High Risk Vendor Count" (Bar).
- **Portfolio Insights**: Implemented distribution chart by vendor category (SaaS, Infrastructure, etc.).
- **UI**: Added "Advanced Analytics" dashboard page.

Files Modified:
- `src/dashboard/app.py`

---

## 2026-01-14 — User Role Management

**Implemented detailed Role-Based Access Control (RBAC).**

- **Authentication**: Upgraded login to support Username+Password.
- **Roles**: Defined `UserRole` enum (Admin, Editor, Viewer, Auditor).
- **Gating**: Dashboard navigation dynamically adjusts based on logged-in user's role.
- **Models**: Added `User` model to schema.

Files Created:
- `src/models/user.py`
Files Modified:
- `src/models/__init__.py`
- `src/dashboard/auth.py`
- `src/dashboard/app.py`

---

## 2026-01-14 — Security Question Bank

**Implemented centralized management for standard security questionnaires.**

- **Data Model**: Defined `Question` model in `src/models/question.py` with guidance fields.
- **UI**: Created "Security Question Bank" page in the dashboard (accessible to Admins/Editors).
- **AI Integration**: Updated `AutoFiller` to accept optional `guidance` context during answer generation.
- **Interface**: `st.data_editor` allows bulk editing of the question library.

Files Created:
- `src/models/question.py`
Files Modified:
- `src/models/__init__.py`
- `src/dashboard/app.py`
- `src/auto_fill/filler.py`

---

## 2026-01-14 — Multi-Tenant Support

**Implemented data isolation for multi-organization support.**

- **Organization Model**: Defined `Organization` entity to represent customer tenants.
- **Data Isolation**: Added `organization_id` foreign key to all core resources (`User`, `Vendor`, `Assessment`, `Document`, `Contract`, `Invitation`, `Question`).
- **Domain Flexibility**: Relaxed `domain` uniqueness on `Vendor` table to allow different organizations to track the same vendor independently.

Files Created:
- `src/models/organization.py`
Files Modified:
- `src/models/__init__.py`
- `src/models/user.py`
- `src/models/vendor.py`
- `src/models/assessment.py`
- `src/models/document.py`
- `src/models/contract.py`
- `src/models/invitation.py`
- `src/models/question.py`

---

## 2026-01-14 — Audit Trail

**Implemented secure audit logging for compliance visibility.**

- **Architecture**: Created `AuditLogger` service to capture undeniable records of user actions.
- **Data Model**: Defined `AuditEvent` model storing Actor, Action, Target Resource, IP, and Diff Details.
- **Coverage**: Integrated logging into high-impact dashboard actions:
  - Starting Assessments
  - Exporting/Importing Data
  - Modifying Frameworks
  - Updating Question Banks

Files Created:
- `src/models/audit.py`
- `src/security/audit_logger.py`
- `src/security/__init__.py`
Files Modified:
- `src/models/__init__.py`
- `src/dashboard/app.py`

---

## 2026-01-14 — Self-Hosted Deployment Guide

**Added comprehensive documentation for on-premise/VPC deployment.**

- **Documentation**: Created `DEPLOY_GUIDE.md` detailing prerequisites, installation, and configuration.
- **Operations**: Included specific instructions for:
  - Docker Compose orchestration.
  - Environment variable secrets management.
  - Database backup and recovery.
  - Troubleshooting common install issues (Puppeteer/Playwright binaries).

Files Created:
- `DEPLOY_GUIDE.md`

---

## 2026-01-14 — End-to-End Testing

**Implemented automated browser testing for critical user flows.**

- **Testing**: Created `tests/e2e/test_flows.py` using `playwright`.
- **Coverage**:
  - **Login Validation**: Verifies Admin/Editor authentication.
  - **New Assessment**: Automates the URL submission and analysis flow.
  - **Data Export**: Verifies CSV download capability from Data Manager.

Files Created:
- `tests/e2e/test_flows.py`

---

## 2026-01-14 — Dashboard Filtering

**Enhanced vendor directory with advanced search and filtering.**

- **Feature**: Added sidebar filters to "Vendor Directory" page.
- **Capabilities**:
  - Filter by Security Score Range (0-100 slider).
  - Filter by Risk Status (Low/Medium/High).
  - Filter by Certifications (e.g., SOC 2, ISO 27001).
  - Search by Name/Domain (existing but refined).

Files Modified:
- `src/dashboard/app.py`

---

## 2026-01-14 — Notification Center

**Introduced in-app notifications for critical events.**

- **Architecture**: Created `src/notifications/` with `NotificationService`.
- **Functionality**:
  - Centralized "Notification Center" page.
  - Sidebar badge showing unread count.
  - JSON-based mock persistence for demo purposes.
- **Triggers**:
  - **Assessment Complete**: Notifies user when a new assessment finishes.
  - **Framework Created**: Broadcasts new framework creation to organization.

Files Created:
- `src/models/notification.py`
- `src/notifications/service.py`
- `src/notifications/__init__.py`
Files Modified:
- `src/models/__init__.py`
- `src/dashboard/app.py`

---

## 2026-01-14 — AI-Powered Mitigation Suggestions

**Integrated AI to provide actionable remediation steps for risk findings.**

- **Architecture**: Created `MitigationGenerator` service utilizing Anthropic Claude.
- **Scoring**: Updated `RiskScorer` to automatically generate mitigation plans for failed controls during assessment.
- **UI**: Displaying AI-driven suggestions in the Dashboard's "New Assessment" results view.

Files Created:
- `src/engine/mitigation.py`
Files Modified:
- `src/engine/scorer.py`
- `src/dashboard/app.py`

---

## 2026-01-14 — Vendor Portal

**Implemented external access for vendors to upload compliance evidence.**

- **Authentication**: Added token-based login (`check_token_login`) accepting `?token=inv-*`.
- **UI**: Created a simplified `page_vendor_portal` specifically for the `VENDOR` role.
- **Workflow**: Allows invited vendors to view missing documents and upload them directly without account creation.

Files Modified:
- `src/dashboard/app.py`
- `src/dashboard/auth.py`

---

## 2026-01-14 — Auto-Generated Executive Reports

**Enables on-demand PDF generation for vendor risk assessments.**

- **Integration**: Wired `ReportGenerator` into the main Dashboard.
- **UI**: Added "Generate Report" button to each vendor card in the Directory.
- **Outcome**: Users can now download a professional PDF summary of any vendor's risk profile, scores, and findings.

Files Modified:
- `src/dashboard/app.py`

---

## 2026-01-14 — Slack/Teams Integration

**Added real-time alerting capability via webhooks.**

- **Feature**: `NotificationService` now checks for `SLACK_WEBHOOK_URL` env var.
- **Behavior**: If configured, all app notifications (Audits, Alerts, etc.) are mirrored to the specified Slack channel.
- **Resilience**: Configured with timeout and exception handling to prevent app blocking.

Files Modified:
- `src/notifications/service.py`

---

## 2026-01-14 — Customizable Risk Frameworks

**Enabled full CRUD capabilities for custom risk frameworks.**

- **UI**: Upgraded Framework Builder to use `st.data_editor` with dynamic rows.
- **Features**: Users can now add new controls, delete existing ones, and modify weights/descriptions inline.
- **State Management**: Implemented session state synchronization to persist edits across re-runs before saving.

Files Modified:
- `src/dashboard/app.py`

---

## 2026-01-14 — Data Encryption at Rest

**Implemented field-level encryption for sensitive PII/Secrets.**

- **Architecture**: Created `EncryptedString` custom SQLAlchemy type using `cryptography` (Fernet).
- **Security**: Ensures sensitive data (like user names, and planned API keys) is stored as ciphertext in the DB.
- **Application**: Applied `EncryptedString` to `User.full_name` as a pilot.

Files Created:
- `src/security/encryption.py`

Files Modified:
- `src/models/user.py`
