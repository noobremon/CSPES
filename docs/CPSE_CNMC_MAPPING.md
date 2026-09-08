# CPSE ↔ CNMC Cross-Walk Mapping Architecture

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Data Architecture (Phase 8 Reference)  
**Status:** `IMPLEMENTED & UNIT TESTED`  

---

## 1. Cross-Walk Concept & Legacy Code Preservation

The National Unified Material Master Framework operates on a strict **Non-Destructive Coexistence Principle**:

```mermaid
flowchart TD
    subgraph CPSE_A["CPSE Alpha (IOCL ERP)"]
        MAT_A["Local Material Code:\nMAT-1001\n(Hex Bolt SS304 M16x50)"]
    end

    subgraph CPSE_B["CPSE Beta (ONGC ERP)"]
        MAT_B["Local Material Code:\nBOLT-778\n(Stainless Steel Hex Bolt M16x50)"]
    end

    subgraph CPSE_C["CPSE Gamma (NTPC ERP)"]
        MAT_C["Local Material Code:\nNTP-BLT-551\n(M16x50 SS304 IS 1363)"]
    end

    subgraph CrossWalk["Layer 3: CPSE <-> CNMC Cross-Walk Mapping Table (cpse_cnmc_mappings)"]
        MAP_A["Mapping A:\nMAT-1001 <--> IN-IND-MECH-BLT-00492"]
        MAP_B["Mapping B:\nBOLT-778 <--> IN-IND-MECH-BLT-00492"]
        MAP_C["Mapping C:\nNTP-BLT-551 <--> IN-IND-MECH-BLT-00492"]
    end

    subgraph Master["Layer 3: Governed Prototype National Master Catalog (cnmc_master)"]
        CNMC["Approved Prototype CNMC:\nIN-IND-MECH-BLT-00492\n'Hexagon Head Bolt M16x50 SS304 (IS 1363)'"]
    end

    MAT_A --> MAP_A --> CNMC
    MAT_B --> MAP_B --> CNMC
    MAT_C --> MAP_C --> CNMC
```

### Key Principles:
1. **Zero Overwriting of Source ERP Codes:** Legacy material codes (`MAT-1001`, `BOLT-778`) are permanently preserved in Layer 1 and are never overwritten.
2. **Cardinality:** 1 CNMC maps to $N$ CPSE local material codes ($1 : N$). A single local material code possesses at most one active primary mapping to a CNMC.
3. **Traceability:** Each mapping record tracks `raw_material_id`, `normalized_material_id`, `organization_id`, `local_material_code`, `mapping_type`, `approved_by`, and effective date timestamps.

---

## 2. Mapping Types & Lifecycle

| Mapping Type | Description |
|---|---|
| `DIRECT_MATCH` | Canonical specification and attribute signature are structurally identical. |
| `NORMALIZED_MATCH` | Standardized engineering terms match following unit and standard conversion. |
| `FUNCTIONAL_EQUIVALENCE` | Materials differ in minor vendor branding but are functionally interchangeable based on engineering standards. |
| `MANUAL_MAPPING` | Established or overridden directly by a human domain reviewer. |

### Lifecycle States:
- `ACTIVE`: Approved, verified cross-walk binding in effect.
- `UNDER_REVIEW`: Re-evaluated due to updated specification or standard revision.
- `DEPRECATED`: Replaced by a newer CNMC version; historical lineage retained.
