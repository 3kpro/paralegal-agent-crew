import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/events"

def test_mixpanel():
    url = f"{BASE_URL}/mixpanel"
    payload = {
        "event": "pricing_viewed",
        "properties": {
            "distinct_id": "user_mix_456",
            "page_url": "/pricing",
            "source": "header_nav"
        }
    }
    print(f"Testing Mixpanel Ingestion: {url}")
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_amplitude():
    url = f"{BASE_URL}/amplitude"
    payload = {
        "events": [
            {
                "user_id": "user_amp_789",
                "event_type": "onboarding_step_reached",
                "time": int(time.time() * 1000),
                "event_properties": {
                    "step": 2,
                    "completed": True
                }
            },
            {
                "user_id": "user_amp_789",
                "event_type": "feature_used",
                "time": int(time.time() * 1000) + 1000,
                "event_properties": {
                    "feature_name": "dashboard_export"
                }
            }
        ]
    }
    print(f"Testing Amplitude Ingestion: {url}")
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

if __name__ == "__main__":
    # Note: These tests assume the server is running on localhost:8000
    try:
        test_mixpanel()
        test_amplitude()
    except Exception as e:
        print(f"Error connecting to server: {e}")
        print("Run 'python -m src.main' in another terminal first.")
