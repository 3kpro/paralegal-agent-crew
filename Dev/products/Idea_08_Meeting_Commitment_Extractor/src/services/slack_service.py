import logging
from slack_sdk.web.async_client import AsyncWebClient
from slack_sdk.errors import SlackApiError

from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class SlackService:
    def __init__(self):
        try:
            self.client = AsyncWebClient(token=settings.SLACK_BOT_TOKEN)
        except Exception as e:
            logger.error(f"Failed to initialize Slack client: {e}")
            self.client = None

    async def send_message(self, text: str, blocks: list = None) -> bool:
        """
        Send a message to the configured Slack channel.
        """
        if not self.client:
            logger.error("Slack client not initialized")
            return False

        if not settings.SLACK_CHANNEL_ID:
             logger.warning("SLACK_CHANNEL_ID not configured")
             return False

        try:
            await self.client.chat_postMessage(
                channel=settings.SLACK_CHANNEL_ID,
                text=text,
                blocks=blocks
            )
            return True
        except SlackApiError as e:
            logger.error(f"Slack API error: {e.response['error']}")
            return False
        except Exception as e:
             logger.error(f"Error sending Slack message: {e}")
             return False
