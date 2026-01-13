"""
SolForge Raydium Integration
Direct interface to Raydium CPMM/AMM pools for high-frequency execution.
"""
import logging
import base64
from decimal import Decimal
from typing import List, Optional, Dict, Any
import httpx

from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction
from solders.message import MessageV0
from solders.instruction import Instruction, AccountMeta
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed

logger = logging.getLogger(__name__)

class RaydiumAPIError(Exception):
    """Raised when Raydium API request fails"""
    pass

class RaydiumClient:
    """
    Client for direct Raydium pooled swaps.
    Bypasses aggregators for lower fees and latency on specific high-depth pools.
    """

    # Raydium V4 Program ID
    PROGRAM_ID = "675kPX9MHTjS2zt1qnt1svKi7ov8G7L5M6u7m9MMSwL"

    # Common high-liquidity pools
    KNOWN_POOLS = {
        "SOL/USDC": {
            "pool_id": "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2",
            "token_a": "So11111111111111111111111111111111111111112",  # SOL
            "token_b": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
            "decimals_a": 9,
            "decimals_b": 6,
        },
        "RAY/USDC": {
            "pool_id": "6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg",
            "token_a": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",  # RAY
            "token_b": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
            "decimals_a": 6,
            "decimals_b": 6,
        },
    }

    # Raydium API for pool info
    RAYDIUM_API_BASE = "https://api.raydium.io/v2"

    def __init__(
        self,
        rpc_url: str = "https://api.mainnet-beta.solana.com",
        mock_mode: bool = False,
        jito_client: Optional[Any] = None
    ):
        self.rpc_url = rpc_url
        self.mock_mode = mock_mode
        self.jito_client = jito_client
        self._client = AsyncClient(rpc_url) if not mock_mode else None
        self._http_client: Optional[httpx.AsyncClient] = None

    async def _get_http_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client"""
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(timeout=30.0)
        return self._http_client

    async def get_pool_info(self, pool_id: str) -> Dict[str, Any]:
        """Fetch pool state from Raydium API"""
        if self.mock_mode:
            return {
                "pool_id": pool_id,
                "mock": True,
                "liquidity": Decimal("1000000"),
                "base_reserve": Decimal("500000"),
                "quote_reserve": Decimal("500000"),
            }

        try:
            client = await self._get_http_client()
            response = await client.get(f"{self.RAYDIUM_API_BASE}/ammPool/info?poolId={pool_id}")
            response.raise_for_status()
            data = response.json()

            if "data" in data:
                pool = data["data"]
                return {
                    "pool_id": pool_id,
                    "liquidity": Decimal(str(pool.get("liquidity", 0))),
                    "base_reserve": Decimal(str(pool.get("baseReserve", 0))),
                    "quote_reserve": Decimal(str(pool.get("quoteReserve", 0))),
                    "volume_24h": Decimal(str(pool.get("volume24h", 0))),
                }

            return {}

        except Exception as e:
            logger.error(f"Failed to fetch pool info: {e}")
            return {}

    def find_pool_for_pair(self, token_a: str, token_b: str) -> Optional[Dict[str, Any]]:
        """Find a known Raydium pool for a token pair"""
        for pool_key, pool_info in self.KNOWN_POOLS.items():
            if (pool_info["token_a"] == token_a and pool_info["token_b"] == token_b) or \
               (pool_info["token_a"] == token_b and pool_info["token_b"] == token_a):
                return pool_info
        return None

    async def get_quote(
        self,
        input_mint: str,
        output_mint: str,
        amount_in: Decimal,
        slippage_bps: int = 50
    ) -> Dict[str, Any]:
        """
        Get a quote for a direct Raydium swap.
        Returns quote in Jupiter-compatible format for consistency.
        """
        pool_info = self.find_pool_for_pair(input_mint, output_mint)

        if not pool_info:
            raise RaydiumAPIError(f"No known Raydium pool for {input_mint[:8]} -> {output_mint[:8]}")

        if self.mock_mode:
            # Mock calculation: simple 1:150 SOL/USDC rate
            if input_mint == pool_info["token_a"]:
                # SOL -> USDC
                output_amount = amount_in * Decimal("150") * Decimal("0.997")  # 0.3% fee
            else:
                # USDC -> SOL
                output_amount = amount_in / Decimal("150") * Decimal("0.997")

            return {
                "input_mint": input_mint,
                "output_mint": output_mint,
                "input_amount": amount_in,
                "output_amount": output_amount,
                "price_impact": 0.05,  # 0.05%
                "slippage_bps": slippage_bps,
                "pool_id": pool_info["pool_id"],
                "route": "raydium_direct"
            }

        # Fetch real pool reserves
        pool_data = await self.get_pool_info(pool_info["pool_id"])

        if not pool_data or not pool_data.get("base_reserve"):
            raise RaydiumAPIError(f"Could not fetch pool reserves for {pool_info['pool_id']}")

        # Calculate output using constant product formula (x * y = k)
        # amount_out = (amount_in * reserve_out) / (reserve_in + amount_in)
        # Apply 0.3% Raydium fee

        is_token_a_input = input_mint == pool_info["token_a"]
        reserve_in = pool_data["base_reserve"] if is_token_a_input else pool_data["quote_reserve"]
        reserve_out = pool_data["quote_reserve"] if is_token_a_input else pool_data["base_reserve"]

        # Adjust for decimals
        decimals_in = pool_info["decimals_a"] if is_token_a_input else pool_info["decimals_b"]
        decimals_out = pool_info["decimals_b"] if is_token_a_input else pool_info["decimals_a"]

        amount_in_raw = amount_in * Decimal(10 ** decimals_in)
        reserve_in_raw = reserve_in
        reserve_out_raw = reserve_out

        # Apply fee (0.3% goes to LPs, 0.03% to protocol)
        amount_in_with_fee = amount_in_raw * Decimal("0.997")

        # CPMM formula
        amount_out_raw = (amount_in_with_fee * reserve_out_raw) / (reserve_in_raw + amount_in_with_fee)
        amount_out = amount_out_raw / Decimal(10 ** decimals_out)

        # Calculate price impact
        price_before = reserve_out_raw / reserve_in_raw
        price_after = (reserve_out_raw - amount_out_raw) / (reserve_in_raw + amount_in_raw)
        price_impact_pct = abs(float((price_after - price_before) / price_before)) * 100

        return {
            "input_mint": input_mint,
            "output_mint": output_mint,
            "input_amount": amount_in,
            "output_amount": amount_out,
            "price_impact": price_impact_pct,
            "slippage_bps": slippage_bps,
            "pool_id": pool_info["pool_id"],
            "route": "raydium_direct",
            "pool_info": pool_info
        }

    async def execute_direct_swap(
        self,
        input_mint: str,
        output_mint: str,
        amount_in: Decimal,
        min_amount_out: Decimal,
        private_key: str,
        use_jito: bool = True
    ) -> str:
        """Execute a direct swap on Raydium pool"""
        if self.mock_mode:
            pool_info = self.find_pool_for_pair(input_mint, output_mint)
            pool_id = pool_info["pool_id"] if pool_info else "unknown"
            logger.info(f"Mock Raydium Swap: {amount_in} {input_mint[:8]} -> {output_mint[:8]}")
            return "mock_raydium_sig_" + pool_id[:8]

        pool_info = self.find_pool_for_pair(input_mint, output_mint)
        if not pool_info:
            raise RaydiumAPIError(f"No known pool for {input_mint[:8]} -> {output_mint[:8]}")

        try:
            # 1. Load keypair
            if isinstance(private_key, str):
                import base58
                key = base58.b58decode(private_key)
                keypair = Keypair.from_bytes(key)
            else:
                keypair = Keypair.from_bytes(private_key)
        except Exception as e:
            logger.error(f"Failed to load keypair: {e}")
            raise RaydiumAPIError(f"Invalid private key: {e}")

        try:
            # 2. Build swap instruction
            # NOTE: For a production implementation, you would use the full Raydium SDK
            # or build the instruction manually with proper account layout.
            # This is a simplified version for the MVP integration.

            logger.warning(
                "Raydium direct swap uses simplified instruction building. "
                "For production, integrate full Raydium SDK or use Jupiter aggregation."
            )

            # Convert amounts to raw units
            decimals_in = pool_info["decimals_a"] if input_mint == pool_info["token_a"] else pool_info["decimals_b"]
            decimals_out = pool_info["decimals_b"] if input_mint == pool_info["token_a"] else pool_info["decimals_a"]

            amount_in_raw = int(amount_in * (10 ** decimals_in))
            min_out_raw = int(min_amount_out * (10 ** decimals_out))

            logger.info(
                f"Raydium Direct Swap: {amount_in} -> {min_amount_out} "
                f"(Pool: {pool_info['pool_id'][:8]})"
            )

            # For MVP: We fall back to Jupiter aggregator for actual execution
            # since building raw Raydium instructions requires the full pool account layout
            # which is beyond MVP scope. The infrastructure is in place for future enhancement.

            logger.info("Falling back to Jupiter aggregator for execution (Raydium SDK integration pending)")
            raise RaydiumAPIError(
                "Direct Raydium execution requires full SDK integration. "
                "Use Jupiter aggregator for now."
            )

        except Exception as e:
            logger.error(f"Raydium swap failed: {e}")
            raise RaydiumAPIError(f"Swap execution failed: {e}")

    async def close(self):
        """Close clients"""
        if self._client:
            await self._client.close()
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()
