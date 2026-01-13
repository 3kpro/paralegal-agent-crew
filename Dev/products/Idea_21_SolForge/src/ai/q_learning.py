"""
SolForge Q-Learning Agent
Basic Reinforcement Learning agent implementing the Q-Learning algorithm.
"""
import random
import pickle
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from decimal import Decimal

from ..core.models import TradeAction

logger = logging.getLogger(__name__)

class QLearningAgent:
    """
    Q-Learning Agent for trading.
    Maintains a Q-table mapping states to action values.
    """
    
    # Action mapping
    ACTIONS = [TradeAction.HOLD, TradeAction.BUY, TradeAction.SELL]
    ACTION_TO_IDX = {a: i for i, a in enumerate(ACTIONS)}
    IDX_TO_ACTION = {i: a for i, a in enumerate(ACTIONS)}
    
    def __init__(
        self,
        learning_rate: float = 0.1,
        discount_factor: float = 0.95,
        epsilon: float = 1.0,
        epsilon_decay: float = 0.995,
        min_epsilon: float = 0.01
    ):
        """
        Initialize Q-Learning Agent.
        
        Args:
            learning_rate: Alpha - how much to accept new value
            discount_factor: Gamma - how much to value future rewards
            epsilon: Exploration rate
            epsilon_decay: Decay rate for epsilon per step
            min_epsilon: Minimum exploration rate
        """
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.min_epsilon = min_epsilon
        
        # Q-Table: State (str) -> [Q-value for HOLD, Q-value for BUY, Q-value for SELL]
        self.q_table: Dict[str, List[float]] = {}
        
    def _get_q_values(self, state: str) -> List[float]:
        """Get Q-values for a state, initializing if new"""
        if state not in self.q_table:
            # Initialize with zeros
            self.q_table[state] = [0.0] * len(self.ACTIONS)
        return self.q_table[state]
    
    def get_action(self, state: Any, valid_actions: Optional[List[TradeAction]] = None) -> Tuple[TradeAction, float]:
        """
        Choose an action using epsilon-greedy strategy.
        
        Args:
            state: Current state representation (will be stringified)
            valid_actions: Optional list of allowed actions (e.g., can't sell if no position)
            
        Returns:
            Tuple of (Selected Action, Confidence/Q-value)
        """
        state_key = str(state)
        q_values = self._get_q_values(state_key)
        
        # Exploration: Choose random valid action
        if random.random() < self.epsilon:
            if valid_actions:
                action = random.choice(valid_actions)
            else:
                action = random.choice(self.ACTIONS)
            return action, 0.0  # Low confidence on random exploration
            
        # Exploitation: Choose best action
        if valid_actions:
            # Filter Q-values for valid actions
            valid_indices = [self.ACTION_TO_IDX[a] for a in valid_actions]
            valid_q = [(i, q_values[i]) for i in valid_indices]
            # Find max Q among valid
            best_idx, max_q = max(valid_q, key=lambda x: x[1])
        else:
            best_idx = q_values.index(max(q_values))
            max_q = q_values[best_idx]
            
        return self.IDX_TO_ACTION[best_idx], max_q
    
    def learn(self, state: Any, action: TradeAction, reward: float, next_state: Any):
        """
        Update Q-table based on action and reward.
        
        Q(s,a) = Q(s,a) + alpha * (reward + gamma * max(Q(s',a')) - Q(s,a))
        
        Args:
            state: Previous state
            action: Action taken
            reward: Reward received
            next_state: New state after action
        """
        state_key = str(state)
        next_state_key = str(next_state)
        
        action_idx = self.ACTION_TO_IDX[action]
        q_values = self._get_q_values(state_key)
        current_q = q_values[action_idx]
        
        # Get max Q for next state
        next_q_values = self._get_q_values(next_state_key)
        max_next_q = max(next_q_values)
        
        # Q-Learning update
        new_q = current_q + self.learning_rate * (reward + self.discount_factor * max_next_q - current_q)
        self.q_table[state_key][action_idx] = new_q
        
        # Decay epsilon
        self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)
        
    def save(self, filepath: str):
        """Save agent state to file"""
        data = {
            "q_table": self.q_table,
            "epsilon": self.epsilon,
            "params": {
                "learning_rate": self.learning_rate,
                "discount_factor": self.discount_factor,
                "epsilon_decay": self.epsilon_decay,
                "min_epsilon": self.min_epsilon
            }
        }
        try:
            with open(filepath, 'wb') as f:
                pickle.dump(data, f)
            logger.info(f"Agent saved to {filepath}")
        except Exception as e:
            logger.error(f"Failed to save agent: {e}")
            
    def load(self, filepath: str):
        """Load agent state from file"""
        try:
            with open(filepath, 'rb') as f:
                data = pickle.load(f)
            
            self.q_table = data["q_table"]
            self.epsilon = data["epsilon"]
            
            params = data.get("params", {})
            if "learning_rate" in params: self.learning_rate = params["learning_rate"]
            if "discount_factor" in params: self.discount_factor = params["discount_factor"]
            if "epsilon_decay" in params: self.epsilon_decay = params["epsilon_decay"]
            
            logger.info(f"Agent loaded from {filepath}")
        except Exception as e:
            logger.error(f"Failed to load agent: {e}")
