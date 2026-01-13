"""
SolForge Trading Lane
Independent trading unit with its own wallet, AI, and history
"""
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any, List
from uuid import uuid4
import logging

from .models import (
    LaneState, LaneStatus, RiskProfile, Trade, TradeAction, 
    TradeStatus, AIDecision, PriceQuote
)
from .wallet import VirtualWallet, InsufficientBalanceError
from .guardrails import Guardrails, GuardrailViolation

logger = logging.getLogger(__name__)


class TradingLane:
    """
    An independent trading lane with its own:
    - Virtual wallet
    - Risk profile
    - AI model
    - Trade history
    - Performance metrics
    """
    
    def __init__(
        self,
        name: str,
        profile: RiskProfile,
        initial_capital: Decimal,
        profile_config: Dict[str, Any],
        guardrails: Guardrails,
        lane_id: Optional[str] = None
    ):
        """
        Initialize a trading lane.
        
        Args:
            name: Human-readable lane name
            profile: Risk profile (safe, moderate, yolo)
            initial_capital: Starting capital in USD (will be converted to SOL)
            profile_config: Risk profile configuration
            guardrails: Guardrails instance for safety checks
            lane_id: Optional ID (generated if not provided)
        """
        self.id = lane_id or str(uuid4())[:8]
        self.name = name
        self.profile = profile
        self.profile_config = profile_config
        self.initial_capital = initial_capital
        self.guardrails = guardrails
        
        # State
        self.status = LaneStatus.ACTIVE
        self.created_at = datetime.utcnow()
        self.cooldown_until: Optional[datetime] = None
        
        # Wallet (starts with SOL equivalent of initial capital)
        # Note: In real usage, we'd convert USD to SOL based on current price
        self.wallet = VirtualWallet(
            lane_id=self.id,
            initial_sol_amount=initial_capital  # Simplified: assume 1 SOL = $1 for MVP
        )
        
        # Trade history
        self.trades: List[Trade] = []
        
        # Performance tracking
        self.win_count = 0
        self.loss_count = 0
        self.consecutive_losses = 0
        self.last_trade_at: Optional[datetime] = None
        
        # AI model reference (will be set by orchestrator)
        self.ai_model = None
        self.ai_model_version = "v0.1"
        
        logger.info(f"Lane {self.id} '{name}' initialized with {profile.value} profile")
    
    @property
    def current_capital(self) -> Decimal:
        """Get current capital value (simplified: just SOL balance for MVP)"""
        sol_mint = "So11111111111111111111111111111111111111112"
        return self.wallet.get_balance(sol_mint)
    
    @property
    def total_pnl(self) -> Decimal:
        """Calculate total profit/loss"""
        return self.current_capital - self.initial_capital
    
    @property
    def total_pnl_pct(self) -> float:
        """Calculate total P&L percentage"""
        if self.initial_capital == 0:
            return 0.0
        return float(self.total_pnl / self.initial_capital)
    
    @property
    def win_rate(self) -> float:
        """Calculate win rate"""
        total = self.win_count + self.loss_count
        if total == 0:
            return 0.0
        return self.win_count / total
    
    @property
    def total_trades(self) -> int:
        """Total number of completed trades"""
        return len([t for t in self.trades if t.status == TradeStatus.EXECUTED])
    
    @property
    def readiness_score(self) -> float:
        """
        Calculate readiness for live trading (0-1).
        Based on trade count, win rate, and Sharpe ratio.
        """
        min_trades = 100  # Need at least 100 trades
        min_win_rate = 0.55  # Need >55% win rate
        
        if self.total_trades < min_trades:
            trade_score = self.total_trades / min_trades
        else:
            trade_score = 1.0
        
        if self.win_rate < min_win_rate:
            win_score = self.win_rate / min_win_rate
        else:
            win_score = 1.0
        
        # Simple Sharpe approximation (would be more complex in production)
        pnl_score = min(1.0, max(0.0, (self.total_pnl_pct + 0.1) / 0.2))
        
        return (trade_score * 0.3 + win_score * 0.4 + pnl_score * 0.3)
    
    def get_state(self) -> LaneState:
        """Get current lane state as a model"""
        return LaneState(
            id=self.id,
            name=self.name,
            profile=self.profile,
            status=self.status,
            created_at=self.created_at,
            initial_capital=self.initial_capital,
            current_capital=self.current_capital,
            total_pnl=self.total_pnl,
            total_pnl_pct=self.total_pnl_pct,
            win_count=self.win_count,
            loss_count=self.loss_count,
            total_trades=self.total_trades,
            consecutive_losses=self.consecutive_losses,
            last_trade_at=self.last_trade_at,
            cooldown_until=self.cooldown_until,
            ai_model_version=self.ai_model_version,
            readiness_score=self.readiness_score
        )
    
    def can_trade(
        self,
        position_value: Decimal,
        liquidity_usd: Decimal
    ) -> tuple[bool, Optional[GuardrailViolation]]:
        """
        Check if lane can execute a trade.
        
        Args:
            position_value: Value of proposed position
            liquidity_usd: Token liquidity
            
        Returns:
            Tuple of (can_trade, violation_if_any)
        """
        if self.status != LaneStatus.ACTIVE:
            return False, None
        
        return self.guardrails.can_trade(
            lane=self.get_state(),
            profile_config=self.profile_config,
            position_value=position_value,
            liquidity_usd=liquidity_usd
        )
    
    def execute_paper_trade(
        self,
        action: TradeAction,
        input_token: str,
        output_token: str,
        input_amount: Decimal,
        quote: PriceQuote,
        ai_decision: Optional[AIDecision] = None
    ) -> Trade:
        """
        Execute a paper trade.
        
        Args:
            action: Buy or sell
            input_token: Token being sold
            output_token: Token being bought
            input_amount: Amount to trade
            quote: Jupiter price quote
            ai_decision: AI model's decision (if applicable)
            
        Returns:
            Trade record
        """
        trade = Trade(
            lane_id=self.id,
            action=action,
            input_token=input_token,
            output_token=output_token,
            input_amount=input_amount,
            output_amount=quote.output_amount,
            price_at_entry=quote.price,
            slippage_bps=quote.slippage_bps,
            fees_paid=Decimal("0.0001"),  # Simplified fee
            ai_confidence=ai_decision.confidence if ai_decision else None,
            ai_reasoning=ai_decision.reasoning if ai_decision else None,
            status=TradeStatus.PENDING
        )
        
        try:
            # Execute virtual swap
            self.wallet.swap(
                input_mint=input_token,
                output_mint=output_token,
                input_amount=input_amount,
                output_amount=quote.output_amount,
                fee_amount=trade.fees_paid
            )
            
            trade.status = TradeStatus.EXECUTED
            self.last_trade_at = datetime.utcnow()
            
            logger.info(
                f"Lane {self.id}: Executed {action.value} trade - "
                f"{input_amount} {input_token[:8]} -> {quote.output_amount} {output_token[:8]}"
            )
            
        except InsufficientBalanceError as e:
            trade.status = TradeStatus.FAILED
            trade.metadata["error"] = str(e)
            logger.warning(f"Lane {self.id}: Trade failed - {e}")
        
        self.trades.append(trade)
        return trade
    
    def close_position(
        self,
        trade: Trade,
        exit_price: Decimal,
        exit_amount: Decimal
    ) -> Trade:
        """
        Close an open position and calculate P&L.
        
        Args:
            trade: Original trade to close
            exit_price: Price at exit
            exit_amount: Amount received
            
        Returns:
            Updated trade with P&L
        """
        trade.price_at_exit = exit_price
        
        # Calculate P&L
        if trade.action == TradeAction.BUY:
            # Bought token, now selling it
            trade.pnl = exit_amount - trade.input_amount
        else:
            # Sold token, now buying it back
            trade.pnl = trade.output_amount - exit_amount
        
        trade.pnl_pct = float(trade.pnl / trade.input_amount) if trade.input_amount > 0 else 0
        
        # Update stats
        if trade.pnl > 0:
            self.win_count += 1
            self.consecutive_losses = 0
        else:
            self.loss_count += 1
            self.consecutive_losses += 1
            
            # Check for cooldown
            if self.consecutive_losses >= self.guardrails.cooldown_after_consecutive_losses:
                self.cooldown_until = datetime.utcnow() + timedelta(
                    minutes=self.guardrails.cooldown_after_loss_minutes
                )
                self.status = LaneStatus.COOLDOWN
                logger.warning(f"Lane {self.id}: Entering cooldown after {self.consecutive_losses} losses")
        
        # Record for daily tracking
        self.guardrails.record_trade_result(self.id, trade.pnl)
        
        # Check kill switch
        violation = self.guardrails.check_lane_kill_switch(self.get_state())
        if violation:
            self.status = LaneStatus.KILLED
            logger.critical(f"Lane {self.id}: KILLED - {violation.message}")
        
        return trade
    
    def update_cooldown_status(self):
        """Check and update cooldown status"""
        if self.status == LaneStatus.COOLDOWN:
            if self.cooldown_until and datetime.utcnow() >= self.cooldown_until:
                self.status = LaneStatus.ACTIVE
                self.cooldown_until = None
                self.consecutive_losses = 0
                logger.info(f"Lane {self.id}: Cooldown ended, resuming trading")
    
    def pause(self):
        """Pause trading on this lane"""
        self.status = LaneStatus.PAUSED
        logger.info(f"Lane {self.id}: Paused")
    
    def resume(self):
        """Resume trading on this lane"""
        if self.status == LaneStatus.PAUSED:
            self.status = LaneStatus.ACTIVE
            logger.info(f"Lane {self.id}: Resumed")
        elif self.status == LaneStatus.KILLED:
            logger.warning(f"Lane {self.id}: Cannot resume - lane is killed")
    
    def get_recent_trades(self, limit: int = 10) -> List[Trade]:
        """Get most recent trades"""
        return sorted(
            self.trades,
            key=lambda t: t.timestamp,
            reverse=True
        )[:limit]
    
    def to_dict(self) -> dict:
        """Serialize lane state"""
        return {
            "id": self.id,
            "name": self.name,
            "profile": self.profile.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "initial_capital": str(self.initial_capital),
            "wallet": self.wallet.to_dict(),
            "win_count": self.win_count,
            "loss_count": self.loss_count,
            "consecutive_losses": self.consecutive_losses,
            "last_trade_at": self.last_trade_at.isoformat() if self.last_trade_at else None,
            "cooldown_until": self.cooldown_until.isoformat() if self.cooldown_until else None,
            "ai_model_version": self.ai_model_version,
            "trades": [t.model_dump() for t in self.trades[-100:]]  # Keep last 100
        }
