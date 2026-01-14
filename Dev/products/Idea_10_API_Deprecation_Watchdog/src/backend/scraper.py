import logging
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class ChangelogScraper:
    def __init__(self):
        pass

    async def fetch_page(self, url: str) -> str:
        """
        Fetches the HTML content of a page using Playwright to handle JS rendering.
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            try:
                # Wait for network idle to ensure content loads
                await page.goto(url, wait_until="networkidle", timeout=30000)
                content = await page.content()
                return content
            except Exception as e:
                logger.error(f"Failed to fetch {url}: {e}")
                raise e
            finally:
                await browser.close()

    def parse_changelog(self, html_content: str) -> List[Dict[str, str]]:
        """
        Heuristically parses HTML to find changelog entries.
        Strategies:
        1. Look for headers (H1-H3) that contain dates.
        2. Look for 'div' or 'section' classes with 'entry', 'change', 'log'.
        
        Returns a list of raw change blocks (title, content).
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        changes = []

        # Simple Strategy: Find all headers, treat text between headers as content
        # This is a baseline MVP. Real world requires more complex selectors or AI.
        
        # We look for common changelog headers: H1, H2, H3
        headers = soup.find_all(['h1', 'h2', 'h3', 'h4'])
        
        for i, header in enumerate(headers):
            title = header.get_text(strip=True)
            
            # Heuristic: If header has a date or version number, it's likely a change entry
            if self._is_version_or_date(title):
                content = []
                # Gather siblings until next header
                curr = header.next_sibling
                while curr and curr.name not in ['h1', 'h2', 'h3', 'h4']:
                    if curr.name: # Skip NavigableStrings if generic whitespace
                        text = curr.get_text(strip=True)
                        if text:
                            content.append(text)
                    curr = curr.next_sibling
                
                if content:
                    changes.append({
                        "title": title,
                        "raw_content": "\n".join(content),
                        "source_html": str(header)
                    })

        return changes

    def _is_version_or_date(self, text: str) -> bool:
        """
        Returns true if text looks like a version (v1.0.0) or date (2023-01-01).
        """
        # Regex for version
        if re.search(r'v?\d+\.\d+', text):
            return True
        # Regex for date (loose)
        if re.search(r'\d{4}-\d{2}-\d{2}', text) or re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', text, re.IGNORECASE):
            return True
        return False
