# Database & Storage Architecture (ADR-003 & ADR-004 Approved)

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** System Architecture (Phase 3)  
**Technology Decision:** PostgreSQL 16+ with `pgvector` Extension + Shared Schema with Row-Level Security (RLS)  
**Status:** `APPROVED`

---

## 1. Decision Records (ADR-003 & ADR-004 Finalization)

### Selected Database Engine: PostgreSQL 16+ with `pgvector`
- **Primary Database (ADR-003):** PostgreSQL 16+ utilizing a **Shared Schema with Row-Level Security (RLS)** and `cpse_id` tenant isolation.
  - *Data Isolation Model:* Strict multi-tenant boundaries on Layer 1 private operational data via RLS, while enabling cross-CPSE deduplication and aggregate analytics on sanitized Layer 2 and Layer 3 data structures.
- **Vector Search Engine (ADR-004):** **`pgvector` Extension** with HNSW (Hierarchical Navigable Small World) index.
  - *Rationale:* Eliminates dual-database synchronization lag, provides ACID transactional consistency between material metadata and vector embeddings, and simplifies local Docker Compose deployment for SIH evaluation.

---

## 2. Multi-Tier Data Model & Entity Relationships (ERD)

```mermaid
erDiagram
    CPSE ||--o{ USER : employs
    CPSE ||--o{ RAW_MATERIAL : owns_layer1
    CPSE ||--o{ CPSE_CNMC_MAPPING : binds_layer3
    RAW_MATERIAL ||--o| NORMALIZED_MATERIAL : sanitizes_to_layer2
    NORMALIZED_MATERIAL ||--o| MATERIAL_EMBEDDING : has_vector
    NORMALIZED_MATERIAL ||--o{ SIMILARITY_MATCH : source_layer2
    NORMALIZED_MATERIAL ||--o{ SIMILARITY_MATCH : target_layer2
    NORMALIZED_MATERIAL }o--o| CPSE_CNMC_MAPPING : maps_into
    CPSE_CNMC_MAPPING }o--|| CNMC_MASTER : harmonized_layer3
    SIMILARITY_MATCH ||--o{ AUDIT_LOG : governed_by
    USER ||--o{ AUDIT_LOG : triggers

    CPSE {
        uuid id PK
        string code "e.g., ONGC, BHEL, IOCL"
        string name
        string sector
        string erp_system "SAP, Oracle, Custom"
        jsonb config
        timestamp created_at
    }

    USER {
        uuid id PK
        uuid cpse_id FK
        string email
        string full_name
        string role "NATIONAL_ADMIN, CPSE_ADMIN, MM_MANAGER, REVIEWER, AUDITOR"
        string password_hash
        boolean is_active
        timestamp created_at
    }

    RAW_MATERIAL {
        uuid id PK
        uuid cpse_id FK
        string local_code
        text raw_description
        string raw_uom
        decimal unit_price "Layer 1 Private Data"
        string plant_code "Layer 1 Private Data"
        jsonb raw_metadata "Layer 1 Private Data"
        timestamp ingested_at
    }

    NORMALIZED_MATERIAL {
        uuid id PK
        uuid raw_material_id FK
        uuid cpse_id FK
        string canonical_title
        string category
        string sub_category
        string standard_code "IS, DIN, ISO, ASTM"
        string material_grade
        jsonb specs "Dimensions, Pressure, Finish (Layer 2 Sanitized)"
        string normalized_uom
        string status "RAW, NORMALIZED, PENDING_REVIEW, HARMONIZED"
        timestamp updated_at
    }

    MATERIAL_EMBEDDING {
        uuid id PK
        uuid normalized_material_id FK
        vector embedding "384-dimensional vector"
        timestamp generated_at
    }

    CNMC_MASTER {
        string cnmc_code PK "IN-IND-MECH-BLT-00492 (Prototype Format)"
        string canonical_name
        text standard_description
        string category
        jsonb spec_template
        string status "ACTIVE, DEPRECATED"
        timestamp created_at
    }

    CPSE_CNMC_MAPPING {
        uuid id PK
        uuid cpse_id FK
        string local_material_code
        string cnmc_code FK
        string status "ACTIVE, DEPRECATED"
        uuid approved_by FK
        timestamp effective_from
        timestamp effective_to
    }

    SIMILARITY_MATCH {
        uuid id PK
        uuid source_material_id FK
        uuid target_material_id FK
        float lexical_score
        float vector_score
        float attribute_score
        float composite_confidence
        string match_type "EXACT, DUPLICATE, NEAR_DUPLICATE, FUNCTIONAL_EQUIVALENT"
        string status "PROPOSED, APPROVED, REJECTED"
        jsonb explainability_card
        timestamp created_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid actor_id FK
        uuid cpse_id FK
        string action "INGEST, CLUSTER, APPROVE, REJECT, MAP_CNMC"
        string entity_type "MATERIAL, MATCH, CNMC, USER"
        uuid entity_id
        jsonb before_state
        jsonb after_state
        text justification
        timestamp timestamp
    }
```

---

## 3. Data Tier Segregation & Row-Level Security (RLS)

1. **Layer 1: Private Operational Isolation:**
   - The `raw_material` table is strictly protected by PostgreSQL Row-Level Security:
     ```sql
     ALTER TABLE raw_material ENABLE ROW LEVEL SECURITY;
     CREATE POLICY cpse_raw_tenant_isolation ON raw_material
     FOR ALL USING (cpse_id = NULLIF(current_setting('app.current_cpse_id', true), '')::uuid);
     ```
2. **Layer 2: Sanitized Intelligence Access:**
   - The `normalized_material` and `material_embedding` tables omit private vendor and raw pricing attributes. They are queried by the background AI matching worker across CPSE boundaries to discover duplicate candidates without exposing proprietary procurement contracts.
3. **Layer 3: Governed Master Integrity:**
   - The `audit_log` table is append-only. Database triggers revoke `UPDATE` and `DELETE` operations, guaranteeing non-repudiation.

---

## 4. Vector Search Performance Targets

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW Index on dense embeddings
CREATE INDEX idx_material_embedding_hnsw 
ON material_embedding 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

*Performance Note:* Target candidate retrieval latency is $\le 100\text{ ms}$ on indexed 384-dimensional embeddings. Actual performance is subject to hardware specifications, index build parameters ($M, \text{ef\_construction}$), and dataset benchmark validation.
