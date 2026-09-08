# Database Entity Relationships & Structural Flow

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** Data Architecture (Phase 5)  
**Status:** `ACTIVE / AUDITED`

---

## 1. Complete Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ SOURCE_SYSTEMS : registers
    ORGANIZATIONS ||--o{ RAW_MATERIALS : owns_layer1
    ORGANIZATIONS ||--o{ NORMALIZED_MATERIALS : owns_layer2
    ORGANIZATIONS ||--o{ CPSE_CNMC_MAPPINGS : binds_layer3
    
    SOURCE_SYSTEMS ||--o{ RAW_MATERIALS : feeds
    
    MATERIAL_TAXONOMIES ||--o{ MATERIAL_TAXONOMIES : parent_child
    MATERIAL_TAXONOMIES ||--o{ NORMALIZED_MATERIALS : classifies
    MATERIAL_TAXONOMIES ||--o{ CNMC_CANDIDATES : categorizes
    MATERIAL_TAXONOMIES ||--o{ CNMC_MASTER : standardizes

    RAW_MATERIALS ||--|| NORMALIZED_MATERIALS : sanitizes_to_layer2
    RAW_MATERIALS ||--o{ CPSE_CNMC_MAPPINGS : crosswalk_source

    NORMALIZED_MATERIALS ||--o{ MATERIAL_ATTRIBUTES : contains_specs
    NORMALIZED_MATERIALS ||--o| MATERIAL_EMBEDDINGS : has_vector
    NORMALIZED_MATERIALS ||--o{ MATERIAL_SIMILARITY_MATCHES : match_source
    NORMALIZED_MATERIALS ||--o{ MATERIAL_SIMILARITY_MATCHES : match_target
    NORMALIZED_MATERIALS ||--o{ CPSE_CNMC_MAPPINGS : mapped_record

    CNMC_CANDIDATES ||--o| CNMC_MASTER : promotes_to
    CNMC_MASTER ||--o{ CPSE_CNMC_MAPPINGS : target_catalog

    STANDARDS_EQUIVALENCES ||--o{ MATERIAL_SIMILARITY_MATCHES : verifies_standards

    GOVERNANCE_REVIEWS ||--o{ CNMC_CANDIDATES : reviews
    GOVERNANCE_REVIEWS ||--o{ MATERIAL_SIMILARITY_MATCHES : signs_off
    GOVERNANCE_REVIEWS ||--o{ CPSE_CNMC_MAPPINGS : approves

    AUDIT_LOGS ||--o{ RAW_MATERIALS : tracks
    AUDIT_LOGS ||--o{ NORMALIZED_MATERIALS : tracks
    AUDIT_LOGS ||--o{ CNMC_MASTER : tracks
    AUDIT_LOGS ||--o{ CPSE_CNMC_MAPPINGS : tracks
```

---

## 2. Complete Demonstration Data Flow: CPSE $\rightarrow$ CNMC

```mermaid
sequenceDiagram
    autonumber
    participant CPSE as CPSE Source ERP (Layer 1)
    participant Raw as RawMaterial Table
    participant NLP as Ingestion / Normalization Worker
    participant Norm as NormalizedMaterial Table (Layer 2)
    participant AI as AI Clustering Engine
    participant Cand as CNMCCandidate Table
    participant Reviewer as Domain Reviewer / Committee
    participant Gov as GovernanceReview Table
    participant Master as CNMCMaster Table (Layer 3)
    participant Map as CPSECNMCMapping Table
    participant Audit as AuditLog Table

    CPSE->>Raw: Import "HEX BOLT M16 X 50 MM SS304" (IOCL-BOLT-001)
    Raw->>Audit: Log RAW_IMPORTED
    
    NLP->>Raw: Extract unparsed description & private fields
    NLP->>Norm: Insert NormalizedMaterial (Canonical Title, UOM: EA, Grade: SS304)
    NLP->>Norm: Insert MaterialAttributes (diameter: 16.0mm, length: 50.0mm)
    Norm->>Audit: Log NORMALIZATION_COMPLETED

    AI->>Norm: Cluster multi-CPSE identical items (IOCL, NTPC, SAIL)
    AI->>Cand: Propose Candidate IN-IND-MECH-BLT-00492 (Status: PENDING_REVIEW)
    Cand->>Audit: Log CANDIDATE_RECOMMENDED

    Reviewer->>Cand: Inspect dimensional diff & IS 1363 / ISO 4016 equivalence
    Reviewer->>Gov: Record Decision APPROVED ("Dimensional and metallurgical equivalence verified")
    
    Gov->>Master: Activate CNMCMaster record IN-IND-MECH-BLT-00492 (Status: ACTIVE)
    Gov->>Map: Bind IOCL-BOLT-001 -> IN-IND-MECH-BLT-00492 (DIRECT_MATCH)
    Gov->>Map: Bind NTPC-MECH-7842 -> IN-IND-MECH-BLT-00492 (NORMALIZED_MATCH)
    Gov->>Map: Bind SAIL-FAST-219 -> IN-IND-MECH-BLT-00492 (NORMALIZED_MATCH)
    Map->>Audit: Log MAPPING_ACTIVATED (Preserves original CPSE codes)
```

---

## 3. Key Relational Safeguards

1. **Original CPSE Material Code Integrity:** `cpse_cnmc_mappings` retains `local_material_code` explicitly alongside foreign key references to `raw_materials.id` and `cnmc_master.id`. No database trigger or update ever alters `raw_materials.material_code`.
2. **Restricted Deletions:** `ON DELETE RESTRICT` on `organizations`, `raw_materials`, and `cnmc_master` prevents cascading accidental deletions of foundational master data.
3. **Cascading Attributes:** `ON DELETE CASCADE` is permitted only on child spec attributes (`material_attributes`) and vector embeddings (`material_embeddings`) when a normalized material is purged.
