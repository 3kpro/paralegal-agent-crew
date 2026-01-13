
import numpy as np
import torch
import os
import logging
from src.ai.ppo_agent import PPOAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_ppo_agent():
    logger.info("Testing PPO Agent...")
    
    # 1. Initialize
    input_dim = 4
    action_dim = 3
    agent = PPOAgent(input_dim=input_dim, action_dim=action_dim)
    
    logger.info("Agent initialized")
    
    # 2. Test Get Action (Inference)
    dummy_state = np.array([0.5, 0.1, -0.2, 0.9], dtype=np.float32)
    action, log_prob = agent.get_action(dummy_state)
    
    logger.info(f"Action: {action}, LogProb: {log_prob}")
    assert action in [0, 1, 2]
    assert isinstance(log_prob, float)
    
    # 3. Test Learning Loop (Simulated)
    logger.info("Simulating rollout...")
    for _ in range(20):
        # Fake interaction
        action, _ = agent.get_action(dummy_state)
        reward = np.random.randn()
        done = False
        agent.store_outcome(reward, done)
        
    # Mark last as terminal
    agent.store_outcome(1.0, True)
    
    logger.info("Running update...")
    try:
        agent.update()
        logger.info("Update successful")
    except Exception as e:
        logger.error(f"Update failed: {e}")
        raise e
        
    # 4. Save/Load
    ckpt = "test_ppo.pth"
    agent.save(ckpt)
    assert os.path.exists(ckpt)
    logger.info("Saved checkpoint")
    
    agent_new = PPOAgent(input_dim=input_dim, action_dim=action_dim)
    agent_new.load(ckpt)
    logger.info("Loaded checkpoint")
    
    # Cleanup
    os.remove(ckpt)
    
    logger.info("PPO Agent tests passed!")

if __name__ == "__main__":
    test_ppo_agent()
