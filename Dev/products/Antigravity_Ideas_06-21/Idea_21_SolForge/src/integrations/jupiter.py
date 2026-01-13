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

from ..core.models import PriceQuote, MarketData

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
        price_api_url: str = "https://price.jup.ag/v6/price",
        default_slippage_bps: int = 50,
        timeout: float = 30.0
    ):
        """
        Initialize Jupiter client.
        
        Args:
            quote_api_url: Jupiter quote API endpoint
            swap_api_url: Jupiter swap API endpoint
            price_api_url: Jupiter price API endpoint
            default_slippage_bps: Default slippage in basis points (50 = 0.5%)
            timeout: Request timeout in seconds
        """
        self.quote_api_url = quote_api_url
        self.swap_api_url = swap_api_url
        self.price_api_url = price_api_url
        self.default_slippage_bps = default_slippage_bps
        self.timeout = timeout
        
        self._client: Optional[httpx.AsyncClient] = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client
    
    async def close(self):
        """Close the HTTP client"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
    
    def _to_raw_amount(self, amount: Decimal, mint: str) -> int:
        """Convert decimal amount to raw (lamports/smallest unit)"""
        decimals = self.DECIMALS.get(mint, 9)
        return int(amount * (10 ** decimals))
    
    def _from_raw_amount(self, raw_amount: int, mint: str) -> Decimal:
        """Convert raw amount to decimal"""
        decimals = self.DECIMALS.get(mint, 9)
        return Decimal(raw_amount) / Decimal(10 ** decimals)
    
    async def get_quote(
        self,
        input_mint: str,
        output_mint: str,
        amount: Decimal,
        slippage_bps: Optional[int] = None
    ) -> PriceQuote:
        """
        Get a swap quote from Jupiter.
        
        Args:
            input_mint: Input token mint address
            output_mint: Output token mint address
            amount: Amount of input token
            slippage_bps: Slippage tolerance in basis points
            
        Returns:
            PriceQuote with swap details
        """
        client = await self._get_client()
        
        raw_amount = self._to_raw_amount(amount, input_mint)
        slippage = slippage_bps or self.default_slippage_bps
        
        params = {
            "inputMint": input_mint,
            "outputMint": output_mint,
            "amount": str(raw_amount),
            "slippageBps": str(slippage),
        }
        
        try:
            response = await client.get(self.quote_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            output_amount = self._from_raw_amount(
                int(data["outAmount"]),
                output_mint
            )
            
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
                route=data.get("routePlan", [])
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
    
    async def get_price(self, mint: str, vs_mint: str = None) -> Decimal:
        """
        Get current price of a token.
        
        Args:
            mint: Token mint address
            vs_mint: Quote token (defaults to USDC)
            
        Returns:
            Price in quote token
        """
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
