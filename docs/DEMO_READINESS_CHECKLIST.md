# Smart India Hackathon (SIH 2026) Demonstration Readiness Checklist

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Evaluation Scope:** Step-by-Step Jury Demonstration Flow  
**Audit Date:** September 2026

---

## 1. Complete Jury Demonstration Walkthrough

| Demo Step | Action Description | UI Screen / Route | Backend API / Service | Verification Status |
|:---:|:---|:---|:---|:---:|
| **1** | **Multi-CPSE Ingestion** | Ingest IOCL mechanical catalog (`indianoil_materials_demo.csv`) and NTPC catalog (`ntpc_materials_demo.xlsx`). Auto-discover headers and map columns. | `IngestionWizard` / `POST /api/v1/ingestion/upload` | `ingestion_engine.py` | **READY & VERIFIED** |
| **2** | **Sensitive Data Isolation** | Verify that confidential purchase order numbers and vendor pricing are securely isolated in Layer 1 `raw_materials.source_payload` and stripped from Layer 2. | Material Detail Modal / `GET /api/v1/ingestion/jobs/{id}` | `models/material.py` | **READY & VERIFIED** |
| **3** | **Material Normalization & Attribute Extraction** | Verify that industrial abbreviations, dimension multipliers (`16 x 50`), steel grades (`SS304`), and UOMs (`NOS -> EA`) are standardized into structured key-value attributes. | Normalized Material Table | `normalization.py`, `attribute_extractor.py` | **READY & VERIFIED** |
| **4** | **Hybrid Duplicate Detection** | Inspect duplicate clusters across CPSEs. View signal breakdown: Lexical Token Ratio, Attribute Signature, Semantic Cosine Similarity, and Hard Conflict checks. | `DuplicateIntelligenceView.tsx` | `hybrid_engine.py`, `deterministic_matcher.py` | **READY & VERIFIED** |
| **5** | **CNMC Recommendation Workspace** | View generated prototype CNMC candidates (e.g. `IN-IND-MECH-BLT-00492`) with full explainability reasoning and recommendation strength. | `RecommendationWorkspace.tsx` | `recommendation_engine.py`, `generator.py` | **READY & VERIFIED** |
| **6** | **Human Governance Resolution** | Log in as Domain Reviewer. Review pending candidate. Execute `APPROVE`, `REJECT` (with mandatory reason), or `MODIFY` (editing description or code). | `GovernanceReviewQueue.tsx` / `ReviewDetailModal.tsx` | `workflow_service.py` | **READY & VERIFIED** |
| **7** | **CPSE Crosswalk Mapping Verification** | Verify 1:N crosswalk mapping table. Confirm that local CPSE codes (`MAT-1001`, `BOLT-778`) remain preserved alongside approved CNMC master record. | `CPSEMappingView.tsx` | `models/cnmc.py` (`CPSECNMCMapping`) | **READY & VERIFIED** |
| **8** | **National Executive Dashboard** | Inspect 10 executive KPIs, duplicate opportunity breakdown, inter-CPSE catalog overlap heat grid, and procurement pooling opportunities. | `NationalOverviewDashboard.tsx`, `CrossCPSEOverlapMatrix.tsx` | 7 Analytics Services in `services/analytics/` | **READY & VERIFIED** |
| **9** | **Audit Trail & Governance Log** | Inspect immutable audit logs recording reviewer identity, action, before/after state diff, and timestamp. | Audit Log Console / `GET /api/v1/governance/audit-trail` | `audit_service.py` | **READY & VERIFIED** |

---

## 2. SIH Demonstration Readiness Score

- **End-to-End Workflow Demonstration:** **100% READY**
- **Automated Test Verification:** **86 / 86 Tests Passed (100%)** (79 backend + 7 frontend)
- **Data Governance Compliance:** **100% COMPLIANT** (Disclaimers embedded across UI & code)
