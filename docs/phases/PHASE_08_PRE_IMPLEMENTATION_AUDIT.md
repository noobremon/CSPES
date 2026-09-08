# Phase 8 — Pre-Implementation Audit Report

**Audit Date:** September 8, 2026  
**System:** AI-Powered National Unified Material Master Framework  
**Scope:** CNMC Recommendation Engine & Human Governance Workflow  
**Auditor:** Principal AI & Database Architect  

---

## 1. Executive Summary

In accordance with Phase 8 Mandatory Instructions, a comprehensive pre-implementation review of the codebase, database schema, domain models, APIs, and existing documentation was conducted.

The audit verified that the foundational domain models for `cnmc_candidates`, `cnmc_master`, `cpse_cnmc_mappings`, `governance_reviews`, and `audit_logs` were established during Phase 5, and the multi-tier matching engine was completed and unit-tested in Phase 7.

Zero premature CNMC approvals, automatic material merges, or production SAP write-backs exist in the repository.

---

## 2. Pre-Implementation Audit Classification Matrix

Each required item has been inspected in the active codebase and classified according to the mandatory categories:
- `CURRENTLY IMPLEMENTED`
- `CONFIRMED NOT PRESENT`
- `REQUIRES PHASE 8 IMPLEMENTATION`
- `OUT OF SCOPE`

| # | Inspection Item | Current Status in Codebase | Classification | Notes & Source Reference |
|---|---|---|---|---|
| **1** | **`cnmc_master` Model** | `CNMCMaster` in `backend/app/models/cnmc.py` & Alembic `0002` | `CURRENTLY IMPLEMENTED` | Layer 3 catalog table with `cnmc_code`, `canonical_name`, `standard_description`, `spec_template`, `status`, `governance_metadata`. |
| **2** | **`cnmc_candidates` Model** | `CNMCCandidate` in `backend/app/models/cnmc.py` & Alembic `0002` | `CURRENTLY IMPLEMENTED` | Prototype candidate model with `proposed_cnmc`, `candidate_group_name`, `confidence_score`, `recommendation_explanation`, `status`. |
| **3** | **`governance_reviews` Model** | `GovernanceReview` in `backend/app/models/governance.py` & Alembic `0002` | `CURRENTLY IMPLEMENTED` | Human decision tracking model with `entity_type`, `entity_id`, `reviewer_reference`, `decision`, `comments`, `previous_status`, `new_status`. |
| **4** | **`material_similarity_matches` Model** | `MaterialSimilarityMatch` in `backend/app/models/matching.py` | `CURRENTLY IMPLEMENTED` | Phase 7 hybrid scoring candidate model with `specification_diff` and structured explanation. |
| **5** | **Audit Logging Architecture** | `AuditLog` in `backend/app/models/governance.py` | `CURRENTLY IMPLEMENTED` (Model) / `REQUIRES PHASE 8 IMPLEMENTATION` (Service) | Model exists in DB schema. Dedicated reusable `AuditLogger` service required in Phase 8 for governance traceability. |
| **6** | **Organization / Role Architecture** | `Organization` in `backend/app/models/organization.py` | `CURRENTLY IMPLEMENTED` (Orgs) / `CONFIRMED NOT PRESENT` (Production RBAC) | Organizations exist. Production JWT/RBAC is not present. Phase 8 will use transparent demo reviewer headers/context (`X-Demo-Reviewer`, `X-Demo-Role`). Production IAM/Auth0 is `OUT OF SCOPE`. |
| **7** | **API Conventions** | FastAPI routers in `backend/app/api/v1/` | `CURRENTLY IMPLEMENTED` (Routing) / `REQUIRES PHASE 8 IMPLEMENTATION` (CNMC Endpoints) | Standard async router patterns established. New `/api/v1/cnmc/*` and `/api/v1/governance/*` endpoints required. |
| **8** | **Frontend Conventions** | React 18 + Vite + TS in `frontend/src/` | `CURRENTLY IMPLEMENTED` (App Shell) / `REQUIRES PHASE 8 IMPLEMENTATION` (Phase 8 Business UI) | Foundation app shell and Tailwind styling present. Enterprise Government/CPSE 4-tab workflow UI required in Phase 8. |
| **9** | **Synthetic Demonstration Data** | `scripts/seed_demo_data.py` & `demo-data/` | `CURRENTLY IMPLEMENTED` | 5 CPSEs, multi-level taxonomies, normalized materials, and synthetic match data available for testing. |
| **10** | **Material Category / Taxonomy Fields** | `MaterialTaxonomy` in `backend/app/models/taxonomy.py` | `CURRENTLY IMPLEMENTED` | Hierarchical taxonomy nodes (`code`, `name`, `path`, `level`), linked to `NormalizedMaterial.taxonomy_id` and attributes. |

---

## 3. Detailed Subsystem Audit Findings

### 3.1 CNMC Codification Structure & Boundaries
- **Audited State:** The CNMC format is strictly an **"MVP Prototype Reference Format"** (`IN-IND-MECH-BLT-00492`).
- **Safety Verification:** No documentation or code claims Government of India approval or statutory standardization.
- **Requirement:** Phase 8 generator service must maintain format versioning (`MVP_CNMC_V1`) and rule-based deterministic assembly.

### 3.2 Recommendation Engine vs. Auto-Approval
- **Audited State:** No automated approval logic exists in the codebase. All existing match candidates remain in status `PROPOSED`.
- **Requirement:** Phase 8 recommendation engine will only generate candidates with status `PENDING_REVIEW`. All approvals require explicit human governance actions.

### 3.3 CPSE Code Preservation & Cross-Walk
- **Audited State:** `cpse_cnmc_mappings` table contains `local_material_code` and `raw_material_id`.
- **Requirement:** Original CPSE material codes remain untouched in Layer 1. The platform operates solely through non-destructive mapping.

### 3.4 Data Layer Isolation & Privacy
- **Audited State:** Layer 1 confidential purchase order pricing, proprietary vendor names, and internal warehouse bins are isolated in `raw_materials.source_payload`.
- **Requirement:** CNMC recommendation explanations and governance review cards must only reference Layer 2 sanitized engineering attributes and Layer 3 public standards. Zero Layer 1 commercial leakage.

---

## 4. Scope Classification Summary

### Currently Implemented & Verified
- Database domain models (15 entities) in SQLAlchemy and Alembic.
- Material Normalization and Attribute Extraction services (Phase 6).
- Deterministic, Lexical, Embedding, and Hybrid Matching services (Phase 7).
- In-memory async test harness with SQLite + aiosqlite.

### Requires Phase 8 Implementation
1. `CNMCGenerator`: Versioned deterministic prototype CNMC builder (`MVP_CNMC_V1`).
2. `CNMCRecommendationService`: Reuse detection, new candidate generation, and structured explainability card builder.
3. `GovernanceWorkflowService`: Human review action handler (`APPROVE`, `REJECT`, `MODIFY`) with mandatory rationale enforcement and history preservation.
4. `AuditLoggerService`: Immutable event recording for recommendations and governance transitions.
5. REST API Endpoints: `/api/v1/cnmc/*` and `/api/v1/governance/*`.
6. Frontend Enterprise UI: 4-tab workflow interface (Workspace, Review Queue, Review Detail, Cross-Walk Mappings).
7. Comprehensive Test Suite: 19 backend test scenarios and frontend Vitest component tests.

### Confirmed Out of Scope
- Production ERP / SAP write-back.
- Official Government of India gazette ratification.
- Production multi-tenant IAM / OAuth2 provider setup.
- Price dispersion analytics and inventory redistribution dashboards (Phase 9).
- Automatic record merging or duplicate deletion.
