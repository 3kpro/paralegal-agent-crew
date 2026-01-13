from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

@dataclass
class ScrapedData:
    url: str
    found_certs: List[str]
    privacy_policy_links: List[str]
    security_page_links: List[str]
    document_links: List[str]
    risk_text_snippets: List[str]

class BaseScraper(ABC):
    @abstractmethod
    def scrape(self, url: str) -> ScrapedData:
        """Scrape a given URL and return structured data."""
        pass
