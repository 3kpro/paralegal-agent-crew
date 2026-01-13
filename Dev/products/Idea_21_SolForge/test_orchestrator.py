
import asyncio
import logging
import os
from src.core.orchestrator import MultiLaneOrchestrator
from src.core.database import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_orchestrator():
    logger.info("Testing Multi-Lane Orchestrator...")
    
    # 0. Clean previous DB/Agents
    if not os.path.exists("data"):
        os.makedirs("data")

    if os.path.exists("data/solforge.db"):
        os.remove("data/solforge.db")
    # Clean pth files
    for f in os.listdir("data"):
        if f.startswith("agent_") and f.endswith(".pth"):
            os.remove(f"data/{f}")
            
    # 1. Initialize
    config = {"mock_mode": True}
    orch = MultiLaneOrchestrator(config)
    
    logger.info("Initializing...")
    orch.initialize()
    
    # Verify Default Lanes
    lanes = orch.paper_engine.get_all_lanes()
    assert len(lanes) == 3
    names = [l.name for l in lanes]
    logger.info(f"Lanes created: {names}")
    assert "Alpha Safe" in names
    
    # Verify Trainers
    assert len(orch.trainers) == 3
    logger.info("AI Trainers initialized")
    
    # 2. Run Tick
    logger.info("Running Tick...")
    await orch.tick()
    
    # Verify Market Data
    sol_mint = "So11111111111111111111111111111111111111112"
    history = orch.market_history.get(sol_mint, [])
    assert len(history) > 0
    logger.info(f"Market History for SOL: {len(history)} items")
    logger.info(f"Latest Price: ${history[-1].price_usd}")
    
    # Simulate Loop (Short)
    # Just checking persistence logic
    orch._persist_state()
    assert os.path.exists("data/solforge.db")
    
    # Check agent persistence
    lane_id = lanes[0].id
    assert os.path.exists(f"data/agent_{lane_id}.pth")
    
    orch.shutdown()
    
    # Cleanup
    # os.remove("solforge.db") 
    
    logger.info("Orchestrator tests passed!")

if __name__ == "__main__":
    asyncio.run(test_orchestrator())
