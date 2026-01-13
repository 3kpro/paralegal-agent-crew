import json
from datetime import datetime, timedelta
from src.models.domain import Trial, Event, TrialStatus, AbandonmentCategory
from src.engine import ClassificationEngine

def run_test_classification():
    engine = ClassificationEngine()
    
    # Mock data for a "Confused" user
    confused_trial = Trial(
        id="t1",
        user_id="u1",
        product_id="revive-saas",
        start_date=datetime.utcnow() - timedelta(days=14),
        end_date=datetime.utcnow(),
        status=TrialStatus.ABANDONED
    )
    
    confused_events = [
        Event(id="e1", user_id="u1", event_name="signup", timestamp=datetime.utcnow() - timedelta(days=14)),
        Event(id="e2", user_id="u1", event_name="onboarding_started", timestamp=datetime.utcnow() - timedelta(days=14)),
        Event(id="e3", user_id="u1", event_name="viewed_dashboard", timestamp=datetime.utcnow() - timedelta(days=14)),
    ]
    
    # Mock data for a "Price Sensitive" user
    price_trial = Trial(
        id="t2",
        user_id="u2",
        product_id="revive-saas",
        start_date=datetime.utcnow() - timedelta(days=14),
        end_date=datetime.utcnow(),
        status=TrialStatus.ABANDONED
    )
    
    price_events = [
        Event(id="e4", user_id="u2", event_name="signup", timestamp=datetime.utcnow() - timedelta(days=14)),
        Event(id="e5", user_id="u2", event_name="onboarding_completed", timestamp=datetime.utcnow() - timedelta(days=13)),
        Event(id="e6", user_id="u2", event_name="pricing_viewed", timestamp=datetime.utcnow() - timedelta(days=5)),
        Event(id="e7", user_id="u2", event_name="pricing_viewed", timestamp=datetime.utcnow() - timedelta(days=2)),
        Event(id="e8", user_id="u2", event_name="pricing_viewed", timestamp=datetime.utcnow() - timedelta(days=1)),
    ]

    print("--- Testing Classification: Confused User ---")
    res1 = engine.analyze_behavior(confused_trial, confused_events)
    print(f"Result: {res1.category}")
    print(f"Reason: {res1.reasoning}\n")

    print("--- Testing Classification: Price Sensitive User ---")
    res2 = engine.analyze_behavior(price_trial, price_events)
    print(f"Result: {res2.category}")
    print(f"Reason: {res2.reasoning}\n")

if __name__ == "__main__":
    run_test_classification()
