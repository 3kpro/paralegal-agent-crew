# TASKS - Idea 09: Vendor Risk Assessment (VendorScope)

## NOW
- [ ] **Email-based Vendor Invite** 📧 (New Candidate)
      - **Goal:** Allow users to invite vendors to upload their own docs.
      - **Action:** Create `src/invite/` with secure link generation.

## NEXT
- [ ] **Dashboard Auth Integration** 🔐
- [ ] **Vector Database Indexing** 🗄️

## COMPLETED
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
