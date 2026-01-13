import requests
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"

def test_trial_extension():
    # 1. Generate an extension link
    print("--- Step 1: Generating Extension Link ---")
    trial_id = "trial_ext_777"
    url = f"{BASE_URL}/trials/{trial_id}/extension-link?days=14"
    headers = {"X-API-Key": "trial_revive_key_3kpro"}
    
    response = requests.post(url, headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")
    
    token = data.get("token")
    
    # 2. Consume the extension link
    print(f"\n--- Step 2: Consuming Extension Token ({token}) ---")
    consume_url = f"{BASE_URL}/recover/extension/{token}"
    
    response = requests.get(consume_url)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    # 3. Test invalid token
    print("\n--- Step 3: Testing Invalid Token ---")
    bad_url = f"{BASE_URL}/recover/extension/invalidtoken"
    response = requests.get(bad_url)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    try:
        test_trial_extension()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
