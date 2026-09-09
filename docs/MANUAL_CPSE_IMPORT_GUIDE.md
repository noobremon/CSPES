# Manual CPSE Material Master Import Guide

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Target User:** CPSE Material Managers & Procurement Officers  
**Date:** September 2026

---

## 1. Overview & Supported File Formats

The platform provides a secure, tenant-isolated manual ingestion portal for onboarding material master catalogs from participating CPSEs.

### Supported Formats
- **Standard CSV (`.csv`):** UTF-8 or Latin-1 encoded files with comma, semicolon, tab, or pipe delimiters.
- **OpenXML Excel (`.xlsx`):** Modern Microsoft Excel workbooks.

### Explicitly Rejected Formats
- **Legacy Binary Excel (`.xls`):** Explicitly rejected by the parsing engine (`422 Unprocessable Entity`) due to security and parsing vulnerabilities. Users are instructed to convert files to `.xlsx` or `.csv`.

---

## 2. Ingestion Security & Isolation Rules

1. **Strict Tenant Boundaries:** Every uploaded catalog is bound to the user's authorized `organization_id`. Cross-tenant ingestion is blocked (`403 Forbidden`).
2. **Duplicate Upload Protection:** Every file undergoes SHA-256 cryptographic hashing. If an identical file has already been processed for the organization, the system halts duplicate processing (`409 Conflict`).
3. **File Size Boundary:** Maximum file size is strictly enforced at **50 MB**.
4. **Processing Threshold:** In-process synchronous ingestion runs for jobs with $\le 250$ rows; larger jobs are dispatched asynchronously to background Celery workers.

---

## 3. Step-by-Step Upload Workflow

```
1. Select / Confirm Organization
        ↓
2. Upload CSV / OpenXML XLSX File
        ↓
3. Automated Column Discovery & Preview
        ↓
4. Confirm Canonical Column Mappings
        ↓
5. Ingestion Engine Executes (Normalization & Attribute Extraction)
        ↓
6. Review Job Status & Validation Metrics
```

### Canonical Column Mappings
| Detected File Header Examples | Canonical System Field | Required | Description |
|:---|:---|:---:|:---|
| `material_code`, `mat_code`, `item_no` | `material_code` | **YES** | Local CPSE material code (preserved immutably). |
| `description`, `short_text`, `item_name` | `material_description` | **YES** | Raw CPSE material description. |
| `specification`, `spec_text`, `technical_spec` | `specification_text` | NO | Technical engineering parameters and standards. |
| `uom`, `unit`, `unit_of_measure`, `base_uom` | `uom` | **YES** | Unit of measurement. |
| `category`, `cat_code`, `material_group` | `category_code` | NO | Local CPSE category code. |

---

## 4. API Endpoints for Ingestion

- `POST /api/v1/ingestion/discover` — Previews columns and sample rows without saving data.
- `POST /api/v1/ingestion/upload` — Validates tenant access, checks SHA-256 hash, and creates the `IngestionJob`.
- `POST /api/v1/ingestion/jobs/{job_id}/process` — Executes the normalization, attribute extraction, and Layer 1/Layer 2 separation.
- `GET /api/v1/ingestion/jobs/{job_id}/status` — Returns job status (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`).
- `GET /api/v1/ingestion/jobs/{job_id}/errors` — Returns row-level validation errors.
