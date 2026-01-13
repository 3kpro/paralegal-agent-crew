"""
SolForge AI Trainer
Orchestrates the learning loop: Feature Extraction -> State Quantization -> Action -> Reward -> Update.
"""
import logging
import numpy as np
from typing import Dict, Any, List, Optional, Union

from ..core.models import Trade, TradeAction, MarketData
from .features import FeatureEngineer
from .q_learning import QLearningAgent
from .ppo_agent import PPOAgent

logger = logging.getLogger(__name__)

class FeatureVectorizer:
    """Helper to convert feature dict to standard numpy vector"""
    
    @staticmethod
    def vectorize(features: Dict[str, float]) -> np.ndarray:
        # Define fixed order
        keys = [
            "rsi", "macd", "macd_hist", "bb_width", "volatility",
            "liquidity", "feature_momentum_1h", "feature_momentum_24h"
        ]
        # Normalize/Scale if needed (simplified for MVP)
        # RSI / 100
        # Volatility * 10 
        values = []
        try:
            values.append(features.get("rsi", 50.0) / 100.0)
            values.append(features.get("macd", 0.0)) # Raw might be too large/small?
            values.append(features.get("macd_hist", 0.0))
            values.append(features.get("bb_width", 0.0))
            values.append(features.get("volatility", 0.0))
            values.append(features.get("liquidity", 0.0) / 1e9) # Scale liquidity
            values.append(features.get("feature_momentum_1h", 0.0))
            values.append(features.get("feature_momentum_24h", 0.0))
        except Exception:
            return np.zeros(len(keys))
            
        return np.array(values, dtype=np.float32)

class AITrainer:
    """
    Manages the training cycle for a lane's agent.
    Supports both Q-Learning and PPO.
    """
    
    def __init__(self, agent: Union[QLearningAgent, PPOAgent], feature_engineer: FeatureEngineer):
        self.agent = agent
        self.feature_engineer = feature_engineer
        
        # State tracking
        self.last_state: Optional[Any] = None # str (Q) or np.array (PPO)
        self.last_action: Optional[TradeAction] = None
        
        # PPO specific
        self.steps_since_update = 0
        self.ppo_update_freq = 64 # Update every 64 ticks (~1 hour)

    def get_decision(self, market_history: List[MarketData], current_holdings: bool) -> TradeAction:
        """Get next action from agent"""
        features = self.feature_engineer.extract_features(market_history)
        
        # Dispatch based on agent type
        if isinstance(self.agent, PPOAgent):
            state = FeatureVectorizer.vectorize(features)
            
            # PPO get_action returns (action_idx, log_prob)
            # Action map: 0=HOLD, 1=BUY, 2=SELL
            # We need to enforce extensive masking logic?
            # PPO agent here is simple, doesn't support masking in get_action directly without modification.
            # For MVP, we let it pick, and mask illegal moves by overriding or penalty.
            # Better: PPO agent learns to avoid illegal moves via punishment.
            
            action_idx, _ = self.agent.get_action(state)
            
            # Map index to TradeAction
            # Assumption: 0=HOLD, 1=BUY, 2=SELL (matches TradeAction logic roughly? TradeAction is str enum)
            # TradeAction.HOLD="HOLD", etc.
            actions = [TradeAction.HOLD, TradeAction.BUY, TradeAction.SELL]
            action = actions[action_idx]
            
            # Masking override (Hard Enforcement)
            if action == TradeAction.BUY and current_holdings:
                action = TradeAction.HOLD # Cannot buy if holding
            elif action == TradeAction.SELL and not current_holdings:
                action = TradeAction.HOLD # Cannot sell if nothing
            
            self.last_state = state # Store numpy array
            
        else:
            # Q-Learning Logic
            from .trainer import StateQuantizer # Local import to avoid circular issues if any
            state = StateQuantizer.quantize(features)
            
            valid_actions = [TradeAction.HOLD]
            if current_holdings:
                valid_actions.append(TradeAction.SELL)
            else:
                valid_actions.append(TradeAction.BUY)
                
            action, _ = self.agent.get_action(state, valid_actions)
            self.last_state = state # Store string
            
        self.last_action = action
        return action
        
    def calculate_reward(self, trade: Optional[Trade], market_change_pct: float) -> float:
        """Calculate reward"""
        # (Same logic as before, roughly)
        if trade and trade.action == TradeAction.SELL:
            if trade.pnl_pct is not None:
                return float(trade.pnl_pct) * 100.0
            return 0.0
        
        if trade and trade.action == TradeAction.BUY:
            return -0.1
            
        # Hold Logic (Simplified)
        return 0.0

    def update(self, reward: float, current_market_history: List[MarketData]):
        """Update agent knowledge"""
        if self.last_state is None or self.last_action is None:
            return

        if isinstance(self.agent, PPOAgent):
            # PPO: Store outcome and conditionally update
            # We treat every step as non-terminal for now, unless lane killed?
            self.agent.store_outcome(reward, is_terminal=False)
            
            self.steps_since_update += 1
            if self.steps_since_update >= self.ppo_update_freq:
                self.agent.update()
                self.steps_since_update = 0
                logger.debug("PPO Agent Updated")
                
        else:
            # Q-Learning
            from .trainer import StateQuantizer
            features = self.feature_engineer.extract_features(current_market_history)
            next_state = StateQuantizer.quantize(features)
            self.agent.learn(self.last_state, self.last_action, reward, next_state)

class StateQuantizer:
    """Methods to convert continuous features into discrete grid states for Q-Learning"""
    
    @staticmethod
    def _quantize_rsi(rsi: float) -> str:
        if rsi < 30: return "OVERSOLD"
        if rsi < 45: return "WEAK"
        if rsi < 55: return "NEUTRAL"
        if rsi < 70: return "STRONG"
        return "OVERBOUGHT"
        
    @staticmethod
    def _quantize_macd(macd: float, signal: float) -> str:
        if macd > signal: return "BULLISH"
        return "BEARISH"
        
    @staticmethod
    def _quantize_volatility(vol: float) -> str:
        if vol < 0.5: return "LOW"
        if vol < 1.0: return "MED"
        return "HIGH"
        
    @staticmethod
    def quantize(features: Dict[str, float]) -> str:
        rsi_state = StateQuantizer._quantize_rsi(features.get("rsi", 50))
        macd_val = features.get("macd", 0)
        signal_val = features.get("macd_signal", 0)
        macd_state = StateQuantizer._quantize_macd(macd_val, signal_val)
        vol_state = StateQuantizer._quantize_volatility(features.get("volatility", 0))
        return f"{rsi_state}|{macd_state}|{vol_state}"

