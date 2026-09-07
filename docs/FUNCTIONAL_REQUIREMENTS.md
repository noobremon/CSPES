# Functional Requirements Specification

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Product & System Design (Phase 2)  
**Status:** `PROPOSED — NOT YET APPROVED`

---

## 1. Requirement Conventions & Priority Definitions
- **MUST HAVE (P0):** Essential for minimum viable functionality and SIH 2026 demonstration.
- **SHOULD HAVE (P1):** High-value capability required for robust enterprise operation.
- **COULD HAVE (P2):** Desirable enhancement to be scheduled after core workflows.
- **FUTURE (P3):** Long-term vision item for full-scale national deployment.

---

## 2. Functional Requirements Matrix

### A. CPSE Tenant Management
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-A01` | System shall allow creation and management of CPSE enterprise profiles (Name, Sector, Code, ERP Type). | **MUST HAVE** | National Admin | CPSE tenant registered with dedicated data partitioning. |
| `FR-A02` | System shall enforce multi-tenant isolation ensuring a CPSE cannot view or edit unshared data of another CPSE. | **MUST HAVE** | System | Tenant data strictly segregated. |

### B. Material Data Ingestion
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-B01` | System shall support bulk file upload of material catalogs in CSV and Excel (.xlsx) formats. | **MUST HAVE** | MM Manager | Catalog rows ingested and staged for validation. |
| `FR-B02` | System shall provide a visual column-mapping wizard to map enterprise columns to standard ingestion schema. | **MUST HAVE** | MM Manager | Custom CPSE field headers successfully mapped. |
| `FR-B03` | System shall process ingestion asynchronously and provide live progress status and error counts. | **SHOULD HAVE** | MM Manager | User informed of batch parsing progress. |

### C. Data Validation
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-C01` | System shall validate mandatory fields (Local Material Code, Description, UOM) on raw inputs. | **MUST HAVE** | System | Invalid rows rejected with detailed error logs. |
| `FR-C02` | System shall compute and verify SHA-256 file checksums upon ingestion to ensure data integrity. | **SHOULD HAVE** | System | File tampering or corruption detected. |

### D. Material Normalization
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-D01` | System shall clean noise characters, remove redundant whitespace, and standardize uppercase text. | **MUST HAVE** | System | Cleaned descriptive baseline created. |
| `FR-D02` | System shall expand domain abbreviations (e.g., "SS" $\rightarrow$ "Stainless Steel") using an industrial lexicon. | **MUST HAVE** | System | Standardized vocabulary across diverse entries. |
| `FR-D03` | System shall extract technical specifications (Diameter, Length, Grade, Pressure, Standard) via NLP. | **MUST HAVE** | System | Structured JSON attributes populated from raw text. |
| `FR-D04` | System shall normalize diverse units of measurement to standard metric SI units (e.g., Inches $\rightarrow$ Millimeters). | **MUST HAVE** | System | Dimension fields harmonized to single metric scale. |

### E. Material Classification
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-E01` | System shall classify materials into a multi-tier hierarchical taxonomy (Discipline $\rightarrow$ Category $\rightarrow$ Item). | **MUST HAVE** | System | Material assigned to standard category node. |
| `FR-E02` | System shall allow authorized reviewers to manually reclassify a material if miscategorized. | **SHOULD HAVE** | Tech Reviewer | Updated taxonomy classification saved with audit log. |

### F. AI Matching & Similarity Engine
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-F01` | System shall generate dense semantic vector embeddings for normalized material specifications. | **MUST HAVE** | AI Engine | Vector representations generated for similarity search. |
| `FR-F02` | System shall perform fast approximate nearest neighbor (ANN) vector candidate retrieval. | **MUST HAVE** | AI Engine | Top candidate matches retrieved within sub-second latency. |
| `FR-F03` | System shall compute composite confidence scores combining lexical, semantic, and attribute overlap. | **MUST HAVE** | AI Engine | Multi-signal confidence percentage ($0\% - 100\%$) generated. |

### G. Duplicate & Near-Duplicate Detection
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-G01` | System shall automatically flag exact matches based on matching OEM part numbers and canonical spec hashes. | **MUST HAVE** | AI Engine | Exact matches flagged with $>98\%$ confidence. |
| `FR-G02` | System shall identify near-duplicates with matching core dimensions and flag minor variances (finish/coating). | **MUST HAVE** | AI Engine | Near-duplicates grouped with detailed diffs. |

### H. Functional Equivalence Analysis
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-H01` | System shall evaluate engineering equivalence across differing manufacturing standards (IS $\leftrightarrow$ DIN $\leftrightarrow$ ISO). | **SHOULD HAVE** | AI Engine | Functional equivalence candidates proposed. |
| `FR-H02` | System shall enforce that all functional equivalence proposals require mandatory domain reviewer sign-off. | **MUST HAVE** | System | Unvalidated automated merging of equivalents blocked. |

### I. CNMC Management
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-I01` | System shall generate and maintain a centralized National Master Catalog of Common National Material Codes. | **MUST HAVE** | System | Unique CNMC records stored with canonical specs. |
| `FR-I02` | System shall recommend an appropriate CNMC code and canonical description for newly harmonized clusters. | **MUST HAVE** | AI Engine | Standardized national code proposed for review. |

### J. CPSE Code Cross-Walk Mapping
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-J01` | System shall maintain an active bi-directional cross-walk table mapping local CPSE codes to CNMC codes. | **MUST HAVE** | System | Cross-walk table accessible for search and queries. |
| `FR-J02` | System shall track mapping history, deprecating old mappings with timestamps when corrections occur. | **SHOULD HAVE** | System | Full mapping lineage preserved without data loss. |

### K. Human Review & Approval Workflow
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-K01` | System shall provide a dedicated Review Center displaying pending match proposals in priority order. | **MUST HAVE** | Reviewer | Staged proposals accessible for review. |
| `FR-K02` | System shall provide a side-by-side spec comparison view with color-coded diffing of engineering parameters. | **MUST HAVE** | Reviewer | Visual clarity on matching vs. differing attributes. |
| `FR-K03` | System shall render an Explainability Card detailing why the AI recommended the match. | **MUST HAVE** | Reviewer | Reviewer understands AI rationale before deciding. |
| `FR-K04` | System shall mandate a written justification note when a reviewer approves or rejects a proposal. | **MUST HAVE** | Reviewer | Every governance decision accompanied by recorded reasoning. |

### L. Dashboards & Analytics
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-L01` | System shall display national executive KPIs: Total Materials Ingested, Duplicate Rate, Rationalized SKUs. | **MUST HAVE** | Nat. Admin | High-level national rationalization metrics rendered. |
| `FR-L02` | System shall provide a Cross-CPSE Price Variance chart identifying price spreads for identical CNMCs. | **SHOULD HAVE** | Proc. Analyst | Price disparities highlighted across CPSEs. |
| `FR-L03` | System shall provide a Cross-CPSE Inventory Overlap matrix showing common materials shared across CPSEs. | **SHOULD HAVE** | Inv. Analyst | Inter-CPSE material overlap visualized. |

### M. Search & Discovery
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-M01` | System shall provide a faceted Material Explorer supporting search by CNMC, Local Code, Specs, and CPSE. | **MUST HAVE** | All Users | Fast tabular search with multi-parameter filtering. |
| `FR-M02` | System shall support natural language semantic search querying materials by informal descriptions. | **SHOULD HAVE** | All Users | Relevant materials returned even with imperfect syntax. |

### N. Audit & Governance
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-N01` | System shall record an immutable, append-only audit log for every ingestion, approval, rejection, and mapping. | **MUST HAVE** | System | Tamper-proof governance audit trail created. |
| `FR-N02` | System shall allow compliance auditors to view and export full decision lineages for any material or user. | **SHOULD HAVE** | Auditor | Comprehensive audit dossier generated. |

### O. ERP / SAP Integration Capabilities
| Req ID | Description | Priority | Actor | Expected Outcome |
|---|---|---|---|---|
| `FR-O01` | System shall support export of approved CNMC cross-walk mappings in standard CSV/JSON format for ERP import. | **MUST HAVE** | ERP Admin | Mapping file exportable for SAP master data update. |
| `FR-O02` | System shall provide read-only REST API endpoints for external ERP systems to query CNMC by local code. | **COULD HAVE** | External ERP | Automated cross-walk query capability enabled. |
| `FR-O03` | System shall support SAP IDoc / OData direct integration connectors. | **FUTURE** | ERP Admin | Direct enterprise ERP pipeline synchronization. |
