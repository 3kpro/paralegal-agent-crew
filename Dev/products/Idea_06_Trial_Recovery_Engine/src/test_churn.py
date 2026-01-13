import requests
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"

def test_churn_scoring():
    print("--- Testing Churn Scoring ---")
    trial_id = "trial_churn_999"
    url = f"{BASE_URL}/trials/{trial_id}/churn-score"
    headers = {"X-API-Key": "trial_revive_key_3kpro"}
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")
    
    score = data.get("score")
    signals = data.get("signals")
    
    print(f"\nPredicted Risk: {score*100}%")
    print("Market Signals:")
    for signal in signals:
        print(f" - {signal}")

if __name__ == "__main__":
    try:
        test_churn_scoring()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
