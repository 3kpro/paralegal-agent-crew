"""
SolForge Risk Manager
Handles dynamic position sizing using Kelly Criterion and Volatility scaling.
"""
import logging
from decimal import Decimal
from typing import Dict, Any, Optional
import math

from .models import RiskProfile, MarketData

logger = logging.getLogger(__name__)

class RiskManager:
    """
    Standardizes risk calculation across all lanes.
    Implements Kelly Criterion for optimal position sizing.
    """
    
    def __init__(self, config: Dict[str, Any] = {}):
        self.config = config
        self.kelly_fraction = float(config.get("kelly_fraction", 0.5)) # Half-Kelly is safer
        self.min_position_usd = Decimal(str(config.get("min_position_usd", 10.0)))
        self.max_position_scaling = float(config.get("max_position_scaling", 1.0))

    def calculate_position_size(
        self,
        available_capital: Decimal,
        win_rate: float,
        avg_win_pct: float,
        avg_loss_pct: float,
        current_volatility: float,
        max_profile_pct: float
    ) -> Decimal:
        """
        Calculate optimal position size based on performance and risk constraints.
        
        Args:
            available_capital: Total capital in lane
            win_rate: Win rate (0.0 to 1.0)
            avg_win_pct: Average gain on winning trades (e.g. 0.05 for 5%)
            avg_loss_pct: Average loss on losing trades (e.g. 0.03 for 3%)
            current_volatility: Current token volatility (std dev)
            max_profile_pct: Maximum position size allowed by RiskProfile
            
        Returns:
            Position size in USD
        """
        if win_rate <= 0 or avg_loss_pct <= 0:
            # Fallback to 1/4 of max profile size if no history
            return available_capital * Decimal(str(max_profile_pct * 0.25))

        # 1. Kelly Criterion
        # K% = W - [(1 - W) / (AvgWin / AvgLoss)]
        # W = win rate, AvgWin/AvgLoss = Profit factor (b)
        profit_factor = avg_win_pct / avg_loss_pct
        k_pct = win_rate - ((1 - win_rate) / profit_factor)
        
        # Apply fractional Kelly (Half-Kelly)
        scaled_k = k_pct * self.kelly_fraction
        
        # 2. Volatility Scaling
        # Reduce size if volatility is extremely high
        # Baseline volatility assumed to be 1.0. If 2.0, reduce size by half.
        vol_factor = 1.0 / max(1.0, current_volatility)
        
        final_pct = scaled_k * vol_factor
        
        # 3. Constraints
        # Cannot exceed RiskProfile maximum
        final_pct = min(final_pct, max_profile_pct)
        # Cannot be negative
        final_pct = max(0.0, final_pct)
        
        position_size = available_capital * Decimal(str(final_pct))
        
        # Enforce minimums
        if position_size < self.min_position_usd:
            return Decimal("0") # Don't trade if too small
            
        return position_size

    def get_stop_loss_price(self, entry_price: Decimal, sl_pct: float) -> Decimal:
        """Calculate hard stop price"""
        return entry_price * Decimal(str(1.0 - sl_pct))

    def get_take_profit_price(self, entry_price: Decimal, tp_pct: float) -> Decimal:
        """Calculate take profit price"""
        return entry_price * Decimal(str(1.0 + tp_pct))
