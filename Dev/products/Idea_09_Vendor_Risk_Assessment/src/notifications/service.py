import json
import os
from datetime import datetime
from typing import List, Optional
from ..models.notification import  NotificationType

# File path for mock persistence
DATA_FILE = "notifications_mock.json"

class NotificationService:
    """
    Service to handle notifications.
    Currently uses local JSON file for persistence (Mock mode).
    In prod, this would use SQLAlchemy session.
    """
    
    @staticmethod
    def _load() -> List[dict]:
        if not os.path.exists(DATA_FILE):
            return []
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except:
            return []

    @staticmethod
    def _save(data: List[dict]):
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=2)

    @staticmethod
    def send(
        title: str,
        message: str,
        user_id: Optional[str] = None,
        org_id: Optional[str] = None,
        type: NotificationType = NotificationType.INFO,
        link: Optional[str] = None
    ):
        """
        Send a notification.
        """
        data = NotificationService._load()
        
        new_notification = {
            "id": str(datetime.now().timestamp()), # Mock ID
            "user_id": user_id,
            "organization_id": org_id,
            "title": title,
            "message": message,
            "type": type.value if hasattr(type, 'value') else type,
            "is_read": False,
            "created_at": datetime.utcnow().isoformat(),
            "link": link
        }
        
        # Prepend to list
        data.insert(0, new_notification)
        NotificationService._save(data)
        
        # --- Slack Integration ---
        webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        if webhook_url:
            try:
                import requests
                slack_payload = {
                    "text": f"*{title}*\n{message}\nDetails: {link if link else 'N/A'}"
                }
                # Fire and forget
                requests.post(webhook_url, json=slack_payload, timeout=2)
            except Exception as e:
                print(f"Slack Notification Failed: {e}")

        return new_notification

    @staticmethod
    def get_for_user(user_id: str, org_id: str = None) -> List[dict]:
        """
        Get notifications for a user OR their organization.
        """
        all_notes = NotificationService._load()
        
        # Filter logic:
        # Match user_id explicitly OR match org_id (broadcast)
        return [
            n for n in all_notes 
            if n.get('user_id') == user_id or (org_id and n.get('organization_id') == org_id)
        ]

    @staticmethod
    def mark_read(notification_id: str):
        data = NotificationService._load()
        for n in data:
            if n['id'] == notification_id:
                n['is_read'] = True
                break
        NotificationService._save(data)

    @staticmethod
    def mark_all_read(user_id: str):
        """Mock implementation: Mark all as read for this user view"""
        data = NotificationService._load()
        for n in data:
             # In a real DB we'd check ownership, here just update all matches
             if n.get('user_id') == user_id:
                 n['is_read'] = True
        NotificationService._save(data)
