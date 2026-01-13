
import logging
from decimal import Decimal
from datetime import datetime
from src.core.models import (
    LaneState, RiskProfile, LaneStatus, Trade, TradeAction, TradeStatus
)
from src.core.database import (
    init_db, SessionLocal, LaneRepository, TradeRepository, engine
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database():
    logger.info("Initializing Database...")
    init_db()
    
    db = SessionLocal()
    lane_repo = LaneRepository(db)
    trade_repo = TradeRepository(db)
    
    try:
        # 1. Create Lane
        logger.info("Testing Lane persistence...")
        lane = LaneState(
            id="test-lane-01",
            name="Test Lane",
            profile=RiskProfile.SAFE,
            status=LaneStatus.ACTIVE,
            created_at=datetime.utcnow(),
            initial_capital=Decimal("100.0"),
            current_capital=Decimal("100.0"),
            total_pnl=Decimal("0.0"),
            total_pnl_pct=0.0
        )
        
        lane_repo.save_lane(lane)
        
        # 2. Retrieve Lane
        retrieved_lane = lane_repo.get_lane("test-lane-01")
        assert retrieved_lane is not None
        assert retrieved_lane.name == "Test Lane"
        assert retrieved_lane.initial_capital == Decimal("100.0")
        logger.info(f"Lane retrieved: {retrieved_lane.name}")
        
        # 3. Create Trade
        logger.info("Testing Trade persistence...")
        trade = Trade(
            lane_id="test-lane-01",
            action=TradeAction.BUY,
            input_token="SOL",
            output_token="USDC",
            input_amount=Decimal("1.0"),
            output_amount=Decimal("150.0"),
            price_at_entry=Decimal("150.0"),
            status=TradeStatus.EXECUTED,
            metadata={"test": "data"}
        )
        
        trade_repo.save_trade(trade)
        
        # 4. Retrieve Trades
        trades = trade_repo.get_trades_for_lane("test-lane-01")
        assert len(trades) == 1
        assert trades[0].input_amount == Decimal("1.0")
        assert trades[0].metadata["test"] == "data"
        logger.info(f"Trade retrieved, ID: {trades[0].id}")
        
        # 5. Update Lane
        logger.info("Testing Update...")
        lane.current_capital = Decimal("150.0")
        lane_repo.save_lane(lane)
        
        updated_lane = lane_repo.get_lane("test-lane-01")
        assert updated_lane.current_capital == Decimal("150.0")
        logger.info("Lane update verified")
        
        logger.info("Database tests passed!")
        
    finally:
        db.close()
        # Clean up optional
        pass

if __name__ == "__main__":
    test_database()
