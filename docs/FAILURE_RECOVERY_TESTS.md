# FAILURE & RECOVERY TEST REPORT

**System:** AI-Powered National Unified Material Master Framework  
**Standard:** Phase 11 Failure & Resilience Verification  
**Status:** IMPLEMENTED & AUTOMATED TEST VERIFIED (`test_failure_recovery.py`)  

---

## 1. Failure Modes & Recovery Matrix

| Scenario | Simulated Fault | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :---: |
| **Empty File Ingestion** | Uploading 0-byte CSV/Excel file | Rejected with `HTTP 400 Bad Request` | `VERIFIED VIA INTEGRATION TEST` |
| **Legacy .xls Binary Excel** | Uploading binary OLE2 Excel file | Rejected with `HTTP 422 Unprocessable Entity` | `VERIFIED VIA INTEGRATION TEST` |
| **Corrupted OpenXML .xlsx** | Uploading malformed zip stream | Rejected with `HTTP 422 Unprocessable Entity` | `VERIFIED VIA INTEGRATION TEST` |
| **Duplicate File Upload** | Re-uploading identical file (SHA-256) | Rejected with `HTTP 409 Conflict` | `VERIFIED VIA INTEGRATION TEST` |
| **Tampered / Malformed JWT** | Forged signature or garbage token | Rejected with `HTTP 401 Unauthorized` | `VERIFIED VIA INTEGRATION TEST` |
| **Non-Existent Entity Query** | Querying random UUID entity | Clean `HTTP 404 Not Found` (no stack traces) | `VERIFIED VIA INTEGRATION TEST` |
| **Celery Worker Offline** | Background worker unavailable | Ingests synchronously if `<= 250` rows or queues | `VERIFIED VIA INTEGRATION TEST` |
| **Cross-Tenant Ingestion** | CPSE Manager uploading for other CPSE | Rejected with `HTTP 403 Forbidden` | `VERIFIED VIA INTEGRATION TEST` |
| **Demo Seeding in Production** | Seeding endpoint called in prod mode | Rejected with `HTTP 403 Forbidden` | `VERIFIED VIA INTEGRATION TEST` |

---

## 2. Information Leakage & Error Sanitization

1. **Standardized Error Envelope**: All API exceptions return `{ "success": False, "error": { "code": "...", "message": "...", "details": [] } }`.
2. **Database Protection**: No raw SQLAlchemy stack traces, table definitions, or internal column structures are exposed to client callers.
3. **Audit Log Sanitization**: Password values and sensitive tokens are strictly excluded from audit payloads (`LOGIN_FAILURE` logs record only actor reference and timestamp).
