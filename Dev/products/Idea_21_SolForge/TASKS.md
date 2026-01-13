# TASKS - Idea 21: SolForge AI Trading Bot

## NOW
- [ ] **Deploy to Always-On Machine** 🚀
      - **Goal:** Move SolForge to a machine that runs 24/7 for continuous paper trading.
      - **Action:** Follow [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) to deploy via Docker.
      - **Options:** VPS ($5-10/mo), Raspberry Pi, or home server.
      - *Rationale: Readiness requires 2-4 weeks continuous operation to hit thresholds.*

- [ ] **Start Extended Paper Trading** 🏃
      - **Goal:** Run paper trading for 2-4 weeks to reach readiness thresholds.
      - **Action:** `docker-compose up -d` and monitor via dashboard.
      - **Readiness Targets:**
        - 100+ trades per lane
        - 55%+ win rate
        - 1.0+ Sharpe ratio
        - <15% max drawdown
        - 5 consecutive profitable days
        - 7+ days runtime
      - *Status: Readiness scoring system integrated. Check `/lanes/{id}/readiness` endpoint.*

## NEXT
- [ ] **Mainnet Small-Cap Scout** ⚓
      - **Goal:** Run with $10-$20 real capital to verify live PnL accuracy.
      - **Prerequisites:** At least ONE lane must achieve readiness score 80+.
      - **Action:**
            1. Check readiness: `curl http://localhost:8000/api/v1/lanes/{id}/readiness`
            2. Set `MOCK_MODE=False` in `.env`
            3. Provide `SOLANA_PRIVATE_KEY` and `SOLANA_RPC_URL`
            4. Start with Safe lane only
      - *Status: System prepped with live `execute_swap` and SL/TP guardrails. DO NOT run until readiness confirmed.*

## BACKLOG
- [ ] **Full Raydium SDK Integration** 🔧
      - **Goal:** Complete raw transaction building for Raydium V4 swaps.
      - **Action:** Integrate full Raydium SDK or manual instruction building with proper account layouts.
      - *Status: Quote calculation complete, execution layer pending for production.*

## COMPLETED
- [x] **Readiness Scoring System** 🎯
      - **Goal:** Implement objective criteria to determine when paper trading lanes can graduate to live trading.
      - **Action:** Created `src/core/readiness.py` with multi-factor weighted scoring (trade volume, win rate, Sharpe ratio, drawdown, consistency, runtime). Integrated into orchestrator and exposed via `/lanes/{id}/readiness` API endpoint. Added dashboard display with visual indicators.

- [x] **Multi-DEX Aggregator: Raydium Direct** 🌊
      - **Goal:** Execute trades directly on Raydium pools for lower fees on specific pairs.
      - **Action:** Implemented `RaydiumClient`, `RouteSelector`, and intelligent DEX routing in orchestrator.
- [x] **MEV Guard: Priority Fee Scaling** 🛡️
      - **Goal:** Dynamically set priority fees based on network congestion.
      - **Action:** Created `src/integrations/priority_fees.py` and integrated into `JupiterClient` for real-time gas optimization.

- [x] **Adaptive Slippage Bot** 📉
      - **Goal:** Dynamically adjust slippage based on volume and pool depth.
      - **Action:** Created `src/core/slippage.py` and integrated into `JupiterClient` with re-quoting logic.

- [x] **Multi-Token Arbitrage Portfolio** 🧺
      - **Goal:** Expand scouting to check 50+ token pairs simultaneously.
      - **Action:** Created `src/core/token_list.py` with 20+ high-volume targets and implemented batching in `ArbitrageScout`.

- [x] **Advanced PnL Analytics UI** 📊
      - **Goal:** Provide deeper insights into trade performance and Risk scaling efficacy.
      - **Action:** Implemented `AnalyticsCharts` with Recharts; added Sharpe, Drawdown, and Profit Factor calculations to backend.

- [x] **Dynamic Risk Scaling** 📈
      - **Goal:** Adjust position sizes based on volatility and PPO confidence.
      - **Action:** Created `src/core/risk_manager.py` with Kelly Criterion and Volatility scaling; integrated into Orchestrator.

- [x] **Flash-Loan Executor Integration** ⚡
      - **Goal:** Enable the bot to actually execute detected arbitrage opportunities.
      - **Action:** Implemented atomic cyclic arbitrage execution via Jito bundles in `ArbitrageScout`.

- [x] **Performance Tuning & Jito Bundling** 🏎️
      - **Goal:** Minimize latency and optimize tip/profit ratio.
      - **Action:** Parallelized lane processing and implemented atomic Jito swap bundles.

- [x] **Flash-Loan Arbitrage Scout** ⚡
      - **Goal:** Identify price discrepancies between different DEX routes.
      - **Action:** Created `src/integrations/jito.py` and `ArbitrageScout` for cyclic delta scanning.

- [x] **Live Trading Scout** 🔭
      - **Goal:** Prepare for mainnet deployment with small capital.
      - **Action:** Integrated `solana-py`, `solders`, and implemented `execute_swap` in `JupiterClient`.

- [x] **PPO Integration** 🤖
      - **Goal:** Replace Q-Learning with PPO Agent.
      - **Action:** Transitioned `orchestrator.py` to `PPOAgent`, updated `AITrainer` for vector state processing.

- [x] **System Optimizations** ⚡
      - **Goal:** Add caching, improve database indexing.
      - **Action:** Added indexes to `TradeSQL` and optimized orchestrator persistence loop.
- [x] **Data Export** 📤
      - **Goal:** Export PnL reports to CSV.
      - **Action:** Added `/api/v1/export/csv` (StreamingResponse) and Dashboard Download button.
- [x] **Paper Trading Run** 🏃
      - **Goal:** Execute a 24h simulated run.
      - **Action:** Created `scripts/start_paper_trading.ps1` and `PAPER_TRADING_LOG.md` for execution protocol.
- [x] **MVP Refinement** 💎
      - **Goal:** Polish UI, improve logs, verify PPO performance.
      - **Action:** Added `Rich` logging and `TradesList` UI component.
- [x] **3kpro.services Integration** 🌍
      - **Goal:** Deploy deployment artifacts and documentation.
      - **Action:** Created `DEPLOYMENT_GUIDE.md`, CI workflows, and Nginx configs.
- [x] **Deployment Config** 🐳
      - **Goal:** Containerize the application for easy deployment.
      - **Action:** Created `Dockerfile` for Backend, `Dockerfile` for Frontend (Nginx), and `docker-compose.yml`.
- [x] **PPO Agent Upgrade** 🚀
      - **Goal:** Replace Q-Learning with Proximal Policy Optimization.
      - **Action:** Created `src/ai/ppo_agent.py` using PyTorch Actor-Critic architecture.
- [x] **Telegram Bot** 📱
      - **Goal:** Real-time notifications for trades and system alerts.
      - **Action:** Created `src/integrations/telegram_bot.py` with mock mode.
- [x] **React Dashboard** 📈
      - **Goal:** Frontend to visualize lanes and trades.
      - **Action:** Created Vite+React app in `src/dashboard/` with Glassmorphism UI and control actions.
- [x] **FastAPI Backend** 🌐
      - **Goal:** Expose lane status and trade history via REST API.
      - **Action:** Created `src/api/main.py` and `src/api/routes.py` with `lifespan` management.
- [x] **Multi-Lane Orchestrator** 🎛️
      - **Goal:** Integrates PaperTrader, Database, AI, and Jupiter.
      - **Action:** Created `src/core/orchestrator.py` with persistence and async tick loop.
- [x] **Learning Loop** 🔄
      - **Goal:** Orchestrate the AI training process.
      - **Action:** Created `src/ai/trainer.py` with state quantization.
- [x] **Feature Engineering Pipeline** 📊
      - **Goal:** Transform raw market data into AI-ready features (e.g. RSI, MACD, Volatility).
      - **Action:** Created `src/ai/features.py` using Pandas/NumPy.
- [x] **Basic Q-Learning Agent** 🧠
      - **Goal:** Implement the initial RL agent using Q-learning.
      - **Action:** Created `src/ai/q_learning.py` with epsilon-greedy strategy and persistence.
- [x] **Database Layer** 💾
      - **Goal:** Persist trades, lane state, and model checkpoints.
      - **Action:** Created `src/core/database.py` with SQLAlchemy models and repositories.
- [x] **Risk Profile System** ⚖️
      - **Goal:** Implement Safe, Moderate, YOLO profiles with guardrails.
      - **Action:** Created `src/core/risk_profiles.py`
- [x] **Jupiter Integration** 🪐
      - **Goal:** Connect to Jupiter API for real-time quotes and simulated swaps.
      - **Action:** Created `src/integrations/jupiter.py` (with Mock Mode for dev)
- [x] **Core Engine Foundation** ✅
      - **Goal:** Build the trading lane abstraction and paper trading engine.
      - **Action:** Created `src/core/lane.py`, `src/core/paper_trader.py`, `src/core/wallet.py`
- [x] **Project Scaffolding** ✅
      - Created TRUTH.md, TASKS.md, directory structure
