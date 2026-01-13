import requests
import json
from datetime import datetime

def test_ingestion():
    url = "http://127.0.0.1:8000/api/events/ingest"
    
    payload = {
        "type": "track",
        "event": "onboarding_completed",
        "userId": "user_trial_99",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "messageId": "msg_abc_123",
        "properties": {
            "plan": "starter",
            "source": "direct"
        }
    }
    
    print(f"Sending test payload to {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
        print("\nNote: Make sure the FastAPI server is running (python -m src.main)")

if __name__ == "__main__":
    test_ingestion()
