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
