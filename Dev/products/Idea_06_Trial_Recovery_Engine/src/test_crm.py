import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_crm_integration():
    print("--- Testing CRM Sync (HubSpot) ---")
    
    # 1. Configure CRM
    config_url = f"{BASE_URL}/integrations/crm/configure"
    headers = {"X-API-Key": "trial_revive_key_3kpro"}
    config_payload = {
        "provider": "hubspot",
        "api_key": "pat-na1-...",
        "sync_fields": {"churn_risk_score": "custom_score_property"}
    }
    
    response = requests.post(config_url, json=config_payload, headers=headers)
    print(f"Configure Status: {response.status_code}")
    print(f"Configure Response: {response.json()}")

    # 2. Trigger Sync
    print("\n--- Testing CRM Contact Sync ---")
    sync_url = f"{BASE_URL}/integrations/crm/sync-test"
    sync_payload = {
        "provider": "hubspot",
        "email": "lead@bigcorp.com",
        "user_id": "u_999"
    }
    
    response = requests.post(sync_url, json=sync_payload, headers=headers)
    print(f"Sync Status: {response.status_code}")
    print(f"Sync Response: {json.dumps(response.json(), indent=2)}")

    # 3. Test Salesforce
    print("\n--- Testing CRM Sync (Salesforce) ---")
    sync_payload["provider"] = "salesforce"
    response = requests.post(sync_url, json=sync_payload, headers=headers)
    print(f"Sync Status: {response.status_code}")
    print(f"Sync Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    try:
        test_crm_integration()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
