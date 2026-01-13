# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_11_Code_Review_Bias_Detector\`
- **Primary Stack:** Python, PostgreSQL, TimescaleDB, Claude API, React, D3.js

## 🚀 Setup
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy asyncpg anthropic PyGithub pandas numpy scipy
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
