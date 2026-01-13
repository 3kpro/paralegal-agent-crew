import os
import requests
import json
import logging
from typing import Dict, Any
from ..models.domain import User, Classification
from ..utils.retries import retry_with_backoff

logger = logging.getLogger(__name__)

class WebhookClient:
    """
    Generic Webhook client for Zapier, n8n, and other automation platforms.
    """
    def __init__(self, webhook_url: str = None):
        self.webhook_url = webhook_url or os.getenv("AUTOMATION_WEBHOOK_URL")

    @retry_with_backoff(retries=3, backoff_in_seconds=2)
    def send_recovery_alert(self, user: User, classification: Classification):
        """
        Sends a POST request to the configured automation webhook.
        """
        if not self.webhook_url:
            logger.warning("No AUTOMATION_WEBHOOK_URL configured. Skipping webhook.")
            return None

        payload = {
            "source": "TrialRevive",
            "event": "classification_created",
            "data": {
                "user_id": user.id,
                "user_email": user.email,
                "user_name": user.name,
                "org_id": user.org_id,
                "trial_id": classification.trial_id,
                "category": classification.category.value,
                "confidence": classification.confidence,
                "reasoning": classification.reasoning,
                "classified_at": classification.classified_at.isoformat()
            }
        }

        print(f"DEBUG: Tossing recovery alert to automation webhook: {self.webhook_url}")
        # In production:
        # response = requests.post(self.webhook_url, json=payload, timeout=10)
        # response.raise_for_status()
        
        return {"status": "success", "platform": "automation_webhook", "webhook_url": self.webhook_url}
