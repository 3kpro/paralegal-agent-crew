# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_08_Meeting_Commitment_Extractor\`
- **Backend:** Python (FastAPI), SQLAlchemy, PostgreSQL
- **Frontend:** React (Vite, TypeScript, TailwindCSS)
- **AI Services:** Deepgram (Transcription), Anthropic Claude (Extraction)
- **Integrations:** Asana, Linear, Slack

## 🚀 Setup Instructions

### 1. Backend Setup
```powershell
# Create and activate venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r src/requirements.txt
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root based on `.env.example`:
```powershell
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/pactpull
DEEPGRAM_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
ASANA_ACCESS_TOKEN=your_token
LINEAR_API_KEY=your_key
LINEAR_TEAM_ID=your_id
SLACK_BOT_TOKEN=your_token
SLACK_CHANNEL_ID=your_channel
```

### 4. Running the Application

**Run Backend:**
```powershell
# From project root
uvicorn src.main:app --reload --port 8000
```

**Run Frontend:**
```powershell
# From frontend directory
npm run dev
```

## 📋 Project Documentation
- **Product Vision:** `TRUTH.md`
- **Current Tasking:** `TASKS.md`
- **History:** `CHANGELOG.md`

## 🔌 Core Services
- **TranscriptionService:** Handles Deepgram API
- **ExtractionService:** Handles Claude AI prompt engineering
- **AsanaService/LinearService:** Integration export logic
- **SlackService:** Formatted message delivery
