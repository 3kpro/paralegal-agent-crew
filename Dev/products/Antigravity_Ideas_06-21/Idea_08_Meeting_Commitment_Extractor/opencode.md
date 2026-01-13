# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_08_Meeting_Commitment_Extractor\`
- **Primary Stack:** Python (FastAPI), Deepgram API, Claude API, PostgreSQL, React
- **Output Directory:** `.\dist\`

## 🚀 Setup Instructions

### 1. Initialize Python Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn deepgram-sdk anthropic sqlalchemy asyncpg python-multipart
```

### 2. Environment Variables
```powershell
@"
DATABASE_URL=postgresql://localhost:5432/pactpull
DEEPGRAM_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
ASANA_ACCESS_TOKEN=your_token
LINEAR_API_KEY=your_key
"@ | Out-File -FilePath .env -Encoding utf8
```

### 3. Run Development Server
```powershell
cd src
uvicorn main:app --reload --port 8000
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md` for core mission and anti-scope.
- **Tasks:** Check `TASKS.md` for current objectives.

## 📋 Task Management
1. Check `TASKS.md` for current objectives.
2. Update `CHANGELOG.md` upon completion.

## 🔌 Key Integrations
- **Deepgram:** Transcription API
- **Claude:** Commitment extraction
- **Asana/Linear:** Task export
