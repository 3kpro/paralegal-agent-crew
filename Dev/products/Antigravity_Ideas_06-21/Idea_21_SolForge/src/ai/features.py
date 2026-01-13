"""
SolForge Feature Extraction
Convert market data into ML-ready features
"""
from decimal import Decimal
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import numpy as np
import logging

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """
    Extracts trading features from market data.
    Features are used by AI agents to make decisions.
    """
    
    def __init__(self, lookback_window: int = 50):
        self.lookback_window = lookback_window
        self.price_history: List[float] = []
        self.volume_history: List[float] = []
        self.timestamps: List[datetime] = []
    
    def update(self, price: float, volume: float, timestamp: Optional[datetime] = None):
        """Add new price/volume data point"""
        self.price_history.append(price)
        self.volume_history.append(volume)
        self.timestamps.append(timestamp or datetime.utcnow())
        
        # Keep only lookback window
        if len(self.price_history) > self.lookback_window * 2:
            self.price_history = self.price_history[-self.lookback_window:]
            self.volume_history = self.volume_history[-self.lookback_window:]
            self.timestamps = self.timestamps[-self.lookback_window:]
    
    def get_features(
        self,
        current_position_pct: float = 0.0,
        recent_pnl_pct: float = 0.0
    ) -> Dict[str, float]:
        """
        Extract features for AI decision making.
        
        Args:
            current_position_pct: Current position as % of capital (-1 to 1)
            recent_pnl_pct: Recent P&L percentage
            
        Returns:
            Feature dictionary
        """
        if len(self.price_history) < 2:
            return self._empty_features(current_position_pct, recent_pnl_pct)
        
        prices = np.array(self.price_history)
        volumes = np.array(self.volume_history)
        
        # Price momentum (% change)
        momentum_1 = (prices[-1] - prices[-2]) / prices[-2] if prices[-2] > 0 else 0
        momentum_5 = (prices[-1] - prices[-min(5, len(prices))]) / prices[-min(5, len(prices))] if len(prices) >= 5 else momentum_1
        momentum_20 = (prices[-1] - prices[-min(20, len(prices))]) / prices[-min(20, len(prices))] if len(prices) >= 20 else momentum_5
        
        # Volume analysis
        avg_volume = np.mean(volumes) if len(volumes) > 0 else 1
        current_volume = volumes[-1] if len(volumes) > 0 else 1
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
        
        # Volatility (std of returns)
        if len(prices) > 5:
            returns = np.diff(prices) / prices[:-1]
            volatility = np.std(returns)
        else:
            volatility = 0.0
        
        # RSI-like indicator (simplified)
        if len(prices) > 14:
            deltas = np.diff(prices[-15:])
            gains = np.mean(deltas[deltas > 0]) if any(deltas > 0) else 0
            losses = -np.mean(deltas[deltas < 0]) if any(deltas < 0) else 0
            rs = gains / losses if losses > 0 else 100
            rsi = 100 - (100 / (1 + rs))
        else:
            rsi = 50
        
        # Price relative to recent range
        if len(prices) > 10:
            recent_high = np.max(prices[-10:])
            recent_low = np.min(prices[-10:])
            price_range_pct = (prices[-1] - recent_low) / (recent_high - recent_low) if recent_high > recent_low else 0.5
        else:
            price_range_pct = 0.5
        
        return {
            # Primary features for Q-learning state
            "momentum": momentum_5,
            "volume_ratio": volume_ratio,
            "position_pct": current_position_pct,
            "pnl_pct": recent_pnl_pct,
            
            # Extended features for potential DNN upgrade
            "momentum_1": momentum_1,
            "momentum_5": momentum_5,
            "momentum_20": momentum_20,
            "volatility": volatility,
            "rsi": rsi / 100,  # Normalize to 0-1
            "price_range_pct": price_range_pct,
            "volume_trend": volume_ratio,
            
            # Raw values
            "current_price": float(prices[-1]),
            "avg_price": float(np.mean(prices[-20:])) if len(prices) >= 20 else float(prices[-1]),
        }
    
    def _empty_features(self, position_pct: float, pnl_pct: float) -> Dict[str, float]:
        """Return empty/neutral features when insufficient data"""
        return {
            "momentum": 0.0,
            "volume_ratio": 1.0,
            "position_pct": position_pct,
            "pnl_pct": pnl_pct,
            "momentum_1": 0.0,
            "momentum_5": 0.0,
            "momentum_20": 0.0,
            "volatility": 0.0,
            "rsi": 0.5,
            "price_range_pct": 0.5,
            "volume_trend": 1.0,
            "current_price": 0.0,
            "avg_price": 0.0,
        }
    
    def reset(self):
        """Clear all history"""
        self.price_history = []
        self.volume_history = []
        self.timestamps = []
