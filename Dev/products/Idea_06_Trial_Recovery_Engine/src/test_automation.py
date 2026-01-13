import requests
from datetime import datetime
from src.models.domain import User, Classification, AbandonmentCategory, WebhookConfig
from src.integrations.webhook import WebhookClient

BASE_URL = "http://127.0.0.1:8000/api/integrations/automation"

def test_automation_integration():
    # 1. Register a webhook (Simulating Zapier/n8n setup)
    print("--- Step 1: Registering Automation Webhook ---")
    reg_url = f"{BASE_URL}/webhooks"
    headers = {"X-API-Key": "trial_revive_key_3kpro"}
    reg_payload = {
        "target_url": "https://hooks.zapier.com/12345/abcde"
    }
    
    response = requests.post(reg_url, json=reg_payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

    # 2. Simulate outbound notification
    print("--- Step 2: Simulating Outbound Webhook Trigger ---")
    mock_webhook_url = "https://hooks.n8n.io/g/9999/TrialReviveAlert"
    client = WebhookClient(webhook_url=mock_webhook_url)
    
    user = User(
        id="user_zap_1",
        org_id="org_3kpro",
        email="automation_fan@workflow.co",
        name="Automation Expert",
        created_at=datetime.utcnow()
    )
    
    classification = Classification(
        trial_id="trial_zap_1",
        org_id="org_3kpro",
        category=AbandonmentCategory.COMPETITOR_EVAL,
        confidence=0.87,
        reasoning="Usage matches competitor evaluation patterns."
    )
    
    result = client.send_recovery_alert(user, classification)
    print(f"Result: {result}")

if __name__ == "__main__":
    try:
        test_automation_integration()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
