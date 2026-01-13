from datetime import datetime
from src.models.domain import Classification, AbandonmentCategory
from src.playbooks import PlaybookGenerator

def test_playbook_generation():
    generator = PlaybookGenerator()
    
    # 1. Test for Price Sensitive
    price_class = Classification(
        trial_id="trial_price_123",
        category=AbandonmentCategory.PRICE_SENSITIVE,
        confidence=0.9,
        reasoning="User viewed pricing 4 times."
    )
    pb_price = generator.generate_for_classification(price_class)
    
    print("--- Playbook: Price Sensitive ---")
    print(f"Name: {pb_price.name}")
    print(f"Offer: {pb_price.offer_type}")
    print(f"First Email Subject: {pb_price.email_templates[0]['subject']}\n")

    # 2. Test for Needs More Time
    time_class = Classification(
        trial_id="trial_time_456",
        category=AbandonmentCategory.NEEDS_MORE_TIME,
        confidence=0.8,
        reasoning="High usage then sudden stop at trial end."
    )
    pb_time = generator.generate_for_classification(time_class)
    
    print("--- Playbook: Needs More Time ---")
    print(f"Name: {pb_time.name}")
    print(f"Offer: {pb_time.offer_type}")
    print(f"First Email Subject: {pb_time.email_templates[0]['subject']}\n")

if __name__ == "__main__":
    test_playbook_generation()
