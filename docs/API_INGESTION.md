# Ingestion API Specification

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** API Specifications & Integration Contract (Phase 6)  
**Base URL:** `/api/v1/ingestion`  
**Status:** `ACTIVE / AUDITED`

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/ingestion/discover` | Inspects an uploaded CSV or Excel file and returns detected column headers, preview rows, and suggested mappings. |
| `POST` | `/api/v1/ingestion/upload` | Uploads a file, performs SHA-256 duplicate validation, stores file in controlled storage, and registers an `IngestionJob`. |
| `POST` | `/api/v1/ingestion/{job_id}/process` | Submits the column mapping dictionary and triggers validation, raw preservation, normalization, and attribute extraction. |
| `GET` | `/api/v1/ingestion/{job_id}` | Retrieves the current ingestion job status, total rows, processed rows, and failed rows. |
| `GET` | `/api/v1/ingestion/{job_id}/errors` | Retrieves the detailed row-level error log for a job. |

---

## 2. Detailed Endpoint Contracts

### 2.1 Inspect File Headers (`POST /api/v1/ingestion/discover`)
- **Request:** `multipart/form-data` with `file` field (`.csv` or `.xlsx`).
- **Response (HTTP 200):**
```json
{
  "filename": "indianoil_materials_demo.csv",
  "file_type": "CSV",
  "detected_columns": [
    "MAT_CODE",
    "ITEM_DESCRIPTION",
    "SPEC_DETAILS",
    "UOM",
    "MATERIAL_GROUP",
    "OEM_NAME",
    "PO_PRICE_INR"
  ],
  "estimated_row_count": 6,
  "sample_rows": [
    {
      "MAT_CODE": "IOCL-BOLT-001",
      "ITEM_DESCRIPTION": "HEX BOLT M16 X 50 MM SS304",
      "SPEC_DETAILS": "IS 1363 / ISO 4016 GRADE SS304 COARSE THREAD",
      "UOM": "NOS",
      "MATERIAL_GROUP": "FASTENERS",
      "OEM_NAME": "Unbrako Fasteners",
      "PO_PRICE_INR": "48.50"
    }
  ],
  "suggested_mapping": {
    "material_code": "MAT_CODE",
    "description": "ITEM_DESCRIPTION",
    "specification": "SPEC_DETAILS",
    "unit_of_measure": "UOM",
    "category": "MATERIAL_GROUP",
    "manufacturer": "OEM_NAME"
  }
}
```

---

### 2.2 Upload Catalog File (`POST /api/v1/ingestion/upload`)
- **Request:** `multipart/form-data` with:
  - `organization_id` (UUID): Target CPSE organization ID
  - `source_system_id` (Optional UUID): Source ERP ID
  - `file`: CSV or Excel file binary
- **Response (HTTP 201 Created):**
```json
{
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organization_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "original_filename": "indianoil_materials_demo.csv",
  "file_type": "CSV",
  "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "status": "QUEUED",
  "detected_columns": ["MAT_CODE", "ITEM_DESCRIPTION", "UOM"],
  "sample_rows": [...],
  "suggested_mapping": {"material_code": "MAT_CODE", "description": "ITEM_DESCRIPTION"},
  "created_at": "2026-09-08T02:00:00Z"
}
```

---

### 2.3 Submit Mapping & Process (`POST /api/v1/ingestion/{job_id}/process`)
- **Request Body:**
```json
{
  "column_mapping": {
    "material_code": "MAT_CODE",
    "description": "ITEM_DESCRIPTION",
    "specification": "SPEC_DETAILS",
    "unit_of_measure": "UOM",
    "category": "MATERIAL_GROUP",
    "manufacturer": "OEM_NAME"
  }
}
```
- **Query Parameters:** `run_sync=true` (optional, for synchronous execution).
- **Response (HTTP 200):**
```json
{
  "message": "Ingestion job executed synchronously.",
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "execution_mode": "SYNCHRONOUS",
  "result": {
    "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "COMPLETED",
    "total_rows": 6,
    "processed_rows": 6,
    "failed_rows": 0,
    "error_count": 0
  }
}
```

---

### 2.4 Get Job Status (`GET /api/v1/ingestion/{job_id}`)
- **Response (HTTP 200):**
```json
{
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organization_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "source_system_id": null,
  "original_filename": "indianoil_materials_demo.csv",
  "file_type": "CSV",
  "status": "COMPLETED",
  "total_rows": 6,
  "processed_rows": 6,
  "failed_rows": 0,
  "column_mapping": {"material_code": "MAT_CODE", "description": "ITEM_DESCRIPTION"},
  "error_summary": null,
  "created_at": "2026-09-08T02:00:00Z",
  "updated_at": "2026-09-08T02:00:05Z"
}
```

---

### 2.5 Get Row Errors (`GET /api/v1/ingestion/{job_id}/errors`)
- **Response (HTTP 200):**
```json
{
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "total_errors": 1,
  "errors": [
    {
      "row_number": 12,
      "column": "MAT_CODE",
      "reason": "Missing required material code."
    }
  ]
}
```
