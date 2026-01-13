from datetime import datetime
from src.models.domain import User, Classification, AbandonmentCategory, Playbook
from src.integrations.customerio import CustomerIOClient

def test_customerio_export():
    client = CustomerIOClient()
    
    # Mock data
    user = User(
        id="u_999",
        email="target@example.com",
        created_at=datetime.utcnow(),
        metadata={"last_active_at": "2026-01-10T15:00:00Z"}
    )
    
    classification = Classification(
        trial_id="t_123",
        category=AbandonmentCategory.PRICE_SENSITIVE,
        confidence=0.92,
        reasoning="User viewed pricing page 4 times in 2 days."
    )
    
    playbook = Playbook(
        id="pb_456",
        name="Price Recovery Offer",
        target_category=AbandonmentCategory.PRICE_SENSITIVE,
        email_templates=[{"subject": "Special Discount", "body": "..."}],
        offer_type="20% Discount",
        timing_days=[1, 3]
    )

    print("--- Testing Customer.io Export ---")
    
    # 1. Identify
    id_res = client.identify_user(user, classification)
    print(f"Identify Result: {id_res}")
    
    # 2. Trigger Event
    ev_res = client.trigger_playbook(user.id, playbook)
    print(f"Event Result: {ev_res}")

if __name__ == "__main__":
    test_customerio_export()
