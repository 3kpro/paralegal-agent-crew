"""
SolForge Priority Fee Manager
Fetches and scales priority fees based on network congestion.
"""
import logging
import httpx
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class PriorityFeeManager:
    """
    Service to fetch optimal priority fees for Solana transactions.
    Supports Helius Priority Fee API and standard RPC fallbacks.
    """
    
    def __init__(self, config: Dict[str, Any] = {}):
        self.config = config
        self.helius_api_key = config.get("helius_api_key")
        self.rpc_url = config.get("solana_rpc_url", "https://api.mainnet-beta.solana.com")
        self.mock_mode = config.get("mock_mode", False)
        
        self._client = httpx.AsyncClient(timeout=10.0)

    async def get_optimal_fee(self, account_keys: list[str] = []) -> int:
        """
        Calculate optimal priority fee (micro-lamports per compute unit).
        
        Args:
            account_keys: List of write-locked accounts for more specific estimates.
            
        Returns:
            Fee in micro-lamports.
        """
        if self.mock_mode:
            return 50000 # 0.05 SOL base priority (mock)
            
        if self.helius_api_key:
            return await self._get_helius_priority_fee(account_keys)
        
        return await self._get_fallback_priority_fee()

    async def _get_helius_priority_fee(self, account_keys: list[str]) -> int:
        """Fetch priority fee from Helius API"""
        url = f"https://mainnet.helius-rpc.com/?api-key={self.helius_api_key}"
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getPriorityFeeEstimate",
            "params": [{
                "accountKeys": account_keys,
                "options": {
                    "includeAllPriorityFeeLevels": True
                }
            }]
        }
        
        try:
            response = await self._client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if "result" in data and "priorityFeeLevels" in data["result"]:
                levels = data["result"]["priorityFeeLevels"]
                # We usually want 'high' or 'veryHigh' for trading
                return int(levels.get("high", 100000))
            
            return 100000 # Fallback
        except Exception as e:
            logger.warning(f"Helius Priority Fee API failed: {e}")
            return await self._get_fallback_priority_fee()

    async def _get_fallback_priority_fee(self) -> int:
        """Standard RPC fallback (using getRecentPrioritizationFees)"""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getRecentPrioritizationFees",
            "params": [[]]
        }
        
        try:
            response = await self._client.post(self.rpc_url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if "result" in data and data["result"]:
                fees = [f["prioritizationFee"] for f in data["result"]]
                if fees:
                    # Take the median of recent fees and scale it
                    fees.sort()
                    median = fees[len(fees)//2]
                    return max(1000, int(median * 1.5))
            
            return 10000 # Static low fallback
        except Exception:
            return 10000

    async def close(self):
        await self._client.aclose()
