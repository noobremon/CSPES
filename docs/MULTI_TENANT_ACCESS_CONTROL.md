# MULTI-TENANT ACCESS CONTROL & TENANT ISOLATION

**Standard:** ADR-007  
**Status:** IMPLEMENTED & AUTOMATED TEST VERIFIED  

---

## 1. Multi-Tenant Tenancy Model

The system employs a shared-schema, tenant-isolated architecture where all CPSE catalogs are tied to the `organizations` table.

- `CPSE_MATERIAL_MANAGER` users have a non-null `organization_id` foreign key.
- Server-side dependency `validate_tenant_access` ensures that CPSE Material Managers cannot upload files, trigger jobs, or modify records belonging to other CPSEs.
- Cross-tenant upload attempts are rejected with `HTTP 403 Forbidden`.

---

## 2. Layer 1 Commercial Data Isolation

To prevent industrial espionage and protect confidential procurement pricing:
- Raw Layer 1 ERP files and line item records are restricted strictly to the designated `CPSE_MATERIAL_MANAGER` of that organization via `validate_raw_layer1_access`.
- Privileged national personas (`NATIONAL_MASTER_ADMIN`, `DOMAIN_REVIEWER`, `AUDITOR`) operate on normalized Layer 2 concepts and approved Layer 3 CNMC records, protecting proprietary CPSE vendor agreements.
