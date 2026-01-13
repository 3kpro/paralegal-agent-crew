"""
Test Readiness Scoring System
"""
from decimal import Decimal
from datetime import datetime, timedelta, timezone

from src.core.models import LaneState, Trade, RiskProfile, TradeAction, TradeStatus, LaneStatus
from src.core.readiness import ReadinessScorer


def test_readiness_scorer():
    """Test readiness scoring with synthetic data"""
    print("[TEST] Testing ReadinessScorer...")

    # Create scorer with default config
    scorer = ReadinessScorer()

    # Create a lane state
    lane_state = LaneState(
        id="test_lane_001",
        name="Test Lane",
        profile=RiskProfile.SAFE,
        status=LaneStatus.ACTIVE,
        initial_capital=Decimal("1000.0"),
        current_capital=Decimal("1200.0"),
        total_pnl=Decimal("200.0"),
        total_pnl_pct=20.0,
        total_trades=150,
        win_count=90,
        loss_count=60,
        win_rate=0.60,
        current_position=None,
        created_at=datetime.now(timezone.utc) - timedelta(days=14)
    )

    # Create synthetic trades
    trades = []
    base_time = datetime.now(timezone.utc) - timedelta(days=14)

    for i in range(150):
        # Create trades with realistic PnL distribution
        is_win = i % 3 != 0  # 66% win rate
        pnl = Decimal("5.0") if is_win else Decimal("-2.0")
        pnl_pct = 2.0 if is_win else -1.0

        trade = Trade(
            id=f"trade_{i:03d}",
            lane_id="test_lane_001",
            action=TradeAction.BUY if i % 2 == 0 else TradeAction.SELL,
            input_token="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
            output_token="So11111111111111111111111111111111111111112",  # SOL
            input_amount=Decimal("100.0"),
            output_amount=Decimal("0.1"),
            price_at_entry=Decimal("100.0"),
            price_at_exit=Decimal("100.0") + pnl,
            timestamp=base_time + timedelta(hours=i),
            status=TradeStatus.EXECUTED,
            pnl=pnl,
            pnl_pct=pnl_pct
        )
        trades.append(trade)

    # Calculate readiness
    result = scorer.calculate_readiness(lane_state, trades)

    print(f"[RESULT] Overall Score: {result['overall_score']:.1f}/100")
    print(f"[RESULT] Is Ready: {result['is_ready']}")
    print()

    # Print component breakdown
    print("[COMPONENTS]")
    for key, component in result['components'].items():
        status_icon = "[PASS]" if component['status'] == "✓" else "[FAIL]"
        print(f"  {status_icon} {key.replace('_', ' ').title()}: {component['score']:.1f}/100")
        print(f"     {component['message']}")

    print()

    # Print blockers if any
    if result['blockers']:
        print("[BLOCKERS]")
        for blocker in result['blockers']:
            print(f"  - {blocker}")
    else:
        print("[READY] Lane meets all criteria for live trading!")

    print()

    # Test human-readable summary (skip unicode characters for Windows terminal)
    print("[SUMMARY]")
    print(f"Readiness Score: {result['overall_score']:.1f}/100")
    print(f"Status: {'READY' if result['is_ready'] else 'NOT READY'}")
    if result['is_ready']:
        print("Lane has met all readiness criteria and can graduate to live trading.")
    else:
        print("Blockers:")
        for blocker in result['blockers']:
            print(f"  - {blocker}")

    print()
    print("[PASS] ReadinessScorer tests passed!")


def test_not_ready_lane():
    """Test readiness scoring with insufficient data"""
    print("\n[TEST] Testing not-ready lane...")

    scorer = ReadinessScorer()

    # Create a new lane with minimal trades
    lane_state = LaneState(
        id="new_lane_001",
        name="New Lane",
        profile=RiskProfile.MODERATE,
        status=LaneStatus.ACTIVE,
        initial_capital=Decimal("1000.0"),
        current_capital=Decimal("980.0"),
        total_pnl=Decimal("-20.0"),
        total_pnl_pct=-2.0,
        total_trades=25,
        win_count=12,
        loss_count=13,
        win_rate=0.48,
        current_position=None,
        created_at=datetime.now(timezone.utc) - timedelta(days=2)
    )

    # Create minimal trades
    trades = []
    base_time = datetime.now(timezone.utc) - timedelta(days=2)

    for i in range(25):
        is_win = i % 2 == 0
        pnl = Decimal("3.0") if is_win else Decimal("-4.0")
        pnl_pct = 1.5 if is_win else -2.0

        trade = Trade(
            id=f"trade_new_{i:03d}",
            lane_id="new_lane_001",
            action=TradeAction.BUY if i % 2 == 0 else TradeAction.SELL,
            input_token="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
            output_token="So11111111111111111111111111111111111111112",  # SOL
            input_amount=Decimal("100.0"),
            output_amount=Decimal("0.1"),
            price_at_entry=Decimal("100.0"),
            price_at_exit=Decimal("100.0") + pnl,
            timestamp=base_time + timedelta(hours=i),
            status=TradeStatus.EXECUTED,
            pnl=pnl,
            pnl_pct=pnl_pct
        )
        trades.append(trade)

    result = scorer.calculate_readiness(lane_state, trades)

    print(f"[RESULT] Overall Score: {result['overall_score']:.1f}/100")
    print(f"[RESULT] Is Ready: {result['is_ready']}")

    assert not result['is_ready'], "New lane should not be ready"
    assert len(result['blockers']) > 0, "Should have blockers"

    print(f"[BLOCKERS] {len(result['blockers'])} blockers identified:")
    for blocker in result['blockers']:
        print(f"  - {blocker}")

    print("[PASS] Not-ready lane correctly identified!")


if __name__ == "__main__":
    print("=" * 60)
    print("SolForge Readiness Scoring Tests")
    print("=" * 60 + "\n")

    test_readiness_scorer()
    test_not_ready_lane()

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)
