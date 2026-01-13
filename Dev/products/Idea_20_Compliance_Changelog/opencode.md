# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_20_Compliance_Changelog\`
- **Primary Stack:** Python, Playwright, Scrapy, PostgreSQL, Elasticsearch, Claude API, React

## 🚀 Setup
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn playwright scrapy elasticsearch anthropic sqlalchemy
playwright install chromium
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
