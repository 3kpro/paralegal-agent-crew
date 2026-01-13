"""
SolForge DEX Route Selector
Intelligently chooses between Jupiter aggregator and Raydium direct based on:
- Price impact
- Expected output amount
- Gas fees
- Route complexity
"""
import logging
from decimal import Decimal
from typing import Dict, Any, Literal, Tuple
from dataclasses import dataclass

from ..integrations.jupiter import JupiterClient, JupiterAPIError
from ..integrations.raydium import RaydiumClient, RaydiumAPIError
from ..core.models import PriceQuote

logger = logging.getLogger(__name__)

RouteType = Literal["jupiter", "raydium"]

@dataclass
class RouteComparison:
    """Comparison of different routing options"""
    jupiter_quote: Dict[str, Any] | None
    raydium_quote: Dict[str, Any] | None
    recommended_route: RouteType
    output_diff_pct: float
    reason: str

class RouteSelector:
    """
    Selects the optimal DEX route for a swap.
    Compares Jupiter aggregator vs Raydium direct execution.
    """

    def __init__(
        self,
        jupiter_client: JupiterClient,
        raydium_client: RaydiumClient,
        config: Dict[str, Any] = None
    ):
        self.jupiter = jupiter_client
        self.raydium = raydium_client
        self.config = config or {}

        # Thresholds
        self.min_improvement_pct = self.config.get("min_improvement_pct", 0.1)  # 0.1% min to switch
        self.raydium_preferred_pairs = [
            ("So11111111111111111111111111111111111111112",
             "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),  # SOL/USDC
        ]

    async def select_best_route(
        self,
        input_mint: str,
        output_mint: str,
        amount: Decimal,
        slippage_bps: int = 50
    ) -> Tuple[RouteType, PriceQuote | Dict[str, Any]]:
        """
        Compare routes and select the best one.

        Returns:
            (route_type, quote) tuple
        """
        # 1. Check if Raydium has a pool for this pair
        raydium_pool = self.raydium.find_pool_for_pair(input_mint, output_mint)

        if not raydium_pool:
            # No Raydium pool, use Jupiter
            logger.debug(f"No Raydium pool for {input_mint[:8]}/{output_mint[:8]}, using Jupiter")
            quote = await self.jupiter.get_quote(input_mint, output_mint, amount, slippage_bps)
            return ("jupiter", quote)

        # 2. Get quotes from both
        jupiter_quote = None
        raydium_quote = None

        try:
            jupiter_quote = await self.jupiter.get_quote(input_mint, output_mint, amount, slippage_bps)
        except JupiterAPIError as e:
            logger.warning(f"Jupiter quote failed: {e}")

        try:
            raydium_quote = await self.raydium.get_quote(input_mint, output_mint, amount, slippage_bps)
        except RaydiumAPIError as e:
            logger.warning(f"Raydium quote failed: {e}")

        # 3. If only one succeeded, use it
        if jupiter_quote and not raydium_quote:
            logger.info("Only Jupiter quote available")
            return ("jupiter", jupiter_quote)

        if raydium_quote and not jupiter_quote:
            logger.info("Only Raydium quote available")
            return ("raydium", raydium_quote)

        if not jupiter_quote and not raydium_quote:
            raise ValueError("No quotes available from any DEX")

        # 4. Compare quotes
        comparison = self._compare_quotes(jupiter_quote, raydium_quote)

        logger.info(
            f"Route comparison: {comparison.recommended_route.upper()} "
            f"(diff: {comparison.output_diff_pct:+.2f}%) - {comparison.reason}"
        )

        # 5. Return best route
        if comparison.recommended_route == "jupiter":
            return ("jupiter", jupiter_quote)
        else:
            return ("raydium", raydium_quote)

    def _compare_quotes(
        self,
        jupiter_quote: PriceQuote | Dict[str, Any],
        raydium_quote: Dict[str, Any]
    ) -> RouteComparison:
        """Compare two quotes and determine which is better"""

        # Extract output amounts (handle both PriceQuote and Dict)
        if isinstance(jupiter_quote, PriceQuote):
            jup_out = jupiter_quote.output_amount
            jup_impact = jupiter_quote.price_impact_pct
        else:
            jup_out = jupiter_quote.get("output_amount", Decimal("0"))
            jup_impact = jupiter_quote.get("price_impact_pct", 0.0)

        ray_out = raydium_quote.get("output_amount", Decimal("0"))
        ray_impact = raydium_quote.get("price_impact", 0.0)

        # Calculate difference
        if jup_out > 0:
            output_diff_pct = float((ray_out - jup_out) / jup_out * 100)
        else:
            output_diff_pct = 0.0

        # Decision logic
        # 1. If Raydium gives significantly more output, use it
        if output_diff_pct > self.min_improvement_pct:
            return RouteComparison(
                jupiter_quote=jupiter_quote,
                raydium_quote=raydium_quote,
                recommended_route="raydium",
                output_diff_pct=output_diff_pct,
                reason=f"Raydium gives {output_diff_pct:.2f}% better rate"
            )

        # 2. If Jupiter gives significantly more output, use it
        if output_diff_pct < -self.min_improvement_pct:
            return RouteComparison(
                jupiter_quote=jupiter_quote,
                raydium_quote=raydium_quote,
                recommended_route="jupiter",
                output_diff_pct=output_diff_pct,
                reason=f"Jupiter gives {-output_diff_pct:.2f}% better rate"
            )

        # 3. Similar rates - prefer Raydium for known pairs (lower fees, direct execution)
        pair = (
            raydium_quote.get("input_mint"),
            raydium_quote.get("output_mint")
        )
        reverse_pair = (pair[1], pair[0])

        if pair in self.raydium_preferred_pairs or reverse_pair in self.raydium_preferred_pairs:
            return RouteComparison(
                jupiter_quote=jupiter_quote,
                raydium_quote=raydium_quote,
                recommended_route="raydium",
                output_diff_pct=output_diff_pct,
                reason="Rates similar, prefer Raydium direct for SOL/USDC"
            )

        # 4. Default to Jupiter (better routing for exotic pairs)
        return RouteComparison(
            jupiter_quote=jupiter_quote,
            raydium_quote=raydium_quote,
            recommended_route="jupiter",
            output_diff_pct=output_diff_pct,
            reason="Rates similar, prefer Jupiter aggregation"
        )

    async def compare_routes_detailed(
        self,
        input_mint: str,
        output_mint: str,
        amount: Decimal
    ) -> RouteComparison:
        """
        Get detailed comparison without executing.
        Useful for analytics and decision transparency.
        """
        raydium_pool = self.raydium.find_pool_for_pair(input_mint, output_mint)

        jupiter_quote = None
        raydium_quote = None

        try:
            jupiter_quote = await self.jupiter.get_quote(input_mint, output_mint, amount)
        except Exception as e:
            logger.warning(f"Jupiter quote failed: {e}")

        if raydium_pool:
            try:
                raydium_quote = await self.raydium.get_quote(input_mint, output_mint, amount)
            except Exception as e:
                logger.warning(f"Raydium quote failed: {e}")

        if not jupiter_quote and not raydium_quote:
            return RouteComparison(
                jupiter_quote=None,
                raydium_quote=None,
                recommended_route="jupiter",
                output_diff_pct=0.0,
                reason="No quotes available"
            )

        if jupiter_quote and raydium_quote:
            return self._compare_quotes(jupiter_quote, raydium_quote)

        # Only one available
        if jupiter_quote:
            return RouteComparison(
                jupiter_quote=jupiter_quote,
                raydium_quote=None,
                recommended_route="jupiter",
                output_diff_pct=0.0,
                reason="Only Jupiter available"
            )
        else:
            return RouteComparison(
                jupiter_quote=None,
                raydium_quote=raydium_quote,
                recommended_route="raydium",
                output_diff_pct=0.0,
                reason="Only Raydium available"
            )
