"""
Tier 3: Machine Learning & Semantic Embedding Provider Abstraction.

CRITICAL HONESTY RULE:
- Absolutely no fake AI scores.
- If a real local or remote embedding model is unavailable, the provider explicitly
  reports `is_available() == False` and returns `None`.
- Semantic similarity is computed strictly via cosine similarity on real vector embeddings.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import math
from loguru import logger


class BaseEmbeddingProvider(ABC):
    """Abstract Base Class for Material Semantic Embedding Providers."""

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True only if a real ML model is loaded and executable."""
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Returns metadata about the embedding model, version, and dimensions."""
        pass

    @abstractmethod
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generates a dense vector embedding for sanitized text. Returns None if unavailable."""
        pass

    @abstractmethod
    def generate_embeddings(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Batch generates dense vector embeddings. Returns list of vectors or Nones."""
        pass

    def compute_similarity(self, vec1: Optional[List[float]], vec2: Optional[List[float]]) -> Optional[float]:
        """
        Computes cosine similarity between two dense vectors.
        Returns float in range [-1.0, 1.0] or None if either vector is missing/empty.
        """
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return None
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return round(dot / (norm_a * norm_b), 4)


class LocalSentenceTransformerProvider(BaseEmbeddingProvider):
    """
    Local sentence-transformers embedding provider.
    Attempts to load a lightweight model (e.g. all-MiniLM-L6-v2) if available.
    If the package is not installed or the model cannot be loaded, safely operates in unavailable state.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.dimensions = 384
        self.model_version = "1.0.0"
        self._model = None
        self._is_loaded = False
        self._load_attempted = False

    def _try_load(self):
        if self._load_attempted:
            return
        self._load_attempted = True
        try:
            from sentence_transformers import SentenceTransformer  # type: ignore
            # Load model in local environment
            self._model = SentenceTransformer(self.model_name)
            self._is_loaded = True
            logger.info(f"Successfully initialized local embedding model '{self.model_name}'")
        except Exception as e:
            logger.warning(
                f"SentenceTransformer model '{self.model_name}' could not be initialized ({e}). "
                "Semantic embedding provider will operate in UNAVAILABLE state."
            )
            self._is_loaded = False
            self._model = None

    def is_available(self) -> bool:
        self._try_load()
        return self._is_loaded

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": "LocalSentenceTransformerProvider",
            "model_name": self.model_name,
            "dimensions": self.dimensions,
            "version": self.model_version,
            "is_available": self.is_available(),
            "status": "LIVE_MODEL_READY" if self.is_available() else "UNAVAILABLE_NO_LOCAL_WEIGHTS"
        }

    def generate_embedding(self, text: str) -> Optional[List[float]]:
        if not self.is_available() or not self._model:
            return None
        if not text or not text.strip():
            return None
        try:
            vec = self._model.encode(text.strip(), convert_to_numpy=True)
            return [float(x) for x in vec.tolist()]
        except Exception as e:
            logger.error(f"Error generating embedding with {self.model_name}: {e}")
            return None

    def generate_embeddings(self, texts: List[str]) -> List[Optional[List[float]]]:
        if not self.is_available() or not self._model:
            return [None for _ in texts]
        try:
            cleaned = [t.strip() if t else "" for t in texts]
            vecs = self._model.encode(cleaned, convert_to_numpy=True)
            return [[float(x) for x in v.tolist()] for v in vecs]
        except Exception as e:
            logger.error(f"Error in batch embedding generation: {e}")
            return [None for _ in texts]


# Global singleton factory
_provider_instance: Optional[BaseEmbeddingProvider] = None


def get_embedding_provider() -> BaseEmbeddingProvider:
    """Returns the singleton instance of the configured embedding provider."""
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = LocalSentenceTransformerProvider()
    return _provider_instance
