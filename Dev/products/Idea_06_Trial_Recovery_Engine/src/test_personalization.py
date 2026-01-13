from datetime import datetime
from src.models.domain import User, Classification, AbandonmentCategory, Event
from src.playbooks import PlaybookGenerator

def test_ai_personalization():
    generator = PlaybookGenerator(use_ai=True)
    
    # 1. Setup Mock User and Events
    user = User(
        id="user_ai_123",
        email="alex@startup.io",
        name="Alex",
        created_at=datetime.utcnow()
    )
    
    events = [
        Event(id="e1", user_id="user_ai_123", event_name="pricing_viewed", timestamp=datetime.utcnow()),
        Event(id="e2", user_id="user_ai_123", event_name="pricing_viewed", timestamp=datetime.utcnow()),
        Event(id="e3", user_id="user_ai_123", event_name="pricing_viewed", timestamp=datetime.utcnow()),
    ]
    
    classification = Classification(
        trial_id="trial_ai_123",
        category=AbandonmentCategory.PRICE_SENSITIVE,
        confidence=0.95,
        reasoning="Exhibited high interest in pricing but didn't convert."
    )
    
    print("--- Testing AI Personalization: Price Sensitive ---")
    pb = generator.generate_for_classification(classification, user, events)
    
    print(f"Playbook: {pb.name}")
    print(f"Original or AI Subject: {pb.email_templates[0]['subject']}")
    print(f"Original or AI Body Content: {pb.email_templates[0]['body'][:100]}...\n")

    # 2. Setup Confused User
    user_confused = User(
        id="user_confused",
        email="dev@ghost.sh",
        name="Dev",
        created_at=datetime.utcnow()
    )
    
    events_confused = [
        Event(id="c1", user_id="user_confused", event_name="onboarding_started", timestamp=datetime.utcnow()),
        Event(id="c2", user_id="user_confused", event_name="onboarding_step_1", timestamp=datetime.utcnow()),
    ]
    
    class_confused = Classification(
        trial_id="trial_confused",
        category=AbandonmentCategory.CONFUSED,
        confidence=0.82,
        reasoning="Failed to complete onboarding steps."
    )
    
    print("--- Testing AI Personalization: Confused ---")
    pb_confused = generator.generate_for_classification(class_confused, user_confused, events_confused)
    
    print(f"Playbook: {pb_confused.name}")
    print(f"Original or AI Subject: {pb_confused.email_templates[0]['subject']}")
    print(f"Original or AI Body Content: {pb_confused.email_templates[0]['body'][:100]}...\n")

if __name__ == "__main__":
    test_ai_personalization()
