
import logging
from typing import List
from datetime import datetime, timedelta
from decimal import Decimal

from src.ai.trainer import AITrainer, StateQuantizer
from src.ai.q_learning import QLearningAgent
from src.ai.features import FeatureEngineer
from src.core.models import MarketData, Trade, TradeAction

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_simple_market_data(rsi_trend: str) -> List[MarketData]:
    """Generate minimal data to trigger specific RSI states"""
    # RSI calc needs delta.
    # Uphill -> RSI High
    # Downhill -> RSI Low
    
    base_price = 100.0
    data = []
    
    if rsi_trend == "UP":
        # Price increases every step
        for i in range(20):
            price = base_price + i*2
            md = MarketData(
                mint="test", symbol="TEST", 
                price_usd=Decimal(str(price)), 
                volume_24h=Decimal("100"), liquidity_usd=Decimal("100"), 
                price_change_1h=0.0, price_change_24h=0.0, 
                timestamp=datetime.utcnow() - timedelta(minutes=20-i)
            )
            data.append(md)
    else:
        # Price decreases
        for i in range(20):
            price = base_price - i*2
            md = MarketData(
                mint="test", symbol="TEST", 
                price_usd=Decimal(str(price)), 
                volume_24h=Decimal("100"), liquidity_usd=Decimal("100"), 
                price_change_1h=0.0, price_change_24h=0.0, 
                timestamp=datetime.utcnow() - timedelta(minutes=20-i)
            )
            data.append(md)
            
    return data

def test_trainer():
    logger.info("Testing AI Trainer...")
    
    agent = QLearningAgent(epsilon=0.0) # Greedy for predictability
    fe = FeatureEngineer()
    trainer = AITrainer(agent, fe)
    
    # 1. Test Quantization
    features = {
        "rsi": 25.0,
        "macd": 1.0,
        "macd_signal": 0.5,
        "volatility": 0.2
    }
    state = StateQuantizer.quantize(features)
    logger.info(f"Quantized State: {state}")
    # Expected: OVERSOLD (rsi < 30) | BULLISH (1.0 > 0.5) | LOW (0.2 < 0.5)
    assert state == "OVERSOLD|BULLISH|LOW"
    
    # 2. Test Get Decision
    logger.info("Testing Decision Making...")
    
    # Scenario: Price crashing (RSI Low). Not holding.
    # Since epsilon is 0, it will pick MAX Q. Initially all 0.
    # It picks first valid action? Or random among max?
    # Python max() picks first if tie.
    # Valid actions for not holding: HOLD, BUY.
    # self.ACTIONS = [HOLD, BUY, SELL]. HOLD is index 0.
    # So it should return HOLD.
    
    market_data = generate_simple_market_data("DOWN")
    action = trainer.get_decision(market_data, current_holdings=False)
    logger.info(f"Decision (Crashing, No Hold): {action}")
    assert action in [TradeAction.HOLD, TradeAction.BUY] # Just validity check
    assert trainer.last_state is not None
    assert trainer.last_action == action
    
    # 3. Test Update Loop
    logger.info("Testing Update Loop...")
    
    # Simulate we bought (override previous decision logic for testing learn)
    trainer.last_action = TradeAction.BUY
    trainer.last_state = "OVERSOLD|BULLISH|LOW"
    
    # Reward: say it was a bad buy, penalized
    reward = -5.0
    
    # Next state: still crashing
    market_data_next = generate_simple_market_data("DOWN")
    
    trainer.update(reward, market_data_next)
    
    # Verify Agent Learned
    q_vals = agent._get_q_values("OVERSOLD|BULLISH|LOW")
    logger.info(f"Q-Values after bad buy: {q_vals}")
    # BUY is index 1. Should be < 0 now.
    assert q_vals[1] < 0 
    
    logger.info("Trainer tests passed!")

if __name__ == "__main__":
    test_trainer()
