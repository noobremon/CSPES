# Phase 7 — Pre-Implementation Audit & Baseline Inspection

**Document Version:** 1.0.0  
**Phase:** Phase 7 — AI-Ready Material Matching & Candidate Intelligence Foundation  
**Audit Date:** September 8, 2026  
**Auditor:** Principal AI & Database Architect / Antigravity Agent  

---

## 1. Executive Summary & Objective

Before writing or modifying any implementation code for Phase 7, this audit formally reviews the actual repository state against the architecture requirements. The purpose of Phase 7 is to construct an **explainable, technically honest, and testable material matching foundation** across CPSE catalogs, implementing:
1. **Tier 1**: Deterministic exact & canonical attribute signature matching (`EXACT_ATTRIBUTE_SIGNATURE_V1`, `PART_NUMBER_EXACT`)
2. **Tier 2**: Deterministic text similarity (`TEXT_SIMILARITY` via Token Jaccard, normalized Levenshtein, and token-set overlap)
3. **Tier 3**: ML / Semantic embedding provider abstraction (`LocalSentenceTransformerProvider` or graceful `UNAVAILABLE` fallback)
4. **Hybrid Scoring Engine**: Weighted composite candidate scoring with transparent signal weights and missing-signal tolerance
5. **Structured Explainability**: Machine-readable `MatchExplanation` breakdown (signals, compared values, status, diffs)
6. **Cross-CPSE Candidate Retrieval**: Efficient candidate generation with blocking keys (category, family, dimensions) to prevent uncontrolled $N \times N$ compute storms
7. **Data Privacy Safety**: Strict construction of `ai_safe_text` only from Layer 2 sanitized intelligence, isolating Layer 1 private commercial payloads.

---

## 2. Baseline Architecture & Repository Inspection

### 2.1 Existing Material-Related Database Entities
*Status: CURRENTLY IMPLEMENTED*
- `raw_materials` ([`backend/app/models/material.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/models/material.py)): Layer 1 tenant-private table storing original ERP code, description, specification text, raw UOM, and `source_payload` (JSON containing PO pricing, vendor details, and store bins).
- `normalized_materials` ([`backend/app/models/material.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/models/material.py)): Layer 2 sanitized table storing canonical descriptions, normalized manufacturer/part numbers, standardized SI UOMs, taxonomy IDs, engineering terms, standard codes, and material grades.
- `material_attributes` ([`backend/app/models/material.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/models/material.py)): Layer 2 flexible EAV model storing extracted attributes (`diameter`, `length`, `grade`, `pressure`, `voltage`, `thread_pitch`, `schedule`, `power_kw`) with normalized values, units, data types, and confidence scores.
- `material_embeddings` ([`backend/app/models/material.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/models/material.py)): Layer 2 vector storage model supporting `pgvector` `Vector(384)` with fallback to `JSON`.
- `material_similarity_matches` ([`backend/app/models/matching.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/models/matching.py)): Candidate match table storing source/target material IDs, `match_type`, `lexical_score`, `vector_score`, `attribute_score`, `composite_confidence`, `methodology`, `match_explanation` (Text), `specification_diff` (JSON), `recommendation_status`, and `ai_model_version`.
- `organizations` & `source_systems` ([`backend/app/models/organization.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/models/organization.py)): Multi-CPSE boundary entities.

### 2.2 Existing Normalized Material Structure
*Status: CURRENTLY IMPLEMENTED*
- Created in Phase 6 via [`backend/app/services/normalization.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/normalization.py).
- Cleans description strings (standardizes case, expands common acronyms, normalizes dimension symbols `X` -> `X`, quotes to `INCH`).
- Maps raw UOMs (e.g. `NOS`, `PCS`, `NUM`, `PKT`) to standardized SI units (`EA`, `KG`, `M`, `L`).

### 2.3 Existing Extracted Attribute Structure
*Status: CURRENTLY IMPLEMENTED*
- Created in Phase 6 via [`backend/app/services/attribute_extractor.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/attribute_extractor.py).
- Deterministic regex patterns for:
  - Metric thread diameters (`M8`, `M16`, `M20`, `M24`)
  - Fractional diameters (`1/2"`, `3/4"`, `1"`, `2"`, `4"`)
  - Lengths (`50mm`, `75mm`, `100mm`, `2"`, `3"`)
  - Material grades (`SS304`, `SS316`, `SS316L`, `A2-70`, `A4-80`, `MS`, `EN8`, `IS2062`, `ASTM A106`)
  - Pressure ratings (`150#`, `300#`, `600#`, `PN16`, `PN40`, `PN100`)
  - Pipe schedules (`SCH 40`, `SCH 80`, `SCH 160`, `SCH XXS`)
  - Electrical specs (`11KV`, `33KV`, `415V`, `15KW`, `55KW`, `100HP`)
  - Engineering standards (`IS 1363`, `DIN 933`, `ISO 4017`, `ASTM A193`, `ASME B16.5`)

### 2.4 Existing Organization & CPSE Boundaries
*Status: CURRENTLY IMPLEMENTED*
- Tenancy is strictly enforced by `organization_id` on all tables.
- Cross-CPSE candidate comparison compares Material A (Org 1) with Material B (Org 2) exclusively across Layer 2 sanitized representations.

### 2.5 Existing Ingestion Job Flow
*Status: CURRENTLY IMPLEMENTED*
- Implemented in [`backend/app/services/ingestion_engine.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/ingestion_engine.py) and [`backend/app/api/v1/endpoints/ingestion.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/api/v1/endpoints/ingestion.py).
- Ingests CSV and `.xlsx` files, creates `raw_materials`, executes normalization and attribute extraction, and persists `normalized_materials` + `material_attributes`.

### 2.6 Existing Synthetic Demonstration Data
*Status: CURRENTLY IMPLEMENTED*
- Implemented in [`backend/scripts/seed_demo_data.py`](file:///c:/Users/User/Desktop/CSPES/backend/scripts/seed_demo_data.py) and demo files in `demo-data/`.
- Contains labeled demonstration materials for IOCL, NTPC, BHEL, ONGC, CIL.

### 2.7 Existing Vector & Embedding Schema
*Status: STRUCTURALLY IMPLEMENTED / RUNTIME VERIFICATION DEPENDENT*
- `MaterialEmbedding` model exists with pgvector column.
- Live embedding generation provider abstraction was **NOT YET IMPLEMENTED** prior to Phase 7.

### 2.8 Existing Celery/Redis Boundaries
*Status: CURRENTLY IMPLEMENTED (CONFIGURED / STRUCTURAL)*
- Celery worker structure exists in `backend/app/workers/tasks.py`.
- Background dispatch for matching candidate jobs can be triggered asynchronously or synchronously.

### 2.9 Existing Security and Sensitive Data Restrictions
*Status: CURRENTLY IMPLEMENTED*
- Layer 1 `raw_materials.source_payload` is isolated.
- AI representation must strictly use Layer 2 sanitized metadata.

---

## 3. Classification of Components & Requirements

| Item / Capability | Classification | Notes |
| :--- | :--- | :--- |
| `raw_materials`, `normalized_materials`, `material_attributes` models | **CURRENTLY IMPLEMENTED** | Layer 1 and Layer 2 models in place |
| `material_similarity_matches` database table & model | **CURRENTLY IMPLEMENTED** | Ready to be populated by matching engine |
| Stream Ingestion & Normalization pipeline | **CURRENTLY IMPLEMENTED** | Ingestion pipeline complete in Phase 6 |
| `ai_safe_text` & `MaterialRepresentation` builder | **REQUIRES PHASE 7 IMPLEMENTATION** | Must be built from Layer 2 sanitized data |
| Canonical attribute signature generator (`EXACT_ATTRIBUTE_SIGNATURE_V1`) | **REQUIRES PHASE 7 IMPLEMENTATION** | Deterministic Tier 1 matching rule |
| Deterministic Part Number / OEM Matcher (`PART_NUMBER_EXACT`) | **REQUIRES PHASE 7 IMPLEMENTATION** | Deterministic Tier 1 matching rule |
| Deterministic Text Similarity Engine (Token Jaccard / Levenshtein / Token-set) | **REQUIRES PHASE 7 IMPLEMENTATION** | Tier 2 text similarity scoring |
| Embedding Provider Abstraction (`BaseEmbeddingProvider`) | **REQUIRES PHASE 7 IMPLEMENTATION** | Tier 3 clean interface with safe `UNAVAILABLE` fallback |
| Hybrid Scoring Engine (`HYBRID_MATCH_V1`) | **REQUIRES PHASE 7 IMPLEMENTATION** | Configurable weights, missing-signal tolerance |
| Structured `MatchExplanation` generator | **REQUIRES PHASE 7 IMPLEMENTATION** | Explainable signal diff cards |
| Candidate Blocking & Retrieval Strategy | **REQUIRES PHASE 7 IMPLEMENTATION** | Category & keyword blocking to prevent $N \times N$ storms |
| Matching API Endpoints (`/match`, `/matches`, `/{match_id}`) | **REQUIRES PHASE 7 IMPLEMENTATION** | REST interface for candidate generation and retrieval |
| Unit & Integration Tests for Matching Engine | **REQUIRES PHASE 7 IMPLEMENTATION** | Pytest test suite covering all tiers and edge cases |
| Complete CNMC generation & approval workflow | **OUT OF SCOPE** | Deferred to Phase 8 |
| National Governance Dashboard UI | **OUT OF SCOPE** | Deferred to Phase 8 |
| Production SAP / ERP connectors | **OUT OF SCOPE** | Deferred to Phase 10 |
| Automated record merging / legal interchangeability declaration | **OUT OF SCOPE** | Strictly forbidden in Phase 7 |

---

## 4. Architectural Rules for Phase 7 Execution

1. **Strict "No Fake AI" Rule**:
   - All deterministic rules must be labeled `RULE_BASED_EXACT` or `RULE_BASED_STRUCTURAL`.
   - Text similarity must be labeled `TEXT_SIMILARITY`.
   - If an ML embedding model is not present/runnable in the environment, the provider must report `is_available() == False` and semantic similarity must be `None` / `"UNAVAILABLE"`. No hardcoded synthetic scores.
2. **Data Privacy Isolation**:
   - Only Layer 2 `normalized_materials` and `material_attributes` may be used to construct `ai_safe_text`.
   - Never embed or concatenate Layer 1 `source_payload` (PO pricing, vendor names, store locations).
3. **Conservative Candidate Classification**:
   - Classifications: `EXACT_MATCH_CANDIDATE`, `NEAR_DUPLICATE_CANDIDATE`, `POSSIBLE_EQUIVALENT_CANDIDATE`, `REQUIRES_DOMAIN_REVIEW`, `NO_MEANINGFUL_MATCH`.
   - Never output `APPROVED`, `MERGED`, or `OFFICIALLY_EQUIVALENT`.
4. **Candidate Retrieval Safety**:
   - Use blocking keys (category, taxonomy family, dimensions) to avoid uncontrolled $N \times N$ comparisons.

---

**Audit Outcome:** PRE-IMPLEMENTATION AUDIT COMPLETE. PHASE 7 IMPLEMENTATION IS CLEARED TO PROCEED.
