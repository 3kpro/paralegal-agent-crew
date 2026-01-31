# VendorScope - Vendor Risk Auto-Assessment

> **Status:** v1.0.0 (MVP) 🚀  
> **Mission:** Automate vendor security assessments with pre-built intelligence and AI analysis.

## 🎯 Problem
Vendor due diligence takes days of chasing documents and filling questionnaires manually.

## 💡 Solution
Pre-populated vendor security profiles + AI-powered risk analysis = assessments in minutes.

## 📊 Core Features (MVP)
- **Vendor Intelligence**: Database of common SaaS tools with risk scores.
- **Auto-Fetch**: Scrapes Trust Centers for SOC 2 reports and privacy policies.
- **AI Analysis**: Automates extracting controls from PDF documents using Claude-3-Haiku.
- **Risk Scoring**: Standardized framework evaluation (Low/Medium/High).
- **Comparison View**: Side-by-side vendor risk analysis.
- **PDF Reporting**: Generate professional risk assessment reports for auditors.

## 🚀 Quick Start (Local)

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
playwright install chromium
```

2. **Run Application**:
```bash
streamlit run src/dashboard/app.py
```

3. **Login**:
   - Default password: `admin123` (Set `DASHBOARD_PASSWORD` env var to override).

## 🐳 Docker Deployment

1. **Build**:
```bash
docker build -t vendorscope:latest .
```

2. **Run**:
```bash
docker run -p 8501:8501 vendorscope:latest
```

---
*Built with ❤️ by Antigravity.*
