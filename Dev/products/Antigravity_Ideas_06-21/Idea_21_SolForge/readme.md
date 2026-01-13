# 🔥 SolForge - AI-Powered Solana Trading Bot

> **Status:** Active Development 🚧  
> **Mission:** Turn $20 into much more through compounding AI intelligence.

```
   ____        _ _____                    
  / ___|  ___ | |  ___|__  _ __ __ _  ___ 
  \___ \ / _ \| | |_ / _ \| '__/ _` |/ _ \
   ___) | (_) | |  _| (_) | | | (_| |  __/
  |____/ \___/|_|_|  \___/|_|  \__, |\___|
                               |___/      
  Multi-Lane AI Trading on Solana
```

## 🎯 What Is This?

SolForge is a personal AI trading bot that:

1. **Runs multiple parallel trading "lanes"** — each with its own $20 allocation
2. **Uses different risk profiles** — Safe 🛡️, Moderate ⚖️, YOLO 🚀
3. **Learns from every trade** — AI models that compound intelligence over time
4. **Starts with paper trading** — prove it works before risking real money
5. **Has built-in guardrails** — automatic stops when things go wrong

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SOLFORGE CORE                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Lane 1    │  │   Lane 2    │  │   Lane 3    │   ...   │
│  │   🛡️ Safe   │  │  ⚖️ Moderate │  │   🚀 YOLO   │         │
│  │   $20       │  │    $20      │  │    $20      │         │
│  │   AI Brain  │  │   AI Brain  │  │   AI Brain  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Jupiter API │ Price Feeds │ Swap Execution │ Liquidity    │
├─────────────────────────────────────────────────────────────┤
│  Paper Trader │ Virtual Wallet │ Realistic Slippage/Fees   │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Telegram Alerts │ Trade History │ Analytics   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Risk Profiles

| Profile | Max Position | Stop Loss | Tokens | Trades/Day | Vibe |
|---------|-------------|-----------|--------|------------|------|
| 🛡️ Safe | 10% | 3% | Top 10 | 1-2 | "I like sleep" |
| ⚖️ Moderate | 25% | 7% | Top 50 | 3-5 | "Balanced life" |
| 🚀 YOLO | 50% | 15% | Anything liquid | ∞ | "LFG" |

## 🧠 How The AI Learns

1. **Observe** — Price action, volume, volatility, on-chain signals
2. **Decide** — Buy, sell, or hold based on current model
3. **Execute** — Paper trade (or live trade when ready)
4. **Learn** — Update model based on outcome
5. **Compound** — Each trade makes the model smarter

The AI uses reinforcement learning — it gets "rewarded" for profitable trades and "punished" for losses. Over time, it learns patterns specific to its risk profile.

## 🛡️ Guardrails

Non-negotiable safety systems:

- **Lane Kill Switch** — If lane loses X% of capital, it stops
- **Daily Loss Limit** — Max loss per day across all lanes
- **Position Limits** — Never exceed profile maximums
- **Slippage Protection** — Skip trades with excessive slippage
- **Liquidity Check** — Only trade tokens with real liquidity
- **Cool-down** — Pause after losses to prevent tilt trading

## 📁 Project Structure

```
Idea_21_SolForge/
├── TRUTH.md              # Product spec and vision
├── TASKS.md              # Current work queue
├── CHANGELOG.md          # Development history
├── readme.md             # This file
├── opencode.md           # Agent setup instructions
├── config/               # Configuration files
├── src/
│   ├── core/             # Lane, wallet, paper trader, guardrails
│   ├── ai/               # Q-learning, PPO, feature engineering
│   ├── lanes/            # Risk profile implementations
│   ├── api/              # FastAPI backend
│   ├── dashboard/        # React frontend
│   └── integrations/     # Jupiter, Telegram, wallet connectors
├── tests/                # Test suite
├── docs/                 # Technical documentation
├── assets/               # Marketing materials
└── dist/                 # Build artifacts
```

## 🏃 Quick Start

```bash
# Clone and setup
cd Idea_21_SolForge
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt

# Configure
cp config/config.example.yaml config/config.yaml
# Edit config.yaml with your settings

# Run paper trading
python -m src.core.main --mode paper

# Run dashboard
cd src/dashboard && npm install && npm run dev
```

## 📊 Roadmap

1. ✅ Architecture Design
2. 🔄 Core Engine (Paper Trading)
3. ⏳ Jupiter Integration
4. ⏳ AI/ML Models
5. ⏳ Dashboard
6. ⏳ Telegram Bot
7. ⏳ Deploy to 3kpro.services
8. ⏳ Live Trading (Phase 2)

---

*Built with 🔥 by the Antigravity Crew*

**Disclaimer:** This is experimental software for educational purposes. Trading cryptocurrency involves significant risk. Never trade with money you can't afford to lose.
