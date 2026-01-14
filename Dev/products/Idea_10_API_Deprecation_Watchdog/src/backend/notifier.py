import httpx
import logging
import os
import json
from .models import ApiChange, Severity, ChangeType

logger = logging.getLogger(__name__)

class SlackNotifier:
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        
    async def send_alert(self, change: ApiChange, api_name: str):
        """
        Sends a formatted Slack alert for a detected change.
        """
        if not self.webhook_url:
            logger.warning("SLACK_WEBHOOK_URL not set. Skipping notification.")
            return

        color = self._get_color(change.severity)
        emoji = self._get_emoji(change.change_type)
        
        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"{emoji} New {change.change_type.value.title()} Detected: {api_name}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Title:*\n{change.title}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Severity:*\n{change.severity.value.upper()}"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Summary:*\n{change.description[:200] + '...' if change.description and len(change.description) > 200 else change.description or 'No description available.'}"
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": f"Source: <{change.source_url}|Link> | Detected: {change.detected_at.strftime('%Y-%m-%d %H:%M')}"
                        }
                    ]
                }
            ]
        }

        # Add divider
        payload["blocks"].append({"type": "divider"})

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.webhook_url, json=payload)
                response.raise_for_status()
                logger.info(f"Slack alert sent for {change.title}")
            except Exception as e:
                logger.error(f"Failed to send Slack alert: {e}")

    def _get_color(self, severity: Severity) -> str:
        if severity == Severity.CRITICAL:
            return "#FF0000" # Red
        elif severity == Severity.HIGH:
            return "#FF4500" # OrangeRed
        elif severity == Severity.MEDIUM:
            return "#FFA500" # Orange
        else:
            return "#36a64f" # Green/Good

    def _get_emoji(self, change_type: ChangeType) -> str:
        if change_type == ChangeType.BREAKING:
            return "🚨"
        elif change_type == ChangeType.DEPRECATION:
            return "⚠️"
        elif change_type == ChangeType.FEATURE:
            return "✨"
        elif change_type == ChangeType.BUGFIX:
            return "🐛"
        else:
            return "📢"
