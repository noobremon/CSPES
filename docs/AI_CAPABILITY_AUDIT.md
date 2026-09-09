# AI / ML & Material Intelligence Capability Audit

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Audit Standard:** Strict Technical Honesty (No Inflated AI Claims)  
**Audit Date:** September 2026

---

## 1. Executive Summary & Core Classification

| Intelligence Technique | Actual Implementation in Codebase | Source Code References | Honest Classification |
|:---|:---|:---|:---|
| **Deterministic Rule Engine** | Canonical signature hashing, dimension extraction, grade matching, engineering conflict rules. | [app/services/matching/deterministic_matcher.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/matching/deterministic_matcher.py), [app/services/attribute_extractor.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/attribute_extractor.py) | **RULE-BASED INTELLIGENCE** |
| **Lexical & Fuzzy Matching** | Levenshtein distance, token sort ratio, token set ratio on sanitized descriptions. | [app/services/matching/text_similarity.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/matching/text_similarity.py) | **FUZZY / LEXICAL MATCHING** |
| **Dense Vector Embeddings** | SentenceTransformer (`all-MiniLM-L6-v2`), 384 dimensions, cosine similarity. | [app/services/matching/embedding_provider.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/matching/embedding_provider.py), `MaterialEmbedding` model in [app/models/material.py](file:///c:/Users/User/Desktop/CSPES/backend/app/models/material.py) | **ACTUAL AI / ML (EMBEDDINGS)** |
| **Hybrid Composite Scoring** | Weighted composite score dynamically re-normalized based on active provider availability. | [app/services/matching/hybrid_engine.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/matching/hybrid_engine.py) | **HYBRID SCORING ENGINE** |
| **CNMC Codification** | Deterministic token sanitization and repeatable hash-based sequence allocation. | [app/services/cnmc/generator.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/cnmc/generator.py) | **DETERMINISTIC CODIFICATION** |
| **Demonstration Data** | Representative CPSE industrial records (valves, pipes, fasteners, bearings). | [backend/scripts/seed_demo_data.py](file:///c:/Users/User/Desktop/CSPES/backend/scripts/seed_demo_data.py), `demo-data/` | **SYNTHETIC DEMONSTRATION DATA** |

---

## 2. Deep Dive: The 3-Tier Matching Architecture

```
                                  INCOMING MATERIAL
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
            [ TIER 1 ]              [ TIER 2 ]              [ TIER 3 ]
        DETERMINISTIC RULES     LEXICAL / FUZZY         DENSE EMBEDDINGS
        • Canonical Signatures  • Levenshtein Dist      • all-MiniLM-L6-v2
        • Attribute Extractor   • Token Set Ratio       • 384 Dimensions
        • Hard Conflict Checks  • Token Sort Ratio      • Cosine Similarity
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          │
                                          ▼
                               [ HYBRID COMPOSITE ]
                            • Dynamic Weight Rebalance
                            • Conflict Safety Override
                            • Explainability Breakdown
```

### Tier 1: Deterministic Engineering Intelligence
- **Implementation:** Extracts structured physical parameters (e.g. `thread_pitch`, `diameter`, `length`, `material_grade`, `pressure_class`, `voltage`, `standards`).
- **Conflict Rule Engine:** If two materials share identical noun words but have conflicting grades (e.g. `SS304` vs `SS316`) or conflicting pressure ratings (e.g. `Class 150` vs `Class 300`), the engine raises `has_hard_conflict = True` and forces the classification to `REQUIRES_DOMAIN_REVIEW`.
- **Engineering Safety:** Prevents catastrophic false positive auto-merging of non-interchangeable industrial components.

### Tier 2: Lexical and Fuzzy Similarity
- **Implementation:** Compares sanitized text strings using token set and partial ratio algorithms.
- **Purpose:** Handles word order variations, abbreviation differences, and minor typos across CPSE catalog descriptions (e.g., `HEX BOLT M16X50 SS304` vs `HEXAGON HEAD BOLTS M16 X 50 STAINLESS STEEL 304`).

### Tier 3: Machine Learning & Semantic Embeddings
- **Implementation:** Uses `LocalSentenceTransformerProvider` running the `all-MiniLM-L6-v2` transformer model.
- **pgvector Integration:** Embedding vectors are stored in PostgreSQL via the `pgvector` extension (`Vector(384)`).
- **Strict Honesty Rule:** If the local environment lacks model weights or PyTorch dependencies, the provider returns `is_available() == False`. The hybrid engine automatically re-normalizes weights to Tier 1 + Tier 2, reports `semantic_status: "UNAVAILABLE"`, and **never generates synthetic fake AI confidence scores**.

---

## 3. UI Labeling & Transparency Audit

| UI Component | Label in UI | Explanation | Compliance Status |
|:---|:---|:---|:---|
| **Matching Score Cards** | `Match Score: XX%` / `Composite Confidence` | Replaces misleading "AI Confidence" with mathematically accurate composite score. | **VERIFIED COMPLIANT** |
| **Signal Explanations** | `Rule-Based Certainty` / `Semantic Embedding Similarity` | Clearly distinguishes whether a signal was generated by a rule or an ML model. | **VERIFIED COMPLIANT** |
| **Governance Resolution** | `Statutory Notice: MVP Prototype Demo Workflow` | Explicitly informs domain reviewers that approvals are demonstration records. | **VERIFIED COMPLIANT** |
| **Demonstration Dashboards** | `Synthetic Demonstration Insight` banner | Clarifies that analytics KPIs are aggregated from demonstration data. | **VERIFIED COMPLIANT** |
