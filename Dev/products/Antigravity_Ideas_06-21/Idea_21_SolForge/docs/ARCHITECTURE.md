# Technical Architecture - SolForge

## System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                           SOLFORGE ENGINE                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    LANE ORCHESTRATOR                             │   │
│  │  - Manages all trading lanes                                     │   │
│  │  - Coordinates price updates                                     │   │
│  │  - Handles shutdown/persistence                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   LANE 1     │  │   LANE 2     │  │   LANE 3     │   ...            │
│  │   🛡️ Safe    │  │  ⚖️ Moderate │  │   🚀 YOLO    │                  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤                  │
│  │ VirtualWallet│  │ VirtualWallet│  │ VirtualWallet│                  │
│  │ Q-Learning   │  │ Q-Learning   │  │ Q-Learning   │                  │
│  │ Features     │  │ Features     │  │ Features     │                  │
│  │ TradeHistory │  │ TradeHistory │  │ TradeHistory │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       GUARDRAILS                                 │   │
│  │  - Kill switches        - Daily limits      - Slippage checks   │   │
│  │  - Position limits      - Cooldowns         - Liquidity checks  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                         INTEGRATIONS                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   JUPITER    │  │   TELEGRAM   │  │    WALLET    │                  │
│  │   - Quotes   │  │   - Alerts   │  │  - Connect   │                  │
│  │   - Swaps    │  │   - Updates  │  │  - Sign txs  │                  │
│  │   - Prices   │  │   - Commands │  │  (Phase 2)   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                           PERSISTENCE                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   SQLite     │  │  Checkpoints │  │    Logs      │                  │
│  │   - Trades   │  │  - Q-tables  │  │  - Events    │                  │
│  │   - States   │  │  - Weights   │  │  - Errors    │                  │
│  │   - Metrics  │  │  - Config    │  │  - Trades    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Jupiter   │────▶│   Feature   │────▶│  Q-Learning │
│   Prices    │     │  Extractor  │     │    Agent    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                           ┌────────────────────┘
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Guardrails │◀────│  AI Decision │────▶│   Virtual   │
│    Check    │     │  (Action)   │     │   Wallet    │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                        │
       ▼                                        ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ALLOW /   │────▶│   Execute   │────▶│   Update    │
│    BLOCK    │     │ Paper Trade │     │  AI Model   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## AI/ML Pipeline

### Feature Extraction
```python
features = {
    # Primary (for Q-learning state discretization)
    "momentum": float,      # Price change % over 5 candles
    "volume_ratio": float,  # Current vs average volume
    "position_pct": float,  # Current position as % of capital
    "pnl_pct": float,       # Recent P&L %

    # Extended (for future DNN)
    "momentum_1": float,    # 1-candle momentum
    "momentum_20": float,   # 20-candle momentum
    "volatility": float,    # Standard deviation of returns
    "rsi": float,           # Relative Strength Index (normalized)
    "price_range_pct": float,  # Position in recent price range
}
```

### State Space (Q-Learning)
- **Momentum**: 5 bins (falling_fast, falling, flat, rising, rising_fast)
- **Volume**: 3 bins (low, medium, high)
- **Position**: 3 bins (short, neutral, long)
- **P&L**: 3 bins (negative, neutral, positive)
- **Total states**: 5 × 3 × 3 × 3 = 135

### Action Space
- **BUY**: Enter or add to long position
- **SELL**: Exit or reduce position
- **HOLD**: No action

### Reward Function
```python
reward = pnl_pct * 100  # Scale P&L
reward -= 0.05          # Transaction cost penalty
if holding_too_long:
    reward -= 0.1       # Opportunity cost
```

## API Endpoints (FastAPI)

```
GET  /status              # Engine status
GET  /lanes               # List all lanes
GET  /lanes/{id}          # Lane details
GET  /lanes/{id}/trades   # Lane trade history
POST /lanes/{id}/pause    # Pause lane
POST /lanes/{id}/resume   # Resume lane
GET  /metrics             # Performance metrics
GET  /ws/prices           # WebSocket price feed
GET  /ws/trades           # WebSocket trade feed
```

## Database Schema

### trades
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| lane_id | TEXT | Foreign key to lane |
| timestamp | DATETIME | Trade time |
| action | TEXT | BUY/SELL/HOLD |
| input_token | TEXT | Token sold |
| output_token | TEXT | Token bought |
| input_amount | DECIMAL | Amount sold |
| output_amount | DECIMAL | Amount received |
| pnl | DECIMAL | Profit/loss |
| ai_confidence | FLOAT | AI confidence score |

### lane_states
| Column | Type | Description |
|--------|------|-------------|
| lane_id | TEXT | Primary key |
| status | TEXT | ACTIVE/PAUSED/KILLED |
| current_capital | DECIMAL | Current value |
| total_pnl | DECIMAL | Total P&L |
| win_count | INT | Winning trades |
| loss_count | INT | Losing trades |

## Deployment

### Local Development
```bash
python -m src.core.main --mode paper
```

### Production (Docker)
```yaml
# docker-compose.yml
services:
  solforge:
    build: .
    environment:
      - SOLANA_RPC_URL=...
      - TELEGRAM_BOT_TOKEN=...
    volumes:
      - ./data:/app/data
      - ./checkpoints:/app/checkpoints
```

### 3kpro.services Subdomain
- URL: `https://solforge.3kpro.services`
- API: `https://api.solforge.3kpro.services`
- Dashboard served via Nginx/Caddy
- API behind reverse proxy with auth

## Security Considerations

1. **Private Keys**: Never stored in code or config, loaded from env
2. **Paper Trading First**: All features tested in paper mode before live
3. **Guardrails**: Cannot be disabled programmatically
4. **Rate Limiting**: Jupiter API calls rate-limited to avoid bans
5. **Audit Logging**: All trades logged with full context
