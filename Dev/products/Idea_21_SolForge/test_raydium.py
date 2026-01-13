"""
Test Raydium Integration & Route Selection
"""
import asyncio
from decimal import Decimal

from src.integrations.raydium import RaydiumClient
from src.integrations.jupiter import JupiterClient
from src.core.route_selector import RouteSelector


async def test_raydium_client():
    """Test RaydiumClient in mock mode"""
    print("[TEST] Testing RaydiumClient...")

    client = RaydiumClient(mock_mode=True)

    # Test pool discovery
    sol_mint = "So11111111111111111111111111111111111111112"
    usdc_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

    pool = client.find_pool_for_pair(sol_mint, usdc_mint)
    assert pool is not None, "Should find SOL/USDC pool"
    print(f"[PASS] Found pool: {pool['pool_id'][:12]}...")

    # Test quote
    quote = await client.get_quote(usdc_mint, sol_mint, Decimal("10.0"))
    assert quote["output_amount"] > 0, "Should get valid quote"
    print(f"[PASS] Quote: 10 USDC -> {quote['output_amount']:.6f} SOL")
    print(f"       Price Impact: {quote['price_impact']:.2f}%")

    # Test execution (mock)
    sig = await client.execute_direct_swap(
        usdc_mint, sol_mint,
        Decimal("10.0"), Decimal("0.065"),
        "mock_key"
    )
    assert sig.startswith("mock_raydium_sig_"), "Should get mock signature"
    print(f"[PASS] Mock execution: {sig}")

    await client.close()
    print("[PASS] RaydiumClient tests passed!\n")


async def test_route_selector():
    """Test RouteSelector logic"""
    print("[TEST] Testing RouteSelector...")

    jupiter = JupiterClient(mock_mode=True)
    raydium = RaydiumClient(mock_mode=True)
    selector = RouteSelector(jupiter, raydium)

    sol_mint = "So11111111111111111111111111111111111111112"
    usdc_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

    # Test route selection for SOL/USDC
    route_type, quote = await selector.select_best_route(
        usdc_mint, sol_mint, Decimal("10.0")
    )

    print(f"[PASS] Selected route: {route_type.upper()}")
    if hasattr(quote, 'output_amount'):
        print(f"       Output: {quote.output_amount:.6f} SOL")
    else:
        print(f"       Output: {quote['output_amount']:.6f} SOL")

    # Test detailed comparison
    comparison = await selector.compare_routes_detailed(
        usdc_mint, sol_mint, Decimal("10.0")
    )

    print(f"[PASS] Route comparison:")
    print(f"       Recommended: {comparison.recommended_route.upper()}")
    print(f"       Diff: {comparison.output_diff_pct:+.2f}%")
    print(f"       Reason: {comparison.reason}")

    # Test with no Raydium pool (should use Jupiter)
    fake_mint = "FakeTokenMintAddress123456789012345678901234"
    route_type, quote = await selector.select_best_route(
        usdc_mint, fake_mint, Decimal("10.0")
    )
    assert route_type == "jupiter", "Should fall back to Jupiter for unknown pairs"
    print(f"[PASS] Unknown pair correctly routed to Jupiter")

    await jupiter.close()
    await raydium.close()
    print("[PASS] RouteSelector tests passed!\n")


async def test_integration():
    """Test full integration"""
    print("[TEST] Testing Full Integration...")

    # Create clients
    jupiter = JupiterClient(mock_mode=True)
    raydium = RaydiumClient(mock_mode=True)
    selector = RouteSelector(jupiter, raydium, config={"min_improvement_pct": 0.1})

    sol_mint = "So11111111111111111111111111111111111111112"
    usdc_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

    # Test BUY flow (USDC -> SOL)
    print("\n[FLOW] BUY Flow (USDC -> SOL):")
    route_type, quote_data = await selector.select_best_route(
        usdc_mint, sol_mint, Decimal("100.0")
    )

    if isinstance(quote_data, dict):
        print(f"       Route: Raydium Direct")
        print(f"       Input: {quote_data['input_amount']} USDC")
        print(f"       Output: {quote_data['output_amount']:.6f} SOL")
        print(f"       Impact: {quote_data['price_impact']:.2f}%")
    else:
        print(f"       Route: Jupiter Aggregator")
        print(f"       Input: {quote_data.input_amount} USDC")
        print(f"       Output: {quote_data.output_amount:.6f} SOL")
        print(f"       Impact: {quote_data.price_impact_pct:.2f}%")

    # Test SELL flow (SOL -> USDC)
    print("\n[FLOW] SELL Flow (SOL -> USDC):")
    route_type, quote_data = await selector.select_best_route(
        sol_mint, usdc_mint, Decimal("0.5")
    )

    if isinstance(quote_data, dict):
        print(f"       Route: Raydium Direct")
        print(f"       Input: {quote_data['input_amount']} SOL")
        print(f"       Output: {quote_data['output_amount']:.2f} USDC")
        print(f"       Impact: {quote_data['price_impact']:.2f}%")
    else:
        print(f"       Route: Jupiter Aggregator")
        print(f"       Input: {quote_data.input_amount} SOL")
        print(f"       Output: {quote_data.output_amount:.2f} USDC")
        print(f"       Impact: {quote_data.price_impact_pct:.2f}%")

    await jupiter.close()
    await raydium.close()
    print("\n[PASS] Full integration tests passed!")


async def main():
    print("=" * 60)
    print("SolForge Raydium Integration Tests")
    print("=" * 60 + "\n")

    await test_raydium_client()
    await test_route_selector()
    await test_integration()

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
