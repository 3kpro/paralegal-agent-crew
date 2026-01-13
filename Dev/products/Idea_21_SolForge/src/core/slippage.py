"""
SolForge Slippage Optimizer
Dynamically calculates optimal slippage based on market volatility and price impact.
"""
import logging
from decimal import Decimal
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SlippageOptimizer:
    """
    Analyzes pool depth and price impact to suggest the lowest safe slippage.
    """
    
    def __init__(self, min_bps: int = 10, max_bps: int = 500, buffer_multiplier: float = 1.2):
        self.min_bps = min_bps      # 0.1% floor
        self.max_bps = max_bps      # 5.0% ceiling
        self.buffer_multiplier = buffer_multiplier

    def calculate_optimal_slippage(
        self, 
        price_impact_pct: float, 
        volatility_factor: float = 1.0
    ) -> int:
        """
        Suggests slippage in basis points.
        
        Args:
            price_impact_pct: Raw price impact from quote (e.g., 0.05 for 5%)
            volatility_factor: Higher during fast moves (1.0 to 3.0)
            
        Returns:
            Slippage in basis points (e.g. 50 = 0.5%)
        """
        # Convert impact to basis points
        impact_bps = price_impact_pct * 10000
        
        # Calculate base slippage with buffer and volatility
        suggested = int(impact_bps * self.buffer_multiplier * volatility_factor)
        
        # Add a minimum padding for network jitter (5 bps = 0.05%)
        suggested += 10
        
        # Clamp between limits
        final_slippage = max(self.min_bps, min(self.max_bps, suggested))
        
        logger.debug(f"Slippage Optimizer: Impact {price_impact_pct:.2%}, Suggested {final_slippage} bps")
        return final_slippage
