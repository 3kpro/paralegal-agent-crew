# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_09_Vendor_Risk_Assessment\`
- **Primary Stack:** Python, Playwright, PostgreSQL, Pinecone, Claude API, React

## 🚀 Setup
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn playwright pinecone-client anthropic sqlalchemy beautifulsoup4
playwright install chromium
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
