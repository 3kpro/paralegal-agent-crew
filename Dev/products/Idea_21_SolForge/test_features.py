
import logging
from datetime import datetime, timedelta
from decimal import Decimal
import pandas as pd
import numpy as np
from src.core.models import MarketData
from src.ai.features import FeatureEngineer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_dummy_data(count: int = 50) -> list[MarketData]:
    """Generate synthetic market data with a trend"""
    data = []
    base_price = 100.0
    now = datetime.utcnow()
    
    for i in range(count):
        # Create a Sine wave trend + noise
        time_offset = count - i
        t = i * 0.2
        price = base_price + (np.sin(t) * 10) + (i * 0.5) # Upward trend with oscillation
        
        md = MarketData(
            mint="test-mint",
            symbol="TEST",
            price_usd=Decimal(f"{price:.2f}"),
            volume_24h=Decimal("1000000"),
            liquidity_usd=Decimal("500000"),
            price_change_1h=0.1,
            price_change_24h=1.0,
            timestamp=now - timedelta(hours=time_offset)
        )
        data.append(md)
        
    return data

def test_feature_engineering():
    logger.info("Testing Feature Engineering...")
    
    # 1. Generate Data
    history = generate_dummy_data(50)
    logger.info(f"Generated {len(history)} data points")
    
    # 2. Initialize Engineer
    engineer = FeatureEngineer(window_size=14)
    
    # 3. Extract Features
    features = engineer.extract_features(history)
    
    logger.info("Extracted Features:")
    for k, v in features.items():
        logger.info(f"  {k}: {v}")
        
    # 4. Assertions
    assert "rsi" in features
    assert "macd" in features
    assert "volatility" in features
    
    # RSI should be valid (0-100)
    assert 0 <= features["rsi"] <= 100
    
    # Check DataFrame conversion internally (implicit via extract_features success)
    
    # Check insufficient data handling
    short_history = generate_dummy_data(5)
    short_features = engineer.extract_features(short_history)
    logger.info(f"Short history RSI (default): {short_features['rsi']}")
    assert short_features["rsi"] == 50.0
    
    logger.info("Feature Engineering tests passed!")

if __name__ == "__main__":
    test_feature_engineering()
