
import asyncio
import logging
from decimal import Decimal
import sys
import os

# Add current directory to path so we can import src
sys.path.append(os.getcwd())

from src.integrations.jupiter import JupiterClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_jupiter():
    logger.info("Initializing Jupiter Client (Mock Mode)...")
    client = JupiterClient(mock_mode=True)
    
    try:
        # 1. Test Price API
        logger.info("Fetching SOL price...")
        sol_mint = "So11111111111111111111111111111111111111112"
        price = await client.get_price(sol_mint)
        logger.info(f"SOL Price: ${price}")
        
        if price == 0:
            logger.error("Failed to fetch SOL price")
        
        # 2. Test Quote API (SOL -> USDC)
        logger.info("Fetching Quote: 1 SOL -> USDC...")
        usdc_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        amount = Decimal("1.0")
        
        quote = await client.get_quote(sol_mint, usdc_mint, amount)
        
        logger.info(f"Quote received:")
        logger.info(f"  Input: {quote.input_amount} SOL")
        logger.info(f"  Output: {quote.output_amount} USDC")
        logger.info(f"  Price: {quote.price}")
        logger.info(f"  Impact: {quote.price_impact_pct}%")
        logger.info(f"  Route hops: {len(quote.route)}")
        
        # 3. Test Unknown Token Decimals (Automatic Fetch)
        # We'll pick a popular memecoin that might not be in the hardcoded map
        # WIF: EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm
        logger.info("Fetching Quote for WIF (validating decimal fetch)...")
        wif_mint = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"
        
        # Buy 100 USDC worth of WIF
        quote_wif = await client.get_quote(usdc_mint, wif_mint, Decimal("100"))
        logger.info(f"100 USDC -> {quote_wif.output_amount} WIF")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await client.close()

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_jupiter())
