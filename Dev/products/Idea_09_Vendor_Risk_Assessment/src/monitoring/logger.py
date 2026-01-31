import os
import logging
import sentry_sdk
from typing import Optional

def setup_monitoring(dsn: Optional[str] = None):
    """
    Initializes logging and Sentry (if DSN provided).
    """
    # 1. Standard Logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("app.log")
        ]
    )
    logger = logging.getLogger("vendorscope")
    
    # 2. Sentry
    sentry_dsn = dsn or os.getenv("SENTRY_DSN")
    if sentry_dsn:
        logger.info("Initializing Sentry SDK...")
        sentry_sdk.init(
            dsn=sentry_dsn,
            # Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring.
            traces_sample_rate=1.0,
            # Set profiles_sample_rate to 1.0 to profile 100% of sampled transactions.
            profiles_sample_rate=1.0,
        )
    else:
        logger.warning("No SENTRY_DSN found. Monitoring running in local-only mode.")

    return logger

# Singleton logger
logger = logging.getLogger("vendorscope")
