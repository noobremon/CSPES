# Conceptual Data Flow Architecture

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Product & System Design (Phase 2)  
**Status:** `PROPOSED — NOT YET APPROVED`

---

## 1. End-to-End Conceptual Data Pipeline

The data flow spans source data ingestion, transformation, AI enrichment, governance validation, and downstream analytics consumption.

```mermaid
flowchart TD
    subgraph S1["1. Enterprise Source Tier"]
        SAP["SAP S/4HANA (IDocs/BAPIs)"]
        Oracle["Oracle ERP / Custom SQL"]
        Files["Manual CSV / Excel Catalogs"]
    end

    subgraph S2["2. Ingestion & Staging (Source Data)"]
        Ingest["Ingestion Gateway & Schema Validator"]
        RawDB[("Raw Material Data Store\n(Tenant-Segregated)")]
    end

    subgraph S3["3. Transformation & Extraction (Derived Data)"]
        Clean["Noise Cleaner & Tokenizer"]
        NER["NLP Specification Extractor"]
        NormDB[("Normalized Material Store\n(Structured JSON Attributes)")]
    end

    subgraph S4["4. Intelligence & Scoring (AI-Generated Data)"]
        Embed["Embedding Engine & Vector Indexing"]
        Matcher["Multi-Signal Similarity Matcher"]
        PropDB[("Match Proposals & Explainability Cards")]
    end

    subgraph S5["5. Governance & Approval (Human-Approved Data)"]
        ReviewUI["Human Review Center"]
        GovEngine["Approval Engine & CNMC Generator"]
        MasterDB[("CNMC Master Catalog &\nCross-Walk Mapping Store")]
    end

    subgraph S6["6. Audit & Immutability (Audit Data)"]
        AuditLog[("Immutable Audit Trail Store\n(Append-Only Log)")]
    end

    subgraph S7["7. Consumption & Analytics (Consumer Tier)"]
        Dash["National & CPSE Analytics Dashboards"]
        Search["Cross-CPSE Material Explorer"]
        Export["ERP Cross-Walk Export API"]
    end

    SAP --> Ingest
    Oracle --> Ingest
    Files --> Ingest
    Ingest --> RawDB
    RawDB --> Clean --> NER --> NormDB
    NormDB --> Embed --> Matcher --> PropDB
    PropDB --> ReviewUI
    ReviewUI --> GovEngine --> MasterDB
    ReviewUI -. Governance Actions .-> AuditLog
    GovEngine -. Code Binding .-> AuditLog
    MasterDB --> Dash
    MasterDB --> Search
    MasterDB --> Export
```

---

## 2. Data Classification by Tier

| Data Layer Category | Data Elements Included | Mutability & Persistence | Security & Privacy Scope |
|---|---|---|---|
| **A. Source Data** | Raw CPSE Material Codes, Raw Legacy Descriptions, Local UOM, Raw Pricing, Plant IDs. | Read-only once ingested; immutable historical source record. | Strictly isolated per CPSE tenant (`cpse_id`). Confidential. |
| **B. Derived Data** | Cleaned Text, Extracted Specification Attributes (Grade, Dimensions, Pressure), Normalized UOM. | Re-generable via deterministic NLP tokenizers; modifiable by authorized domain reviewers. | Shared within CPSE; masked across CPSEs during harmonization. |
| **C. AI-Generated Data** | Dense Vector Embeddings, Lexical Scores, Semantic Scores, Match Proposals, Explainability Diff Cards. | Ephemeral / Re-computable upon model update or parameter tuning. | System-level intermediate data; unmasked for review workflows. |
| **D. Human-Approved Data** | Approved Match Pairs, Assigned CNMC Codes, Active Cross-Walk Mappings, Canonical Descriptions. | Version-controlled; updates create new active records while deprecating old ones. | Public / Cross-CPSE National Master Catalog. |
| **E. Immutable Audit Data** | User IDs, Timestamps, Action Verbs, Before/After JSON Snapshots, Mandatory Written Justifications. | **Strictly Append-Only.** No `UPDATE` or `DELETE` operations permitted. | Governed read access for Auditors and Administrators. |
