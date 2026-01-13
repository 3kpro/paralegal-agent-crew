import re
from typing import List
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from .base import BaseScraper, ScrapedData

class TrustCenterScraper(BaseScraper):
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.cert_keywords = [
            "SOC 2", "SOC2", "ISO 27001", "ISO27001", 
            "GDPR", "HIPAA", "PCI DSS", "FedRAMP"
        ]

    def scrape(self, url: str) -> ScrapedData:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            page = browser.new_page()
            
            try:
                # Go to URL, wait for network idle to ensure dynamic content loads
                page.goto(url, wait_until="networkidle", timeout=60000)
                
                # Get page content
                content = page.content()
                
                # Parse with BeautifulSoup
                soup = BeautifulSoup(content, 'html.parser')
                text_content = soup.get_text()
                
                # Extract Data
                found_certs = self._extract_certs(text_content)
                privacy_links = self._extract_links(soup, ["privacy", "policy"])
                security_links = self._extract_links(soup, ["security", "trust"])
                doc_links = self._extract_document_links(soup)
                snippets = self._extract_snippets(text_content)
                
                return ScrapedData(
                    url=url,
                    found_certs=found_certs,
                    privacy_policy_links=privacy_links,
                    security_page_links=security_links,
                    document_links=doc_links,
                    risk_text_snippets=snippets
                )
                
            except Exception as e:
                print(f"Error scraping {url}: {e}")
                return ScrapedData(url, [], [], [], [], [])
            finally:
                browser.close()

    def _extract_certs(self, text: str) -> List[str]:
        found = []
        for keyword in self.cert_keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE):
                found.append(keyword)
        # Normalize (e.g. SOC2 vs SOC 2)
        unique = list(set(found))
        return unique

    def _extract_links(self, soup: BeautifulSoup, keywords: List[str]) -> List[str]:
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            text = a.get_text().lower()
            if any(k in href.lower() or k in text for k in keywords):
                if href not in links:
                    links.append(href)
        return links[:5] # Limit to top 5

    def _extract_document_links(self, soup: BeautifulSoup) -> List[str]:
        doc_links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.lower().endswith('.pdf') or 'report' in href.lower() or 'download' in href.lower():
                 if href not in doc_links:
                    doc_links.append(href)
        return doc_links[:10]

    def _extract_snippets(self, text: str) -> List[str]:
        # Very naive snippet extraction extracting lines with keywords
        lines = text.split('\n')
        snippets = []
        keywords = ["encryption", "data security", "access control", "compliance"]
        for line in lines:
            line = line.strip()
            if len(line) > 20 and any(k in line.lower() for k in keywords):
                snippets.append(line[:200]) # Truncate long lines
        return snippets[:5]
