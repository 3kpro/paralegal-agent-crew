import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_cohorts():
    print("--- Testing Cohort Analysis ---")
    url = f"{BASE_URL}/analytics/cohorts"
    headers = {"X-API-Key": "trial_revive_key_3kpro"}
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Cohort Data ({len(data['cohorts'])} periods):")
        print(json.dumps(data["cohorts"], indent=2, default=str))
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    try:
        test_cohorts()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
