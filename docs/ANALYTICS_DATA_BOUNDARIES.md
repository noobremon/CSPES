# Analytics Data Boundaries & Commercial Airgap Isolation

## 1. Governance Boundary Overview
In accordance with SIH 2026 guidelines and CPSE commercial compliance rules, the National Unified Material Master Framework maintains strict isolation between **Technical Material Master Intelligence** and **Confidential Commercial Procurement Data**.

---

## 2. Ingestion & Analytics Boundary Matrix

```mermaid
graph TD
    subgraph Allowed ["Allowed Analytical Data Fields (Layer 2 & 3)"]
        T1[Material Item Names & Local Descriptions]
        T2[Standard Specifications & Norms e.g. IS/ASTM/DIN]
        T3[Standardized Engineering Attributes: Size, Material, Pressure]
        T4[Taxonomy Categories & Sector Classifications]
        T5[Participating CPSE Organization Codes]
        T6[Assigned MVP Prototype CNMC Codes]
    end

    subgraph Prohibited ["Strictly Prohibited Commercial Fields (Airgapped)"]
        P1[❌ Purchase Order Unit Rates & Prices]
        P2[❌ Vendor Identities & Commercial Bids]
        P3[❌ Contract Numbers & Milestone Terms]
        P4[❌ Plant/Warehouse Bin Storage Locations]
        P5[❌ Internal Proprietary CPSE Financial Margins]
    end

    Allowed --> Platform[Analytics & Opportunity Engine]
    Prohibited -.->|BLOCKED BY AIRGAP| Platform
```

---

## 3. Compliance Verification
- **Audit Lineage**: All analytical aggregations operate as read-only queries against normalized technical attributes.
- **No Direct ERP Modifications**: Local CPSE ERP catalog codes and identifiers are preserved as immutable references.
- **No Price Extrapolation**: Potential savings scores represent technical demand commonality, not fiscal rate comparisons.
