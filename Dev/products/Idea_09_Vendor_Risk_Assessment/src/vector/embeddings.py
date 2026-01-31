from abc import ABC, abstractmethod
from typing import List
import logging
import random

logger = logging.getLogger(__name__)

class BaseEmbedder(ABC):
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        pass

class MockEmbedder(BaseEmbedder):
    """
    Generates random vectors for testing without API costs.
    Dimension default: 1536 (OpenAI standard)
    """
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        logger.info(f"Mock embedding {len(texts)} documents")
        return [[random.random() for _ in range(self.dimension)] for _ in texts]

    def embed_query(self, text: str) -> List[float]:
        return [random.random() for _ in range(self.dimension)]

class OpenAIEmbedder(BaseEmbedder):
    """
    Placeholder for real OpenAI embeddings.
    Requires `openai` package and API key.
    """
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        # import openai
        # openai.api_key = api_key

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # return [openai.Embedding.create(input=t, model="text-embedding-ada-002")['data'][0]['embedding'] for t in texts]
        raise NotImplementedError("OpenAI client not yet installed")

    def embed_query(self, text: str) -> List[float]:
        raise NotImplementedError("OpenAI client not yet installed")
