# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_17_Competitive_Feature_Intelligence\`
- **Primary Stack:** Python, Playwright, PostgreSQL, Claude API, React

## 🚀 Setup
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn playwright anthropic sqlalchemy beautifulsoup4 diff-match-patch
playwright install chromium
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
