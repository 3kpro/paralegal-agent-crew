"""
SolForge Telegram Integration
Provides real-time alerts via Telegram Bot API.
"""
import logging
import asyncio
from typing import Optional, Dict, Any
from telegram import Bot
from telegram.error import TelegramError

logger = logging.getLogger(__name__)

class TelegramNotifier:
    """
    Async wrapper for Telegram Bot notifications.
    Supports mock mode for development.
    """
    
    def __init__(self, token: str, chat_id: str, mock_mode: bool = False):
        """
        Initialize Telegram Notifier.
        
        Args:
            token: Bot API Token
            chat_id: Target Chat ID (user or group)
            mock_mode: If True, logs messages instead of sending
        """
        self.token = token
        self.chat_id = chat_id
        self.mock_mode = mock_mode
        self.bot: Optional[Bot] = None
        
        if not mock_mode and token:
            try:
                self.bot = Bot(token=token)
            except Exception as e:
                logger.error(f"Failed to init Telegram Bot: {e}")
                
    async def send_message(self, text: str, parse_mode: str = "Markdown") -> bool:
        """
        Send a text message.
        
        Args:
            text: Message content
            parse_mode: 'Markdown' or 'HTML'
            
        Returns:
            True if success (or mock), False otherwise
        """
        if self.mock_mode:
            logger.info(f"[MOCK TELEGRAM] Sending to {self.chat_id}: {text}")
            return True
            
        if not self.bot:
            logger.warning("Telegram Bot not initialized (no token?)")
            return False
            
        try:
            await self.bot.send_message(chat_id=self.chat_id, text=text, parse_mode=parse_mode)
            return True
        except TelegramError as e:
            logger.error(f"Telegram Send Failed: {e}")
            return False
            
    async def send_trade_alert(self, lane_name: str, action: str, token: str, price: str, pnl: Optional[str] = None):
        """Helper to format and send a trade alert"""
        emoji = "🟢" if action == "BUY" else "🔴"
        msg = f"{emoji} *{action} Executed* - {lane_name}\n"
        msg += f"Token: `{token}`\n"
        msg += f"Price: `${price}`\n"
        
        if pnl:
            pnl_emoji = "🚀" if not pnl.startswith("-") else "📉"
            msg += f"RvP: {pnl_emoji} {pnl}"
            
        await self.send_message(msg)

    async def send_system_alert(self, level: str, message: str):
        """Helper for system alerts"""
        icons = {
            "INFO": "ℹ️",
            "WARNING": "⚠️",
            "ERROR": "🚨",
            "CRITICAL": "🔥"
        }
        icon = icons.get(level, "ℹ️")
        msg = f"{icon} *SYSTEM {level}*\n{message}"
        await self.send_message(msg)
