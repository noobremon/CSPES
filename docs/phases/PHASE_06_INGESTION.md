# Phase 6 — Material Ingestion & Normalization Pipeline

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** Phase Execution & Architecture Log (Phase 6)  
**Status:** `COMPLETE / AUDITED`

---

## 1. Phase 6 Objectives & Achievements

Phase 6 implements the foundational data ingestion and normalization pipeline, enabling Central Public Sector Enterprises (CPSEs) to upload raw material master catalogs in heterogeneous CSV and OpenXML Excel (`.xlsx`) formats.

### Key Capabilities Delivered:
1. **Multi-Format Ingestion:** Full parsing support for CSV (with auto-delimiter sniffing) and OpenXML Excel (`.xlsx`) workbooks. Legacy `.xls` binary files are explicitly rejected with structured HTTP 422 errors.
2. **Column Discovery & Preview:** Dynamic header extraction, row estimation, and heuristic column mapping suggestions.
3. **Configurable Column Mapping:** Flexible contract mapping custom CPSE headers to canonical fields (`material_code`, `description`, `specification`, `unit_of_measure`, `category`, `manufacturer`, `oem_part_number`).
4. **Data Isolation & Raw Preservation:** Original CPSE material codes, unparsed descriptions, raw UOMs, and private purchase order details are preserved verbatim in Layer 1 (`raw_materials`).
5. **Deterministic Normalization:** Standardized whitespace cleaning, punctuation noise removal, dimension multiplier formatting, and conservative unit of measure standardization in Layer 2 (`normalized_materials`).
6. **Rule-Based Attribute Extraction:** Deterministic regex pattern matching extracting dimensions, metallurgy grades, pressure classes, nominal sizes, and electrical specs into `material_attributes` (categorized under `source="RULE_EXTRACTOR"`).
7. **Import Batch Tracking:** Managed via `ingestion_jobs` with lifecycle states (`QUEUED`, `PROCESSING`, `COMPLETED`, `PARTIALLY_COMPLETED`, `FAILED`).
8. **Row-Level Error Isolation:** Structured row error tracking without crashing batch execution.
9. **Duplicate Upload Protection:** SHA-256 file checksum validation preventing redundant imports.
10. **Background Job Architecture & Sync Safety:** Celery task integration (`process_ingestion_batch_task`) with direct synchronous fallback limited to $\le 250$ rows.

---

## 2. Verification Classification Matrix (Phase 6)

| Subsystem / Feature | Configuration | Structural Check | Unit-Tested | Live Runtime Verified | Current Status & Notes |
|---|---|---|---|---|---|
| **CSV & Excel Parsers** | ✅ | ✅ | ✅ (Pytest 14/14) | ❌ | **UNIT-TESTED** — Stream parsing, header detection, and `.xls` rejection verified. |
| **Sensitive Data Isolation** | ✅ | ✅ | ✅ (Pytest) | ❌ | **UNIT-TESTED** — Private PO prices and vendor data isolated strictly in Layer 1. |
| **Sync Fallback Limit (250 rows)** | ✅ | ✅ | ✅ (Pytest) | ❌ | **UNIT-TESTED** — Prevents web worker starvation on large files. |
| **Column Discovery & Mapping** | ✅ | ✅ | ✅ (Pytest) | ❌ | **UNIT-TESTED** — Heuristic mapping and required field validation verified. |
| **Normalization Services** | ✅ | ✅ | ✅ (Pytest) | ❌ | **UNIT-TESTED** — String cleaning and conservative UOM mapping verified. |
| **Attribute Extractor** | ✅ | ✅ | ✅ (Pytest) | ❌ | **UNIT-TESTED** — Deterministic regex extraction verified across mechanical and electrical specs. |
| **Ingestion Engine & DB Layer** | ✅ | ✅ | ✅ (Async SQLite) | ❌ | **UNIT-TESTED** — Full row validation, Layer 1 preservation, Layer 2 normalization, and audit logging verified. |
| **Celery Ingestion Task** | ✅ | ✅ | ✅ (Imported) | ❌ | **CONFIGURED & STRUCTURALLY VERIFIED** — Task function defined; live distributed execution unverified on host. |
| **Ingestion REST API Endpoints** | ✅ | ✅ | ✅ (FastAPI AsyncClient) | ❌ | **UNIT-TESTED** — `/discover`, `/upload`, `/process`, and `/errors` endpoints verified. |

---

## 3. Strict Boundary Compliance & Zero Scope Creep

- **No AI Similarity Matching:** No sentence-transformer embeddings or machine learning similarity matching algorithms were implemented in Phase 6.
- **No External LLM Calls:** All normalization and attribute extraction logic is strictly deterministic and rule-based.
- **No Real SAP Integration:** Direct SAP BAPI/IDoc connectivity is deferred to future enterprise connectors.
- **No Premature Full Auth:** Ingestion routes operate on organization IDs without requiring JWT/RBAC middleware.
- **Preserved Source Codes:** Original CPSE material codes are never overwritten by normalization.
