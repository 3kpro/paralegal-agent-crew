import requests
import json

URL = "http://127.0.0.1:8000/api/integrations/slack/interactivity"

def test_slack_interactivity():
    # Mocking the payload Slack sends on button click
    slack_payload = {
        "type": "block_actions",
        "user": {
            "id": "U123456",
            "username": "growth_hacker_alex"
        },
        "actions": [
            {
                "action_id": "trigger_recovery_playbook",
                "value": "trigger_playbook:trial_abc_123:user_999",
                "type": "button",
                "action_ts": "1625645000.000000"
            }
        ]
    }

    print("--- Testing Slack Interactivity Handle ---")
    
    # Slack sends payload as a form field named 'payload'
    response = requests.post(URL, data={"payload": json.dumps(slack_payload)})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    try:
        test_slack_interactivity()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure the server is running on localhost:8000")
