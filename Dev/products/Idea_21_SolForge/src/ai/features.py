"""
SolForge Feature Engineering
Transforms raw market data into AI-ready feature vectors.
"""
import pandas as pd
import numpy as np
import logging
from typing import List, Dict, Any, Optional
from decimal import Decimal

from ..core.models import MarketData

logger = logging.getLogger(__name__)

class FeatureEngineer:
    """
    Calculates technical indicators and generates feature vectors from market data.
    """
    
    def __init__(self, window_size: int = 14):
        """
        Initialize Feature Engineer.
        
        Args:
            window_size: Default lookback period for indicators (e.g. RSI 14)
        """
        self.window_size = window_size
        
    def _to_dataframe(self, data: List[MarketData]) -> pd.DataFrame:
        """Convert list of MarketData to sorted DataFrame"""
        if not data:
            return pd.DataFrame()
            
        records = []
        for d in data:
            records.append({
                "timestamp": d.timestamp,
                "price": float(d.price_usd),
                "volume": float(d.volume_24h),
                "liquidity": float(d.liquidity_usd)
            })
            
        df = pd.DataFrame(records)
        df.sort_values("timestamp", inplace=True)
        df.set_index("timestamp", inplace=True)
        return df
        
    def calculate_rsi(self, series: pd.Series, period: int = 14) -> pd.Series:
        """Calculate Relative Strength Index"""
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)  # Default neutral
        
    def calculate_macd(self, series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
        """Calculate MACD, Signal, and Histogram"""
        exp1 = series.ewm(span=fast, adjust=False).mean()
        exp2 = series.ewm(span=slow, adjust=False).mean()
        macd = exp1 - exp2
        signal_line = macd.ewm(span=signal, adjust=False).mean()
        histogram = macd - signal_line
        
        return pd.DataFrame({
            "macd": macd,
            "macd_signal": signal_line,
            "macd_hist": histogram
        })
        
    def calculate_bollinger_bands(self, series: pd.Series, period: int = 20, std_dev: int = 2) -> pd.DataFrame:
        """Calculate Bollinger Bands"""
        sma = series.rolling(window=period).mean()
        rstd = series.rolling(window=period).std()
        
        upper = sma + (rstd * std_dev)
        lower = sma - (rstd * std_dev)
        
        return pd.DataFrame({
            "bb_upper": upper,
            "bb_lower": lower,
            "bb_width": (upper - lower) / sma
        })
        
    def calculate_volatility(self, series: pd.Series, period: int = 14) -> pd.Series:
        """Calculate annualized volatility"""
        # Log returns
        returns = np.log(series / series.shift(1))
        vol = returns.rolling(window=period).std() * np.sqrt(365) # Annualized assumption if daily, but adaptable
        return vol.fillna(0)

    def extract_features(self, history: List[MarketData]) -> Dict[str, float]:
        """
        Generate feature vector from market history.
        
        Returns dictionary of features for the LATEST timestamp.
        """
        if len(history) < self.window_size + 2:
            logger.warning(f"Insufficient history ({len(history)}) for feature calc")
            # Return neutral defaults
            return {
                "rsi": 50.0,
                "macd": 0.0,
                "volatility": 0.0,
                "price_change_1h": float(history[-1].price_change_1h) if history else 0.0,
                "volume_change": 0.0
            }
            
        df = self._to_dataframe(history)
        price = df['price']
        
        # Calculate Indicators
        rsi = self.calculate_rsi(price, self.window_size)
        macd_df = self.calculate_macd(price)
        bb_df = self.calculate_bollinger_bands(price)
        volatility = self.calculate_volatility(price, self.window_size)
        
        # Get latest values
        latest_idx = df.index[-1]
        
        features = {
            "price": price.iloc[-1],
            "rsi": float(rsi.iloc[-1]),
            "macd": float(macd_df["macd"].iloc[-1]),
            "macd_hist": float(macd_df["macd_hist"].iloc[-1]),
            "bb_width": float(bb_df["bb_width"].fillna(0).iloc[-1]),
            "volatility": float(volatility.iloc[-1]),
            "liquidity": float(df["liquidity"].iloc[-1]),
            
            # Simple momentum
            "feature_momentum_1h": float(history[-1].price_change_1h),
            "feature_momentum_24h": float(history[-1].price_change_24h)
        }
        
        # Clean NaNs
        return {k: (0.0 if pd.isna(v) else v) for k, v in features.items()}
