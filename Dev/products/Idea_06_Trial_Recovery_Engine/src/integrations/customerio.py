import os
import requests
import json
from typing import Dict, Any, Optional
from ..models.domain import User, Classification, Playbook
from ..utils.retries import retry_with_backoff

class CustomerIOClient:
    def __init__(self, site_id: str = None, api_key: str = None):
        self.site_id = site_id or os.getenv("CUSTOMERIO_SITE_ID", "mock_site_id")
        self.api_key = api_key or os.getenv("CUSTOMERIO_API_KEY", "mock_api_key")
        self.base_url = "https://track.customer.io/api/v1"

    @retry_with_backoff(retries=3, backoff_in_seconds=2)
    def identify_user(self, user: User, classification: Classification):
        """
        Updates user attributes in Customer.io with abandonment classification.
        """
        url = f"{self.base_url}/customers/{user.id}"
        payload = {
            "email": user.email,
            "abandonment_category": classification.category,
            "classification_confidence": classification.confidence,
            "recovery_reasoning": classification.reasoning,
            "last_active": user.metadata.get("last_active_at", ""),
            "trial_revive_status": "active_recovery"
        }
        
        print(f"DEBUG: Identifying user {user.id} in Customer.io with category {classification.category}")
        # In production: 
        # response = requests.put(url, json=payload, auth=(self.site_id, self.api_key))
        return {"status": "success", "action": "identify", "user_id": user.id}

    @retry_with_backoff(retries=3, backoff_in_seconds=2)
    def trigger_playbook(self, user_id: str, playbook: Playbook):
        """
        Triggers a specific recovery event that Customer.io campaigns can listen to.
        """
        url = f"{self.base_url}/customers/{user_id}/events"
        payload = {
            "name": "trial_recovery_playbook_triggered",
            "data": {
                "playbook_id": playbook.id,
                "playbook_name": playbook.name,
                "offer_type": playbook.offer_type,
                "email_templates_count": len(playbook.email_templates)
            }
        }
        
        print(f"DEBUG: Triggering event 'trial_recovery_playbook_triggered' for user {user_id}")
        # In production:
        # response = requests.post(url, json=payload, auth=(self.site_id, self.api_key))
        return {"status": "success", "action": "track_event", "event": "trial_recovery_playbook_triggered"}
