# Statement of Truth - SolForge

## Core Purpose
An AI-driven Solana trading bot with multi-lane architecture, compounding intelligence that learns from every trade, and tiered risk profiles. Designed to grow $20 investments into significant returns through adaptive machine learning strategies.

## Target User
- Carlos Spicy Wiener (primary)
- Solo traders who want hands-off AI trading
- Crypto enthusiasts experimenting with algorithmic strategies
- Developers learning AI/ML trading systems

## Value Proposition
Set it. Forget it. Watch it learn. Multiple parallel trading lanes with different risk profiles, each with its own AI brain that gets smarter after every trade.

## Core Architecture

### Multi-Lane System
Each "lane" is an independent trading instance with:
- Its own wallet allocation ($20 starting capital per lane)
- Its own risk profile (Safe, Moderate, YOLO)
- Its own AI model that learns from its trades
- Its own performance metrics and history
- Configurable guardrails (max loss threshold, position limits)

### Risk Profiles
1. **Safe Mode** 🛡️
   - Max position: 10% of lane capital
   - Stop loss: 3%
   - Only trades established tokens (SOL, USDC, RAY, JUP)
   - Trade frequency: 1-2 per day max
   - Learning rate: Conservative (slow adaptation)

2. **Moderate Mode** ⚖️
   - Max position: 25% of lane capital
   - Stop loss: 7%
   - Trades top 50 tokens by volume
   - Trade frequency: 3-5 per day
   - Learning rate: Balanced

3. **YOLO Mode** 🚀 ("R U Fucking Serious")
   - Max position: 50% of lane capital
   - Stop loss: 15%
   - Trades any token with sufficient liquidity
   - Trade frequency: Unlimited
   - Learning rate: Aggressive (fast adaptation)
   - Includes memecoin hunting

### AI/ML Engine
- **Base Model**: Reinforcement Learning (PPO/DQN hybrid)
- **Feature Engineering**: 
  - Price momentum (multiple timeframes)
  - Volume analysis
  - Volatility metrics
  - On-chain signals (whale movements, liquidity changes)
  - Social sentiment (optional)
- **Learning Loop**: After each trade, model updates with:
  - Entry/exit effectiveness
  - Timing optimization
  - Risk-adjusted returns
  - Market regime classification
- **Compounding Intelligence**: Each lane's model improves independently, developing its own "personality" based on its risk profile and trade history

### Trading Modes
1. **Paper Trading** (MVP)
   - Simulates trades against real Jupiter price feeds
   - Tracks virtual P&L with realistic slippage/fees
   - AI learns from virtual trades
   - Readiness threshold before live trading

2. **Live Trading** (Post-MVP)
   - Connects to Phantom/Solflare via WalletConnect or direct keypair
   - Executes real swaps through Jupiter API
   - Same guardrails, real money

## MVP Features (v1.0 ONLY)
- [ ] Paper trading engine with virtual wallet
- [ ] Jupiter API integration for real-time prices
- [ ] 3 concurrent lanes with different risk profiles
- [ ] Basic RL model (Q-learning to start, upgrade to PPO later)
- [ ] SQLite persistence for trades and model state
- [ ] Web dashboard showing all lanes, P&L, trade history
- [ ] Guardrails: max loss per lane, per trade, daily limits
- [ ] Telegram bot alerts via BotFather
- [ ] Readiness score for each lane (when to go live)

## Anti-Scope (DO NOT BUILD in MVP)
- Live trading with real money (Phase 2)
- Blue chip stock trading (separate product)
- Mobile app (web-first)
- Multi-user/SaaS mode
- Backtesting framework (use live paper trading instead)
- Complex order types (limit, stop-limit) — market swaps only

## Tech Stack
- **Language**: Python 3.11+
- **Web Framework**: FastAPI (async, WebSocket support)
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **AI/ML**: 
  - PyTorch for neural networks
  - Stable-Baselines3 for RL algorithms
  - Pandas/NumPy for data processing
- **Solana Integration**:
  - jupiter-python-sdk for swaps
  - solana-py / solders for chain interaction
- **Frontend**: React + TailwindCSS + Recharts
- **Telegram**: python-telegram-bot
- **Deployment**: Docker → 3kpro.services subdomain

## Monetization
- Personal tool (no monetization for MVP)
- Future: SaaS with subscription tiers

## Timeline
- MVP Complete: TBD (target 2-3 weeks)
- Paper Trading Validated: +1 week
- Live Trading Enabled: After consistent paper trading profits

## Current Phase
- [ ] Research & Validation ← YOU ARE HERE
- [ ] Core Engine Build
- [ ] Paper Trading Loop
- [ ] AI/ML Integration
- [ ] Dashboard Build
- [ ] Telegram Integration
- [ ] Testing & Optimization
- [ ] Deploy to 3kpro.services
- [ ] Live Trading (Phase 2)

## Key Metrics to Track
- Per-lane P&L (realized and unrealized)
- Win rate per lane
- Average trade duration
- Sharpe ratio per lane
- Max drawdown
- AI confidence scores over time
- Learning curve visualization

## Guardrails (Non-Negotiable)
1. **Lane Kill Switch**: If lane loses X% of initial capital, trading stops
2. **Daily Loss Limit**: Max loss per day across all lanes
3. **Position Size Limits**: Never exceed profile max
4. **Slippage Protection**: Skip trades if slippage > threshold
5. **Liquidity Check**: Don't trade tokens with < $10K liquidity
6. **Cool-down Period**: After a loss, wait N minutes before next trade

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
| 2026-01-11 | Claude Opus | Architecture | Designed multi-lane AI trading system |
