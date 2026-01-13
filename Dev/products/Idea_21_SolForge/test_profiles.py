
from src.core.risk_profiles import get_profile_config, RiskProfile, RiskProfileConfig
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_risk_profiles():
    logger.info("Testing Risk Profiles...")
    
    # Test Safe Profile
    safe = get_profile_config(RiskProfile.SAFE)
    logger.info(f"Safe Profile: Max Pos {safe.max_position_pct}, Stop Loss {safe.stop_loss_pct}")
    assert safe.profile == RiskProfile.SAFE
    assert safe.max_position_pct == 0.10
    
    # Test Moderate Profile
    mod = get_profile_config(RiskProfile.MODERATE)
    logger.info(f"Moderate Profile: Max Pos {mod.max_position_pct}, Stop Loss {mod.stop_loss_pct}")
    assert mod.profile == RiskProfile.MODERATE
    assert mod.max_position_pct == 0.25
    
    # Test YOLO Profile
    yolo = get_profile_config(RiskProfile.YOLO)
    logger.info(f"YOLO Profile: Max Pos {yolo.max_position_pct}, Stop Loss {yolo.stop_loss_pct}")
    assert yolo.profile == RiskProfile.YOLO
    assert yolo.max_position_pct == 0.50
    
    # Test to_dict for Guardrails compatibility
    safe_dict = safe.to_dict()
    assert "max_position_pct" in safe_dict
    assert safe_dict["max_position_pct"] == 0.10
    
    logger.info("Risk Profile tests passed!")

if __name__ == "__main__":
    test_risk_profiles()
