
import logging
import os
from src.ai.q_learning import QLearningAgent
from src.core.models import TradeAction

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_q_learning_agent():
    logger.info("Testing Q-Learning Agent...")
    
    agent = QLearningAgent(
        learning_rate=0.5, 
        discount_factor=0.9, 
        epsilon=0.5,
        epsilon_decay=0.9
    )
    
    # 1. Test Action Selection
    state = "test_state"
    action, conf = agent.get_action(state)
    logger.info(f"Initial Action: {action} (Conf: {conf})")
    assert action in [TradeAction.BUY, TradeAction.SELL, TradeAction.HOLD]
    
    # 2. Test Learning
    logger.info("Training on dummy pattern...")
    # Scenario: "UP" state -> BUY gives +10 reward
    #           "UP" state -> SELL gives -10 reward
    
    state_up = "price_UP"
    
    # Initial Q-values should be 0
    q_initial = agent._get_q_values(state_up)
    logger.info(f"Initial Q-values: {q_initial}")
    assert q_initial[1] == 0  # Support BUY is index 1
    
    # Update: Taken BUY action in UP state, got +10 reward, next state is same
    agent.learn(state_up, TradeAction.BUY, 10.0, state_up)
    
    q_after = agent._get_q_values(state_up)
    logger.info(f"After 1 update (BUY): {q_after}")
    
    # Q(s,a) = 0 + 0.5 * (10 + 0.9*0 - 0) = 5.0
    # Note: max_next_q is 0 initially (or 5.0 if we use updated? no, it uses snapshot before update typically, 
    # but here implementation uses current table. 
    # Let's trace code: 
    #   max_next_q = max(self._get_q_values(next_state_key)) -> computed BEFORE update of current?
    #   Implementation calls _get_q_values(next_state_key) which returns list ref.
    #   If state == next_state, it's the SAME list ref.
    #   So max_next_q reads the VALUES. 
    #   Then we update one value.
    #   Effectively: max_next_q is calculated based on "old" values because we haven't written new_q yet.
    #   So max_next_q = 0.
    #   New Q = 0 + 0.5 * (10 + 0 - 0) = 5.0.
    
    assert q_after[1] == 5.0
    
    # 3. Test Save/Load
    filename = "test_agent.pkl"
    agent.save(filename)
    assert os.path.exists(filename)
    
    new_agent = QLearningAgent()
    new_agent.load(filename)
    
    q_loaded = new_agent._get_q_values(state_up)
    logger.info(f"Loaded Q-values: {q_loaded}")
    assert q_loaded[1] == 5.0
    
    # Cleanup
    os.remove(filename)
    
    logger.info("AI Agent tests passed!")

if __name__ == "__main__":
    test_q_learning_agent()
