"""
SolForge Q-Learning Agent
Simple reinforcement learning agent for trading decisions
"""
import numpy as np
from typing import Dict, Any, Optional, List
from pathlib import Path
import pickle
import logging

from ..core.models import TradeAction, AIDecision

logger = logging.getLogger(__name__)


class QLearningAgent:
    """
    Q-Learning agent for trading decisions.
    Simple tabular Q-learning for MVP. Upgrade to DQN/PPO for production.
    """
    
    ACTIONS = [TradeAction.BUY, TradeAction.SELL, TradeAction.HOLD]
    
    def __init__(
        self,
        lane_id: str,
        learning_rate: float = 0.1,
        discount_factor: float = 0.99,
        epsilon_start: float = 1.0,
        epsilon_end: float = 0.01,
        epsilon_decay: float = 0.995,
        checkpoint_dir: str = "./checkpoints"
    ):
        self.lane_id = lane_id
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        
        # Q-table: 5*3*3*3 = 135 states, 3 actions
        self.n_states = 135
        self.n_actions = 3
        self.q_table = np.zeros((self.n_states, self.n_actions))
        
        self.total_episodes = 0
        self.total_reward = 0.0
        self.episode_rewards: List[float] = []
        
        logger.info(f"Q-Learning agent initialized for lane {lane_id}")
    
    def _get_state_index(self, features: Dict[str, float]) -> int:
        """Convert features to state index"""
        m = features.get("momentum", 0)
        v = features.get("volume_ratio", 1)
        p = features.get("position_pct", 0)
        pnl = features.get("pnl_pct", 0)
        
        # Discretize
        m_idx = 0 if m < -0.05 else (1 if m < -0.01 else (2 if m < 0.01 else (3 if m < 0.05 else 4)))
        v_idx = 0 if v < 0.5 else (1 if v < 1.5 else 2)
        p_idx = 0 if p < -0.1 else (1 if p < 0.1 else 2)
        pnl_idx = 0 if pnl < -0.02 else (1 if pnl < 0.02 else 2)
        
        return m_idx * 27 + v_idx * 9 + p_idx * 3 + pnl_idx
    
    def decide(self, features: Dict[str, float]) -> AIDecision:
        """Make trading decision based on features"""
        state_idx = self._get_state_index(features)
        
        if np.random.random() < self.epsilon:
            action_idx = np.random.randint(self.n_actions)
            reasoning = "Exploration"
        else:
            action_idx = np.argmax(self.q_table[state_idx])
            reasoning = f"Exploitation: Q={self.q_table[state_idx].tolist()}"
        
        action = self.ACTIONS[action_idx]
        confidence = self._calc_confidence(state_idx, action_idx)
        
        return AIDecision(
            action=action,
            confidence=confidence,
            position_size_pct=0.0 if action == TradeAction.HOLD else confidence * 0.5,
            reasoning=reasoning,
            features_snapshot=features
        )
    
    def _calc_confidence(self, state_idx: int, action_idx: int) -> float:
        q = self.q_table[state_idx]
        if np.all(q == 0):
            return 0.5
        return 0.3 + 0.7 * (q[action_idx] - q.min()) / (q.max() - q.min() + 1e-8)
    
    def learn(self, state: Dict, action: TradeAction, reward: float, next_state: Dict, done: bool = False):
        """Update Q-values"""
        s = self._get_state_index(state)
        ns = self._get_state_index(next_state)
        a = self.ACTIONS.index(action)
        
        target = reward if done else reward + self.discount_factor * np.max(self.q_table[ns])
        self.q_table[s, a] += self.learning_rate * (target - self.q_table[s, a])
        
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)
        self.total_reward += reward
    
    def save(self, path: Optional[str] = None):
        path = path or self.checkpoint_dir / f"q_agent_{self.lane_id}.pkl"
        with open(path, "wb") as f:
            pickle.dump({"q_table": self.q_table, "epsilon": self.epsilon, "episodes": self.total_episodes}, f)
    
    def load(self, path: Optional[str] = None) -> bool:
        path = Path(path or self.checkpoint_dir / f"q_agent_{self.lane_id}.pkl")
        if not path.exists():
            return False
        with open(path, "rb") as f:
            data = pickle.load(f)
            self.q_table = data["q_table"]
            self.epsilon = data["epsilon"]
            self.total_episodes = data.get("episodes", 0)
        return True
