# Phase 5 — Core Database Domain Schema & Multi-CPSE Sample Data

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** Phase Execution & Architecture Log (Phase 5)  
**Status:** `COMPLETE / AUDITED`

---

## 1. Phase 5 Overview & Objectives

Phase 5 establishes the core relational and vector domain database foundation required for the Unified Material Master platform. It enforces multi-tenant schema boundaries, preserves raw CPSE ERP legacy codes, separates sanitized intelligence from private pricing, and provides complete governance and cross-walk mapping tables.

### Key Objectives Achieved:
1. Multi-CPSE aware relational models created (5 sample enterprises: IOCL, NTPC, SAIL, CIL, BHEL).
2. Raw material records (Layer 1) preserve original ERP descriptions, codes, and private PO details without modification.
3. Normalized materials (Layer 2) provide sanitized canonical descriptions and extensible attribute specifications (`material_attributes`).
4. `pgvector` embedding table (`material_embeddings`) prepared with 384-dimensional dense vector support.
5. Hierarchical taxonomy tree (`material_taxonomies`) supports multi-level classification across Mechanical, Electrical, and Chemical domains.
6. Engineering standards equivalence table (`standards_equivalences`) captures cross-standard mapping rules with governance flags.
7. Provisional candidate tables (`material_similarity_matches`, `cnmc_candidates`) separated from approved master records (`cnmc_master`).
8. CPSE material code $\leftrightarrow$ CNMC cross-walk mappings (`cpse_cnmc_mappings`) preserve local codes while linking to national prototype codes.
9. Human review workflow (`governance_reviews`) and append-oriented audit logs (`audit_logs`) implemented.
10. Repeatable seed script (`backend/scripts/seed_demo_data.py`) and Alembic migration (`0002_core_domain_schema`) created and tested.

---

## 2. Verification Classification Matrix (Phase 5)

| Subsystem / Entity | Configuration | Structural Check | Unit-Tested | Live Runtime Verified | Current Status & Notes |
|---|---|---|---|---|---|
| **SQLAlchemy Domain Models (14 Entities)** | ✅ | ✅ | ✅ (Pytest 6/6) | ❌ | **UNIT-TESTED** — All models, relationships, foreign keys, and constraints verified in SQLite in-memory test suite. |
| **Alembic Migration (`0002_core_domain_schema`)** | ✅ | ✅ | ✅ | ❌ | **CONFIGURED & STRUCTURALLY VERIFIED** — Migration script syntax, foreign keys, and upgrade/downgrade paths validated. |
| **Repeatable Seed Data Script** | ✅ | ✅ | ✅ (Async Pytest) | ❌ | **UNIT-TESTED (Async Logic)** — `seed_demo_data.py` designed and unit-tested for repeatable/idempotent seed behavior. Live PostgreSQL execution pending. |
| **PostgreSQL Async Engine** | ✅ | ✅ | ✅ (Driver loaded) | ❌ | **CONFIGURED & STRUCTURALLY VERIFIED** — Live TCP connection unverified due to host daemon state. |
| **`pgvector` Extension** | ✅ | ✅ | ❌ | ❌ | **CONFIGURED (DDL & Model)** — Vector column structure defined; live extension unverified on host. |
| **PostgreSQL RLS** | ✅ (Schema Scoped) | ✅ | ❌ | ❌ | **PENDING** — Tenant boundaries represented in schema; PostgreSQL RLS enforcement remains a future verification step. |
| **Frontend Application Shell** | ✅ | ✅ | ✅ (Vitest 2/2) | ❌ | **UNIT-TESTED** — Intact from Phase 4. |

---

## 3. Strict Boundary Compliance & Zero Scope Creep

- **No Premature AI Engine:** The machine learning matching engine, embedding inference pipelines, and automated NLP parsers were **NOT** implemented in this phase.
- **Synthetic Match Data:** All seeded similarity scores are **manually seeded demonstration values** used strictly to validate data schemas and spec diffing visualizations.
- **MVP Prototype CNMC Format:** All CNMC codes represent the **MVP Prototype CNMC Reference Format** used for SIH demonstration purposes; no official government ratification or national codification is claimed.
- **Application-Level Demonstration Approval:** Governance review records represent demonstration approvals within the prototype workflow.
- **Preserved Source Codes:** The original CPSE material codes (`IOCL-BOLT-001`, `NTPC-MECH-7842`, `SAIL-FAST-219`) are strictly preserved in both `raw_materials` and `cpse_cnmc_mappings`.
