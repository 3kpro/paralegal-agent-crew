import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/events"

def test_conversion_tracking():
    # Test Org 1 (3KPRO)
    url = f"{BASE_URL}/conversion"
    headers = {"X-API-Key": "trial_revive_key_3kpro"}
    payload = {
        "user_id": "user_3k_1",
        "trial_id": "trial_3k_1",
        "value": 299.0,
        "playbook_id": "pb_recovery_discount_20"
    }
    
    print(f"Testing Conversion Tracking (3KPRO)...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

    # Test ROI with no playbook ID (Organic or legacy recovery)
    payload_organic = {
        "user_id": "user_startup_1",
        "trial_id": "trial_startup_1",
        "value": 49.0
    }
    headers_startup = {"X-API-Key": "trial_revive_key_startup"}
    print(f"Testing Organic Conversion (Startup)...")
    response = requests.post(url, json=payload_organic, headers=headers_startup)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

if __name__ == "__main__":
    try:
        test_conversion_tracking()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
