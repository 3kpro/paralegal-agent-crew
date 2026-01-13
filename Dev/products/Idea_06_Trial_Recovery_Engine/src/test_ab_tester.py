from datetime import datetime
from src.models.domain import User, ABTest, ABTestVariant, AbandonmentCategory
from src.ab_tester import ABTester

def test_ab_assignment():
    # Setup test and variants
    v1 = ABTestVariant(id="v1", playbook_id="pb_discount_10", weight=0.5)
    v2 = ABTestVariant(id="v2", playbook_id="pb_extension_7d", weight=0.5)
    
    test = ABTest(
        id="test_recovery_strategy",
        name="10% Discount vs 7-day Extension",
        category=AbandonmentCategory.PRICE_SENSITIVE,
        variants=[v1, v2]
    )
    
    tester = ABTester(tests=[test])
    
    # Test users
    users = [
        User(id="user_1", email="u1@test.com", created_at=datetime.utcnow()),
        User(id="user_2", email="u2@test.com", created_at=datetime.utcnow()),
        User(id="user_3", email="u3@test.com", created_at=datetime.utcnow()),
        User(id="user_4", email="u4@test.com", created_at=datetime.utcnow()),
    ]
    
    print(f"--- Testing A/B Assignment for {test.name} ---")
    results = {"v1": 0, "v2": 0}
    
    for user in users:
        assignment = tester.get_assignment(user, test.id)
        if assignment:
            results[assignment.variant_id] += 1
            print(f"User: {user.id} -> Variant: {assignment.variant_id}")
            
            # Verify deterministic assignment (running again for same user)
            assignment_retry = tester.get_assignment(user, test.id)
            assert assignment.variant_id == assignment_retry.variant_id
    
    print(f"\nSummary: {results}")

if __name__ == "__main__":
    test_ab_assignment()
