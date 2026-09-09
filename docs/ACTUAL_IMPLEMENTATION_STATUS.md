# Actual Implementation Status Report

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Audit Standard:** Strict Codebase Source of Truth  
**Audit Date:** September 2026

---

## 1. Frontend Implementation Reality

- **Real API Connectivity:** The frontend client in [frontend/src/services/api.ts](file:///c:/Users/User/Desktop/CSPES/frontend/src/services/api.ts) connects dynamically to FastAPI backend routes (`/api/v1/auth`, `/api/v1/cnmc`, `/api/v1/analytics`, `/api/v1/governance`, `/api/v1/ingestion`).
- **Mock Fallback Handling:** If the backend API is temporarily offline or running in standalone frontend demo mode, the UI gracefully renders structured demonstration fallbacks with clear disclaimers, avoiding unhandled crashes.
- **Authentication & Token Storage:** Access tokens are managed via `localStorage` with Bearer headers attached to all authenticated requests.
- **UI Views Verified:**
  1. `NationalOverviewDashboard.tsx` — 10 macro KPI cards and charts.
  2. `RecommendationWorkspace.tsx` — CNMC recommendation clustering & candidate generation.
  3. `GovernanceReviewQueue.tsx` & `ReviewDetailModal.tsx` — Domain reviewer APPROVE/REJECT/MODIFY console.
  4. `CPSEMappingView.tsx` — 1:N legacy code to CNMC crosswalk table.
  5. `DuplicateIntelligenceView.tsx` — Duplicate, near-duplicate, and equivalent material explorer.
  6. `CrossCPSEOverlapMatrix.tsx` — Inter-CPSE catalog overlap heat grid.
  7. `CNMCStandardizationView.tsx` — National standardization velocity tracker.
  8. `CategoryAnalyticsView.tsx` — 4-tier taxonomy distribution.
  9. `RationalizationPriorityView.tsx` — Duplicate rationalization opportunity queue.
  10. `ProcurementOpportunitiesView.tsx` — Demand pooling and specification harmonization.

---

## 2. Backend Implementation Reality

- **FastAPI Core (`backend/app/`):** Fully modular application structured with routers, dependency injection, Pydantic schemas, and SQLAlchemy ORM models.
- **Ingestion Engine (`ingestion_engine.py`):** Multi-tenant ingestion pipeline with SHA-256 duplicate upload protection, column auto-discovery, delimiter sniffing, and schema mapping.
- **3-Tier Matching Engine (`hybrid_engine.py`):**
  - Tier 1: Deterministic attribute signature hashing and conflict detection.
  - Tier 2: Levenshtein token sort and token set ratio lexical analysis.
  - Tier 3: Dense vector cosine similarity via SentenceTransformers.
- **Governance Service (`workflow_service.py`):** Enforces human review, transitions candidate records to `CNMCMaster`, creates `CPSECNMCMapping` cross-walk records, and logs immutable audit records.
- **Analytics Services (`backend/app/services/analytics/`):** 7 dedicated analytics services computing dynamic metrics directly via SQL queries over database tables.

---

## 3. Database & Model Architecture

- **Layer 1 (`raw_materials`):** Preserves raw source records, legacy CPSE codes, and confidential vendor/PO data (`source_payload`).
- **Layer 2 (`normalized_materials`, `material_attributes`, `material_embeddings`):** Sanitized engineering representations containing standard attributes, SI units, and 384-dimensional vector embeddings.
- **Layer 3 (`cnmc_master`, `cpse_cnmc_mappings`):** Governed national material catalog and multi-CPSE crosswalk mappings.
- **Governance & Audit (`governance_reviews`, `audit_logs`):** Immutable review logs and before/after state diff tracking.

---

## 4. AI / ML / NLP Reality Classification

| Component | Code Reference | Classification |
|:---|:---|:---|
| Technical Parameter Extraction | `attribute_extractor.py` | **RULE-BASED INTELLIGENCE** (Deterministic Regex) |
| Description Normalization | `normalization.py` | **RULE-BASED NORMALIZATION** (Standard Terminology) |
| Lexical Similarity | `text_similarity.py` | **FUZZY / LEXICAL MATCHING** (Levenshtein Token Ratio) |
| Semantic Embeddings | `embedding_provider.py` | **ACTUAL AI / ML** (`all-MiniLM-L6-v2` Dense Embeddings) |
| Vector Storage & Search | `material.py` (`Vector(384)`) | **VECTOR SEARCH** (`pgvector` Cosine Similarity) |
| CNMC Code Generation | `generator.py` | **DETERMINISTIC CODIFICATION** (Hash & Sequence Allocator) |

---

## 5. Enterprise ERP & SAP Integration Reality

- **Implemented:** Production-grade CSV and OpenXML Excel (`.xlsx`) stream ingestion adapters with column header detection.
- **Implemented:** Formal `BaseERPAdapter` interface and `MockSAPConnectorAdapter` in [erp_adapter.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/erp_adapter.py) for development simulation.
- **Not Implemented:** Direct live SAP RFC / BAPI / IDoc network listener clients (which require enterprise SAP NetWeaver on-premise infrastructure).
