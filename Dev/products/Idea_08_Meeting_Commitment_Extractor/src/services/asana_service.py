import logging
import httpx
from typing import Optional

from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class AsanaService:
    def __init__(self):
        self.base_url = "https://app.asana.com/api/1.0"
        self.headers = {
            "Authorization": f"Bearer {settings.ASANA_ACCESS_TOKEN}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def create_task(self, name: str, notes: str, due_on: Optional[str] = None) -> Optional[dict]:
        """
        Create a task in Asana using HTTPX.
        Returns the created task data (dict) or None if failed.
        """
        if not settings.ASANA_ACCESS_TOKEN:
            logger.error("ASANA_ACCESS_TOKEN not configured")
            return None

        # Prepare payload
        data = {
            "name": name,
            "notes": notes,
        }
        
        if settings.ASANA_PROJECT_GID:
            data["projects"] = [settings.ASANA_PROJECT_GID]
        
        if settings.ASANA_WORKSPACE_GID:
            data["workspace"] = settings.ASANA_WORKSPACE_GID

        # If due_on is provided, we put it in notes strictly to avoid date parsing errors 
        # unless format is strictly YYYY-MM-DD. 
        # For this MVP, extracting strict date formatting is out of scope, 
        # so we append to notes for safety.
        if due_on:
             data["notes"] += f"\n\nExtracted Due Date: {due_on}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/tasks",
                    headers=self.headers,
                    json={"data": data}
                )
                
                if response.status_code == 201:
                    return response.json().get("data")
                else:
                    logger.error(f"Asana create task failed: {response.status_code} - {response.text}")
                    return None
            except Exception as e:
                logger.error(f"Error communicating with Asana: {e}")
                return None
