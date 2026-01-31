import sys
import os
import logging
import sentry_sdk

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.monitoring.logger import setup_monitoring

def test_monitoring():
    print("Initializing monitoring...")
    logger = setup_monitoring()
    
    logger.info("TEST: This is an info message.")
    logger.warning("TEST: This is a warning.")
    
    try:
        1 / 0
    except Exception as e:
        logger.error(f"TEST: Caught expected exception: {e}")
        # sentry_sdk.capture_exception(e) # Uncomment to test actual sending if DSN is set

    if os.path.exists("app.log"):
        print("SUCCESS: Log file created.")
        with open("app.log", "r") as f:
            print(f"Log content preview:\n{f.read()}")
    else:
        print("FAILURE: Log file not found.")

if __name__ == "__main__":
    test_monitoring()
