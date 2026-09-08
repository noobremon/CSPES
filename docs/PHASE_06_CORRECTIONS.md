# Phase 6 Verification & Safety Hardening Corrections

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** Quality Assurance & Safety Audit (Phase 6 Correction)  
**Status:** `AUDITED / COMPLIANT`

---

## 1. Summary of Phase 6 Corrections Applied

### Correction 1 — Excel .XLS Support Clarification & Safe Rejection
- **Finding:** Initial documentation claimed support for both `.xlsx` and legacy `.xls` using `openpyxl`. In reality, `openpyxl` only supports OpenXML (`.xlsx`) and does not parse legacy binary BIFF8 (`.xls`).
- **Resolution:**
  - Removed all claims of `.xls` support from documentation and API specifications.
  - Implemented explicit detection and safe rejection in `detect_file_type` and API endpoints, returning a structured `HTTP 422 Unprocessable Entity` error: *"Legacy binary Excel format (.xls) is not supported. Please convert the file to OpenXML Excel (.xlsx) or standard CSV format."*
  - Added unit test (`test_xls_legacy_rejection`) validating safe rejection.

### Correction 2 — Sensitive Procurement Data Boundary (Layer 1 Isolation)
- **Finding:** Private purchase order numbers, confidential contract prices, and proprietary supplier identities required explicit architectural isolation guarantees.
- **Resolution:**
  - Confirmed that sensitive procurement fields (`PO_PRICE_INR`, `PO_NUMBER`, `VENDOR_SECRET`) are stored strictly within `raw_materials.source_payload` in **Layer 1** (Tenant-Private Operational Data).
  - Validated that sensitive fields are **NEVER** copied to `normalized_materials.canonical_description`, `material_attributes`, future dense vector embeddings, or Layer 3 shared master records.
  - Added unit test (`test_end_to_end_ingestion_execution_and_sensitive_isolation`) verifying zero leakage into Layer 2.

### Correction 3 — Synchronous Fallback Safety Threshold
- **Finding:** Unbounded synchronous fallback could block web worker threads on large file uploads if Celery/Redis is offline.
- **Resolution:**
  - Implemented a conservative synchronous safety threshold: `MAX_SYNC_INGESTION_ROWS = 250`.
  - If a file exceeds 250 rows and the background Celery worker is offline (or `run_sync=true` is requested), the API rejects synchronous execution with a structured `HTTP 503 Service Unavailable` / `HTTP 400 Bad Request` error, mandating Celery worker processing for large datasets.

### Correction 4 — Duplicate Import Protection vs. Reprocessing Policy
- **Finding:** SHA-256 duplicate detection needed clear differentiation between accidental duplicate uploads and future intentional re-imports.
- **Resolution:**
  - Documented that for the SIH MVP, identical file uploads for the same CPSE in active/completed states are rejected with `HTTP 409 Conflict`, returning the existing `job_id` and status.
  - Clarified that intentional catalog reprocessing or versioned updates will be supported in future phase enhancements via explicit overwrite flags.

### Correction 5 — Deterministic Attribute Extraction Certainty Wording
- **Finding:** Numeric certainty scores could be conflated with machine learning or AI model confidence.
- **Resolution:**
  - Replaced misleading terminology in code docstrings, comments, and documentation.
  - Extracted attributes are categorized under `source="RULE_EXTRACTOR"` with explicit documentation that certainty values (e.g. `0.95`, `0.98`) represent deterministic rule/heuristic weights, NOT machine learning model confidence.

---

## 2. Audited Subsystem Verification Matrix

| Component / Subsystem | Verification Level | Current Status |
|---|---|---|
| **CSV Parser (Delimiter-Sniffed)** | `UNIT-TESTED` | Multi-encoding and auto-delimiter detection verified (Pytest). |
| **Excel Parser (.xlsx OpenXML)** | `UNIT-TESTED` | `openpyxl` OpenXML parsing verified. Legacy `.xls` rejected safely. |
| **Sensitive Data Isolation** | `UNIT-TESTED` | Private fields isolated in Layer 1 `source_payload`. |
| **Synchronous Safety Limit** | `UNIT-TESTED` | Safe 250-row limit enforced on synchronous fallback. |
| **Rule-Based Attribute Extractor** | `UNIT-TESTED` | Deterministic regex extraction verified across mechanical/electrical specs. |
| **Ingestion REST API Endpoints** | `UNIT-TESTED` | Tested via FastAPI AsyncClient (14/14 tests passing). |
| **Live Celery Distributed Broker** | `UNVERIFIED` | Celery task defined; distributed Redis/Worker runtime unverified on host. |
| **Live PostgreSQL Database** | `UNVERIFIED` | SQLite used for unit tests; PostgreSQL daemon offline on host. |
