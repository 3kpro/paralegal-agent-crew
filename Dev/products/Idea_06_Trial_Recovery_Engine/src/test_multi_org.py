import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/events"

def test_multi_org_ingestion():
    # 1. Test Org 1 (3KPRO)
    url = f"{BASE_URL}/segment"
    headers = {"X-API-Key": "trial_revive_key_3kpro"}
    payload = {
        "type": "track",
        "event": "trial_started",
        "userId": "user_3k_1",
        "timestamp": datetime.utcnow().isoformat(),
        "messageId": "msg_3k_1"
    }
    print(f"Testing 3KPRO Org Ingestion...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

    # 2. Test Org 2 (Startup)
    headers = {"X-API-Key": "trial_revive_key_startup"}
    payload = {
        "type": "track",
        "event": "trial_started",
        "userId": "user_startup_1",
        "timestamp": datetime.utcnow().isoformat(),
        "messageId": "msg_startup_1"
    }
    print(f"Testing Startup Org Ingestion...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

    # 3. Test Invalid Key
    headers = {"X-API-Key": "invalid_key"}
    print(f"Testing Invalid API Key...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

if __name__ == "__main__":
    try:
        test_multi_org_ingestion()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
        print("Run 'python -m src.main' in a separate terminal.")
