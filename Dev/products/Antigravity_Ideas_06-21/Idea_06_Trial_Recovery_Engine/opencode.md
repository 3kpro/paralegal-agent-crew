# OpenCode Setup & Environment Guide

This document provides exact instructions for the **OpenCode** agent to initialize and manage the **TrialRevive** environment.

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_06_Trial_Recovery_Engine\`
- **Primary Stack:** Python (FastAPI), PostgreSQL, ClickHouse, React, Claude API
- **Output Directory:** `.\dist\`

## 🚀 Setup Instructions

### 1. Initialize Python Environment
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install core dependencies
pip install fastapi uvicorn sqlalchemy asyncpg clickhouse-driver anthropic pydantic
```

### 2. Verify Project Integrity
```powershell
Get-ChildItem -Path ".\src", ".\docs", ".\assets" -Recurse
```

### 3. Database Setup
```powershell
# Ensure PostgreSQL is running
# Create database
psql -U postgres -c "CREATE DATABASE trialrevive;"
```

### 4. Run Development Server
```powershell
cd src
uvicorn main:app --reload --port 8000
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md` for the core project mission and anti-scope.
- **Tasks:** Check `TASKS.md` for current objectives.
- **Models:** Data models will be in `src/models/`.
- **API Routes:** Endpoints in `src/api/`.

## 📋 Task Management
When performing work:
1. Check `TASKS.md` for current objectives.
2. Update `CHANGELOG.md` upon completion.
3. Move completed tasks from NOW to COMPLETED.
4. Use `Write-Output` to confirm status to the user.

## 🔌 Key Integrations
- **Segment:** Webhook endpoint at `/api/events/segment`
- **Mixpanel:** Pull via Export API
- **Amplitude:** Pull via Export API
- **Claude API:** Classification and copy generation
- **Customer.io:** Export playbooks via API
