import feedparser
from typing import List, Dict, Optional
import logging
from datetime import datetime
from time import mktime

logger = logging.getLogger(__name__)

class RssParser:
    def __init__(self):
        pass

    def parse_feed(self, url: str) -> List[Dict[str, str]]:
        """
        Parses an RSS or Atom feed specifically for changelog entries.
        Returns a list of change dictionaries.
        """
        try:
            feed = feedparser.parse(url)
            
            if feed.bozo:
                logger.warning(f"Feed at {url} might be malformed: {feed.bozo_exception}")

            changes = []
            
            for entry in feed.entries:
                # Extract date
                published_at = None
                if hasattr(entry, 'published_parsed'):
                    published_at = datetime.fromtimestamp(mktime(entry.published_parsed))
                elif hasattr(entry, 'updated_parsed'):
                    published_at = datetime.fromtimestamp(mktime(entry.updated_parsed))
                
                changes.append({
                    "title": entry.get('title', 'No Title'),
                    "raw_content": entry.get('summary', '') or entry.get('description', ''),
                    "source_url": entry.get('link', url),
                    "published_at": published_at,
                    "original_id": entry.get('id', entry.get('link', ''))
                })
                
            return changes

        except Exception as e:
            logger.error(f"Failed to parse RSS feed {url}: {e}")
            raise e
