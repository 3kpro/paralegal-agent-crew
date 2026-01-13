# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_10_API_Deprecation_Watchdog\`
- **Primary Stack:** Python, Celery, Redis, PostgreSQL, Claude API, React

## 🚀 Setup
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn celery redis sqlalchemy anthropic feedparser playwright
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
