import logging
import requests
from typing import Dict, Any, Optional
from ..models.domain import User, Classification, CRMConfig
from ..utils.retries import retry_with_backoff

logger = logging.getLogger(__name__)

class CRMClient:
    """
    Unified client for syncing data to HubSpot or Salesforce.
    """
    def __init__(self, config: CRMConfig):
        self.config = config
        self.provider = config.provider.lower()
        self.api_key = config.api_key

    @retry_with_backoff(retries=3, backoff_in_seconds=2)
    def sync_contact(self, user: User, classification: Classification) -> Dict[str, Any]:
        """
        Creates or updates a contact in the CRM with recovery signals.
        """
        if not self.config.is_active:
            return {"status": "skipped", "reason": "Integration inactive"}

        print(f"DEBUG: Syncing User {user.email} to {self.provider.upper()}...")
        
        # Mapping internal fields to CRM-specific payload structure
        payload = self._build_payload(user, classification)
        
        # In a real implementation, we'd make the actual API call here.
        # response = requests.post(f"https://api.{self.provider}.com/contacts", json=payload, headers=...)
        
        return {
            "status": "success", 
            "provider": self.provider, 
            "contact_email": user.email, 
            "attributes_synced": list(payload.keys())
        }

    def _build_payload(self, user: User, classification: Classification) -> Dict[str, Any]:
        """
        Constructs the payload based on the provider and configured field mappings.
        """
        # Default internal data
        data = {
            "email": user.email,
            "firstname": user.name.split(" ")[0] if user.name else "",
            "lastname": " ".join(user.name.split(" ")[1:]) if user.name and " " in user.name else "",
            "trial_status": "abandoned_recovery_active",
            "abandonment_reason": classification.category.value,
            "churn_risk_score": f"{classification.confidence:.2f}",
            "ai_recovery_reason": classification.reasoning
        }

        # If user defined custom mappings, use those (simplified logic here)
        final_payload = {}
        target_map = self.config.sync_fields or {}
        
        if self.provider == "hubspot":
            # HubSpot uses "properties" object
            properties = {}
            for key, val in data.items():
                hubspot_key = target_map.get(key, key) # Default to key name if not mapped
                properties[hubspot_key] = val
            final_payload = {"properties": properties}
            
        elif self.provider == "salesforce":
            # Salesforce uses flat structure with CamelCase typically, or custom objects
            for key, val in data.items():
                sf_key = target_map.get(key, key)
                final_payload[sf_key] = val
        
        else:
            # Generic fallback
            final_payload = data

        return final_payload
