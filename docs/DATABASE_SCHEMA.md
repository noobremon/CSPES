# Database Schema Specification

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** Technical Data Architecture (Phase 5)  
**Database Engine:** PostgreSQL 16+ with `pgvector`  
**Status:** `ACTIVE / AUDITED`

---

## 1. Architectural Principles & Isolation Guarantees

1. **Multi-Tenant Preservation:** Original CPSE material codes, proprietary vendor identities, and contract pricing are preserved without modification in **Layer 1** and are NEVER overwritten by normalization routines.
2. **Layered Intelligence Separation:** Raw ERP records (Layer 1) $\rightarrow$ Sanitized Normalized Intelligence (Layer 2) $\rightarrow$ Governed Prototype Master Catalog (Layer 3).
3. **AI Candidate Separation:** Similarity matches and CNMC recommendations are stored as provisional candidates requiring explicit human domain approval before entering the active demonstration master catalog.
4. **Append-Oriented Governance:** All administrative actions, approvals, and mapping activations are logged with append-oriented audit trails.
5. **Universal Identifiers:** UUID primary keys are utilized across all relational entities.
6. **Tenant Isolation Status:** Tenant boundaries are represented in the schema and application design (`organization_id` foreign keys). PostgreSQL RLS enforcement remains a future implementation/verification step.
7. **MVP Prototype Status:** CNMC codes represent the **MVP Prototype CNMC Reference Format** used for SIH demonstration purposes, and do not imply official Government of India codification.

---

## 2. Comprehensive Table Definitions

### 2.1 Table: `organizations` (CPSEs)
Represents participating demonstration Central Public Sector Enterprises (e.g., IOCL, NTPC, SAIL, CIL, BHEL).

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique organization identifier |
| `code` | `VARCHAR(50)` | `UNIQUE, NOT NULL, INDEX` | Short organizational identifier (e.g. `IOCL`, `NTPC`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full legal organization name |
| `sector` | `VARCHAR(100)` | `NOT NULL` | Industrial sector (e.g. `Oil & Gas`, `Power Generation`) |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'ACTIVE'` | Operational status (`ACTIVE`, `INACTIVE`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Last update timestamp |

---

### 2.2 Table: `source_systems`
Represents source ERPs, procurement databases, or CSV batch feeds.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique system identifier |
| `organization_id` | `UUID` | `NOT NULL, FK -> organizations.id ON DELETE CASCADE` | Owning CPSE |
| `name` | `VARCHAR(100)` | `NOT NULL` | System name (e.g. `IOCL Refinery SAP ECC`) |
| `system_type` | `VARCHAR(50)` | `NOT NULL` | Technology (`SAP`, `ORACLE`, `LEGACY_ERP`, `CSV_IMPORT`) |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Active ingest flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Last modification timestamp |

---

### 2.3 Table: `material_taxonomies`
Hierarchical material classification system (Level 1: Domain $\rightarrow$ Level 2: Group $\rightarrow$ Level 3: Family $\rightarrow$ Level 4: Class).

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique category identifier |
| `code` | `VARCHAR(100)` | `UNIQUE, NOT NULL, INDEX` | Structured taxonomy code (`IND-MECH-FAST-BLT`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Category name (`Hexagon Head Bolts & Studs`) |
| `parent_id` | `UUID` | `NULLABLE, FK -> material_taxonomies.id ON DELETE SET NULL` | Parent node in hierarchy |
| `level` | `INTEGER` | `NOT NULL, DEFAULT 1` | Depth level in tree (1 to 4) |
| `path` | `VARCHAR(500)` | `NOT NULL` | Full breadcrumb path |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Active flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Update timestamp |

---

### 2.4 Table: `raw_materials` (Layer 1: Private Operational Data)
Preserves original CPSE ERP material records.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique raw record identifier |
| `organization_id` | `UUID` | `NOT NULL, FK -> organizations.id ON DELETE RESTRICT` | Owning CPSE |
| `source_system_id` | `UUID` | `NULLABLE, FK -> source_systems.id ON DELETE SET NULL` | Originating ERP source |
| `material_code` | `VARCHAR(100)` | `NOT NULL, INDEX` | Original CPSE local material code |
| `material_description` | `TEXT` | `NOT NULL` | Original unparsed material description |
| `specification_text` | `TEXT` | `NULLABLE` | Supplementary unparsed specification text |
| `uom` | `VARCHAR(50)` | `NOT NULL` | Original local unit of measure (`NOS`, `EA`, `SET`) |
| `category_code` | `VARCHAR(100)` | `NULLABLE` | Local ERP category code |
| `manufacturer_reference` | `VARCHAR(255)` | `NULLABLE` | Local OEM/supplier reference |
| `source_payload` | `JSONB` | `NULLABLE` | Raw confidential payload (PO pricing, store bins) |
| `import_batch_id` | `VARCHAR(100)` | `NULLABLE, INDEX` | Batch ingestion tracking ID |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'IMPORTED'` | Status (`IMPORTED`, `NORMALIZED`, `ARCHIVED`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Ingest timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Update timestamp |

*Unique Constraint:* `UNIQUE (organization_id, material_code)`

---

### 2.5 Table: `normalized_materials` (Layer 2: Sanitized Intelligence Data)
Sanitized, standardized representation of a material record stripped of private procurement pricing.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique normalized record identifier |
| `raw_material_id` | `UUID` | `UNIQUE, NOT NULL, FK -> raw_materials.id ON DELETE RESTRICT` | Source raw material record |
| `organization_id` | `UUID` | `NOT NULL, FK -> organizations.id ON DELETE RESTRICT` | Owning CPSE reference |
| `canonical_description` | `TEXT` | `NOT NULL` | Cleaned, formatted standard title |
| `normalized_manufacturer` | `VARCHAR(255)` | `NULLABLE` | Normalized manufacturer/OEM name |
| `normalized_part_number` | `VARCHAR(255)` | `NULLABLE` | Cleaned OEM part number |
| `normalized_uom` | `VARCHAR(50)` | `NOT NULL` | Standardized SI unit of measure (`EA`, `KG`, `M`) |
| `taxonomy_id` | `UUID` | `NULLABLE, FK -> material_taxonomies.id ON DELETE SET NULL` | Assigned taxonomy node |
| `engineering_term` | `VARCHAR(255)` | `NULLABLE` | Standard engineering noun (e.g. `Hexagon Head Bolt`) |
| `standard_code` | `VARCHAR(100)` | `NULLABLE` | Primary governing standard (`IS 1363`, `ISO 4016`) |
| `material_grade` | `VARCHAR(100)` | `NULLABLE` | Material metallurgy/grade (`SS304`, `A2-70`, `WCB`) |
| `normalization_status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'NORMALIZED'` | Status (`PENDING`, `NORMALIZED`, `NEEDS_REVIEW`, `ERROR`) |
| `confidence_score` | `FLOAT` | `NULLABLE` | Normalization parser confidence (0.0 to 1.0) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Timestamp |

---

### 2.6 Table: `material_attributes`
Extensible engineering specifications model.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique attribute identifier |
| `normalized_material_id` | `UUID` | `NOT NULL, FK -> normalized_materials.id ON DELETE CASCADE` | Owning normalized material |
| `attribute_name` | `VARCHAR(100)` | `NOT NULL, INDEX` | Attribute key (`diameter`, `length`, `pressure_class`) |
| `original_value` | `VARCHAR(255)` | `NULLABLE` | Unparsed source string (`16MM DIA`) |
| `normalized_value` | `VARCHAR(255)` | `NOT NULL` | Cleaned canonical value (`16.0`) |
| `normalized_unit` | `VARCHAR(50)` | `NULLABLE` | Standardized unit (`mm`, `bar`, `V`) |
| `data_type` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'STRING'` | Data type (`NUMERIC`, `STRING`, `RANGE`, `BOOLEAN`) |
| `source` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'RULE_EXTRACTOR'` | Origin (`RULE_EXTRACTOR`, `AI_EXTRACTOR`, `HUMAN_INPUT`) |
| `confidence` | `FLOAT` | `NULLABLE` | Extraction confidence score |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Creation timestamp |

---

### 2.7 Table: `material_embeddings`
pgvector dense vector storage for semantic similarity search.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique embedding identifier |
| `normalized_material_id` | `UUID` | `UNIQUE, NOT NULL, FK -> normalized_materials.id ON DELETE CASCADE` | Target material |
| `embedding_model` | `VARCHAR(100)` | `NOT NULL, DEFAULT 'all-MiniLM-L6-v2'` | Embedding model name |
| `model_version` | `VARCHAR(50)` | `NOT NULL, DEFAULT '1.0.0'` | Model revision |
| `dimensions` | `INTEGER` | `NOT NULL, DEFAULT 384` | Vector dimensions |
| `embedding_vector` | `VECTOR(384)` | `NULLABLE` | 384-dimensional dense float vector |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Generation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Update timestamp |

---

### 2.8 Table: `standards_equivalences`
Engineering standards equivalence rules and cross-walk verification.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique standard rule ID |
| `source_standard` | `VARCHAR(100)` | `NOT NULL, INDEX` | Source engineering standard (`IS 1363`) |
| `target_standard` | `VARCHAR(100)` | `NOT NULL, INDEX` | Target engineering standard (`ISO 4016`) |
| `equivalence_type` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'REQUIRES_DOMAIN_REVIEW'` | `VERIFIED_EQUIVALENT`, `POSSIBLE_EQUIVALENT`, `NOT_EQUIVALENT`, `REQUIRES_DOMAIN_REVIEW` |
| `comparison_notes` | `TEXT` | `NULLABLE` | Engineering boundary conditions and notes |
| `domain_reviewer_required` | `BOOLEAN` | `NOT NULL, DEFAULT false` | Mandatory expert review flag |
| `verification_status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'DRAFT'` | `DRAFT`, `VERIFIED`, `DEPRECATED` |
| `verified_by` | `VARCHAR(255)` | `NULLABLE` | Verifying domain engineer |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Update timestamp |

*Unique Constraint:* `UNIQUE (source_standard, target_standard)`

---

### 2.9 Table: `material_similarity_matches`
Similarity candidate pairs. Schema supports future AI pipelines; initial seeded data is explicitly labeled as **Synthetic Demonstration Match Data**.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique match candidate identifier |
| `source_material_id` | `UUID` | `NOT NULL, FK -> normalized_materials.id ON DELETE CASCADE` | Candidate Material A |
| `target_material_id` | `UUID` | `NOT NULL, FK -> normalized_materials.id ON DELETE CASCADE` | Candidate Material B |
| `match_type` | `VARCHAR(50)` | `NOT NULL` | `EXACT_DUPLICATE`, `NEAR_DUPLICATE`, `FUNCTIONALLY_EQUIVALENT`, `POSSIBLE_EQUIVALENT`, `NOT_EQUIVALENT` |
| `lexical_score` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Lexical token similarity score |
| `vector_score` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Dense vector embedding similarity |
| `attribute_score` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Attribute-level compatibility score |
| `composite_confidence` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Weighted aggregate score ($0.0 - 1.0$) |
| `methodology` | `VARCHAR(100)` | `NOT NULL, DEFAULT 'MANUAL_SYNTHETIC_DEMO_V1'` | Algorithm / heuristic version |
| `match_explanation` | `TEXT` | `NOT NULL` | Human-readable explanation |
| `specification_diff` | `JSONB` | `NULLABLE` | Attribute-by-attribute diff JSON |
| `recommendation_status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'PROPOSED'` | `PROPOSED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED` |
| `ai_model_version` | `VARCHAR(50)` | `NULLABLE` | Pipeline version identifier |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Proposal timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Status update timestamp |

---

### 2.10 Table: `cnmc_candidates`
Provisional Common National Material Code clusters recommended by system rules or future AI clustering.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique candidate identifier |
| `proposed_cnmc` | `VARCHAR(100)` | `NOT NULL, INDEX` | Proposed CNMC (MVP Prototype Reference Format) |
| `candidate_group_name` | `VARCHAR(255)` | `NOT NULL` | Cluster candidate title |
| `proposed_description` | `TEXT` | `NOT NULL` | Proposed standardized national description |
| `taxonomy_id` | `UUID` | `NULLABLE, FK -> material_taxonomies.id ON DELETE SET NULL` | Proposed taxonomy classification |
| `confidence_score` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Confidence score |
| `recommendation_explanation`| `TEXT` | `NOT NULL` | Rationale for national consolidation |
| `generation_source` | `VARCHAR(100)` | `NOT NULL, DEFAULT 'MANUAL_PROPOSAL'` | `AI_CLUSTERING`, `STANDARDIZATION_RULE`, `MANUAL_PROPOSAL` |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'PENDING_REVIEW'` | `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `SUPERSEDED` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Generation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Decision timestamp |

---

### 2.11 Table: `cnmc_master` (Layer 3: Governed Prototype Master Catalog)
Governed Common National Material Code master catalog records approved within the application's demonstration workflow.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique master catalog record ID |
| `cnmc_code` | `VARCHAR(100)` | `UNIQUE, NOT NULL, INDEX` | Approved MVP Prototype CNMC (e.g. `IN-IND-MECH-BLT-00492`) |
| `canonical_name` | `VARCHAR(255)` | `NOT NULL` | Standardized material title |
| `standard_description` | `TEXT` | `NOT NULL` | Demonstration national master specification description |
| `taxonomy_id` | `UUID` | `NULLABLE, FK -> material_taxonomies.id ON DELETE SET NULL` | Governed taxonomy node |
| `spec_template` | `JSONB` | `NULLABLE` | Standardized parameter schema & required attributes |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'ACTIVE'` | `ACTIVE`, `SUPERSEDED`, `DEPRECATED` |
| `governance_metadata` | `JSONB` | `NULLABLE` | Application workflow sign-off metadata |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Approval timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Modification timestamp |

---

### 2.12 Table: `cpse_cnmc_mappings` (Cross-walk Table)
Binds an existing CPSE material code to an approved CNMC code while preserving the original CPSE code.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique mapping identifier |
| `raw_material_id` | `UUID` | `NOT NULL, FK -> raw_materials.id ON DELETE RESTRICT` | Source raw record |
| `normalized_material_id` | `UUID` | `NOT NULL, FK -> normalized_materials.id ON DELETE RESTRICT` | Normalized record |
| `organization_id` | `UUID` | `NOT NULL, FK -> organizations.id ON DELETE RESTRICT` | Owning CPSE |
| `local_material_code` | `VARCHAR(100)` | `NOT NULL, INDEX` | Original CPSE local material code |
| `cnmc_id` | `UUID` | `NOT NULL, FK -> cnmc_master.id ON DELETE RESTRICT` | Target CNMC master record |
| `mapping_type` | `VARCHAR(50)` | `NOT NULL` | `DIRECT_MATCH`, `NORMALIZED_MATCH`, `FUNCTIONAL_EQUIVALENCE`, `MANUAL_MAPPING` |
| `confidence_score` | `FLOAT` | `NOT NULL, DEFAULT 1.0` | Mapping confidence |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'ACTIVE'` | `ACTIVE`, `UNDER_REVIEW`, `DEPRECATED` |
| `approved_by` | `VARCHAR(255)` | `NOT NULL` | Reviewer reference |
| `effective_from` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Activation timestamp |
| `effective_to` | `TIMESTAMPTZ` | `NULLABLE` | Sunset timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Mapping creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Mapping update timestamp |

---

### 2.13 Table: `governance_reviews`
Human governance review decisions across similarity candidates, CNMC candidates, and cross-walk mappings.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique review event identifier |
| `entity_type` | `VARCHAR(50)` | `NOT NULL, INDEX` | `SIMILARITY_MATCH`, `CNMC_CANDIDATE`, `CPSE_MAPPING`, `STANDARDS_EQUIVALENCE` |
| `entity_id` | `UUID` | `NOT NULL, INDEX` | Target entity UUID |
| `reviewer_reference` | `VARCHAR(255)` | `NOT NULL` | Reviewer identity or system placeholder |
| `decision` | `VARCHAR(50)` | `NOT NULL` | `APPROVED`, `REJECTED`, `NEEDS_MORE_INFORMATION`, `ESCALATED` |
| `comments` | `TEXT` | `NULLABLE` | Technical justification or notes |
| `previous_status` | `VARCHAR(50)` | `NULLABLE` | Prior state |
| `new_status` | `VARCHAR(50)` | `NOT NULL` | Updated state |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Review decision timestamp |

---

### 2.14 Table: `audit_logs`
Append-oriented audit log for immutable traceability across the platform.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique audit entry identifier |
| `entity_type` | `VARCHAR(100)` | `NOT NULL, INDEX` | Entity classification |
| `entity_id` | `VARCHAR(100)` | `NOT NULL, INDEX` | Entity identifier (UUID or String code) |
| `action` | `VARCHAR(100)` | `NOT NULL` | Event code (`RAW_IMPORTED`, `NORMALIZED`, `MATCH_PROPOSED`, `CNMC_APPROVED`, `MAPPING_ACTIVATED`) |
| `previous_state` | `JSONB` | `NULLABLE` | Snapshot before mutation |
| `new_state` | `JSONB` | `NULLABLE` | Snapshot after mutation |
| `actor_reference` | `VARCHAR(255)` | `NOT NULL` | Actor identifier |
| `ip_address` | `VARCHAR(100)` | `NULLABLE` | Client IP address |
| `timestamp` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Timestamp |
| `metadata_payload` | `JSONB` | `NULLABLE` | Supplementary audit metadata |
