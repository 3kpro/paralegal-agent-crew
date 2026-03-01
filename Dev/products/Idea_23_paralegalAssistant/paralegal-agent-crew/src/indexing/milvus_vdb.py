import os
import json
import numpy as np
import faiss
from typing import List
from loguru import logger
from src.embeddings.embed_data import EmbedData, batch_iterate
from config.settings import settings


class MilvusVDB:
    """FAISS-based vector database with binary quantization support (Windows-compatible).

    Drop-in replacement for the Milvus Lite implementation. Uses IndexBinaryFlat
    with HAMMING distance — same search semantics, no server required.
    """

    def __init__(
        self,
        collection_name: str = None,
        vector_dim: int = None,
        batch_size: int = None,
        db_file: str = None
    ):
        self.collection_name = collection_name or settings.collection_name
        self.vector_dim = vector_dim or settings.vector_dim
        self.batch_size = batch_size or settings.batch_size
        self.db_file = db_file or settings.milvus_db_path
        self.client = None  # FAISS IndexBinaryFlat
        self.contexts: List[str] = []

        # Storage paths derived from db_file (swap .db → .faiss / .json)
        base = os.path.splitext(self.db_file)[0]
        self.index_path = base + ".faiss"
        self.contexts_path = base + ".json"

    def initialize_client(self):
        try:
            db_dir = os.path.dirname(self.db_file)
            if db_dir:
                os.makedirs(db_dir, exist_ok=True)

            # Load existing index if present
            if os.path.exists(self.index_path) and os.path.exists(self.contexts_path):
                self.client = faiss.read_index_binary(self.index_path)
                with open(self.contexts_path, "r", encoding="utf-8") as f:
                    self.contexts = json.load(f)
                logger.info(
                    f"Loaded existing FAISS index: {self.index_path} "
                    f"({self.client.ntotal} vectors)"
                )
            else:
                self.client = None  # Will be created in create_collection()

            logger.info(f"Initialized FAISS binary client (dim={self.vector_dim})")
        except Exception as e:
            logger.error(f"Failed to initialize FAISS client: {e}")
            raise e

    def create_collection(self):
        """Create (or reset) a binary FAISS flat index with HAMMING distance."""
        db_dir = os.path.dirname(self.db_file)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)

        self.client = faiss.IndexBinaryFlat(self.vector_dim)
        self.contexts = []
        logger.info(f"Created FAISS binary index (dim={self.vector_dim})")

    def ingest_data(self, embed_data: EmbedData):
        """Ingest embedded data into the FAISS index."""
        if self.client is None:
            raise RuntimeError("FAISS index not initialized. Call create_collection() first.")

        logger.info(f"Ingesting {len(embed_data.contexts)} documents...")

        total_inserted = 0
        bytes_per_vec = self.vector_dim // 8

        for batch_context, batch_binary_embeddings in zip(
            batch_iterate(embed_data.contexts, self.batch_size),
            batch_iterate(embed_data.binary_embeddings, self.batch_size)
        ):
            vectors = np.array(
                [np.frombuffer(b, dtype=np.uint8) for b in batch_binary_embeddings],
                dtype=np.uint8
            )
            self.client.add(vectors)
            self.contexts.extend(batch_context)
            total_inserted += len(batch_context)
            logger.info(f"Inserted batch: {len(batch_context)} documents")

        # Persist to disk
        faiss.write_index_binary(self.client, self.index_path)
        with open(self.contexts_path, "w", encoding="utf-8") as f:
            json.dump(self.contexts, f, ensure_ascii=False)

        logger.info(
            f"Successfully ingested {total_inserted} documents with binary quantization"
        )

    def search(
        self,
        binary_query: bytes,
        top_k: int = None,
        output_fields: List[str] = None
    ):
        if self.client is None:
            raise RuntimeError("FAISS index not initialized.")

        top_k = top_k or settings.top_k

        query_vec = np.array(
            [np.frombuffer(binary_query, dtype=np.uint8)],
            dtype=np.uint8
        )
        distances, indices = self.client.search(query_vec, top_k)

        formatted_results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.contexts):
                continue
            formatted_results.append({
                "id": int(idx),
                "score": 1.0 / (1.0 + float(dist)),  # HAMMING distance → similarity
                "payload": {"context": self.contexts[idx]}
            })

        return formatted_results

    def collection_exists(self):
        return self.client is not None and self.client.ntotal > 0

    def get_collection_info(self):
        if self.client is None:
            return {"exists": False}
        return {
            "exists": True,
            "row_count": self.client.ntotal,
            "collection_name": self.collection_name
        }

    def close(self):
        self.client = None
        logger.info("Closed FAISS client connection")
