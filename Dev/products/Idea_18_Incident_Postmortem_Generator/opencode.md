# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_18_Incident_Postmortem_Generator\`
- **Primary Stack:** Python, Slack SDK, PagerDuty API, Claude API, React

## 🚀 Setup
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn slack-sdk pdpyras anthropic sqlalchemy notion-client
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
