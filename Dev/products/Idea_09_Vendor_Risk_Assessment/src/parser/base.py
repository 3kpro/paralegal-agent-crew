from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

@dataclass
class ParsedChunk:
    content: str
    page_number: int
    metadata: Dict[str, Any]

@dataclass
class DocumentContent:
    text: str
    metadata: Dict[str, Any]
    chunks: List[ParsedChunk]

class BaseParser(ABC):
    @abstractmethod
    def parse(self, file_path: str) -> DocumentContent:
        """Parse a file and return structured content."""
        pass
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """Utility to chunk text for vector embeddings."""
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
            
        return chunks
