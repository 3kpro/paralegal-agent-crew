import hashlib
from typing import List, Optional
from .models.domain import ABTest, ABAssignment, User

class ABTester:
    def __init__(self, tests: List[ABTest] = None):
        self.tests = tests or []

    def get_assignment(self, user: User, test_id: str) -> Optional[ABAssignment]:
        """
        Assigns a user to a variant in an A/B test using deterministic hashing.
        """
        test = next((t for t in self.tests if t.id == test_id and t.is_active), None)
        if not test:
            return None

        # Use hashing for deterministic assignment across sessions
        hash_val = self._hash_user_for_test(user.id, test.id)
        
        cumulative_weight = 0.0
        total_weight = sum(v.weight for v in test.variants)
        
        normalized_hash = hash_val / 100.0  # hash_val is 0-99
        
        for variant in test.variants:
            cumulative_weight += (variant.weight / total_weight)
            if normalized_hash < cumulative_weight:
                return ABAssignment(
                    user_id=user.id,
                    test_id=test.id,
                    variant_id=variant.id
                )
        
        return None

    def _hash_user_for_test(self, user_id: str, test_id: str) -> int:
        """
        Generates a deterministic integer between 0 and 99 for a user and test.
        """
        combined = f"{user_id}:{test_id}"
        hash_digest = hashlib.md5(combined.encode()).hexdigest()
        return int(hash_digest, 16) % 100
