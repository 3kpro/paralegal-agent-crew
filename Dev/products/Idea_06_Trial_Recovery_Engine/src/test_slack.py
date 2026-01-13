from datetime import datetime
from src.models.domain import User, Classification, AbandonmentCategory
from src.integrations.slack import SlackClient

def test_slack_alert():
    client = SlackClient()
    
    # Mock data
    user = User(
        id="u_555",
        email="potential_lead@bigcorp.com",
        created_at=datetime.utcnow(),
        metadata={"last_active_at": "30 mins ago"}
    )
    
    classification = Classification(
        trial_id="t_789",
        category=AbandonmentCategory.CONFUSED,
        confidence=0.85,
        reasoning="Failed to configure SMTP settings after 3 attempts. Visited 'Integration Troubleshooting' 5 times."
    )

    print("--- Testing Slack Alert ---")
    res = client.notify_classification(user, classification)
    print(f"Result: {res}")

if __name__ == "__main__":
    test_slack_alert()
