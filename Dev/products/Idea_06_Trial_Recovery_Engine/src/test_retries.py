import unittest
from datetime import datetime
from src.utils.retries import retry_with_backoff

class TestRetries(unittest.TestCase):
    def test_sync_retry_success(self):
        self.attempts = 0
        
        @retry_with_backoff(retries=3, backoff_in_seconds=0.1)
        def unstable_function():
            self.attempts += 1
            if self.attempts < 3:
                raise ValueError("Temporary Failure")
            return "Success"
        
        result = unstable_function()
        self.assertEqual(result, "Success")
        self.assertEqual(self.attempts, 3)

    def test_sync_retry_failure(self):
        self.attempts = 0
        
        @retry_with_backoff(retries=2, backoff_in_seconds=0.1)
        def failing_function():
            self.attempts += 1
            raise ValueError("Persistent Failure")
        
        with self.assertRaises(ValueError):
            failing_function()
        
        # 1 initial + 2 retries = 3 attempts
        self.assertEqual(self.attempts, 3)

if __name__ == "__main__":
    unittest.main()
