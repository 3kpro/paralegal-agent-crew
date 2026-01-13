# OpenCode Setup & Environment Guide

This document provides exact instructions for the **OpenCode** agent to initialize and manage the **SolForge** environment.

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_21_SolForge\`
- **Primary Stack:** Python 3.11+, FastAPI, PyTorch, React, SQLite/PostgreSQL
- **Output Directory:** `.\dist\`

## 🚀 Setup Instructions

### 1. Python Environment
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Required Python Packages
```powershell
pip install fastapi uvicorn sqlalchemy asyncpg aiosqlite
pip install torch numpy pandas scikit-learn
pip install stable-baselines3 gymnasium
pip install jupiter-python-sdk solana solders
pip install python-telegram-bot httpx websockets
pip install pydantic pyyaml python-dotenv
pip install pytest pytest-asyncio
```

### 3. Environment Variables
```powershell
@"
# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com

# Jupiter API
JUPITER_QUOTE_API=https://quote-api.jup.ag/v6/quote
JUPITER_SWAP_API=https://quote-api.jup.ag/v6/swap

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Database
DATABASE_URL=sqlite:///./solforge.db

# Trading Config
PAPER_TRADING=true
LANE_INITIAL_CAPITAL=20.0
"@ | Out-File -FilePath .env -Encoding utf8
```

### 4. Database Setup
```powershell
# Initialize SQLite database
python -c "from src.core.database import init_db; init_db()"
```

### 5. Run Development Server
```powershell
# Start the trading engine
python -m src.core.main --mode paper

# In another terminal, start the API
uvicorn src.api.main:app --reload --port 8000

# In another terminal, start the dashboard
cd src/dashboard
npm install
npm run dev
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md` for core mission, risk profiles, and guardrails.
- **Tasks:** Check `TASKS.md` for current objectives.
- **Architecture:** Multi-lane system with independent AI brains per lane.

## 🔑 Key Files to Understand

### Core Engine
- `src/core/lane.py` — Trading lane abstraction
- `src/core/paper_trader.py` — Simulated trading engine
- `src/core/wallet.py` — Virtual wallet management
- `src/core/guardrails.py` — Safety limits and kill switches
- `src/core/orchestrator.py` — Manages all lanes

### AI/ML
- `src/ai/q_learning.py` — Basic Q-learning agent
- `src/ai/ppo_agent.py` — Advanced PPO agent
- `src/ai/features.py` — Feature engineering pipeline
- `src/ai/trainer.py` — Learning loop

### Integrations
- `src/integrations/jupiter.py` — Jupiter API wrapper
- `src/integrations/telegram_bot.py` — Alert system
- `src/integrations/wallet_connect.py` — Live wallet connection (Phase 2)

## 📋 Task Management
When performing work:
1. Check `TASKS.md` for current objectives.
2. Update `CHANGELOG.md` upon completion.
3. Run tests: `pytest tests/`
4. Ensure guardrails are never bypassed.

## 🧪 Testing
```powershell
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_paper_trader.py -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html
```

## 🐳 Docker Deployment
```powershell
# Build
docker build -t solforge:latest .

# Run
docker-compose up -d
```

## 🌐 Production Deployment (3kpro.services)
```powershell
# Build production assets
cd src/dashboard && npm run build

# Deploy to subdomain
# Configure nginx/Caddy for solforge.3kpro.services
```

## ⚠️ Critical Reminders
1. **NEVER** disable guardrails
2. **ALWAYS** start with paper trading
3. **VERIFY** Jupiter quotes before simulating trades
4. **LOG** every trade decision for ML training
5. **BACKUP** model checkpoints regularly
