# AI Embedding Strategy & Vector Foundation

**Document Version:** 1.0.0  
**Phase:** Phase 7 — AI-Ready Material Matching & Candidate Intelligence Foundation  

---

## 1. Objective & Technical Honesty Principle

The vector embedding strategy provides semantic similarity capabilities to detect materials described in completely different vocabulary but referring to equivalent industrial concepts.

### Critical Honesty Rule: Zero Fake AI
In many hackathon and prototype systems, developers simulate AI by hardcoding random similarity numbers, mocking inference with deterministic heuristics, or claiming models are active when they are not.

In this platform:
- **No fake numbers:** If an embedding model is not loaded in the runtime environment, the provider explicitly reports `is_available() == False` and returns `None` for vector scores.
- **Explicit Methodology Labels:** The engine tags every match with `RULE_BASED_EXACT`, `TEXT_SIMILARITY`, or `HYBRID_AI_RULE_V1`.
- **Transparent Fallback:** When semantic embeddings are offline, the hybrid scoring engine dynamically renormalizes weights across deterministic and lexical signals.

---

## 2. Embedding Provider Abstraction

The system defines an abstract interface ([`BaseEmbeddingProvider`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/matching/embedding_provider.py)) decoupling the matching engine from specific model frameworks:

```python
class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def is_available(self) -> bool:
        """Returns True only if a real ML model is loaded and executable."""
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Returns metadata regarding model name, dimensions, and execution status."""
        pass

    @abstractmethod
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generates dense vector embedding for sanitized text. Returns None if unavailable."""
        pass

    @abstractmethod
    def generate_embeddings(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Batch generates dense vector embeddings."""
        pass

    def compute_similarity(self, vec1: Optional[List[float]], vec2: Optional[List[float]]) -> Optional[float]:
        """Computes cosine similarity between two dense vectors."""
        pass
```

### Supported Providers
1. **`LocalSentenceTransformerProvider`**:
   - Default target model: `all-MiniLM-L6-v2` (384 dimensions).
   - Designed for fast CPU/GPU inference on industrial text strings.
   - Gracefully handles missing package / missing weights by logging a warning and operating in `UNAVAILABLE` state.

---

## 3. Sanitized `ai_safe_text` Generation

Embedding models must NEVER consume raw ERP payloads containing confidential commercial information (vendor names, purchase order pricing, store bin codes).

The representation layer constructs a canonical `ai_safe_text` exclusively from Layer 2 sanitized intelligence:

```
CATEGORY: FASTENERS | TYPE: HEX BOLT | DESCRIPTION: HEX BOLT SS304 M16 X 50MM | MATERIAL_GRADE: SS304 | STANDARD: ISO 4017 | DIAMETER: M16 | LENGTH: 50MM | UOM: EA
```

### Privacy Guarantee:
- **Excluded:** `source_payload.po_number`, `source_payload.unit_price`, `source_payload.vendor_name`, `source_payload.store_bin`.
- **Included:** Standardized taxonomy, engineering term, normalized description, grade, standard code, and extracted physical attributes.

---

## 4. Vector Storage Schema

Vectors are persisted in the `material_embeddings` table:

```sql
CREATE TABLE material_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    normalized_material_id UUID NOT NULL UNIQUE REFERENCES normalized_materials(id) ON DELETE CASCADE,
    embedding_model VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    model_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    dimensions INTEGER NOT NULL DEFAULT 384,
    embedding_vector vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

*Note on pgvector:* The SQLAlchemy model includes a TypeDecorator fallback to `JSON` when `pgvector` extension is not present in lightweight test SQLite environments.

---

## 5. Candidate Retrieval & Blocking Strategy

To prevent $N \times N$ vector distance calculations across millions of records:
1. **Blocking Filter:** Materials are partitioned into candidate pools by taxonomy category, engineering term, or primary dimensional tokens (`M16`, `SS304`, `50MM`).
2. **K-Nearest Candidate Generation:** Vector similarity is evaluated only on candidate pools (default limit: 50 candidates per query).
