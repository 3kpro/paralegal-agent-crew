"""
SolForge Readiness Scoring System
Calculates when a trading lane is ready to graduate from paper trading to live trading.
"""
import logging
from decimal import Decimal
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
import numpy as np

from .models import LaneState, Trade, TradeAction, TradeStatus

logger = logging.getLogger(__name__)


class ReadinessScorer:
    """
    Calculates a readiness score (0-100) for a trading lane based on:
    - Trade volume (min trades executed)
    - Win rate (profitability)
    - Risk-adjusted returns (Sharpe ratio)
    - Drawdown control (max capital loss)
    - Consistency (consecutive profitable periods)
    - AI confidence convergence
    """

    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}

        # Minimum thresholds for readiness
        self.min_trades = self.config.get("min_trades", 100)
        self.min_win_rate = self.config.get("min_win_rate", 0.55)  # 55%
        self.min_sharpe_ratio = self.config.get("min_sharpe_ratio", 1.0)
        self.max_drawdown_pct = self.config.get("max_drawdown_pct", 0.15)  # 15%
        self.min_consecutive_profitable_days = self.config.get("min_consecutive_profitable_days", 5)
        self.min_runtime_days = self.config.get("min_runtime_days", 7)

        # Weights for each component (must sum to 100)
        self.weights = self.config.get("weights", {
            "trade_volume": 15,
            "win_rate": 25,
            "sharpe_ratio": 20,
            "drawdown": 15,
            "consistency": 15,
            "runtime": 10
        })

    def calculate_readiness(
        self,
        lane_state: LaneState,
        trades: List[Trade]
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive readiness score for a lane.

        Returns:
            Dict with overall score and component breakdowns
        """
        # Filter to executed trades only
        executed_trades = [t for t in trades if t.status == TradeStatus.EXECUTED]

        if not executed_trades:
            return self._empty_score("No executed trades")

        # Calculate individual components
        components = {
            "trade_volume": self._score_trade_volume(len(executed_trades)),
            "win_rate": self._score_win_rate(lane_state.win_count, lane_state.total_trades),
            "sharpe_ratio": self._score_sharpe_ratio(executed_trades),
            "drawdown": self._score_drawdown(lane_state, executed_trades),
            "consistency": self._score_consistency(executed_trades),
            "runtime": self._score_runtime(lane_state.created_at)
        }

        # Calculate weighted total
        total_score = sum(
            components[key]["score"] * self.weights[key] / 100
            for key in self.weights.keys()
        )

        # Determine if ready
        is_ready = all([
            total_score >= 80,
            len(executed_trades) >= self.min_trades,
            lane_state.win_rate >= self.min_win_rate,
            components["drawdown"]["current_drawdown"] <= self.max_drawdown_pct
        ])

        return {
            "overall_score": round(total_score, 2),
            "is_ready": is_ready,
            "components": components,
            "thresholds": {
                "min_trades": self.min_trades,
                "min_win_rate": self.min_win_rate,
                "min_sharpe_ratio": self.min_sharpe_ratio,
                "max_drawdown_pct": self.max_drawdown_pct,
                "min_runtime_days": self.min_runtime_days
            },
            "blockers": self._identify_blockers(components, lane_state, executed_trades)
        }

    def _score_trade_volume(self, num_trades: int) -> Dict[str, Any]:
        """Score based on number of trades executed"""
        # Linear interpolation: 0 trades = 0%, min_trades = 100%
        score = min(100, (num_trades / self.min_trades) * 100)

        return {
            "score": score,
            "value": num_trades,
            "target": self.min_trades,
            "status": "✓" if num_trades >= self.min_trades else "✗",
            "message": f"{num_trades}/{self.min_trades} trades"
        }

    def _score_win_rate(self, wins: int, total: int) -> Dict[str, Any]:
        """Score based on win rate"""
        if total == 0:
            return {"score": 0, "value": 0.0, "target": self.min_win_rate, "status": "✗", "message": "No trades"}

        win_rate = wins / total

        # Linear interpolation: min_win_rate = 100%, below = proportional
        if win_rate >= self.min_win_rate:
            score = 100
        else:
            score = (win_rate / self.min_win_rate) * 100

        return {
            "score": score,
            "value": win_rate,
            "target": self.min_win_rate,
            "status": "✓" if win_rate >= self.min_win_rate else "✗",
            "message": f"{win_rate:.1%} win rate"
        }

    def _score_sharpe_ratio(self, trades: List[Trade]) -> Dict[str, Any]:
        """Score based on risk-adjusted returns (Sharpe ratio)"""
        # Calculate returns per trade
        returns = []
        for trade in trades:
            if trade.pnl_pct is not None:
                returns.append(trade.pnl_pct)

        if len(returns) < 10:
            return {
                "score": 0,
                "value": 0.0,
                "target": self.min_sharpe_ratio,
                "status": "✗",
                "message": "Need 10+ trades"
            }

        returns_array = np.array(returns)
        mean_return = np.mean(returns_array)
        std_return = np.std(returns_array)

        if std_return == 0:
            sharpe = 0.0
        else:
            # Annualized Sharpe (assume 365 trading days)
            sharpe = (mean_return / std_return) * np.sqrt(365)

        # Score: min_sharpe = 100%, below = proportional, above = capped at 100
        if sharpe >= self.min_sharpe_ratio:
            score = 100
        else:
            score = (sharpe / self.min_sharpe_ratio) * 100

        return {
            "score": max(0, score),
            "value": float(sharpe),
            "target": self.min_sharpe_ratio,
            "status": "✓" if sharpe >= self.min_sharpe_ratio else "✗",
            "message": f"Sharpe: {sharpe:.2f}"
        }

    def _score_drawdown(self, lane_state: LaneState, trades: List[Trade]) -> Dict[str, Any]:
        """Score based on maximum drawdown"""
        # Calculate peak and current drawdown
        peak_capital = lane_state.initial_capital
        current_drawdown = 0.0
        max_drawdown = 0.0

        running_capital = float(lane_state.initial_capital)

        for trade in sorted(trades, key=lambda t: t.timestamp):
            if trade.pnl:
                running_capital += float(trade.pnl)
                peak_capital = max(peak_capital, Decimal(str(running_capital)))

                # Calculate drawdown from peak
                drawdown = float((peak_capital - Decimal(str(running_capital))) / peak_capital)
                max_drawdown = max(max_drawdown, drawdown)
                current_drawdown = drawdown

        # Score: lower drawdown = higher score
        # max_drawdown_pct = 100%, 0% = 100 points
        if max_drawdown <= self.max_drawdown_pct:
            score = 100
        else:
            # Penalty for exceeding max
            score = max(0, 100 - ((max_drawdown - self.max_drawdown_pct) * 500))

        return {
            "score": score,
            "value": max_drawdown,
            "target": self.max_drawdown_pct,
            "current_drawdown": current_drawdown,
            "status": "✓" if max_drawdown <= self.max_drawdown_pct else "✗",
            "message": f"Max DD: {max_drawdown:.1%}"
        }

    def _score_consistency(self, trades: List[Trade]) -> Dict[str, Any]:
        """Score based on consecutive profitable days"""
        if len(trades) < 5:
            return {
                "score": 0,
                "value": 0,
                "target": self.min_consecutive_profitable_days,
                "status": "✗",
                "message": "Need more trades"
            }

        # Group trades by day
        daily_pnl = {}
        for trade in trades:
            day = trade.timestamp.date()
            if day not in daily_pnl:
                daily_pnl[day] = Decimal("0")
            if trade.pnl:
                daily_pnl[day] += trade.pnl

        # Find longest streak of profitable days
        max_streak = 0
        current_streak = 0

        for day in sorted(daily_pnl.keys()):
            if daily_pnl[day] > 0:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0

        # Score based on streak
        if max_streak >= self.min_consecutive_profitable_days:
            score = 100
        else:
            score = (max_streak / self.min_consecutive_profitable_days) * 100

        return {
            "score": score,
            "value": max_streak,
            "target": self.min_consecutive_profitable_days,
            "status": "✓" if max_streak >= self.min_consecutive_profitable_days else "✗",
            "message": f"{max_streak} day streak"
        }

    def _score_runtime(self, created_at: datetime) -> Dict[str, Any]:
        """Score based on how long the lane has been running"""
        runtime = (datetime.now(timezone.utc) - created_at).days

        # Score: linear up to min_runtime_days
        if runtime >= self.min_runtime_days:
            score = 100
        else:
            score = (runtime / self.min_runtime_days) * 100

        return {
            "score": score,
            "value": runtime,
            "target": self.min_runtime_days,
            "status": "✓" if runtime >= self.min_runtime_days else "✗",
            "message": f"{runtime} days running"
        }

    def _identify_blockers(
        self,
        components: Dict[str, Any],
        lane_state: LaneState,
        trades: List[Trade]
    ) -> List[str]:
        """Identify what's blocking the lane from being ready"""
        blockers = []

        if len(trades) < self.min_trades:
            blockers.append(f"Need {self.min_trades - len(trades)} more trades")

        if lane_state.win_rate < self.min_win_rate:
            diff = (self.min_win_rate - lane_state.win_rate) * 100
            blockers.append(f"Win rate {diff:.1f}% below target")

        if components["sharpe_ratio"]["value"] < self.min_sharpe_ratio:
            blockers.append("Sharpe ratio too low (poor risk-adjusted returns)")

        if components["drawdown"]["value"] > self.max_drawdown_pct:
            blockers.append("Drawdown exceeded limit")

        if components["consistency"]["value"] < self.min_consecutive_profitable_days:
            needed = self.min_consecutive_profitable_days - components["consistency"]["value"]
            blockers.append(f"Need {needed} more consecutive profitable days")

        runtime_days = components["runtime"]["value"]
        if runtime_days < self.min_runtime_days:
            blockers.append(f"Need {self.min_runtime_days - runtime_days} more days of data")

        return blockers

    def _empty_score(self, reason: str) -> Dict[str, Any]:
        """Return an empty score structure"""
        return {
            "overall_score": 0.0,
            "is_ready": False,
            "components": {},
            "thresholds": {},
            "blockers": [reason]
        }

    def get_readiness_summary(
        self,
        lane_state: LaneState,
        trades: List[Trade]
    ) -> str:
        """Get a human-readable readiness summary"""
        score_data = self.calculate_readiness(lane_state, trades)

        summary = f"Readiness Score: {score_data['overall_score']:.1f}/100\n"
        summary += f"Status: {'✓ READY' if score_data['is_ready'] else '✗ NOT READY'}\n\n"

        if score_data['is_ready']:
            summary += "Lane has met all readiness criteria and can graduate to live trading."
        else:
            summary += "Blockers:\n"
            for blocker in score_data['blockers']:
                summary += f"  - {blocker}\n"

        return summary
