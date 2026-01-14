import httpx
import logging
from typing import List, Dict, Optional
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class GithubMonitor:
    def __init__(self):
        self.api_base = "https://api.github.com"
        # Optional: Add Github Token support for higher rate limits
        # self.token = os.getenv("GITHUB_TOKEN")

    async def fetch_releases(self, repo_url: str) -> List[Dict[str, str]]:
        """
        Fetches releases from a GitHub repository URL.
        Input URL format: https://github.com/owner/repo or just owner/repo
        """
        owner, repo = self._parse_repo_url(repo_url)
        if not owner or not repo:
            logger.error(f"Invalid GitHub URL: {repo_url}")
            raise ValueError(f"Invalid GitHub URL: {repo_url}")

        url = f"{self.api_base}/repos/{owner}/{repo}/releases"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "BreakingChange-Watcher"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                releases = response.json()
                
                changes = []
                for release in releases:
                    # Skip drafts? Maybe. Keeping prereleases as they are important early warnings.
                    if release.get('draft'):
                        continue

                    # GitHub dates are ISO 8601: 2023-01-01T00:00:00Z
                    pub_date_str = release.get('published_at')
                    pub_date = None
                    if pub_date_str:
                        pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))

                    changes.append({
                        "title": release.get('name') or release.get('tag_name', 'Unknown Release'),
                        "raw_content": release.get('body', ''),
                        "source_url": release.get('html_url'),
                        "published_at": pub_date,
                        "original_id": str(release.get('id')) 
                    })
                
                return changes

            except Exception as e:
                logger.error(f"GitHub API error for {owner}/{repo}: {e}")
                raise e

    def _parse_repo_url(self, url: str) -> tuple[Optional[str], Optional[str]]:
        """
        Extracts owner and repo from various URL formats.
        Matches:
        - https://github.com/owner/repo
        - https://github.com/owner/repo.git
        - owner/repo
        """
        # Clean trailing slash and .git
        url = url.strip().rstrip('/')
        if url.endswith('.git'):
            url = url[:-4]
            
        # Regex for owner/repo
        match = re.search(r'github\.com/([^/]+)/([^/]+)$', url)
        if match:
            return match.group(1), match.group(2)
        
        # Try finding simple owner/repo pattern if full URL failed
        simple_match = re.match(r'^([^/]+)/([^/]+)$', url)
        if simple_match:
            return simple_match.group(1), simple_match.group(2)
            
        return None, None
