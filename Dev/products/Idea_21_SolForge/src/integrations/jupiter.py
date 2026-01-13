"""
SolForge Jupiter Integration
Interface to Jupiter aggregator for price quotes and swaps
"""
import asyncio
from decimal import Decimal
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging

import httpx
import base64
from solders.keypair import Keypair
from solders.transaction import VersionedTransaction
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed

from ..core.models import PriceQuote, MarketData
from ..core.slippage import SlippageOptimizer
from .priority_fees import PriorityFeeManager

logger = logging.getLogger(__name__)


class JupiterAPIError(Exception):
    """Raised when Jupiter API request fails"""
    pass


class JupiterClient:
    """
    Client for Jupiter DEX aggregator API.
    Used for getting quotes and executing swaps on Solana.
    """
    
    # Common token mints
    TOKENS = {
        "SOL": "So11111111111111111111111111111111111111112",
        "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    }
    
    # Token decimals
    DECIMALS = {
        "So11111111111111111111111111111111111111112": 9,   # SOL
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 6,  # USDC
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": 6,  # USDT
        "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": 6,  # RAY
        "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": 6,   # JUP
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": 5,  # BONK
    }
    
    def __init__(
        self,
        quote_api_url: str = "https://quote-api.jup.ag/v6/quote",
        swap_api_url: str = "https://quote-api.jup.ag/v6/swap",
        price_api_url: str = "https://api.jup.ag/price/v2",
        default_slippage_bps: int = 50,
        timeout: float = 30.0,
        verify_ssl: bool = True,
        mock_mode: bool = False,
        private_key: Optional[str] = None,
        rpc_url: str = "https://api.mainnet-beta.solana.com",
        jito_client: Optional[Any] = None
    ):
        """
        Initialize Jupiter client.
        
        Args:
            quote_api_url: Jupiter quote API endpoint
            swap_api_url: Jupiter swap API endpoint
            price_api_url: Jupiter price API endpoint (v2)
            default_slippage_bps: Default slippage in basis points (50 = 0.5%)
            timeout: Request timeout in seconds
            verify_ssl: Verify SSL certificates (disable for dev if needed)
            mock_mode: Use mock data instead of real API (for offline/testing)
            private_key: Optional Solana private key for live swaps
            rpc_url: Solana RPC endpoint for live transactions
            jito_client: Optional JitoClient for bundled execution
        """
        self.quote_api_url = quote_api_url
        self.swap_api_url = swap_api_url
        self.price_api_url = price_api_url
        self.default_slippage_bps = default_slippage_bps
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.mock_mode = mock_mode
        self.private_key = private_key
        self.rpc_url = rpc_url
        self.jito_client = jito_client
        
        # Components
        self.slippage_optimizer = SlippageOptimizer()
        self.priority_fee_manager = PriorityFeeManager({
            "helius_api_key": None,  # Can be configured via environment or passed explicitly
            "solana_rpc_url": rpc_url,
            "mock_mode": mock_mode
        })
        
        self._client: Optional[httpx.AsyncClient] = None
        
        # Initialize decimals cache with known tokens
        self._decimals_cache = self.DECIMALS.copy()
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=self.timeout, verify=self.verify_ssl)
        return self._client
    
    async def close(self):
        """Close the HTTP client"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
    
    async def _get_decimals(self, mint: str) -> int:
        """Get decimals for a token, fetching if unknown"""
        if mint in self._decimals_cache:
            return self._decimals_cache[mint]
            
        if self.mock_mode:
            return 9  # Default for mock
            
        # Fetch from API
        info = await self.get_token_info(mint)
        if info and "decimals" in info:
            self._decimals_cache[mint] = info["decimals"]
            return info["decimals"]
            
        # Fallback
        logger.warning(f"Decimals for {mint} not found, defaulting to 6")
        return 6
    
    async def get_quote(
        self,
        input_mint: str,
        output_mint: str,
        amount: Decimal,
        slippage_bps: Optional[int] = None,
        adaptive: bool = True
    ) -> PriceQuote:
        """
        Get a swap quote from Jupiter.
        """
        slippage = slippage_bps or self.default_slippage_bps
        
        if self.mock_mode:
            # Mock Quote Logic
            # Simulate a price around $100 for SOL, $1 for USDC
            input_decimals = await self._get_decimals(input_mint)
            output_decimals = await self._get_decimals(output_mint)
            
            # Simple mock price map
            prices = {
                "So11111111111111111111111111111111111111112": Decimal("150.0"),
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": Decimal("1.0"),
                "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": Decimal("1.0"),
            }
            
            p_in = prices.get(input_mint, Decimal("1.0"))
            p_out = prices.get(output_mint, Decimal("1.0"))
            
            # Identify relative price
            exchange_rate = p_in / p_out
            output_amount = amount * exchange_rate * Decimal("0.999") # 0.1% mock impact/fee
            
            return PriceQuote(
                input_mint=input_mint,
                output_mint=output_mint,
                input_amount=amount,
                output_amount=output_amount,
                price=output_amount/amount if amount else 0,
                price_impact_pct=0.1,
                slippage_bps=slippage,
                route=[{"mock": "route"}]
            )

        client = await self._get_client()
        
        # Ensure we have decimals
        input_decimals = await self._get_decimals(input_mint)
        raw_amount = int(amount * (10 ** input_decimals))
        
        params = {
            "inputMint": input_mint,
            "outputMint": output_mint,
            "amount": str(raw_amount),
            "slippageBps": str(slippage),
        }
        
        # If adaptive, we might re-quote after seeing impact
        try:
            response = await client.get(self.quote_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            price_impact = float(data.get("priceImpactPct", 0))
            
            if adaptive and slippage_bps is None:
                # Calculate optimal slippage
                optimal_bps = self.slippage_optimizer.calculate_optimal_slippage(price_impact)
                if optimal_bps != slippage:
                    logger.info(f"Adapting slippage: {slippage} -> {optimal_bps} bps (Impact: {price_impact:.2%})")
                    params["slippageBps"] = str(optimal_bps)
                    response = await client.get(self.quote_api_url, params=params)
                    response.raise_for_status()
                    data = response.json()
                    slippage = optimal_bps

            
            output_decimals = await self._get_decimals(output_mint)
            output_amount = Decimal(data["outAmount"]) / Decimal(10 ** output_decimals)
            
            price_impact = float(data.get("priceImpactPct", 0))
            
            # Calculate effective price
            if amount > 0:
                price = output_amount / amount
            else:
                price = Decimal("0")
            
            quote = PriceQuote(
                input_mint=input_mint,
                output_mint=output_mint,
                input_amount=amount,
                output_amount=output_amount,
                price=price,
                price_impact_pct=price_impact,
                slippage_bps=slippage,
                route=data.get("routePlan", []),
                metadata={"raw_quote": data} # Store raw quote for swap
            )
            
            logger.debug(
                f"Quote: {amount} {input_mint[:8]} -> {output_amount} {output_mint[:8]} "
                f"(impact: {price_impact:.2%})"
            )
            
            return quote
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Jupiter API error: {e.response.status_code} - {e.response.text}")
            raise JupiterAPIError(f"Quote failed: {e.response.text}")
        except Exception as e:
            logger.error(f"Jupiter request failed: {e}")
            raise JupiterAPIError(f"Quote request failed: {e}")
    
    async def execute_swap(
        self,
        quote: PriceQuote,
        private_key: Optional[str] = None,
        rpc_url: Optional[str] = None
    ) -> str:
        """
        Execute a live swap on Solana via Jupiter.
        
        Args:
            quote: PriceQuote object containing the raw quote data
            private_key: Base58 or byte string private key (overrides instance)
            rpc_url: Solana RPC endpoint (overrides instance)
            
        Returns:
            Transaction signature
        """
        key_to_use = private_key or self.private_key
        rpc_to_use = rpc_url or self.rpc_url

        if not key_to_use:
            raise JupiterAPIError("No private key provided for swap execution")

        if self.mock_mode:
            logger.info("Mock Swap: Execution skipped")
            return "mock_signature_" + quote.input_mint[:8]

        raw_quote = quote.metadata.get("raw_quote")
        if not raw_quote:
            raise JupiterAPIError("No raw quote data found for execution")

        # 1. Setup Wallet
        try:
            # Handle both base58 and list of ints
            if isinstance(key_to_use, str):
                import base58
                key = base58.b58decode(key_to_use)
                keypair = Keypair.from_bytes(key)
            else:
                keypair = Keypair.from_bytes(key_to_use)
        except Exception as e:
            logger.error(f"Failed to load keypair: {e}")
            raise JupiterAPIError(f"Invalid private key: {e}")

    async def get_swap_transaction(
        self,
        quote: PriceQuote,
        user_pubkey: str,
        wrap_unwrap_sol: bool = True
    ) -> str:
        """
        Get a base64 encoded swap transaction from Jupiter.
        """
        raw_quote = quote.metadata.get("raw_quote")
        if not raw_quote:
            raise JupiterAPIError("No raw quote data found")

        # Calculate dynamic priority fee if not provided
        priority_fee = 0
        if not self.mock_mode:
            # We fetch priority fee in micro-lamports
            # Jupiter expects lamports (total) OR "auto"
            # However, recent Jupiter V6 API often prefers specific lamport amounts or "auto"
            # We will use "auto" for now BUT we can scale it if we want custom logic
            # For this task, we will fetch the fee and convert to lamports if possible
            # OR we stick to Helius estimate and pass it as a custom value if API supports it.
            # Jupiter's "auto" is decent but Helius is often better.
            
            # For now, let's stick to 'auto' for Jupiter but implement the manager for 
            # transactions we build ourselves (like Jito tips or custom arbitrage legs).
            # ACTUALLY, we can calculate total lamports: Fee * CU_Limit / 1,000,000
            micro_lamports = await self.priority_fee_manager.get_optimal_fee([user_pubkey])
            cu_limit = 200000 # Default estimate
            priority_fee_lamports = int((micro_lamports * cu_limit) / 1_000_000)
            priority_fee = max(priority_fee_lamports, 1000) # Min 1000 lamports
            
        swap_params = {
            "quoteResponse": raw_quote,
            "userPublicKey": user_pubkey,
            "wrapAndUnwrapSol": wrap_unwrap_sol,
            "dynamicComputeUnitLimit": True,
            "prioritizationFeeLamports": priority_fee if priority_fee > 0 else "auto"
        }
        
        response = await client.post(self.swap_api_url, json=swap_params)
        response.raise_for_status()
        data = response.json()
        return data["swapTransaction"]

    async def execute_swap(
        self,
        quote: PriceQuote,
        private_key: Optional[str] = None,
        rpc_url: Optional[str] = None
    ) -> str:
        """Execute a live swap via Jupiter (Standard or Jito)."""
        key_to_use = private_key or self.private_key
        rpc_to_use = rpc_url or self.rpc_url

        if not key_to_use:
            raise JupiterAPIError("No private key provided for swap execution")

        if self.mock_mode:
            logger.info("Mock Swap: Execution skipped")
            return "mock_signature_" + quote.input_mint[:8]

        try:
            if isinstance(key_to_use, str):
                import base58
                key = base58.b58decode(key_to_use)
                keypair = Keypair.from_bytes(key)
            else:
                keypair = Keypair.from_bytes(key_to_use)
        except Exception as e:
            logger.error(f"Failed to load keypair: {e}")
            raise JupiterAPIError(f"Invalid private key: {e}")

        try:
            # 1. Get Swap Transaction
            tx_b64 = await self.get_swap_transaction(quote, str(keypair.pubkey()))
            tx_bytes = base64.b64decode(tx_b64)
            tx = VersionedTransaction.from_bytes(tx_bytes)
            
            # 2. Sign Transaction
            signature = keypair.sign_message(tx.message.to_bytes())
            signed_tx = VersionedTransaction.populate(tx.message, [signature])
            
            # 4. Send Transaction
            if self.jito_client and not self.mock_mode:
                try:
                    # 4.1 Create Tip Instruction
                    tip_lamports = 100000  # 0.0001 SOL tip
                    tip_ix = self.jito_client.create_tip_instruction(keypair.pubkey(), tip_lamports)
                    
                    # 4.2 Create a separate Tip Transaction to bundle with Swap
                    # (Standard practice for Jito bundling)
                    # We need a recent blockhash
                    async with AsyncClient(rpc_to_use) as rpc:
                        recent_blockhash = await rpc.get_latest_blockhash()
                        
                        from solders.message import MessageV0
                        from solders.transaction import VersionedTransaction
                        
                        tip_message = MessageV0.try_compile(
                            payer=keypair.pubkey(),
                            instructions=[tip_ix],
                            address_lookup_table_accounts=[],
                            recent_blockhash=recent_blockhash.value.blockhash
                        )
                        tip_tx = VersionedTransaction(tip_message, [keypair])
                        
                        # 4.3 Bundle: [SwapTX, TipTX]
                        bundle = [
                            base64.b64encode(bytes(signed_tx)).decode("utf-8"),
                            base64.b64encode(bytes(tip_tx)).decode("utf-8")
                        ]
                        
                        # Send to Jito
                        bundle_id = await self.jito_client.send_bundle(bundle)
                        logger.info(f"Swap sent via Jito bundle: {bundle_id}")
                        return f"jito_{bundle_id}"
                except Exception as je:
                    logger.warning(f"Jito bundling failed, falling back to standard RPC: {je}")

            # Fallback / Standard Send
            async with AsyncClient(rpc_to_use) as rpc:
                res = await rpc.send_raw_transaction(bytes(signed_tx))
                sig = str(res.value)
                logger.info(f"Swap transaction sent (Standard): {sig}")
                await rpc.confirm_transaction(res.value, commitment=Confirmed)
                return sig
                
        except Exception as e:
            logger.error(f"Execution failed: {e}")
            raise JupiterAPIError(f"Swap execution failed: {e}")
    
    async def get_price(self, mint: str, vs_mint: str = None) -> Decimal:
        """
        Get current price of a token.
        
        Args:
            mint: Token mint address
            vs_mint: Quote token (defaults to USDC)
            
        Returns:
            Price in quote token
        """
        if self.mock_mode:
            # Simple mock prices
            if mint == "So11111111111111111111111111111111111111112":
                return Decimal("150.0")
            elif mint == "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v":
                return Decimal("1.0")
            elif mint == "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB":
                return Decimal("1.0")
            else:
                return Decimal("1.0")  # Default mock

        client = await self._get_client()
        
        vs = vs_mint or self.TOKENS["USDC"]
        
        params = {
            "ids": mint,
            "vsToken": vs
        }
        
        try:
            response = await client.get(self.price_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and mint in data["data"]:
                price = Decimal(str(data["data"][mint]["price"]))
                return price
            else:
                logger.warning(f"No price data for {mint}")
                return Decimal("0")
                
        except Exception as e:
            logger.error(f"Price fetch failed: {e}")
            return Decimal("0")
    
    async def get_prices(self, mints: List[str]) -> Dict[str, Decimal]:
        """
        Get prices for multiple tokens.
        
        Args:
            mints: List of token mint addresses
            
        Returns:
            Dict mapping mint -> price in USDC
        """
        if self.mock_mode:
            results = {}
            for mint in mints:
                if mint == "So11111111111111111111111111111111111111112":
                    results[mint] = Decimal("150.0")
                else:
                    results[mint] = Decimal("1.0")
            return results

        client = await self._get_client()
        
        params = {
            "ids": ",".join(mints),
            "vsToken": self.TOKENS["USDC"]
        }
        
        try:
            response = await client.get(self.price_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            prices = {}
            if "data" in data:
                for mint, info in data["data"].items():
                    prices[mint] = Decimal(str(info["price"]))
            
            return prices
            
        except Exception as e:
            logger.error(f"Prices fetch failed: {e}")
            return {}
    
    async def get_token_info(self, mint: str) -> Optional[Dict[str, Any]]:
        """
        Get token information from Jupiter.
        
        Args:
            mint: Token mint address
            
        Returns:
            Token info dict or None
        """
        client = await self._get_client()
        
        try:
            url = f"https://token.jup.ag/strict"
            response = await client.get(url)
            response.raise_for_status()
            tokens = response.json()
            
            for token in tokens:
                if token.get("address") == mint:
                    return token
            
            return None
            
        except Exception as e:
            logger.error(f"Token info fetch failed: {e}")
            return None
    
    async def get_top_tokens(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get top tokens by volume.
        
        Args:
            limit: Number of tokens to return
            
        Returns:
            List of token info dicts
        """
        client = await self._get_client()
        
        try:
            url = "https://token.jup.ag/strict"
            response = await client.get(url)
            response.raise_for_status()
            tokens = response.json()
            
            # Sort by some criteria (simplified - just return first N)
            return tokens[:limit]
            
        except Exception as e:
            logger.error(f"Top tokens fetch failed: {e}")
            return []


# Singleton instance for convenience
_jupiter_client: Optional[JupiterClient] = None


def get_jupiter_client() -> JupiterClient:
    """Get singleton Jupiter client instance"""
    global _jupiter_client
    if _jupiter_client is None:
        _jupiter_client = JupiterClient()
    return _jupiter_client


async def cleanup_jupiter():
    """Cleanup Jupiter client"""
    global _jupiter_client
    if _jupiter_client:
        await _jupiter_client.close()
        _jupiter_client = None
