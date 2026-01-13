"""
SolForge Data Models
Pydantic models for type safety and validation
"""
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class RiskProfile(str, Enum):
    """Trading risk profiles"""
    SAFE = "safe"
    MODERATE = "moderate"
    YOLO = "yolo"


class LaneStatus(str, Enum):
    """Lane operational status"""
    ACTIVE = "active"
    PAUSED = "paused"
    KILLED = "killed"
    COOLDOWN = "cooldown"


class TradeAction(str, Enum):
    """Possible trade actions"""
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


class TradeStatus(str, Enum):
    """Trade execution status"""
    PENDING = "pending"
    EXECUTED = "executed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TokenBalance(BaseModel):
    """Token balance in wallet"""
    mint: str
    symbol: str
    amount: Decimal
    usd_value: Optional[Decimal] = None
    
    class Config:
        json_encoders = {Decimal: str}


class Trade(BaseModel):
    """Individual trade record"""
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    lane_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    action: TradeAction
    input_token: str
    output_token: str
    input_amount: Decimal
    output_amount: Optional[Decimal] = None
    price_at_entry: Decimal
    price_at_exit: Optional[Decimal] = None
    slippage_bps: Optional[int] = None
    fees_paid: Decimal = Decimal("0")
    pnl: Optional[Decimal] = None
    pnl_pct: Optional[float] = None
    status: TradeStatus = TradeStatus.PENDING
    ai_confidence: Optional[float] = None
    ai_reasoning: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {Decimal: str, datetime: lambda v: v.isoformat()}


class LaneState(BaseModel):
    """Complete state of a trading lane"""
    id: str
    name: str
    profile: RiskProfile
    status: LaneStatus
    created_at: datetime
    initial_capital: Decimal
    current_capital: Decimal
    total_pnl: Decimal
    total_pnl_pct: float
    win_count: int = 0
    loss_count: int = 0
    total_trades: int = 0
    consecutive_losses: int = 0
    last_trade_at: Optional[datetime] = None
    cooldown_until: Optional[datetime] = None
    ai_model_version: str = "v0.1"
    readiness_score: float = 0.0
    
    @property
    def win_rate(self) -> float:
        if self.total_trades == 0:
            return 0.0
        return self.win_count / self.total_trades

class PnLPoint(BaseModel):
    """A single point in PnL history"""
    timestamp: datetime
    pnl: float
    total_value: float

class LaneAnalytics(BaseModel):
    """Advanced analytics for a trading lane"""
    lane_id: str
    sharpe_ratio: float
    max_drawdown: float
    profit_factor: float
    pnl_history: List[PnLPoint]
    
    class Config:
        json_encoders = {Decimal: str, datetime: lambda v: v.isoformat()}


class PriceQuote(BaseModel):
    """Jupiter price quote"""
    input_mint: str
    output_mint: str
    input_amount: Decimal
    output_amount: Decimal
    price: Decimal
    price_impact_pct: float
    slippage_bps: int
    route: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    class Config:
        json_encoders = {Decimal: str}


class MarketData(BaseModel):
    """Market data for a token"""
    mint: str
    symbol: str
    price_usd: Decimal
    volume_24h: Decimal
    liquidity_usd: Decimal
    price_change_1h: float
    price_change_24h: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {Decimal: str}


class AIDecision(BaseModel):
    """AI model decision output"""
    action: TradeAction
    confidence: float  # 0-1
    target_token: Optional[str] = None
    position_size_pct: float
    stop_loss_price: Optional[Decimal] = None
    take_profit_price: Optional[Decimal] = None
    reasoning: str
    features_snapshot: Dict[str, float]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {Decimal: str}


class LaneMetrics(BaseModel):
    """Performance metrics for a lane"""
    lane_id: str
    period_start: datetime
    period_end: datetime
    total_return_pct: float
    sharpe_ratio: Optional[float] = None
    max_drawdown_pct: float
    win_rate: float
    avg_trade_duration_minutes: float
    best_trade_pnl: Decimal
    worst_trade_pnl: Decimal
    total_fees_paid: Decimal
    trades_count: int
    
    class Config:
        json_encoders = {Decimal: str}


class TelegramAlert(BaseModel):
    """Telegram notification payload"""
    alert_type: str
    lane_id: Optional[str] = None
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    priority: str = "normal"  # low, normal, high, critical
