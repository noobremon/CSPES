# Known Gaps & Deficiency Register

**System:** AI-Powered National Unified Material Master Framework  
**Scope:** Traceability Matrix of Missing Capabilities & Architectural Gaps  
**Audit Classification:** Phase 1 — Discovery & Baseline Audit

---

## 1. Traceability & Gap Matrix

This document catalogs every missing component required to fulfill the SIH 2026 problem statement.

| Module | Required Capability | Repository Status | Classification | Architectural Status |
|---|---|---|---|---|
| **Version Control** | Git repository initialized with `.gitignore` | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** |
| **Frontend Framework** | Web application foundation (Vite React / Next.js) | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-001`) |
| **Design System** | Tailored UI components, responsive layout | Absent in workspace | **CONFIRMED NOT PRESENT** | **RECOMMENDED FOR EVALUATION** |
| **Material Catalog UI** | Data grid with filtering, search, pagination | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **AI Matching UI** | Side-by-side spec comparison, diffing | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **Governance UI** | Proposal review, approve/reject workflow | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **Analytics UI** | Material KPI dashboard, price variance charts | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **Backend Framework** | API server with modular layered architecture | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-002`) |
| **Data Ingestion Engine** | Parsers for CSV/Excel/JSON bulk upload | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **NLP Attribute Extractor** | Extraction of dimensions, grades from text | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-005`) |
| **AI Similarity Engine** | Vector embeddings + spec matching | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-004`, `ADR-005`) |
| **CNMC Generator** | National code assignment & mapping logic | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **Database & Schema** | Relational schema + Vector extension + ORM | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-003`, `ADR-004`) |
| **Auth & RBAC** | Multi-tenant authentication, JWT, RBAC | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-007`) |
| **Audit Logging** | Immutable change logging for governance | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **Containerization** | Multi-service Docker Compose environment | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-009`) |
| **CI/CD & Testing** | Automated test pipelines with GitHub Actions | Absent in workspace | **CONFIRMED NOT PRESENT** | **FUTURE PHASE DECISION REQUIRED** (`ADR-010`) |
| **ERP Connectors** | SAP BAPI / OData / IDoc integration endpoints | Absent in workspace | **CONFIRMED NOT PRESENT** | **PROPOSED — NOT YET APPROVED** |
| **Documentation & ADR** | Full documentation baseline & decision register | Present in `/docs` | **CURRENTLY IMPLEMENTED** | **APPROVED** |

---

## 2. Next Steps

All functional gaps must be addressed through a disciplined phase sequence starting with **Phase 2 — Product & System Design**, rather than initiating ad-hoc coding in an uncoordinated manner.
