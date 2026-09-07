# Database & Data Model Audit

**System:** AI-Powered National Unified Material Master Framework  
**Scope:** Schemas, Relational Models, Vector Embeddings, Migration Layer & Data Integrity  
**Audit Classification:** Phase 1 — Discovery & Baseline Audit

---

## 1. Executive Summary

An audit of the database configurations, migrations, schema files, and data storage drivers in `c:\Users\User\Desktop\CSPES` was conducted.

| Database Dimension | Physical Repository State | Classification |
|---|---|---|
| **Active DB Instances** | Not Present | **CONFIRMED NOT PRESENT** |
| **Migration Scripts (`alembic`, `prisma`)** | Not Present | **CONFIRMED NOT PRESENT** |
| **Schema Definitions & ORM Models** | Not Present | **CONFIRMED NOT PRESENT** |
| **Documentation & ADR Reference** | Present in `/docs` | **CURRENTLY IMPLEMENTED** |

---

## 2. Relational & Vector Schema Blueprint (PROPOSED — NOT YET APPROVED)

The following schema architecture is proposed for review and formal validation in **Phase 2 — Product & System Design**:

```mermaid
erDiagram
    CPSE ||--o{ USER : employs
    CPSE ||--o{ RAW_MATERIAL : owns
    RAW_MATERIAL ||--o| NORMALIZED_MATERIAL : maps_to
    NORMALIZED_MATERIAL }o--|| CNMC_MASTER : harmonized_into
    NORMALIZED_MATERIAL ||--o| MATERIAL_EMBEDDING : vector_representation
    NORMALIZED_MATERIAL ||--o{ SIMILARITY_MATCH : source
    NORMALIZED_MATERIAL ||--o{ SIMILARITY_MATCH : target
    SIMILARITY_MATCH ||--o{ AUDIT_LOG : governed_by
    USER ||--o{ AUDIT_LOG : performs

    CPSE {
        uuid id PK
        string code
        string name
        string sector
        string erp_system
        jsonb metadata
    }

    USER {
        uuid id PK
        uuid cpse_id FK
        string email
        string full_name
        string role
        string password_hash
        boolean is_active
        timestamp created_at
    }

    RAW_MATERIAL {
        uuid id PK
        uuid cpse_id FK
        string local_material_code
        string legacy_description
        string uom
        decimal unit_price
        string plant_location
        jsonb raw_attributes
        timestamp ingested_at
    }

    NORMALIZED_MATERIAL {
        uuid id PK
        uuid raw_material_id FK
        string item_name
        string category
        string sub_category
        string standard_code
        string material_grade
        jsonb technical_specs
        string normalized_uom
        string cnmc_code FK
        string harmonization_status
    }

    MATERIAL_EMBEDDING {
        uuid id PK
        uuid normalized_material_id FK
        vector embedding
        timestamp updated_at
    }

    CNMC_MASTER {
        string cnmc_code PK
        string canonical_name
        string standard_description
        string category
        jsonb standard_spec_template
        timestamp created_at
    }

    SIMILARITY_MATCH {
        uuid id PK
        uuid source_material_id FK
        uuid target_material_id FK
        float exact_match_score
        float semantic_score
        float spec_compatibility_score
        float combined_confidence
        string match_type
        string status
    }

    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        string entity_type
        uuid entity_id
        string action
        jsonb previous_state
        jsonb new_state
        text justification
        timestamp timestamp
    }
```

---

## 3. Technology Decisions Pending

- **Primary Database & Multi-Tenancy:** **FUTURE PHASE DECISION REQUIRED** (`ADR-003`: PostgreSQL 16+ with Row-Level Security vs. Multi-schema).
- **Vector Search Engine:** **FUTURE PHASE DECISION REQUIRED** (`ADR-004`: PostgreSQL `pgvector` extension vs. Standalone Qdrant / FAISS).
- **ORM / Migration Tooling:** **FUTURE PHASE DECISION REQUIRED** (SQLAlchemy + Alembic vs. Prisma ORM).
