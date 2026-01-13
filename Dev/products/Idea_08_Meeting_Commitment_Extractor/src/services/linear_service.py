import logging
import httpx
from typing import Optional

from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class LinearService:
    def __init__(self):
        self.url = "https://api.linear.app/graphql"
        self.headers = {
            "Authorization": f"{settings.LINEAR_API_KEY}",
            "Content-Type": "application/json"
        }

    async def create_issue(self, title: str, description: str) -> Optional[dict]:
        """
        Create an issue in Linear using GraphQL.
        Returns the created issue data (dict) or None if failed.
        """
        if not settings.LINEAR_API_KEY:
            logger.error("LINEAR_API_KEY not configured")
            return None
            
        if not settings.LINEAR_TEAM_ID:
            logger.error("LINEAR_TEAM_ID not configured")
            return None

        query = """
        mutation IssueCreate($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue {
                    id
                    identifier
                    url
                }
            }
        }
        """

        variables = {
            "input": {
                "title": title,
                "description": description,
                "teamId": settings.LINEAR_TEAM_ID
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.url,
                    headers=self.headers,
                    json={"query": query, "variables": variables}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "errors" in data:
                        logger.error(f"Linear GraphQL error: {data['errors']}")
                        return None
                        
                    return data.get("data", {}).get("issueCreate", {}).get("issue")
                else:
                    logger.error(f"Linear API failed: {response.status_code} - {response.text}")
                    return None
            except Exception as e:
                logger.error(f"Error communicating with Linear: {e}")
                return None
