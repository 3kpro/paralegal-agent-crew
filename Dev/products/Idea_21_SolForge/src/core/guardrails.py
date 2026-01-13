"""
SolForge Guardrails
Safety systems to prevent catastrophic losses
"""
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
from typing import Optional, Dict, Any
import logging

from .models import LaneState, Trade, RiskProfile

logger = logging.getLogger(__name__)


class GuardrailType(str, Enum):
    """Types of guardrail violations"""
    LANE_KILL_SWITCH = "lane_kill_switch"
    DAILY_LOSS_LIMIT = "daily_loss_limit"
    POSITION_SIZE = "position_size"
    SLIPPAGE = "slippage"
    LIQUIDITY = "liquidity"
    TRADE_INTERVAL = "trade_interval"
    CONSECUTIVE_LOSSES = "consecutive_losses"
    COOLDOWN = "cooldown"


@dataclass
class GuardrailViolation:
    """Record of a guardrail violation"""
    guardrail_type: GuardrailType
    lane_id: str
    message: str
    value: Any
    threshold: Any
    timestamp: datetime
    severity: str  # "warning", "block", "kill"


class Guardrails:
    """
    Safety guardrails for trading lanes.
    Prevents trades that violate risk parameters.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize guardrails from config.
        
        Args:
            config: Guardrails configuration dict
        """
        self.lane_kill_switch_pct = config.get("lane_kill_switch_pct", 0.50)
        self.max_daily_loss_pct = config.get("max_daily_loss_pct", 0.20)
        self.max_slippage_pct = config.get("max_slippage_pct", 0.02)
        self.min_trade_interval_seconds = config.get("min_trade_interval_seconds", 60)
        self.cooldown_after_loss_minutes = config.get("cooldown_after_loss_minutes", 5)
        self.cooldown_after_consecutive_losses = config.get("cooldown_after_consecutive_losses", 3)
        
        # Track daily losses per lane
        self._daily_losses: Dict[str, Decimal] = {}
        self._last_reset_date: Optional[datetime] = None
        
        # Track violations
        self.violations: list[GuardrailViolation] = []
    
    def _reset_daily_if_needed(self):
        """Reset daily counters if it's a new day"""
        now = datetime.utcnow()
        if self._last_reset_date is None or now.date() > self._last_reset_date.date():
            self._daily_losses = {}
            self._last_reset_date = now
            logger.info("Daily guardrail counters reset")
    
    def check_lane_kill_switch(self, lane: LaneState) -> Optional[GuardrailViolation]:
        """
        Check if lane should be killed due to excessive losses.
        
        Args:
            lane: Current lane state
            
        Returns:
            GuardrailViolation if triggered, None otherwise
        """
        loss_pct = -lane.total_pnl_pct if lane.total_pnl_pct < 0 else 0
        
        if loss_pct >= self.lane_kill_switch_pct:
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.LANE_KILL_SWITCH,
                lane_id=lane.id,
                message=f"Lane {lane.name} killed: {loss_pct:.1%} loss exceeds {self.lane_kill_switch_pct:.1%} threshold",
                value=loss_pct,
                threshold=self.lane_kill_switch_pct,
                timestamp=datetime.utcnow(),
                severity="kill"
            )
            self.violations.append(violation)
            logger.critical(violation.message)
            return violation
        
        return None
    
    def check_daily_loss_limit(
        self,
        lane: LaneState,
        pending_trade_pnl: Decimal
    ) -> Optional[GuardrailViolation]:
        """
        Check if daily loss limit would be exceeded.
        
        Args:
            lane: Current lane state
            pending_trade_pnl: Potential P&L from pending trade
            
        Returns:
            GuardrailViolation if would exceed, None otherwise
        """
        self._reset_daily_if_needed()
        
        current_daily_loss = self._daily_losses.get(lane.id, Decimal("0"))
        if pending_trade_pnl < 0:
            projected_daily_loss = current_daily_loss + abs(pending_trade_pnl)
        else:
            projected_daily_loss = current_daily_loss
        
        daily_loss_pct = float(projected_daily_loss / lane.initial_capital)
        
        if daily_loss_pct >= self.max_daily_loss_pct:
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.DAILY_LOSS_LIMIT,
                lane_id=lane.id,
                message=f"Daily loss limit reached for {lane.name}: {daily_loss_pct:.1%}",
                value=daily_loss_pct,
                threshold=self.max_daily_loss_pct,
                timestamp=datetime.utcnow(),
                severity="block"
            )
            self.violations.append(violation)
            logger.warning(violation.message)
            return violation
        
        return None
    
    def check_position_size(
        self,
        lane: LaneState,
        profile_config: Dict[str, Any],
        position_value: Decimal
    ) -> Optional[GuardrailViolation]:
        """
        Check if position size exceeds profile maximum.
        
        Args:
            lane: Current lane state
            profile_config: Risk profile configuration
            position_value: Value of proposed position
            
        Returns:
            GuardrailViolation if exceeded, None otherwise
        """
        max_position_pct = profile_config.get("max_position_pct", 0.25)
        max_position = lane.current_capital * Decimal(str(max_position_pct))
        
        if position_value > max_position:
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.POSITION_SIZE,
                lane_id=lane.id,
                message=f"Position size ${position_value} exceeds max ${max_position}",
                value=float(position_value),
                threshold=float(max_position),
                timestamp=datetime.utcnow(),
                severity="block"
            )
            self.violations.append(violation)
            logger.warning(violation.message)
            return violation
        
        return None
    
    def check_slippage(
        self,
        lane_id: str,
        expected_amount: Decimal,
        actual_amount: Decimal
    ) -> Optional[GuardrailViolation]:
        """
        Check if slippage exceeds threshold.
        
        Args:
            lane_id: Lane identifier
            expected_amount: Expected output amount
            actual_amount: Actual/quoted output amount
            
        Returns:
            GuardrailViolation if exceeded, None otherwise
        """
        if expected_amount == 0:
            return None
            
        slippage = float((expected_amount - actual_amount) / expected_amount)
        
        if slippage > self.max_slippage_pct:
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.SLIPPAGE,
                lane_id=lane_id,
                message=f"Slippage {slippage:.2%} exceeds max {self.max_slippage_pct:.2%}",
                value=slippage,
                threshold=self.max_slippage_pct,
                timestamp=datetime.utcnow(),
                severity="block"
            )
            self.violations.append(violation)
            logger.warning(violation.message)
            return violation
        
        return None
    
    def check_liquidity(
        self,
        lane_id: str,
        profile_config: Dict[str, Any],
        liquidity_usd: Decimal
    ) -> Optional[GuardrailViolation]:
        """
        Check if token has sufficient liquidity.
        
        Args:
            lane_id: Lane identifier
            profile_config: Risk profile configuration
            liquidity_usd: Token liquidity in USD
            
        Returns:
            GuardrailViolation if insufficient, None otherwise
        """
        min_liquidity = Decimal(str(profile_config.get("min_liquidity_usd", 10000)))
        
        if liquidity_usd < min_liquidity:
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.LIQUIDITY,
                lane_id=lane_id,
                message=f"Liquidity ${liquidity_usd} below min ${min_liquidity}",
                value=float(liquidity_usd),
                threshold=float(min_liquidity),
                timestamp=datetime.utcnow(),
                severity="block"
            )
            self.violations.append(violation)
            logger.warning(violation.message)
            return violation
        
        return None
    
    def check_trade_interval(
        self,
        lane: LaneState
    ) -> Optional[GuardrailViolation]:
        """
        Check if minimum time has passed since last trade.
        
        Args:
            lane: Current lane state
            
        Returns:
            GuardrailViolation if too soon, None otherwise
        """
        if lane.last_trade_at is None:
            return None
        
        elapsed = (datetime.utcnow() - lane.last_trade_at).total_seconds()
        
        if elapsed < self.min_trade_interval_seconds:
            remaining = self.min_trade_interval_seconds - elapsed
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.TRADE_INTERVAL,
                lane_id=lane.id,
                message=f"Trade too soon, wait {remaining:.0f}s",
                value=elapsed,
                threshold=self.min_trade_interval_seconds,
                timestamp=datetime.utcnow(),
                severity="block"
            )
            # Don't log these as they're common
            return violation
        
        return None
    
    def check_consecutive_losses(
        self,
        lane: LaneState
    ) -> Optional[GuardrailViolation]:
        """
        Check if lane should enter cooldown due to consecutive losses.
        
        Args:
            lane: Current lane state
            
        Returns:
            GuardrailViolation if cooldown triggered, None otherwise
        """
        if lane.consecutive_losses >= self.cooldown_after_consecutive_losses:
            cooldown_until = datetime.utcnow() + timedelta(
                minutes=self.cooldown_after_loss_minutes
            )
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.CONSECUTIVE_LOSSES,
                lane_id=lane.id,
                message=f"Cooldown triggered: {lane.consecutive_losses} consecutive losses",
                value=lane.consecutive_losses,
                threshold=self.cooldown_after_consecutive_losses,
                timestamp=datetime.utcnow(),
                severity="block"
            )
            self.violations.append(violation)
            logger.warning(violation.message)
            return violation
        
        return None
    
    def check_cooldown(self, lane: LaneState) -> Optional[GuardrailViolation]:
        """
        Check if lane is still in cooldown period.
        
        Args:
            lane: Current lane state
            
        Returns:
            GuardrailViolation if still in cooldown, None otherwise
        """
        if lane.cooldown_until and datetime.utcnow() < lane.cooldown_until:
            remaining = (lane.cooldown_until - datetime.utcnow()).total_seconds()
            violation = GuardrailViolation(
                guardrail_type=GuardrailType.COOLDOWN,
                lane_id=lane.id,
                message=f"Lane in cooldown for {remaining:.0f}s more",
                value=remaining,
                threshold=0,
                timestamp=datetime.utcnow(),
                severity="block"
            )
            return violation
        
        return None
    
    def record_trade_result(self, lane_id: str, pnl: Decimal):
        """
        Record a trade result for daily tracking.
        
        Args:
            lane_id: Lane identifier
            pnl: Profit/loss from trade
        """
        self._reset_daily_if_needed()
        
        if pnl < 0:
            current = self._daily_losses.get(lane_id, Decimal("0"))
            self._daily_losses[lane_id] = current + abs(pnl)
    
    def can_trade(
        self,
        lane: LaneState,
        profile_config: Dict[str, Any],
        position_value: Decimal,
        liquidity_usd: Decimal
    ) -> tuple[bool, Optional[GuardrailViolation]]:
        """
        Run all guardrail checks to determine if a trade is allowed.
        
        Args:
            lane: Current lane state
            profile_config: Risk profile configuration
            position_value: Proposed position value
            liquidity_usd: Token liquidity
            
        Returns:
            Tuple of (can_trade: bool, violation: Optional[GuardrailViolation])
        """
        # Check kill switch first
        violation = self.check_lane_kill_switch(lane)
        if violation:
            return False, violation
        
        # Check cooldown
        violation = self.check_cooldown(lane)
        if violation:
            return False, violation
        
        # Check consecutive losses
        violation = self.check_consecutive_losses(lane)
        if violation:
            return False, violation
        
        # Check trade interval
        violation = self.check_trade_interval(lane)
        if violation:
            return False, violation
        
        # Check position size
        violation = self.check_position_size(lane, profile_config, position_value)
        if violation:
            return False, violation
        
        # Check liquidity
        violation = self.check_liquidity(lane.id, profile_config, liquidity_usd)
        if violation:
            return False, violation
        
        return True, None
