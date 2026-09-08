# Phase 8 — CNMC Recommendation Engine & Human Governance Workflow

**Phase Status:** COMPLETE  
**Execution Date:** September 8, 2026  
**Architect:** Principal AI & Database Architect  

---

## 1. Executive Summary

Phase 8 establishes the complete pipeline connecting:
```
Material Ingestion → Normalization & Attribute Extraction → Multi-Tier Matching & Candidate Intelligence → CNMC Recommendation → Human Governance Sign-Off → Governed MVP Prototype Master & CPSE Cross-Walk
```

### Critical Boundaries Satisfied:
1. **MVP Prototype Reference Codification:** All CNMC codes (`IN-IND-MECH-BLT-00492`) are clearly identified as MVP Prototype reference formats for SIH 2026 evaluation. Zero false claims of official Government of India approval.
2. **Zero Automatic Approval:** Recommendations remain in status `PENDING_REVIEW` until an authorized human reviewer acts.
3. **Zero Destructive Merging:** Source CPSE local item codes are preserved in Layer 1; cross-walk bindings coexist non-destructively in Layer 3.
4. **Mandatory Reviewer Justifications:** Rejections and modifications strictly require human technical justification.
5. **Full History Preservation:** Original AI/system proposals remain preserved in audit logs and governance metadata even after human modifications.
6. **Data Privacy:** Sensitive Layer 1 commercial data (PO pricing, supplier names, store bins) is strictly excluded from all audit logs and explainability cards.

---

## 2. Deliverables & Technical Components Implemented

### A. Backend Services (`backend/app/services/`)
1. [`cnmc/generator.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/cnmc/generator.py):
   - `CNMCFormatVersion`: `MVP_CNMC_V1`.
   - `generate_prototype_cnmc_code`: Deterministic `[COUNTRY]-[SECTOR]-[CATEGORY]-[TYPE]-[SEQUENCE]` codification.
   - `map_component_type`: Industrial component abbreviation mapping (`BLT`, `NUT`, `VLV`, `FLG`, `BRG`, `GSK`, `PMP`, `MTR`, `PIPE`).
2. [`cnmc/recommendation_engine.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/cnmc/recommendation_engine.py):
   - `CNMCRecommendationService`: Reuse detection against active clusters (`REUSE_EXISTING_CNMC_CANDIDATE`), new candidate synthesis (`NEW_CNMC_CANDIDATE`), and insufficient data handling.
   - Structured explainability card generation (`CNMCRecommendationExplanation`) with taxonomy signals, matching evidence, and recommendation strength.
   - Repeatability and idempotency protection against duplicate candidates.
3. [`governance/workflow_service.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/governance/workflow_service.py):
   - `GovernanceWorkflowService`: `APPROVE`, `REJECT` (mandatory comment), and `MODIFY` (mandatory comment + original recommendation preservation).
   - Non-destructive `CPSECNMCMapping` creation and `CNMCMaster` updates.
4. [`governance/audit_service.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/services/governance/audit_service.py):
   - `record_audit_log` & `sanitize_audit_payload`: Append-oriented audit trail with Layer 1 commercial isolation.

### B. REST API Endpoints (`backend/app/api/v1/endpoints/`)
1. [`cnmc.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/api/v1/endpoints/cnmc.py):
   - `POST /api/v1/cnmc/recommend`
   - `GET /api/v1/cnmc/candidates`
   - `GET /api/v1/cnmc/candidates/{candidate_id}`
   - `POST /api/v1/cnmc/candidates/{candidate_id}/review`
   - `GET /api/v1/cnmc/mappings`
   - `GET /api/v1/cnmc/masters`
2. [`governance.py`](file:///c:/Users/User/Desktop/CSPES/backend/app/api/v1/endpoints/governance.py):
   - `GET /api/v1/governance/reviews`
   - `GET /api/v1/governance/reviews/{review_id}`
   - `GET /api/v1/governance/audit-logs`

### C. Frontend Enterprise UI (`frontend/src/`)
1. [`Header.tsx`](file:///c:/Users/User/Desktop/CSPES/frontend/src/components/layout/Header.tsx): Enterprise navigation header with 4 tabs, pending badge, and reviewer persona context.
2. [`RecommendationWorkspace.tsx`](file:///c:/Users/User/Desktop/CSPES/frontend/src/components/cnmc/RecommendationWorkspace.tsx): 3-column analysis interface (Source Material, Match Intelligence, Recommended Prototype CNMC).
3. [`GovernanceReviewQueue.tsx`](file:///c:/Users/User/Desktop/CSPES/frontend/src/components/cnmc/GovernanceReviewQueue.tsx): Filterable reviewer queue with search, status badges, and candidate examination triggers.
4. [`ReviewDetailModal.tsx`](file:///c:/Users/User/Desktop/CSPES/frontend/src/components/cnmc/ReviewDetailModal.tsx): Side-by-side spec comparison, structured explanation, APPROVE, REJECT, and MODIFY resolution forms.
5. [`CPSEMappingView.tsx`](file:///c:/Users/User/Desktop/CSPES/frontend/src/components/cnmc/CPSEMappingView.tsx): CPSE ↔ CNMC cross-walk table verifying legacy item code preservation.

---

## 3. Verification & Test Results

### Automated Backend Tests (Pytest)
Command: `& "C:\Users\User\Desktop\CSPES\backend\.venv\Scripts\pytest.exe" -v`  
**Result:** **37/37 PASSED (100%)** in 1.44s.

- `test_new_cnmc_candidate_generation` — **PASSED**
- `test_insufficient_data_handling` — **PASSED**
- `test_recommendation_explainability_structure` — **PASSED**
- `test_governance_approve_workflow` — **PASSED**
- `test_existing_cnmc_reuse_candidate` — **PASSED**
- `test_reject_workflow_mandatory_reason` — **PASSED**
- `test_modify_workflow_preserves_original_recommendation` — **PASSED**
- `test_no_automatic_mapping_or_merge` — **PASSED**
- `test_sensitive_layer1_data_excluded_from_audit` — **PASSED**
- `test_duplicate_recommendation_prevention` — **PASSED**
- `test_complete_audit_trail_generation` — **PASSED**
- `test_cnmc_and_governance_api_endpoints` — **PASSED**
- All prior Phase 4, 5, 6, 7 tests — **PASSED**

### Automated Frontend Tests (Vitest)
Command: `npm test -- --run`  
**Result:** **4/4 PASSED (100%)** in `App.test.tsx`.

---

## 4. Live Infrastructure Status

| Service | Driver / Client Config | Live Server Verification | Classification |
|---|---|---|---|
| **PostgreSQL 16** | `asyncpg` + SQLAlchemy | Offline (Daemon not started) | **UNVERIFIED** |
| **pgvector** | HNSW Extension Driver | Offline (Daemon not started) | **UNVERIFIED** |
| **Redis 7.2** | `redis-py` Async Client | Offline (Daemon not started) | **UNVERIFIED** |
| **Celery Worker** | Task Queue Configured | Offline (Daemon not started) | **UNVERIFIED** |

---

## 5. Phase 8 Scope Completion

All Phase 8 mandatory requirements have been implemented, unit-tested, verified, and documented.
The platform is ready for Phase 8 review.
