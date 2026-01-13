"""
SolForge Arbitrage Scout
Scans for cyclic arbitrage opportunities and identifies price discrepancies.
"""
import logging
from decimal import Decimal
from typing import List, Dict, Any, Optional
from datetime import datetime

import asyncio
import base64
from solana.rpc.async_api import AsyncClient
from solders.transaction import VersionedTransaction
from solders.keypair import Keypair
from solders.message import MessageV0

from ..integrations.jupiter import JupiterClient
from ..integrations.jito import JitoClient
from .models import MarketData

logger = logging.getLogger(__name__)

class ArbitrageScout:
    """
    Identifies price discrepancies by comparing multiple swap paths.
    Targets cyclic arbitrage: SOL -> Token A -> SOL or SOL -> A -> B -> SOL.
    """
    
    def __init__(
        self,
        jupiter: JupiterClient,
        jito: JitoClient,
        min_profit_pct: float = 0.5  # 0.5% min profit after fees
    ):
        self.jupiter = jupiter
        self.jito = jito
        self.min_profit_pct = min_profit_pct
        self.base_mint = "So11111111111111111111111111111111111111112" # SOL

    async def find_cyclic_opportunity(
        self,
        target_mints: List[str],
        base_amount: Decimal = Decimal("1.0"),
        batch_size: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Scan for cyclic arbitrage opportunities in parallel batches.
        """
        all_results = []
        for i in range(0, len(target_mints), batch_size):
            batch = target_mints[i : i + batch_size]
            tasks = [self._check_single_arb(mint, base_amount) for mint in batch]
            results = await asyncio.gather(*tasks)
            all_results.extend([r for r in results if r is not None])
            
            # Optional: Short delay between batches if needed to respect rate limits
            if i + batch_size < len(target_mints):
                await asyncio.sleep(0.1)
        
        return all_results

    async def _check_single_arb(self, mint: str, base_amount: Decimal) -> Optional[Dict[str, Any]]:
        """Check a single token for cyclic arbitrage discrepancy"""
        try:
            # 1. SOL -> Token A
            quote_in = await self.jupiter.get_quote(
                input_mint=self.base_mint,
                output_mint=mint,
                amount=base_amount
            )
            
            # 2. Token A -> SOL
            quote_out = await self.jupiter.get_quote(
                input_mint=mint,
                output_mint=self.base_mint,
                amount=quote_in.output_amount
            )
            
            total_return = quote_out.output_amount
            profit = total_return - base_amount
            profit_pct = float(profit / base_amount) * 100
            
            if profit_pct >= self.min_profit_pct:
                opp = {
                    "path": [self.base_mint, mint, self.base_mint],
                    "profit_sol": profit,
                    "profit_pct": profit_pct,
                    "quotes": [quote_in, quote_out],
                    "timestamp": datetime.utcnow()
                }
                logger.info(f"ARBITRAGE DETECTED: {mint[:8]} | Profit: {profit_pct:.2%}")
                return opp
                
        except Exception as e:
            logger.debug(f"Failed to check arb for {mint[:8]}: {e}")
            
        return None

    async def execute_arb_bundle(
        self,
        opportunity: Dict[str, Any],
        private_key: str,
        rpc_url: str = "https://api.mainnet-beta.solana.com"
    ) -> Optional[str]:
        """
        Execute an arbitrage opportunity using a Jito bundle.
        """
        logger.info(f"Executing Arb Bundle for {opportunity['profit_pct']:.2%}")
        
        if self.jito.mock_mode:
            logger.info("Mock Arb: Execution skipped")
            return "mock_arb_bundle_id"

        # 1. Setup Wallet
        try:
            import base58
            key = base58.b58decode(private_key)
            keypair = Keypair.from_bytes(key)
        except Exception as e:
            logger.error(f"Arb failed to load keypair: {e}")
            return None

        quotes = opportunity['quotes']
        user_pubkey = str(keypair.pubkey())
        
        try:
            # 2. Get Swap Transactions
            tx1_b64 = await self.jupiter.get_swap_transaction(quotes[0], user_pubkey)
            tx2_b64 = await self.jupiter.get_swap_transaction(quotes[1], user_pubkey)
            
            # 3. Sign Transactions
            signed_txs = []
            for b64 in [tx1_b64, tx2_b64]:
                tx_bytes = base64.b64decode(b64)
                tx = VersionedTransaction.from_bytes(tx_bytes)
                signature = keypair.sign_message(tx.message.to_bytes())
                signed_tx = VersionedTransaction.populate(tx.message, [signature])
                signed_txs.append(base64.b64encode(bytes(signed_tx)).decode("utf-8"))
            
            # 4. Add Jito Tip Transaction
            tip_lamports = 100000 # 0.0001 SOL
            tip_ix = self.jito.create_tip_instruction(keypair.pubkey(), tip_lamports)
            
            async with AsyncClient(rpc_url) as rpc:
                recent_blockhash = await rpc.get_latest_blockhash()
                tip_message = MessageV0.try_compile(
                    payer=keypair.pubkey(),
                    instructions=[tip_ix],
                    address_lookup_table_accounts=[],
                    recent_blockhash=recent_blockhash.value.blockhash
                )
                tip_tx = VersionedTransaction(tip_message, [keypair])
                signed_txs.append(base64.b64encode(bytes(tip_tx)).decode("utf-8"))

            # 5. Send Bundle
            bundle_id = await self.jito.send_bundle(signed_txs)
            if bundle_id:
                logger.info(f"Arb bundle sent successfully: {bundle_id}")
                return bundle_id
                
        except Exception as e:
            logger.error(f"Arb execution failed: {e}")
            
        return None
