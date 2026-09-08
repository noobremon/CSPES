# SECURITY BOUNDARIES & AIRGAP ARCHITECTURE

**System:** AI-Powered National Unified Material Master Framework  
**Standard:** ADR-007  
**Status:** IMPLEMENTED & AUTOMATED TEST VERIFIED  

---

## 1. Multi-Layer Commercial Airgap Architecture

The platform separates material intelligence into 3 distinct governance layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    3-LAYER GOVERNANCE & DATA BOUNDARIES                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LAYER 1: TENANT-PRIVATE RAW ERP DATA                                   │
│  - Raw file uploads, local descriptions, vendor names, PO numbers       │
│  - Boundary: Accessible ONLY by CPSE Material Manager of that tenant.    │
│  - Blocked: National Master Admin, Domain Reviewer, Auditor (HTTP 403). │
│                                                                         │
│  LAYER 2: NORMALIZED CATALOG INTELLIGENCE                               │
│  - Standardized noun-modifier attributes, clean units, embeddings       │
│  - Commercial airgap: PO numbers & vendor names stripped.               │
│  - Boundary: Shared for deduplication, similarity matching & analytics. │
│                                                                         │
│  LAYER 3: GOVERNED MVP PROTOTYPE CNMC MASTER RECORDS                    │
│  - National standardized CNMC codification and canonical specifications.│
│  - Boundary: Full read across all CPSEs; mutated only via Governance.   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Server-Side Enforcement Dependencies

| Dependency / Guard | Target | Rejection Behavior |
| :--- | :--- | :--- |
| `validate_tenant_access(org_id, user)` | Ingestion uploads & job processing | Blocks CPSE Manager if `org_id != user.organization_id` (403). |
| `validate_raw_layer1_access(org_id, user)` | Raw ERP records, vendor details | Blocks National Admin, Reviewer, Auditor, other tenants (403). |
| `require_roles(*roles)` | Governance decision submissions | Blocks CPSE Managers & Auditors from approving CNMC codes (403). |
| `is_token_jti_revoked(jti)` | Token refresh & authenticated routes | Rejects rotated, revoked, or logged-out tokens (401). |
| Environment Guard | Demo user seeding endpoint | Rejects execution when `ENVIRONMENT=production` (403). |
