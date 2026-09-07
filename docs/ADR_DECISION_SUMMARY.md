# Architecture Decision Register (ADR) Decision Summary

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** System Architecture (Phase 3)  
**Overall Decision Status:** `ALL 11 ADRs APPROVED FOR IMPLEMENTATION`

---

## 1. Executive ADR Summary Table

| ADR ID | Architectural Area | Selected Decision | Final Status | Core Rationale |
|---|---|---|---|---|
| **`ADR-001`** | **Frontend Framework** | **React 18+ (Vite) + TypeScript + Tailwind CSS** | **APPROVED** | Static packaging, instant HMR, high-performance table virtualization (TanStack Table), and zero Node.js server dependency. |
| **`ADR-002`** | **Backend Framework** | **Python 3.11+ FastAPI (ASGI) + Pydantic v2** | **APPROVED** | Native in-process co-location with PyTorch/NLP libraries, high async throughput, strict schema validation, and auto-generated OpenAPI docs. |
| **`ADR-003`** | **Primary Database** | **PostgreSQL 16+ with Shared Schema & RLS** | **APPROVED** | Multi-tenant data isolation via `cpse_id` Row-Level Security while enabling cross-CPSE deduplication over sanitized Layer 2 intelligence data. |
| **`ADR-004`** | **Vector Search Engine** | **PostgreSQL `pgvector` Extension with HNSW** | **APPROVED** | Eliminates dual-database synchronization overhead, provides ACID transactional consistency, and simplifies Docker Compose deployment. |
| **`ADR-005`** | **AI / NLP Pipeline** | **Hybrid Local Sentence-Transformers + Deterministic NER + Controlled Standards Matrix** | **APPROVED** | 100% offline capability for SIH demo, zero cloud API costs, controlled standards equivalence (Verified/Possible/Not Equivalent/Review Required), explainable scoring formula. |
| **`ADR-006`** | **Task Processing Framework** | **Celery Task Workers + Single Redis Broker + PostgreSQL Job Tracking** | **APPROVED** | Robust distributed task execution for bulk CSV ingestion, batch embeddings, and similarity clustering with retries; FastAPI BackgroundTasks for lightweight in-process tasks. |
| **`ADR-007`** | **Authentication & Security** | **Stateless JWT in HttpOnly SameSite Cookies + Anti-CSRF Token Defense** | **APPROVED** | Mitigates direct JavaScript XSS token access, enforces Double Submit CSRF defense, provides 15-minute token TTL, Redis logout blacklisting, and 7-role RBAC. |
| **`ADR-008`** | **Caching Layer** | **Single Redis 7.2 Instance (MVP) / Redis Cluster (Future Scale)** | **APPROVED** | Sub-millisecond caching for taxonomies and price statistics, Celery broker, rate-limiting store, and token blacklist in a lean single-container MVP setup. |
| **`ADR-009`** | **DevOps Orchestration** | **Multi-Service Docker Compose (5 Containers: Web, API, Celery, DB, Redis)** | **APPROVED** | Guarantees 1-command reproducible local environment (`docker compose up`) across developer laptops and SIH evaluation machines. |
| **`ADR-010`** | **CI/CD Pipeline** | **GitHub Actions** | **APPROVED** | Cloud-native automated linting (Ruff/ESLint), type-checking (Mypy/tsc), and Pytest test runners on every commit. |
| **`ADR-011`** | **CNMC Codification** | **MVP CNMC Prototype Reference Format (`IN-IND-MECH-BLT-00492`)** | **APPROVED (PROTOTYPE)** | Demonstrates hierarchical national taxonomy; formal pan-India adoption subject to DPE/Ministry governance ratification. |

---

## 2. Architectural Trade-Off Alignment

Every technology decision was rigorously evaluated against the 12 core criteria:
1. **SIH MVP Feasibility:** 100% runnable locally via Docker Compose without external cloud subscription requirements.
2. **Development Speed:** Fast Python ASGI backend + React Vite frontend maximizing developer velocity.
3. **Maintainability:** Modular Monolith architecture preventing distributed system fragmentation.
4. **AI/ML Requirements:** Python co-location eliminating inter-process serialization latency.
5. **Data Requirements:** PostgreSQL ACID relational tables + pgvector HNSW indexing.
6. **Multi-Tenancy:** Row-Level Security (RLS) and 3-Layer Data Segregation (Private Operational, Sanitized Intelligence, Governed Master).
7. **Security:** HttpOnly JWT cookies + Anti-CSRF header defense, Argon2id hashing, and tamper-proof immutable audit logging.
8. **Scalability:** 4-stage progressive scaling model capable of growing from 10K items (MVP) to 10M+ items (National scale).
9. **Cost:** Zero recurring proprietary license or mandatory cloud token fees.
10. **Local Development Simplicity:** Standardized ports and pre-configured Docker containers.
11. **Future Production Readiness:** Clean adapter interfaces for future SAP/Oracle ERP integration.
12. **Explainability & Controlled Governance:** Multi-signal confidence calculation with visual diff cards and mandatory human engineering sign-off for functional interchangeability.
