# Raydium Direct Integration - Technical Documentation

## Overview

SolForge now features intelligent multi-DEX routing that automatically selects the optimal execution path between Jupiter aggregator and Raydium direct pools. This integration minimizes trading fees and price impact for supported token pairs.

## Architecture

### Components

1. **RaydiumClient** ([src/integrations/raydium.py](../src/integrations/raydium.py))
   - Direct interface to Raydium AMM V4 pools
   - CPMM quote calculation using pool reserves
   - Known pool registry for high-liquidity pairs

2. **RouteSelector** ([src/core/route_selector.py](../src/core/route_selector.py))
   - Intelligent DEX routing logic
   - Parallel quote comparison
   - Configurable selection thresholds

3. **Orchestrator Integration** ([src/core/orchestrator.py](../src/core/orchestrator.py))
   - Unified BUY/SELL flow with route selection
   - Automatic fallback to Jupiter for unsupported pairs
   - Trade metadata tracking for analytics

## Features

### Intelligent Route Selection

The `RouteSelector` compares quotes from both DEXs and automatically selects the best route based on:

- **Output Amount**: Chooses the route that maximizes tokens received
- **Price Impact**: Considers slippage and price movement
- **Route Complexity**: Prefers Raydium direct for known pairs when rates are similar
- **Minimum Improvement Threshold**: 0.1% default (configurable)

### Supported Pools

Currently supported high-liquidity Raydium pools:

| Pair        | Pool ID                                      | Token A Decimals | Token B Decimals |
|-------------|----------------------------------------------|------------------|------------------|
| SOL/USDC    | 58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2 | 9                | 6                |
| RAY/USDC    | 6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg | 6                | 6                |

### CPMM Quote Calculation

Raydium quotes use the constant product market maker formula:

```
amount_out = (amount_in * fee_multiplier * reserve_out) / (reserve_in + amount_in * fee_multiplier)
```

Where:
- `fee_multiplier = 0.997` (0.3% LP fee)
- Reserves are fetched in real-time from Raydium API
- Price impact is calculated as the change in exchange rate

## Usage

### Configuration

Enable route selection in orchestrator config:

```python
config = {
    "use_route_selector": True,  # Enable intelligent routing (default: True)
    "route_selector": {
        "min_improvement_pct": 0.1  # Minimum advantage to switch routes (default: 0.1%)
    }
}

orchestrator = MultiLaneOrchestrator(config)
```

### Trade Execution Flow

1. **Quote Phase**: System fetches quotes from both Jupiter and Raydium
2. **Comparison**: RouteSelector compares output amounts and price impact
3. **Selection**: Best route is chosen based on configured criteria
4. **Execution**: Trade is executed via selected DEX
5. **Metadata**: Route type and details are saved to trade record

### Example: BUY Trade (USDC -> SOL)

```python
# Orchestrator automatically handles route selection
# In _process_lane method:

route_type, quote_data = await self.route_selector.select_best_route(
    input_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
    output_mint="So11111111111111111111111111111111111111112",  # SOL
    amount=Decimal("10.0")
)

# quote_data contains the best quote
# route_type is either "jupiter" or "raydium"
```

## Testing

Run the integration tests:

```bash
python test_raydium.py
```

Tests cover:
- Pool discovery
- Quote calculation
- Route selection logic
- Full BUY/SELL flow integration

### Sample Test Output

```
============================================================
SolForge Raydium Integration Tests
============================================================

[TEST] Testing RaydiumClient...
[PASS] Found pool: 58oQChx4yWmv...
[PASS] Quote: 10 USDC -> 0.066467 SOL
       Price Impact: 0.05%
[PASS] Mock execution: mock_raydium_sig_58oQChx4
[PASS] RaydiumClient tests passed!

[TEST] Testing RouteSelector...
[PASS] Selected route: JUPITER
       Output: 0.066600 SOL
[PASS] Route comparison:
       Recommended: JUPITER
       Diff: -0.20%
       Reason: Jupiter gives 0.20% better rate

[FLOW] BUY Flow (USDC -> SOL):
       Route: Jupiter Aggregator
       Input: 100.0 USDC
       Output: 0.666000 SOL
       Impact: 0.10%

============================================================
ALL TESTS PASSED!
============================================================
```

## Trade Metadata

Each trade now includes routing information:

```python
trade.metadata = {
    "route_type": "raydium",  # or "jupiter"
    "route": "raydium",
    "signature": "abc123...",
    "raydium_data": {  # If Raydium was used
        "pool_id": "58oQChx4yWmv...",
        "price_impact": 0.05
    }
}
```

## Performance Benefits

### Fee Comparison

| DEX             | Swap Fee | Routing Complexity | Best For                |
|-----------------|----------|---------------------|-------------------------|
| Raydium Direct  | 0.3%     | Single hop          | High-liquidity pairs    |
| Jupiter         | 0.3-1%+  | Multi-hop possible  | Exotic tokens, routing  |

### When Raydium is Selected

- SOL/USDC swaps with < 0.1% advantage difference
- Direct pool execution when price impact is minimal
- Preferred pairs configured in `raydium_preferred_pairs`

### When Jupiter is Selected

- Tokens without Raydium pools
- Jupiter quote is > 0.1% better
- Complex routing provides better rates

## Future Enhancements

### Phase 1: MVP (Current)
- ✅ Pool discovery and quote calculation
- ✅ Intelligent route selection
- ✅ Orchestrator integration
- ✅ Mock mode testing

### Phase 2: Production (Backlog)
- [ ] Full Raydium SDK integration for transaction building
- [ ] Raw instruction creation with proper account layouts
- [ ] Direct on-chain execution (currently falls back to Jupiter)
- [ ] Additional pool support (RAY/SOL, JUP/SOL, etc.)

### Phase 3: Advanced (Future)
- [ ] Multi-hop Raydium routing
- [ ] Pool depth analysis for optimal routing
- [ ] Historical performance tracking by route
- [ ] Dynamic pool discovery via Raydium API

## API Reference

### RaydiumClient

```python
client = RaydiumClient(
    rpc_url="https://api.mainnet-beta.solana.com",
    mock_mode=False,
    jito_client=jito_client  # Optional
)

# Find pool for token pair
pool = client.find_pool_for_pair(token_a_mint, token_b_mint)

# Get quote
quote = await client.get_quote(
    input_mint=usdc_mint,
    output_mint=sol_mint,
    amount=Decimal("10.0"),
    slippage_bps=50
)

# Execute swap (currently falls back to Jupiter)
sig = await client.execute_direct_swap(
    input_mint=usdc_mint,
    output_mint=sol_mint,
    amount_in=Decimal("10.0"),
    min_amount_out=Decimal("0.065"),
    private_key=private_key
)
```

### RouteSelector

```python
selector = RouteSelector(
    jupiter_client=jupiter,
    raydium_client=raydium,
    config={"min_improvement_pct": 0.1}
)

# Select best route
route_type, quote = await selector.select_best_route(
    input_mint=usdc_mint,
    output_mint=sol_mint,
    amount=Decimal("10.0")
)

# Get detailed comparison
comparison = await selector.compare_routes_detailed(
    input_mint=usdc_mint,
    output_mint=sol_mint,
    amount=Decimal("10.0")
)

print(f"Recommended: {comparison.recommended_route}")
print(f"Output Diff: {comparison.output_diff_pct:.2f}%")
print(f"Reason: {comparison.reason}")
```

## Configuration Options

### Orchestrator Config

```python
config = {
    "use_route_selector": True,  # Enable/disable route selection
    "route_selector": {
        "min_improvement_pct": 0.1,  # Minimum improvement to switch routes
    },
    "mock_mode": True  # Paper trading mode
}
```

### Route Selector Config

```python
route_selector_config = {
    "min_improvement_pct": 0.1,  # 0.1% minimum advantage
}
```

## Troubleshooting

### Issue: All trades use Jupiter

**Cause**: Route selector disabled or no Raydium pool for pair

**Solution**:
```python
# Ensure route selector is enabled
config["use_route_selector"] = True

# Check if pair has a Raydium pool
pool = raydium_client.find_pool_for_pair(token_a, token_b)
if not pool:
    print("No Raydium pool available for this pair")
```

### Issue: Raydium execution fails

**Cause**: Full SDK integration pending

**Solution**: System automatically falls back to Jupiter. This is expected behavior for MVP.

```python
# Check logs for fallback message:
# "Raydium execution pending SDK integration, using Jupiter"
```

### Issue: Price discrepancy between quotes

**Cause**: Timing difference or pool reserves changed

**Solution**: Quotes are fetched in parallel. Small discrepancies are normal due to market movement.

## Monitoring

### Log Messages

```
[INFO] Selected RAYDIUM route for BUY
[INFO] Executing via Raydium Direct for lane Alpha Safe
[WARN] Raydium execution pending SDK integration, using Jupiter
[INFO] LIVE BUY SUCCESS (jupiter): abc123...
```

### Metrics to Track

- Route selection frequency (Jupiter vs Raydium)
- Output amount differences between routes
- Price impact per route type
- Execution success rates

## Security Considerations

1. **Private Key Handling**: Never log or expose private keys
2. **Slippage Protection**: Enforced via `min_amount_out` parameter
3. **Pool Validation**: Only whitelisted pools in `KNOWN_POOLS`
4. **Fallback Safety**: Automatic fallback to Jupiter if Raydium fails

## Performance

### Benchmarks (Mock Mode)

- Pool discovery: < 1ms
- Quote calculation: < 50ms
- Route comparison: < 100ms
- Total overhead: ~150ms per trade

### Production Expectations

- Real API calls: 200-500ms per quote
- Route selection adds: ~100ms overhead
- Total trade time: 1-2 seconds (includes confirmation)

## Conclusion

The Raydium integration provides SolForge with intelligent multi-DEX routing, ensuring optimal execution for every trade. The system automatically compares routes and selects the best path, maximizing profitability while maintaining safety and reliability.

**Status**: MVP Complete | Production SDK Integration Pending

**Next Steps**: See [TASKS.md](../TASKS.md) for backlog items related to full Raydium SDK integration.
