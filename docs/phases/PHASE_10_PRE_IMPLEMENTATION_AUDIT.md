# Phase 10 Pre-Implementation Audit — Authentication, RBAC & Multi-Tenant Access

**System:** AI-Powered National Unified Material Master Framework  
**Project:** Smart India Hackathon (SIH) 2026 — "One Nation – One Common Material Code"  
**Audit Date:** 2026-09-08  
**Phase:** Phase 10 Pre-Implementation Audit (Phase 10A)  
**Status:** `AUDIT COMPLETE — READY FOR IMPLEMENTATION PLAN`

---

## 1. Executive Summary & Audit Purpose

This pre-implementation audit inspects the complete codebase across backend, database schema, API routers, and frontend application to establish the exact baseline before implementing **Phase 10: Authentication, RBAC & Secure Multi-Tenant Access**.

The platform currently provides ingestion, normalization, AI matching, CNMC recommendation, human governance workflow, CPSE ↔ CNMC cross-walk mappings, and national material intelligence analytics (Phases 1–9). However, access control has operated in an unauthenticated / demonstration mode. Phase 10 establishes production-grade authentication and server-side RBAC without disrupting existing functionality.

---

## 2. Detailed Subsystem Audit

### 2.1 Current Authentication Status
- **Backend:** `NOT IMPLEMENTED`. No user table, session manager, or JWT validator is active in the API gateway. Endpoints accept requests without checking token validity.
- **Frontend:** `NOT IMPLEMENTED`. The UI renders all tabs directly upon mount without a login screen or session state management.
- **Password & Cryptography:** `passlib`, `bcrypt`, `pyjwt[crypto]`, `cryptography` are installed in the backend environment, ready for standard Argon2/bcrypt/JWT usage.

### 2.2 Current User Models
- **Database Schema:** `NOT IMPLEMENTED`. No `users`, `roles`, or `user_roles` tables exist in SQLAlchemy models or Alembic migrations (`0001`, `0002`, `0003`).
- **Actor References in Data:** Existing models (`GovernanceReview`, `AuditLog`, `CPSECNMCMapping`) use unstructured string fields (`reviewer_reference: str`, `actor_reference: str`, `approved_by: str`) to record user identities.

### 2.3 Current Organization / CPSE Models
- **Database Schema:** `CURRENTLY IMPLEMENTED`.
  - `Organization` table (`organizations`): Stores `id (UUID)`, `code (VARCHAR 50, unique)`, `name`, `sector`, `status`, `created_at`, `updated_at`.
  - `SourceSystem` table (`source_systems`): Stores ERP source systems per organization (`organization_id`, `name`, `system_type`, `is_active`).
  - Related to `RawMaterial`, `NormalizedMaterial`, `IngestionJob`, `CPSECNMCMapping`.
- **Finding:** We can directly link users to the existing `organizations` table via a foreign key (`user.organization_id`), avoiding redundant organization tables.

### 2.4 Current Role Definitions
- **Status:** `NOT IMPLEMENTED`. No formal enum or database role entity exists in the codebase.
- **Target Phase 10 Roles:**
  1. `NATIONAL_MASTER_ADMIN`: Cross-CPSE oversight, user management, national analytics, approved CNMC viewing.
  2. `CPSE_MATERIAL_MANAGER`: Ingestion, catalog management, and cross-walk viewing strictly restricted to own CPSE.
  3. `DOMAIN_REVIEWER`: Technical specification analysis, AI match review, CNMC candidate approval/rejection/modification.
  4. `AUDITOR`: Read-only access to immutable audit logs, governance lineage, and cross-walk histories.

### 2.5 Current Demo Reviewer Identity Mechanism
- **Implementation:** `X-Demo-Reviewer` and `X-Demo-Role` headers are accepted optionally in `POST /api/v1/cnmc/recommend` and `POST /api/v1/cnmc/candidates/{candidate_id}/review`, defaulting to string fallbacks (`"demo_domain_reviewer@sih.gov.in"`, `"CNMC_RECOMMENDATION_ENGINE_V1"`).
- **Security Finding:** These headers operate as untrusted test conveniences. Phase 10 must replace them with authenticated `get_current_user` dependencies while retaining demo header fallbacks strictly in development/test fixtures.

### 2.6 Current API Access Protection
- **Status:** Open/Unauthenticated.
- **Endpoints to Protect:**
  - `/api/v1/auth/*`: Login, logout, refresh, me.
  - `/api/v1/ingestion/*`: Protected; uploads restricted to user's assigned CPSE.
  - `/api/v1/matching/*`: Protected; candidate browsing accessible to authenticated roles.
  - `/api/v1/cnmc/*`: Protected; recommendation & review restricted by role.
  - `/api/v1/governance/*`: Protected; audit log inspection restricted to Auditor / Admin.
  - `/api/v1/analytics/*`: Protected; national analytics accessible to Admin / Reviewer / Auditor.
  - `/api/v1/health`: Public probe endpoint.

### 2.7 Current Frontend Route & Navigation Structure
- **Current Architecture:** 5 Top-Level Navigation Tabs in `Header.tsx` / `App.tsx`:
  1. `CNMC Workspace`
  2. `Governance Queue`
  3. `CPSE ↔ CNMC Cross-Walk`
  4. `National Analytics` (with 7 embedded sub-views)
  5. `System Status`
- **Phase 10 Enhancement:**
  - Wrap app in an `AuthProvider` / `AuthContext`.
  - Add an enterprise `LoginPage.tsx` displayed when unauthenticated.
  - Render user profile pill with role badge and logout button in header.
  - Provide role-aware view access (e.g. CPSE Manager sees their catalog & upload; Reviewer sees queue; Auditor sees read-only audit trails; Admin sees national analytics & system controls).

### 2.8 Current Tenant Isolation Status
- **Layer 1 (Private Catalog / ERP Data):** Models have `organization_id` foreign keys, but API endpoints accept client-supplied `organization_id` without server-side validation against user identity.
- **Layer 2 (Normalized Intelligence):** Masked technical specifications.
- **Layer 3 (National Governed Master):** Public prototype CNMC codes.
- **Phase 10 Target:** Enforce server-side tenancy checking so `CPSE_MATERIAL_MANAGER` can only interact with materials matching `user.organization_id`.

---

## 3. Explicit Classification Matrix

### A. CURRENTLY IMPLEMENTED
1. Multi-CPSE Organization schema (`organizations`, `source_systems`).
2. Material domain models (`raw_materials`, `normalized_materials`, `material_attributes`).
3. Multi-tier AI matching models (`similarity_matches`).
4. Governed Master CNMC schema (`cnmc_candidates`, `cnmc_masters`, `cpse_cnmc_mappings`).
5. Append-only audit trail schema (`governance_reviews`, `audit_logs`).
6. Core analytical services (7 services across 9 REST endpoints).
7. Frontend 5-tab interface with 7 analytical sub-views.
8. Automated test fixtures (SQLite in-memory async session).

### B. NOT IMPLEMENTED (Prior to Phase 10)
1. User model (`User`, `UserRole`, `RoleEnum`, `UserStatus`).
2. Password hashing & verification utilities (`bcrypt`/`passlib`).
3. JWT token generation, cookie parsing, and signature verification.
4. FastApi security dependencies (`get_current_user`, `require_roles`, `require_permissions`, `get_current_tenant_scope`).
5. Authentication endpoints (`POST /login`, `POST /logout`, `POST /refresh`, `GET /me`).
6. Tenant ownership enforcement on mutation endpoints.
7. Frontend Login screen, Auth Context, and Protected Route wrapper.
8. Seed demonstration accounts with role segregation.

### C. TO BE IMPLEMENTED IN PHASE 10
1. **User & Role Data Model:** `User` table linked to existing `Organization` table, with password hash, role enum, active status, last login timestamp.
2. **Database Migration:** Alembic migration `0004_auth_and_rbac`.
3. **Authentication Core:** Secure password hashing, short-lived JWT access token, refresh token handling, cookie/header token extraction.
4. **Auth REST Endpoints:** `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/refresh`, `/api/v1/auth/me`.
5. **Server-Side RBAC Dependencies:** `get_current_user`, `require_authenticated_user`, `require_roles(roles...)`, `get_current_organization_scope()`.
6. **Multi-Tenant Scoping:** Validation that client operations on Layer 1 data match the user's authorized CPSE.
7. **Audit Logging for Auth Events:** Automatic audit logs for `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `ACCESS_DENIED`.
8. **Controlled Demo Seed Accounts:** `national_admin@sih.demo`, `cpse_manager_a@sih.demo`, `domain_reviewer@sih.demo`, `auditor@sih.demo`.
9. **Enterprise Frontend UI:** Professional Login page, AuthContext, role badges, protected tab navigation, logout action.
10. **Automated Test Suite:** Comprehensive backend and frontend test suites for authentication, authorization, tenant isolation, and UI flows.
11. **Documentation Suite:** Complete architecture and operational guides.

### D. OUT OF SCOPE (Strict Non-Goals)
1. Production Aadhaar / DigiLocker / Government of India e-Pramaan SSO integration.
2. Live hardware HSM / KMS key vault integration.
3. Live container infrastructure verification (PostgreSQL/Redis daemons remain classified as unverified while offline).
4. Direct modifications to Phase 6 ingestion parsers, Phase 7 similarity formulas, Phase 8 CNMC codification logic, or Phase 9 analytics formulas.
