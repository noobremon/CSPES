# RBAC PERMISSION & OPERATIONAL SCOPE MATRIX

**Standard:** ADR-007  
**Scope:** SIH 2026 Material Governance Platform  
**Status:** IMPLEMENTED & AUTOMATED TEST VERIFIED  

---

## 1. Role Definitions & Scopes

| Role Code | Display Name | Operational Scope | Layer 1 (Raw ERP) | Layer 2 (Normalized) | Layer 3 (CNMC Master) | National Analytics |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `NATIONAL_MASTER_ADMIN` | National Master Admin | National (All Tenants) | ❌ Blocked | ✅ Read | ✅ Read / Manage | ✅ Full Access |
| `CPSE_MATERIAL_MANAGER` | CPSE Material Manager | Tenant-Scoped (Own CPSE) | ✅ Own CPSE Only | ✅ Own + Cross-walk | ❌ View Only | ✅ National View |
| `DOMAIN_REVIEWER` | Domain Reviewer | National Technical Domain | ❌ Blocked | ✅ Read / Match | ✅ Approve / Reject | ✅ Full Access |
| `AUDITOR` | National Auditor | National Read-Only | ❌ Blocked | ✅ Read | ✅ Read | ✅ Full Access |

---

## 2. Granular Action Matrix

| Feature / API Endpoint | `NATIONAL_MASTER_ADMIN` | `CPSE_MATERIAL_MANAGER` | `DOMAIN_REVIEWER` | `AUDITOR` |
| :--- | :---: | :---: | :---: | :---: |
| **Ingestion - File Discovery (`/discover`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Forbidden (403) |
| **Ingestion - File Upload (`/upload`)** | ❌ Blocked (Airgap) | ✅ Allowed (Own CPSE) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Raw ERP Payloads & PO Data (Layer 1)** | ❌ Blocked (Airgap) | ✅ Allowed (Own CPSE) | ❌ Blocked (Airgap) | ❌ Blocked (Airgap) |
| **Normalization View & Attributes (Layer 2)**| ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Read-Only |
| **Similarity Search & Duplication Engine** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Read-Only |
| **CNMC Recommendation Generation** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Read-Only |
| **Candidate Review (APPROVE / REJECT / MODIFY)**| ✅ Allowed | ❌ Forbidden (403) | ✅ Allowed | ❌ Forbidden (403) |
| **National Analytics & Opportunity Engine**| ✅ Full Access | ✅ Aggregated View | ✅ Full Access | ✅ Full Access |
| **Audit Log Inspection** | ✅ Full Access | ❌ Own CPSE Only | ✅ Full Access | ✅ Full Access |

---

## 3. Critical Security Boundaries

### A. National Admin Layer 1 Commercial Airgap
- `NATIONAL_MASTER_ADMIN` focuses on **national macro analytics, standard master data, organization governance, and audit trails**.
- `NATIONAL_MASTER_ADMIN` does **NOT** have access to tenant-private raw ERP payloads, local vendor names, PO numbers, or confidential pricing agreements.
- Server-side dependency `validate_raw_layer1_access` strictly enforces this separation.

### B. Auditor Read-Only Enforcement
- The `AUDITOR` persona cannot initiate uploads, trigger batch jobs, or submit governance approval decisions. Any mutating attempt is rejected with `HTTP 403 Forbidden`.
