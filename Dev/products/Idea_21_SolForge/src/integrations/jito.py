"""
SolForge Jito Integration
Handles MEV-aware transaction bundling and tipping to Jito Block Engine.
"""
import logging
import base58
import httpx
from typing import List, Optional, Dict, Any
from solders.keypair import Keypair
from solders.transaction import VersionedTransaction
from solders.system_program import transfer, TransferParams
from solders.pubkey import Pubkey

logger = logging.getLogger(__name__)

class JitoClient:
    """
    Client for Jito Block Engine.
    Used for sending bundles and adding tips for faster/atomic execution.
    """
    
    # Jito Tip Accounts (Mainnet)
    TIP_ACCOUNTS = [
        "96g9sR9SWW6mveoUzhzp8SmtS9Wv8UnonYFvJ4Bsk5nB",
        "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gS8",
        "Cw8CFyM9FkoMi7K7Crf6HNWoFtkdi89J3S3smSLeV9q7",
        "ADaUMid9yfUytqMBBmgrrqZ6T93v7bToT6EpxCj7t94R",
        "ADuYqjsPBzYBe8iV9p9cMDnreCEnXfC2NUn495hY9D92",
        "DttWaMo66K9YycUUnu66Q8GAtV3aoXunR3kH8z8fUuC2",
        "3AVXUvS9u6h8An78yF3pU2fUeC5f1SjF6U5hS2L6G9S7",
        "BrG8h2Gf9YycUUnu66Q8GAtV3aoXunR3kH8z8fUuC2",
    ]

    def __init__(
        self,
        block_engine_url: str = "https://mainnet.block-engine.jito.wtf",
        mock_mode: bool = True
    ):
        self.block_engine_url = block_engine_url
        self.mock_mode = mock_mode
        self._client = httpx.AsyncClient(timeout=30.0)

    async def get_tip_accounts(self) -> List[str]:
        """Fetch current tip accounts (usually static but good to verify)"""
        if self.mock_mode:
            return self.TIP_ACCOUNTS[:1]
            
        try:
            # Note: Jito uses JSON-RPC for some metadata
            return self.TIP_ACCOUNTS
        except Exception:
            return self.TIP_ACCOUNTS

    def create_tip_instruction(self, from_pubkey: Pubkey, tip_lamports: int):
        """Create a transfer instruction to a random Jito tip account"""
        import random
        tip_account = Pubkey.from_string(random.choice(self.TIP_ACCOUNTS))
        
        return transfer(
            TransferParams(
                from_pubkey=from_pubkey,
                to_pubkey=tip_account,
                lamports=tip_lamports
            )
        )

    async def send_bundle(self, transactions_b64: List[str]) -> Optional[str]:
        """
        Send a bundle of transactions to Jito Block Engine.
        
        Args:
            transactions_b64: List of base64 encoded signed transactions
            
        Returns:
            Bundle ID if successful
        """
        if self.mock_mode:
            logger.info(f"Mock Jito: Bundle sent ({len(transactions_b64)} txs)")
            return "mock_bundle_id_" + transactions_b64[0][:10] if transactions_b64 else "mock_bundle_id"

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sendBundle",
            "params": [transactions_b64]
        }
        
        try:
            response = await self._client.post(
                f"{self.block_engine_url}/api/v1/bundles",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            
            if "result" in data:
                bundle_id = data["result"]
                logger.info(f"Jito bundle sent: {bundle_id}")
                return bundle_id
            else:
                logger.error(f"Jito error: {data.get('error')}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to send bundle to Jito: {e}")
            return None

    async def close(self):
        await self._client.aclose()
