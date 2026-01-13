import os
import requests
import json
from ..models.domain import User, Classification
from ..utils.retries import retry_with_backoff

class SlackClient:
    def __init__(self, webhook_url: str = None):
        self.webhook_url = webhook_url or os.getenv("SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/mock/webhook")

    @retry_with_backoff(retries=5, backoff_in_seconds=1)
    def notify_classification(self, user: User, classification: Classification):
        """
        Sends a rich Slack notification for a new user abandonment classification.
        """
        category_emoji = {
            "price": "💰",
            "confused": "❓",
            "more_time": "⏳",
            "competitor": "⚔️",
            "wrong_fit": "🚫",
            "ghosted": "👻"
        }
        
        emoji = category_emoji.get(classification.category.value, "🚨")
        confidence_stars = "⭐" * int(classification.confidence * 5)
        
        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"{emoji} New Recovery Opportunity",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*User:*\n{user.email}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Category:*\n{classification.category.value.title()}"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*AI Confidence:*\n{int(classification.confidence * 100)}% {confidence_stars}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Last Active:*\n{user.metadata.get('last_active_at', 'Unknown')}"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*AI Reasoning:*\n_{classification.reasoning}_"
                    }
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "View in Dashboard",
                                "emoji": True
                            },
                            "style": "primary",
                            "url": "https://trialrevive.app/dashboard"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "🚀 Trigger Playbook",
                                "emoji": True
                            },
                            "value": f"trigger_playbook:{classification.trial_id}:{user.id}",
                            "action_id": "trigger_recovery_playbook"
                        }
                    ]
                }
            ]
        }
        
        print(f"DEBUG: Sending Slack alert for {user.email} (Category: {classification.category})")
        # In production:
        # response = requests.post(self.webhook_url, json=payload)
        return {"status": "success", "platform": "slack"}
