"""
SolForge Risk Profiles
Defines risk configuration for different trading modes.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from decimal import Decimal

from .models import RiskProfile

class RiskProfileConfig(BaseModel):
    """Configuration for a risk profile"""
    profile: RiskProfile
    max_position_pct: float
    stop_loss_pct: float
    take_profit_pct: float
    max_trades_per_day: int
    min_liquidity_usd: float
    allowed_tokens: List[str]  # List of mints or 'ALL'
    learning_rate: float
    description: str

    class Config:
        json_encoders = {Decimal: str}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for guardrails compatibility"""
        return self.model_dump()


# Token Constants
SOL_MINT = "So11111111111111111111111111111111111111112"
USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
RAY_MINT = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"
JUP_MINT = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"


# 1. Safe Mode Configuration 🛡️
SAFE_PROFILE = RiskProfileConfig(
    profile=RiskProfile.SAFE,
    max_position_pct=0.10,      # 10% max position
    stop_loss_pct=0.03,         # 3% stop loss
    take_profit_pct=0.06,       # 6% take profit (2:1 reward/risk)
    max_trades_per_day=2,       # 1-2 trades max
    min_liquidity_usd=50000.0,  # High liquidity only
    allowed_tokens=[
        SOL_MINT,
        USDC_MINT,
        USDT_MINT,
        RAY_MINT, 
        JUP_MINT
    ],
    learning_rate=0.01,         # Conservative learning
    description="Low risk, established tokens only, capital preservation focus."
)

# 2. Moderate Mode Configuration ⚖️
MODERATE_PROFILE = RiskProfileConfig(
    profile=RiskProfile.MODERATE,
    max_position_pct=0.25,      # 25% max position
    stop_loss_pct=0.07,         # 7% stop loss
    take_profit_pct=0.15,       # 15% take profit
    max_trades_per_day=5,       # 3-5 trades
    min_liquidity_usd=10000.0,  # Moderate liquidity
    allowed_tokens=["TOP_50"],  # Special flag for top 50
    learning_rate=0.05,         # Balanced learning
    description="Balanced risk, top 50 volume tokens, steady growth focus."
)

# 3. YOLO Mode Configuration 🚀
YOLO_PROFILE = RiskProfileConfig(
    profile=RiskProfile.YOLO,
    max_position_pct=0.50,      # 50% max position
    stop_loss_pct=0.15,         # 15% stop loss
    take_profit_pct=0.40,       # 40% take profit
    max_trades_per_day=100,     # Unlimited (effectively)
    min_liquidity_usd=1000.0,   # Low liquidity threshold
    allowed_tokens=["ALL"],     # Any token
    learning_rate=0.10,         # Aggressive learning
    description="High risk, memecoins allowed, moonshot focus."
)


def get_profile_config(profile: RiskProfile) -> RiskProfileConfig:
    """
    Get configuration for a specific risk profile.
    
    Args:
        profile: RiskProfile enum value
        
    Returns:
        RiskProfileConfig object
    """
    if profile == RiskProfile.SAFE:
        return SAFE_PROFILE
    elif profile == RiskProfile.MODERATE:
        return MODERATE_PROFILE
    elif profile == RiskProfile.YOLO:
        return YOLO_PROFILE
    else:
        # Fallback to safe
        return SAFE_PROFILE

def get_all_profiles() -> Dict[str, RiskProfileConfig]:
    """Get all profile configurations"""
    return {
        RiskProfile.SAFE.value: SAFE_PROFILE,
        RiskProfile.MODERATE.value: MODERATE_PROFILE,
        RiskProfile.YOLO.value: YOLO_PROFILE
    }
