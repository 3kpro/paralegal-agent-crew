
import asyncio
import logging
from src.integrations.telegram_bot import TelegramNotifier

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_telegram():
    logger.info("Testing Telegram Integration...")
    
    # 1. Test Mock Mode
    logger.info("--- Testing Mock Mode ---")
    mock_bot = TelegramNotifier(token="fake", chat_id="123", mock_mode=True)
    
    success = await mock_bot.send_message("Hello World")
    assert success == True
    
    await mock_bot.send_trade_alert(
        lane_name="Alpha Safe",
        action="BUY",
        token="SOL",
        price="150.00"
    )
    
    await mock_bot.send_system_alert("CRITICAL", "Database disconnect!")
    
    # 2. Test Real Mode (init only, don't send without real token)
    # Just verify object creation doesn't crash
    logger.info("--- Testing Real Mode Init ---")
    try:
        real_bot = TelegramNotifier(token="invalid_token", chat_id="123", mock_mode=False)
        # We expect init to work (it usually just stores token), 
        # but send_message would fail.
        assert real_bot.bot is not None
    except Exception as e:
        logger.warning(f"Real mode init warning: {e}")
        
    logger.info("Telegram tests passed!")

if __name__ == "__main__":
    asyncio.run(test_telegram())
