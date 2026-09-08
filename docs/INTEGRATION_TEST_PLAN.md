# INTEGRATION TEST PLAN

**System:** AI-Powered National Unified Material Master Framework  
**Standard:** Phase 11 Integration & Validation  
**Status:** IMPLEMENTED & TEST VERIFIED  

---

## 1. Test Objectives & Strategy

The integration test plan validates the unified interoperability of the platform across all layers:
1. **Multi-Tenant Ingestion Pipeline**: File upload, column validation, Layer 1 storage, Layer 2 normalization.
2. **AI & Similarity Clustering**: Deterministic rule checks, token-based text similarity, hybrid similarity matrix.
3. **CNMC Recommendation & Governance**: Candidate proposal generation, human review lifecycle (APPROVE/REJECT), cross-walk binding.
4. **National Intelligence Analytics**: Aggregation of KPIs, overlap matrices, and synthetic procurement opportunities.
5. **Security & Boundary Enforcement**: JWT issuance, refresh rotation, raw Layer 1 airgap, and tenant isolation.
6. **Failure Recovery & Edge Cases**: Unsupported formats, duplicate uploads, malformed payloads, and expired sessions.

---

## 2. Test Execution Matrix

| Test Suite | Test Target | Verification Status | Pass / Total |
| :--- | :--- | :--- | :---: |
| `test_auth_rbac.py` | Authentication, RBAC, Layer 1 Airgap, Refresh Rotation | `VERIFIED VIA INTEGRATION TEST` | 12/12 (100%) |
| `test_cnmc_governance.py`| CNMC Codification, Candidate Review, Cross-Walks | `VERIFIED VIA INTEGRATION TEST` | 12/12 (100%) |
| `test_domain_models.py` | SQLAlchemy Entity Mappings & Constraints | `VERIFIED VIA UNIT TEST` | 3/3 (100%) |
| `test_e2e_integration_pipeline.py`| Full Multi-Role Lifecycle Journey | `VERIFIED VIA INTEGRATION TEST` | 1/1 (100%) |
| `test_failure_recovery.py`| Malformed Files, Duplicate Uploads, Token Tampering | `VERIFIED VIA INTEGRATION TEST` | 6/6 (100%) |
| `test_health.py` | Health Check & Application Metadata | `VERIFIED VIA UNIT TEST` | 3/3 (100%) |
| `test_ingestion_pipeline.py`| CSV/Excel Stream Parsing, Column Discovery | `VERIFIED VIA INTEGRATION TEST` | 8/8 (100%) |
| `test_material_matching.py`| 3-Tier Similarity Engine & Duplication Clustering | `VERIFIED VIA INTEGRATION TEST` | 11/11 (100%) |
| `test_national_analytics.py`| Dashboard KPIs, Overlap Matrix, Opportunities | `VERIFIED VIA INTEGRATION TEST` | 10/10 (100%) |
| `test_performance_benchmarks.py`| Latency & Throughput Benchmarking (100 & 1k items) | `VERIFIED VIA INTEGRATION TEST` | 5/5 (100%) |
| `App.test.tsx` (Frontend) | 5-Tab Portal, Personas, Recommendation, Governance | `VERIFIED VIA UNIT TEST` | 7/7 (100%) |
| **Total Test Coverage** | Full Platform Integration | **VERIFIED (100%)** | **78/78 (100%)** |
