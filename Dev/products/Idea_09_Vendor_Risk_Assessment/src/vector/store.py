import os
import logging
import uuid
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import time

try:
    from pinecone import Pinecone, ServerlessSpec
except ImportError:
    Pinecone = None

from .embeddings import BaseEmbedder, MockEmbedder

logger = logging.getLogger(__name__)

@dataclass
class SearchResult:
    id: str
    score: float
    metadata: Dict[str, Any]
    text: Optional[str] = None

class VectorStore:
    def __init__(self, 
                 api_key: Optional[str] = None, 
                 environment: str = "us-east-1", 
                 index_name: str = "vendorscope-index",
                 embedder: Optional[BaseEmbedder] = None):
        
        self.api_key = api_key or os.getenv("PINECONE_API_KEY")
        self.environment = environment
        self.index_name = index_name
        self.embedder = embedder or MockEmbedder()
        self.index = None
        
        if self.api_key and Pinecone:
            self.pc = Pinecone(api_key=self.api_key)
            self._init_index()
        else:
            logger.warning("Pinecone API key not found or client missing. Running in MOCK mode.")
            self.pc = None
            self.mock_storage = {} # id -> (vector, metadata)

    def _init_index(self):
        """Initializes Pinecone index."""
        if self.index_name not in [i.name for i in self.pc.list_indexes()]:
            logger.info(f"Creating Pinecone index: {self.index_name}")
            try:
                self.pc.create_index(
                    name=self.index_name,
                    dimension=1536, # Match embedder
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
            except Exception as e:
                logger.error(f"Failed to create index: {e}")
        
        self.index = self.pc.Index(self.index_name)

    def upsert_chunks(self, chunks: List[Dict[str, Any]]):
        """
        Upserts processed chunks.
        chunks schema: [{'text': str, 'metadata': dict, 'id': str (optional)}]
        """
        texts = [c['text'] for c in chunks]
        vectors = self.embedder.embed_documents(texts)
        
        vectors_to_upsert = []
        for i, chunk in enumerate(chunks):
            chunk_id = chunk.get('id', str(uuid.uuid4()))
            metadata = chunk.get('metadata', {})
            # Ensure text is in metadata for retrieval context
            metadata['text'] = chunk['text'][:20000] # Limit size just in case
            
            if self.index:
                vectors_to_upsert.append({
                    "id": chunk_id,
                    "values": vectors[i],
                    "metadata": metadata
                })
            else:
                # Mock storage
                self.mock_storage[chunk_id] = {
                    "values": vectors[i],
                    "metadata": metadata
                }
        
        if self.index and vectors_to_upsert:
            # Batch upsert
            batch_size = 100
            for i in range(0, len(vectors_to_upsert), batch_size):
                batch = vectors_to_upsert[i:i+batch_size]
                self.index.upsert(vectors=batch)
                logger.info(f"Upserted batch {i} to {i+len(batch)}")
        else:
            logger.info(f"Mock upserted {len(vectors_to_upsert)} vectors")

    def search(self, query: str, top_k: int = 5, filter: Optional[Dict] = None) -> List[SearchResult]:
        query_vector = self.embedder.embed_query(query)
        
        if self.index:
            response = self.index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True,
                filter=filter
            )
            
            results = []
            for match in response['matches']:
                results.append(SearchResult(
                    id=match['id'],
                    score=match['score'],
                    metadata=match['metadata'],
                    text=match['metadata'].get('text', '')
                ))
            return results
        else:
            # Simple mock linear search (cosine similarity equivalent for mock?)
            # Just return random top_k chunks for interface testing
            if not self.mock_storage:
                return []
            
            import random
            keys = list(self.mock_storage.keys())
            selected = random.sample(keys, min(len(keys), top_k))
            
            results = []
            for k in selected:
                item = self.mock_storage[k]
                results.append(SearchResult(
                    id=k,
                    # Random fake score
                    score=0.8 + (random.random() * 0.1),
                    metadata=item['metadata'],
                    text=item['metadata'].get('text', '')
                ))
            return results

    def delete(self, ids: List[str]):
        if self.index:
            self.index.delete(ids=ids)
        else:
            for i in ids:
                self.mock_storage.pop(i, None)
