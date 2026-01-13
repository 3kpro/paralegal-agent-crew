import pdfplumber
from typing import List, Dict, Any
from .base import BaseParser, DocumentContent, ParsedChunk

class PDFParser(BaseParser):
    def parse(self, file_path: str) -> DocumentContent:
        chunks: List[ParsedChunk] = []
        full_text = []
        metadata = {}

        try:
            with pdfplumber.open(file_path) as pdf:
                metadata = pdf.metadata or {}
                
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    if text.strip():
                        # Create chunk per page for now, or sub-chunk if needed
                        chunks.append(ParsedChunk(
                            content=text,
                            page_number=i + 1,
                            metadata={"source": file_path}
                        ))
                        full_text.append(text)
                        
        except Exception as e:
            print(f"Error parsing PDF {file_path}: {e}")
            raise

        return DocumentContent(
            text="\n".join(full_text),
            metadata=metadata,
            chunks=chunks
        )
