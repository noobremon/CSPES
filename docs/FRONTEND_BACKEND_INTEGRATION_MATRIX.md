# FRONTEND ↔ BACKEND API INTEGRATION MATRIX
**System:** AI-Powered National Unified Material Master Framework  
**Standard:** Phase 12 Interface & Endpoint Audit  
**Status:** VERIFIED (100% Endpoint & View Alignment)

---

## 1. Enterprise Interface & API Integration Matrix

| Frontend Feature / View | Primary API Endpoint | HTTP Method | Backend Service / Handler | Database Source Table | Verification Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **Authentication: Login** | `/api/v1/auth/login` | `POST` | `login()` in `auth.py` | `users` | `VERIFIED` |
| **Authentication: Current User**| `/api/v1/auth/me` | `GET` | `get_me()` in `auth.py` | `users`, `organizations` | `VERIFIED` |
| **Authentication: Logout** | `/api/v1/auth/logout` | `POST` | `logout()` in `auth.py` | In-Memory / Redis Revocation | `VERIFIED` |
| **System Health Check** | `/api/v1/health` | `GET` | `get_health()` in `health.py` | DB ping / Celery ping | `VERIFIED` |
| **Material Ingestion: Upload** | `/api/v1/ingestion/upload` | `POST` | `upload_material_file()` | `ingestion_jobs`, `raw_materials` | `VERIFIED` |
| **Material Ingestion: Discover**| `/api/v1/ingestion/discover` | `POST` | `discover_file_columns()` | In-Memory Header Parser | `VERIFIED` |
| **Material Ingestion: Status** | `/api/v1/ingestion/jobs/{id}`| `GET` | `get_job_status()` | `ingestion_jobs` | `VERIFIED` |
| **Material Catalog: List** | `/api/v1/ingestion/materials`| `GET` | `list_materials()` | `raw_materials`, `normalized_materials`| `VERIFIED` |
| **Material Matching: Clusters** | `/api/v1/matching/clusters` | `GET` | `list_clusters()` | `material_clusters`, `similarity_matches`| `VERIFIED` |
| **Material Matching: Trigger** | `/api/v1/matching/run` | `POST` | `trigger_matching_pipeline()`| Worker Pipeline Task | `VERIFIED` |
| **CNMC Recommendations: List** | `/api/v1/cnmc/candidates` | `GET` | `list_cnmc_candidates()` | `cnmc_candidates` | `VERIFIED` |
| **CNMC Recommendations: Detail**| `/api/v1/cnmc/candidates/{id}`| `GET` | `get_cnmc_candidate_detail()`| `cnmc_candidates`, `normalized_materials`| `VERIFIED` |
| **CNMC Governance: Review** | `/api/v1/cnmc/candidates/{id}/review`| `POST`| `review_cnmc_candidate()`| `governance_reviews`, `cnmc_master` | `VERIFIED` |
| **CPSE ↔ CNMC Crosswalk Mapping**| `/api/v1/cnmc/mappings` | `GET` | `list_cpse_cnmc_mappings()`| `cpse_cnmc_mappings`, `organizations` | `VERIFIED` |
| **National Overview Analytics** | `/api/v1/analytics/dashboard`| `GET` | `get_dashboard_summary()` | Aggregations over L2/L3 | `VERIFIED` |
| **Duplicate Intelligence** | `/api/v1/analytics/duplicates`| `GET` | `get_duplicate_summary()`| Dynamic Cluster Metrics | `VERIFIED` |
| **Cross-CPSE Matrix** | `/api/v1/analytics/cross-cpse-overlap`| `GET`| `get_cross_cpse_matrix()`| Dynamic Matrix Calculator | `VERIFIED` |
| **CNMC Standardization Funnel** | `/api/v1/analytics/cnmc-summary`| `GET` | `get_cnmc_standardization()`| Pipeline Conversion Funnel | `VERIFIED` |
| **Procurement Opportunities** | `/api/v1/analytics/procurement-opportunities`| `GET`| `get_procurement_opportunities()`| Cross-CPSE Demand Engine | `VERIFIED` |
| **Rationalization Priorities**| `/api/v1/analytics/rationalization-priorities`| `GET`| `get_rationalization_priorities()`| 4-Factor Weighted Scorer | `VERIFIED` |
| **Taxonomy Breakdown** | `/api/v1/analytics/categories`| `GET` | `get_category_analytics()`| Multi-Level Taxonomy Trees | `VERIFIED` |

---

## 2. Frontend State & Component Health

1. **Broken Endpoints:** 0 confirmed.
2. **Mock / Stale Data:** Replaced with live dynamic database aggregation handlers.
3. **Disconnected Components:** All 5 top-level tabs (`National Overview`, `Material Ingestion`, `Candidate Review`, `Material Matching`, `Settings`) and 7 analytical sub-views are connected via the central API client (`frontend/src/services/api.ts`).
4. **Error & Loading States:** Standardized loading spinners, skeleton placeholders, and error banners present across all views.
