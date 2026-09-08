# END-TO-END SYSTEM WORKFLOW ARCHITECTURE
**System:** AI-Powered National Unified Material Master Framework  
**Standard:** SIH 2026 Core Workflow Reference  
**Status:** FULLY INTEGRATED & AUTOMATED TEST VERIFIED (7/7 Scenarios)

---

## 1. The 13-Step Rationalization Journey

```
STEP 1: CPSE Catalog Ingestion
  Authenticated CPSE Material Manager uploads CSV/XLSX catalog.
  File SHA-256 is hashed; duplicate uploads are blocked (HTTP 409).
       ↓
STEP 2: Validation & Column Discovery
  System parses headers, infers MIME types, and automatically detects column roles
  (Code, Description, UOM, Category, Price, Vendor).
       ↓
STEP 3: Text Normalization
  Standard uppercase normalization, punctuation removal, regex-based standard
  expansion (e.g., "SS 304" -> "STAINLESS STEEL 304", "HEX BOLT" -> "HEXAGON HEAD BOLT").
       ↓
STEP 4: Attribute Extraction
  Deterministic extraction of technical parameters (Dimensions: M16x50, Material Grade: SS304,
  Pressure Rating: Class 150, Standard: IS 1363) stored in relational `MaterialAttribute` records.
       ↓
STEP 5: Commercial Data Airgap Isolation
  Layer 1 raw commercial data (Vendor Names, PO Numbers, Unit Prices, Store Bins)
  is isolated. Only Layer 2 normalized descriptions and technical attributes enter shared intelligence.
       ↓
STEP 6: AI Similarity & Multi-Tier Matching
  Candidate pairs undergo multi-tier similarity processing:
  - Exact Duplicate: Token Jaccard >= 0.90 + exact attribute match
  - Near Duplicate: Token Jaccard >= 0.75 + minor specification variation
  - Functional Equivalence: Equivalent form/fit/function under cross-standards (IS/ASTM/DIN).
       ↓
STEP 7: Explainable Match Evidence
  System generates structured explanation breakdowns detailing shared tokens,
  attribute diffs, and confidence metrics for reviewer transparency.
       ↓
STEP 8: CNMC Recommendation Generation
  Engine generates structured MVP Prototype CNMC Reference codes
  (e.g., `IN-IND-MECH-BLT-01001`) with confidence scoring. Status is set strictly to `PENDING_REVIEW`.
       ↓
STEP 9: Human Governance Decision
  Authenticated Domain Reviewer submits review decision:
  - APPROVE: Transition to `APPROVED`, creates `CNMCMaster` record and `CPSECNMCMapping`.
  - REJECT: Transition to `REJECTED`, no master or mapping created, reason logged.
  - MODIFY: Human overrides code or specification; original recommendation preserved in metadata.
       ↓
STEP 10: Prototype CNMC Mapping Activation
  Approved materials receive active bindings in `cpse_cnmc_mappings` with effective timestamps.
       ↓
STEP 11: Legacy CPSE Code Preservation
  Original CPSE local codes (e.g., `IOCL-BOLT-1001`, `ONGC-BLT-778`) remain preserved.
  No ERP records or legacy identifiers are deleted or overwritten.
       ↓
STEP 12: National Analytics Dynamic Reflection
  All 7 national analytics views dynamically refresh KPIs, overlap matrices,
  joint procurement opportunities, and rationalization priorities.
       ↓
STEP 13: Immutable Audit Trail Logging
  All pipeline events, governance actions, user overrides, and auth events are
  written to append-only `AuditLog` records for complete regulatory compliance.
```

---

## 2. Component Integration Status

| Pipeline Stage | Backend Handler / Engine | Database Entities Involved | Governance Boundary | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **Ingestion** | `execute_ingestion_job()` | `IngestionJob`, `RawMaterial` | Tenant-scoped isolation | `VERIFIED` |
| **Normalization** | `normalize_text()`, `normalize_uom()` | `NormalizedMaterial` | Strips proprietary fields | `VERIFIED` |
| **Extraction** | `extract_attributes()` | `MaterialAttribute` | Technical parameters only | `VERIFIED` |
| **Matching** | `calculate_similarity()`, `compute_token_jaccard()` | `MaterialCluster`, `SimilarityMatch` | No commercial data input | `VERIFIED` |
| **Recommendation** | `recommend_cnmc_for_cluster()` | `CNMCCandidate` | AI recommends ONLY; status=PENDING | `VERIFIED` |
| **Governance** | `GovernanceWorkflowService.review_candidate()` | `CNMCCandidate`, `GovernanceReview` | Human authorization mandatory | `VERIFIED` |
| **Master & Mapping**| `_ensure_cnmc_master()`, `_create_cpse_mapping()` | `CNMCMaster`, `CPSECNMCMapping` | Legacy CPSE codes preserved | `VERIFIED` |
| **Analytics** | `/api/v1/analytics/*` | Aggregations over L2/L3 | Zero L1 commercial leakage | `VERIFIED` |
| **Audit Logging** | `record_audit_log()` | `AuditLog` | Immutable append-only | `VERIFIED` |
