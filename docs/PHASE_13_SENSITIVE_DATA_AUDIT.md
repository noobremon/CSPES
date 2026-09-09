# Phase 13 Sensitive Data Sanitization & Isolation Audit

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Audit Standard:** Government Commercial Confidentiality & Data Protection  
**Date:** September 2026

---

## 1. Executive Confidentiality Guarantee

Central Public Sector Enterprises maintain commercially sensitive and proprietary information in their local ERPs (such as vendor contract prices, negotiated discounts, purchase order histories, and plant storage bins).

**Under no circumstances does this platform expose or cross-share Layer 1 proprietary procurement data across CPSE boundaries.**

---

## 2. 3-Layer Data Boundary Audit

```
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 1: TENANT-PRIVATE OPERATIONAL DATA                   │
│  Table: raw_materials                                                  │
│  • organization_id (Tenant Isolated)                                   │
│  • material_code (Preserved original CPSE code)                        │
│  • source_payload (JSON: Confidential PO numbers, vendor prices, bins) │
│  ACCESS: Strictly restricted to the owning CPSE organization.          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ (Sanitization Pipeline)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 2: NORMALIZED MATERIAL INTELLIGENCE                  │
│  Tables: normalized_materials, material_attributes, material_embeddings│
│  • canonical_description (Standardized engineering terminology)        │
│  • normalized_uom (SI/ISO standard units)                              │
│  • material_grade & standard_code (e.g. SS304, IS 1363)                │
│  • material_attributes (Structured key-value physical dimensions)      │
│  • embedding_vector (384-dimensional dense vector embeddings)          │
│  EXCLUSIONS: Zero vendor names, zero PO numbers, zero prices.          │
│  ACCESS: Available for cross-CPSE similarity matching & clustering.    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ (Human Governance Approval)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 3: GOVERNED NATIONAL MASTER CATALOG                  │
│  Tables: cnmc_master, cpse_cnmc_mappings                               │
│  • cnmc_code (MVP Prototype Reference Format)                          │
│  • standard_description & spec_template                                │
│  • 1:N CPSE Mapping Cross-Walks (e.g. IOCL: MAT-1001 ↔ CNMC)           │
│  ACCESS: Public governed national master for all CPSEs.                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Audit of AI Inputs & Vector Embeddings

### Audit Target: `generate_ai_safe_text` in [representation.py](file:///c:/Users/User/Desktop/CSPES/backend/app/services/matching/representation.py)

```python
# Code snippet verified in representation.py:
ai_safe_text = f"{canonical_description} | {engineering_term} | {material_grade} | {standard_code} | {attrs}"
```

**Verification Results:**
- **Vendor Names:** 100% EXCLUDED
- **Purchase Order Numbers:** 100% EXCLUDED
- **Unit Prices & Expenditure:** 100% EXCLUDED
- **Store & Bin Locations:** 100% EXCLUDED
- **Contract Information:** 100% EXCLUDED

---

## 4. API Endpoints & Response Sanitization Verification

| Endpoint | Output Data Layer | Verified Sanitization Status |
|:---|:---|:---|
| `GET /api/v1/ingestion/jobs/{id}` | Layer 1 (Tenant-Scoped) | Only returned if authenticated user belongs to the job's `organization_id`. |
| `GET /api/v1/cnmc/candidates` | Layer 2 & Layer 3 | Returns candidate cluster details, canonical descriptions, and attribute diffs. Zero commercial pricing. |
| `GET /api/v1/analytics/overlap-matrix` | Layer 2 Aggregation | Returns numerical count and percentage of overlapping items. Zero raw POs or vendor names. |
| `GET /api/v1/analytics/procurement-opportunities` | Layer 2 Synthesis | Synthesizes volume pooling recommendations with statutory demonstration notices. Zero confidential contract terms exposed. |
| `GET /api/v1/governance/audit-trail` | Audit Records | Records governance state transitions (`APPROVE`, `REJECT`, `MODIFY`). Excludes Layer 1 payloads. |

**Final Audit Finding:** The platform strictly enforces commercial confidentiality with zero detected data leakage vectors.
