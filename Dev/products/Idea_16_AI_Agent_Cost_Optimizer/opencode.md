# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_16_AI_Agent_Cost_Optimizer\`
- **Primary Stack:** Python, Go, ClickHouse, React

## 🚀 Setup
```powershell
# Python SDK
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install openai anthropic opentelemetry-api tiktoken

# Backend (Go)
go mod init agentmeter
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
