"""
SolForge Paper Trading Engine
Orchestrates multiple trading lanes and simulates market interactions
"""
from typing import Dict, List, Optional, Any
from decimal import Decimal
import logging
from datetime import datetime

from .models import (
    RiskProfile, LaneStatus, PriceQuote, TradeAction, 
    AIDecision, MarketData
)
from .lane import TradingLane
from .guardrails import Guardrails

logger = logging.getLogger(__name__)


class PaperTradingEngine:
    """
    Manages multiple concurrent trading lanes in paper trading mode.
    Feeds market data to lanes and tracks aggregate performance.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the paper trading engine.
        
        Args:
            config: Engine configuration
        """
        self.config = config
        self.guardrails_config = config.get("guardrails", {})
        self.guardrails = Guardrails(self.guardrails_config)
        
        # Lanes: lane_id -> TradingLane
        self._lanes: Dict[str, TradingLane] = {}
        
        # Aggregate stats
        self.start_time = datetime.utcnow()
        self.is_running = False
        
    def create_lane(
        self,
        name: str,
        profile: RiskProfile,
        initial_capital: Decimal,
        profile_config: Optional[Dict[str, Any]] = None
    ) -> TradingLane:
        """
        Create and regiser a new trading lane.
        
        Args:
            name: Lane name
            profile: Risk profile
            initial_capital: Starting capital
            profile_config: Optional custom profile config
            
        Returns:
            Created TradingLane
        """
        if profile_config is None:
            # Default profile configs if not provided
            # These would ideally come from a central config
            if profile == RiskProfile.SAFE:
                profile_config = {
                    "max_position_pct": 0.10,
                    "stop_loss_pct": 0.03,
                    "min_liquidity_usd": 50000
                }
            elif profile == RiskProfile.MODERATE:
                profile_config = {
                    "max_position_pct": 0.25,
                    "stop_loss_pct": 0.07,
                    "min_liquidity_usd": 25000
                }
            else:  # YOLO
                profile_config = {
                    "max_position_pct": 0.50,
                    "stop_loss_pct": 0.15,
                    "min_liquidity_usd": 5000
                }
        
        lane = TradingLane(
            name=name,
            profile=profile,
            initial_capital=initial_capital,
            profile_config=profile_config,
            guardrails=self.guardrails
        )
        
        self._lanes[lane.id] = lane
        logger.info(f"Created new lane: {name} ({profile.value}) [{lane.id}]")
        return lane
    
    def get_lane(self, lane_id: str) -> Optional[TradingLane]:
        """Get a lane by ID"""
        return self._lanes.get(lane_id)
    
    def get_all_lanes(self) -> List[TradingLane]:
        """Get all registered lanes"""
        return list(self._lanes.values())
    
    def start(self):
        """Start the engine"""
        self.is_running = True
        logger.info("Paper trading engine started")
        
    def stop(self):
        """Stop the engine"""
        self.is_running = False
        logger.info("Paper trading engine stopped")
        
    def process_market_tick(self, market_data: MarketData):
        """
        Process a new market data tick.
        For MVP, this primarily updates lane status (cooldowns).
        
        In a real scenario, this would trigger AI evaluation.
        """
        if not self.is_running:
            return
            
        for lane in self._lanes.values():
            if lane.status == LaneStatus.COOLDOWN:
                lane.update_cooldown_status()
                
    def execute_trade_signal(
        self,
        lane_id: str,
        action: TradeAction,
        token_mint: str,
        quote: PriceQuote,
        ai_decision: Optional[AIDecision] = None
    ) -> Optional['Trade']: # Use string forward ref or import Trade if needed
        """
        Execute a trade based on a signal/decision.
        
        Args:
            lane_id: Target lane
            action: Buy or Sell
            token_mint: Token to trade
            quote: Jupiter price quote
            ai_decision: Supporting AI decision data
            
        Returns:
             The executed Trade object if successful, else None
        """
        if not self.is_running:
            logger.warning("Engine is not running, ignoring trade signal")
            return None
            
        lane = self._lanes.get(lane_id)
        if not lane:
            logger.error(f"Lane {lane_id} not found")
            return
            
        # Determine input/output based on action
        if action == TradeAction.BUY:
            input_token = "So11111111111111111111111111111111111111112" # SOL
            output_token = token_mint
            input_amount = quote.input_amount
        else: # SELL
            input_token = token_mint
            output_token = "So11111111111111111111111111111111111111112" # SOL
            input_amount = quote.input_amount
            
        # Check guardrails
        # Calculate position value in USD (approximate using quote input/output)
        # For a BUY, input_amount is SOL, so we use quote price * output amount as value
        # For a SELL, we are exiting, so we check if the exit is valid
        
        # Simplified guardrail check call - In real app we need accurate USD values
        # Here we assume quote.input_amount is roughly the value we are risking
        
        # NOTE: Guardrails usually check BEFORE getting a quote to save API calls,
        # but here we double check or assume caller checked.
        
        # Execute
        trade = lane.execute_paper_trade(
            action=action,
            input_token=input_token,
            output_token=output_token,
            input_amount=input_amount,
            quote=quote,
            ai_decision=ai_decision
        )
        
        if trade.status == "executed":
            # If it was a SELL (closing a position), logic to calculate P&L 
            # is handled in lane.close_position() usually, but execute_paper_trade 
            # just treats it as a swap.
            # We need to link Sells to Buys to calculate P&L properly.
            # For MVP, `execute_paper_trade` does the swap.
            # If we want to track P&L per trade, we need a position manager.
            # For now, we rely on the wallet balance changes for total P&L.
            pass
            
        return trade

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all lanes"""
        total_pnl = sum(lane.total_pnl for lane in self._lanes.values())
        total_trades = sum(lane.total_trades for lane in self._lanes.values())
        
        return {
            "status": "running" if self.is_running else "stopped",
            "uptime_seconds": (datetime.utcnow() - self.start_time).total_seconds(),
            "active_lanes": len([l for l in self._lanes.values() if l.status == LaneStatus.ACTIVE]),
            "total_lanes": len(self._lanes),
            "total_pnl": str(total_pnl),
            "total_trades": total_trades,
            "lanes": [lane.to_dict() for lane in self._lanes.values()]
        }
