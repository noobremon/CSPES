# System Context Architecture (C4 Model — Level 1)

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** System Architecture (Phase 3)  
**Status:** `APPROVED`

---

## 1. Executive System Context

The **AI-Powered National Unified Material Master Framework** operates as an intelligent national data harmonization, semantic matching, and governance platform positioned alongside existing enterprise IT infrastructure across Central Public Sector Enterprises (CPSEs).

The platform does **not** replace enterprise ERP systems (SAP, Oracle, Custom ERPs) or government tendering portals (GeM, CPPP). Instead, it acts as a centralized **intelligence and codification layer** that ingests heterogeneous material master data, discovers cross-enterprise duplicates, establishes the **Common National Material Code (CNMC)**, and exports synchronized mapping tables back to enterprise systems.

---

## 2. C4 Context Diagram

```mermaid
flowchart TD
    subgraph External_Users["Stakeholders & Actors"]
        NatAdmin["National Administrator\n(DPE / Line Ministries)"]
        CPSEUser["CPSE Material Manager / Engineer\n(ONGC, BHEL, IOCL, NTPC, etc.)"]
        Reviewer["Domain / Technical Reviewer\n(Mechanical / Electrical / Piping)"]
        ProcAnalyst["Procurement / Inventory Analyst"]
        Auditor["Statutory & Compliance Auditor\n(CAG / CVC / Internal Audit)"]
    end

    subgraph Core_System["National Unified Material Master Framework (System Boundary)"]
        WebPortal["Enterprise Web Application\n(Material Explorer, Diff Viewer, Analytics)"]
        APIGateway["Unified API Gateway & Core Engine\n(FastAPI Async Services)"]
        AIEngine["AI Similarity & Spec Extraction Engine\n(Sentence-Transformers + NER)"]
        DataTier["Enterprise Data Tier\n(PostgreSQL + pgvector + Redis)"]
    end

    subgraph External_Systems["External Enterprise & Government Systems"]
        CPSE_ERP["CPSE Enterprise ERPs\n(SAP S/4HANA, ECC, Oracle, Legacy)"]
        GovPortals["National Procurement Intelligence\n(GeM / CPPP Benchmark Data - Future)"]
    end

    NatAdmin -->|National Governance & Taxonomies| WebPortal
    CPSEUser -->|Catalog Ingestion & Local Management| WebPortal
    Reviewer -->|Spec Diff Review & Approvals| WebPortal
    ProcAnalyst -->|Price Variance & Surplus Discovery| WebPortal
    Auditor -->|Immutable Audit Verification| WebPortal

    WebPortal -->|HTTPS / REST / JWT| APIGateway
    APIGateway <--> AIEngine
    APIGateway <--> DataTier
    AIEngine <--> DataTier

    CPSE_ERP -.->|Bulk File / API Ingestion (Adapter)| APIGateway
    APIGateway -.->|Export CNMC Cross-Walk (CSV/JSON)| CPSE_ERP
    GovPortals -.->|Reference Price Feeds (Future)| APIGateway
```

---

## 3. External System Interfaces & Boundaries

| External Entity | Relationship / Data Exchanged | Communication Protocol |
|---|---|---|
| **CPSE ERP Systems (SAP/Oracle)** | Source catalog ingestion (Local Codes, Raw Text, UOM, Unit Price); Export of approved CNMC cross-walk mappings. | Asynchronous File Ingestion (CSV/Excel) in MVP; REST API / IDoc Adapter in Future. |
| **National Ministry / DPE** | Macro-level KPI monitoring, inter-CPSE duplicate rationalization metrics, demand aggregation policies. | HTTPS Web Portal / Exportable Executive PDF Reports. |
| **Domain Engineering Specialists** | Visual inspection of material specifications, engineering drawings, and standard interchangeability validations. | Interactive Web Application (Side-by-Side Diff View). |
| **Statutory Audit Authorities** | Non-repudiable audit trails, historical decision timelines, and cryptographic verification logs. | Read-Only Audit Viewer / Exportable Certified Dossiers. |
