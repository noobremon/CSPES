# SIH 2026 DEMONSTRATION WORKFLOW & EVALUATION GUIDE
**Platform:** AI-Powered National Unified Material Master Framework  
**Motto:** "One Nation – One Common Material Code"  
**Target Audience:** SIH Evaluation Panel, Ministry Representatives & CPSE Stakeholders

---

## 1. Ten Core SIH Evaluation Questions Answered

| # | SIH Evaluation Question | Platform Architectural Answer & Demo Evidence |
| :-: | :--- | :--- |
| **1** | **What problem does this solve?** | Eliminates severe material catalog fragmentation across India's Central Public Sector Enterprises (CPSEs), where identical physical items are procured under completely different local codes, descriptions, and units of measure. |
| **2** | **Why do CPSEs need it?** | Enables cross-enterprise visibility, prevents duplicate inventory holdings, unlocks bulk joint procurement discounts, and streamlines emergency spare parts inter-borrowing across CPSE plants. |
| **3** | **How does AI identify equivalent materials?** | Combines deterministic text normalization, regex-based technical attribute extraction (dimensions, material grades, pressure classes), multi-tier token Jaccard similarity, and vector embeddings to detect exact duplicates, near duplicates, and functional equivalents. |
| **4** | **How is a CNMC recommended?** | The CNMC engine maps extracted technical attributes into structured MVP Prototype CNMC Reference codes (`IN-IND-MECH-BLT-XXXX`) and attaches explainable evidence breakdowns. |
| **5** | **Who approves the recommendation?** | Authenticated **Domain Reviewers** and **National Master Admins** via a mandatory human-in-the-loop governance workflow (`APPROVE`, `REJECT`, `MODIFY`). AI never autonomously approves. |
| **6** | **Are original CPSE codes lost?** | **No.** Local CPSE material codes (e.g. `IOCL-BOLT-1001`) are preserved permanently in `cpse_cnmc_mappings` crosswalk tables. Existing ERP systems continue operating undisturbed. |
| **7** | **Can the system automatically modify SAP/ERP?** | **No.** The platform provides read-only ingestion and outward API/export synchronization. It never directly executes destructive writes or schema changes on CPSE ERP databases. |
| **8** | **How is sensitive procurement information protected?** | Strict Layer 1 commercial airgap. Vendor names, purchase order numbers, contract prices, and store bin locations are isolated in Layer 1 and **never** enter Layer 2 matching models, Layer 3 governed catalogs, or national analytics. |
| **9** | **How does the Government benefit?** | Provides DPE, MoPNG, MoP, and MoS with real-time national intelligence on material redundancies, cross-CPSE procurement synergies, and rationalization priorities. |
| **10**| **How can this scale nationally?** | Built on an asynchronous microservice architecture (FastAPI, PostgreSQL with pgvector, Redis, Celery) capable of handling millions of catalog items with multi-tenant isolation. |

---

## 2. Multi-Sector Demonstration Data Matrix

The platform includes representative demonstration data across 5 core industrial sectors:

```
[Oil & Gas]            [Power]             [Steel]             [Heavy Engineering]
 IOCL & ONGC             NTPC                SAIL                    BHEL
      │                   │                   │                       │
      ▼                   ▼                   ▼                       ▼
MAT-1001 (IOCL)     BOLT-778 (ONGC)     MECH-4521 (SAIL)       ENG-9901 (BHEL)
Hex Bolt M16x50     SS Hex Bolt M16x50  Hex Head Bolt M16x50   Bolt Hex M16x50 SS304
      │                   │                   │                       │
      └───────────────────┼───────────────────┼───────────────────────┘
                          ▼
            [ AI Similarity Engine: 96% Match ]
                          ▼
         [ Proposed: IN-IND-MECH-BLT-01001 ]
                          ▼
            [ Domain Reviewer: APPROVED ]
                          ▼
      [ Active CPSE Crosswalk Mappings (4 CPSEs) ]
                          ▼
[ Joint Procurement Opportunity: 4 CPSEs Shared Demand ]
```

---

## 3. Step-by-Step Demonstration Walkthrough for Evaluators

1. **Step 1: Multi-Tenant Role Login**  
   Log in as `cpse_manager_a@sih.demo` (Indian Oil Corporation Ltd). Observe tenant-scoped dashboard and catalog view.
2. **Step 2: Material Ingestion & Column Discovery**  
   Upload a raw CSV catalog (`iocl_catalog.csv`). View automatic column role discovery (Material Code, Description, UOM, Unit Price, Vendor Name). Submit ingestion job.
3. **Step 3: Commercial Airgap Verification**  
   Inspect the normalized catalog. Observe that proprietary vendor identities and contract prices are stripped into Layer 1 isolation while standardized descriptions and extracted attributes (e.g. `SS304`, `M16x50`) are populated in Layer 2.
4. **Step 4: AI Similarity & Cluster Intelligence**  
   Navigate to **Material Matching**. Observe multi-CPSE duplicate clusters (IOCL, ONGC, SAIL, BHEL) with composite confidence scores and transparent explainability cards.
5. **Step 5: Governance Review & Human-in-the-Loop Approval**  
   Log in as `domain_reviewer@sih.demo`. Open **Candidate Review**. Review proposed MVP Prototype CNMC code `IN-IND-MECH-BLT-01001`. Submit approval with review comments.
6. **Step 6: National Analytics & Procurement Synergies**  
   Navigate to **National Overview**. Observe dynamic reflection:
   - Participating CPSEs: 5
   - Exact & Near Duplicates Detected
   - Active CNMC Master records and CPSE Crosswalk mappings
   - Joint Procurement Opportunities with clear disclaimer: *"ILLUSTRATIVE / DEMONSTRATION ESTIMATE"*.
