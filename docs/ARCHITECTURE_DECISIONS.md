# Architecture Decision Register (ADR)

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Architecture Decision Register (ADR)  
**Phase Status:** Phase 3 — Architecture Decision Finalization  

---

## 1. Overview & Decision Framework

This Architecture Decision Register (ADR) records the finalized, approved architectural and technological choices for the platform. In accordance with Phase 3 Governance, all technology selections have been rigorously evaluated against feasibility, development velocity, maintainability, AI compatibility, multi-tenancy, security, scalability, cost, local simplicity, and governance integrity.

### Status Definitions
- `APPROVED`: Formally agreed upon by architects and stakeholders for implementation.
- `IMPLEMENTED`: Built, verified, and physically confirmed in the codebase (targeted for subsequent phases).
- `SUPERSEDED`: Replaced by a subsequent decision record.

---

## 2. Formal Architecture Decision Records (ADR-001 through ADR-011)

### ADR-001: Frontend Web Application Framework
- **Decision ID:** `ADR-001`
- **Area:** Frontend Architecture & Client Tier
- **Selected Decision:** **React 18+ (Vite) + TypeScript + Tailwind CSS**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Next.js 14+ (App Router):* Node.js server dependency in production, SSR overhead for private enterprise dashboards, hydration complexity on heavy table state.
  2. *Angular / Vue.js:* Slower prototyping velocity, smaller AI diffing/visualization open-source ecosystem.
- **Rationale:** Ultra-fast development speed, instant HMR, pure static asset deployment (served by NGINX with zero Node.js server dependency), rich ecosystem for high-density virtualized data tables (`@tanstack/react-table`), and seamless server-state caching (`@tanstack/react-query`).
- **Dependencies:** Backend OpenAPI REST endpoints.
- **Risks:** Client-side state bloat if large datasets are not virtualized (mitigated via TanStack Table windowing).
- **Reversibility:** Low post-component scaffolding.

---

### ADR-002: Backend API Framework & Runtime
- **Decision ID:** `ADR-002`
- **Area:** Backend API & Service Layer
- **Selected Decision:** **Python 3.11+ FastAPI (ASGI) + Pydantic v2 + SQLAlchemy (Async)**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Node.js / NestJS:* Requires heavy IPC or microservice serialization overhead to communicate with Python AI/ML models.
  2. *Go (Golang):* Immature native NLP library ecosystem, slower development velocity for text normalization rules.
- **Rationale:** Native in-process co-location with PyTorch, Sentence-Transformers, and Spacy NLP libraries; high-throughput ASGI concurrency; strict schema safety via Pydantic v2; automatic interactive OpenAPI/Swagger documentation.
- **Dependencies:** PostgreSQL with `asyncpg` driver.
- **Risks:** CPU-bound blocking operations in async loop (mitigated by offloading bulk vector batching to background Celery workers).
- **Reversibility:** Low post-API implementation.

---

### ADR-003: Primary Relational Database & Multi-Tenancy Architecture
- **Decision ID:** `ADR-003`
- **Area:** Database & Storage Layer
- **Selected Decision:** **PostgreSQL 16+ with Shared Schema & Row-Level Security (RLS)**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Schema-per-Tenant:* Complex migration maintenance across 100+ CPSE schemas; prevents atomic cross-schema joins for deduplication.
  2. *Separate Databases:* Prohibitive operational cost and high latency for national aggregate queries.
- **Rationale:** Provides bulletproof multi-tenant isolation via `cpse_id` RLS policies while allowing unified cross-CPSE deduplication and national analytics queries within a single ACID relational database. Cross-CPSE matching accesses only sanitized Layer 2 intelligence attributes, strictly isolating Layer 1 private operational data.
- **Dependencies:** PostgreSQL 16+ engine.
- **Risks:** RLS policy misconfiguration (mitigated by automated multi-tenancy integration test suite).
- **Reversibility:** Medium.

---

### ADR-004: Vector Database & Semantic Similarity Search Engine
- **Decision ID:** `ADR-004`
- **Area:** AI / Vector Search Infrastructure
- **Selected Decision:** **PostgreSQL `pgvector` Extension with HNSW Cosine Indexing**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Dedicated Standalone Vector DB (Qdrant / Milvus / Pinecone):* Dual-database network latency, synchronization complexity, extra container overhead for local hackathon demo.
  2. *In-Memory FAISS:* Lack of transactional persistence with relational material metadata.
- **Rationale:** Co-locates dense vector embeddings directly inside PostgreSQL tables; provides ACID consistency between specs and vectors; HNSW index yields sub-second approximate nearest neighbor (ANN) search; eliminates extra external service dependencies.
- **Dependencies:** PostgreSQL `pgvector` extension.
- **Risks:** Graph indexing build time at $>10\text{M}$ records (mitigated by category partitioning strategy).
- **Reversibility:** Medium.

---

### ADR-005: AI / NLP Embedding & Attribute Extraction Strategy
- **Decision ID:** `ADR-005`
- **Area:** AI / Machine Learning Engine
- **Selected Decision:** **Hybrid Local Sentence-Transformers (`all-MiniLM-L6-v2`) + Deterministic RegEx/Spacy NER + Controlled Standards Matrix**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Pure Cloud LLM APIs (OpenAI / Gemini Embeddings):* Continuous API token costs, data sovereignty concerns for CPSE defense/energy data, fails if internet drops during live hackathon evaluation.
  2. *Pure Keyword Matching:* Cannot comprehend semantic synonyms or noisy industrial abbreviations.
- **Rationale:** 100% offline execution capability for hackathon demonstration; zero cloud API cost; deterministic unit conversion; controlled standards categorization (Verified Equivalent, Possible Equivalent, Not Equivalent, Requires Domain Review); explainable multi-signal confidence scoring formula.
- **Dependencies:** PyTorch, Sentence-Transformers, Spacy.
- **Risks:** Domain acronym gaps (mitigated by expandable industrial synonym dictionary).
- **Reversibility:** High (models sit behind a standardized embedding interface).

---

### ADR-006: Asynchronous Processing & Task Queue Framework
- **Decision ID:** `ADR-006`
- **Area:** Backend Asynchronous Processing
- **Selected Decision:** **Celery Task Worker Framework with Redis Broker & PostgreSQL Job Persistence (FastAPI BackgroundTasks reserved for lightweight in-process operations)**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Pure FastAPI BackgroundTasks for all operations:* Ephemeral, lacks worker distribution, no persistent retry/failure tracking, risk of worker crashes blocking web event loops during heavy batch embedding.
  2. *Heavy Kafka / RabbitMQ Enterprise Topology:* Overengineered for SIH MVP.
- **Rationale:** 
  - **API Producer:** FastAPI endpoints dispatch long-running jobs (bulk CSV ingestion, batch embeddings, multi-CPSE duplicate scans) via Celery task signatures.
  - **Queue / Broker:** Single Redis instance (`redis://redis:6379/0`).
  - **Worker Framework:** Dedicated Celery worker process with concurrency scaling (`--concurrency=4`).
  - **Job Status Tracking:** Persistent job state tracked in PostgreSQL `ingestion_job` table (Statuses: `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED` with row error logs).
  - **Retry & Failure Handling:** Exponential backoff retry policy (3 retries with jitter) and dead-letter failure logging.
  - **Lightweight Tasks:** FastAPI `BackgroundTasks` used exclusively for non-critical, in-process tasks (e.g., flushing audit log buffers).
- **Dependencies:** Celery, Redis.
- **Risks:** Worker process crash (mitigated by Docker container auto-restart and task acks).
- **Reversibility:** Medium.

---

### ADR-007: Authentication, Session & CSRF Security Architecture
- **Decision ID:** `ADR-007`
- **Area:** Security & Identity Access Management
- **Selected Decision:** **Stateless JWT in HttpOnly SameSite Cookies + Anti-CSRF Token Defense + 7-Role RBAC**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *LocalStorage JWT:* Highly vulnerable to XSS script token theft.
  2. *Cookie Auth without CSRF Mitigation:* Vulnerable to Cross-Site Request Forgery attacks.
- **Rationale:** 
  - **XSS Mitigation:** Signed JWT access tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax/Strict` cookies prevent direct JavaScript access to credentials. *Note: HttpOnly cookies reduce direct script access but do not eliminate all XSS vectors; comprehensive Content Security Policy (CSP), Pydantic input sanitization, and React JSX output encoding provide defense-in-depth.*
  - **CSRF Defense:** Implementation of the **Double Submit Cookie pattern** and Anti-CSRF request header (`X-CSRF-Token`) validated on all mutating HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`).
  - **Session & Invalidation:** Short-lived access tokens (15-minute TTL), refresh token rotation, and instant session invalidation via Redis token blacklisting upon logout.
  - **RBAC:** Fine-grained dependency guards enforcing access control across 7 user roles.
- **Dependencies:** PyJWT, cryptography, Redis (for token blacklisting).
- **Risks:** Token revocation lag (mitigated by short TTL and Redis blacklist).
- **Reversibility:** Medium.

---

### ADR-008: Caching & Query Optimization Strategy
- **Decision ID:** `ADR-008`
- **Area:** Caching & Performance
- **Selected Decision:** **Single Redis Instance for SIH MVP (Redis Cluster / Managed Redis designated for Future Scale Architecture)**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Redis Cluster for MVP:* Unnecessary operational complexity for single-node development and hackathon demonstration.
  2. *In-Memory Process Cache:* Inconsistent cache state across multiple backend Celery worker processes.
- **Rationale:** 
  - **SIH MVP Implementation:** Single Redis 7.2 container (`redis:7.2-alpine`) serving query caching (CNMC taxonomies, price variance statistics), Celery task broker, rate limiting counters, and session token blacklist.
  - **Future Scale Architecture:** Seamless transition to Redis Cluster / AWS ElastiCache / Redis Sentinel when enterprise load exceeds 5,000 concurrent CPSE users.
- **Dependencies:** Redis container.
- **Risks:** Single point of failure in MVP (acceptable for hackathon scope; addressed by replication in production).
- **Reversibility:** High.

---

### ADR-009: Containerization & Local Development Orchestration
- **Decision ID:** `ADR-009`
- **Area:** DevOps & Infrastructure
- **Selected Decision:** **Multi-Service Docker Compose (Frontend, Backend, Celery Worker, DB+pgvector, Redis)**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *Manual Native Host Installs:* Complex prerequisite setup prone to host OS discrepancies during evaluation.
- **Rationale:** 1-command reproducible environment (`docker compose up --build`) ensuring identical execution across developer laptops, CI pipelines, and SIH jury evaluation servers.
- **Dependencies:** Docker & Docker Compose.
- **Risks:** Resource footprint on low-spec developer machines (mitigated by lightweight alpine base images).
- **Reversibility:** High.

---

### ADR-010: CI/CD & Automated Testing Pipeline
- **Decision ID:** `ADR-010`
- **Area:** DevOps & Quality Assurance
- **Selected Decision:** **GitHub Actions Workflow (Lint, TypeCheck, Pytest, Vitest, Docker Build)**
- **Status:** `APPROVED`
- **Alternatives Rejected:**
  1. *GitLab CI / Jenkins:* External hosting and configuration overhead.
- **Rationale:** Zero-maintenance cloud CI natively integrated with GitHub; enforces code quality, type safety, and test coverage on every pull request.
- **Dependencies:** GitHub repository.
- **Risks:** None.
- **Reversibility:** High.

---

### ADR-011: Common National Material Code (CNMC) Prototype Codification Structure
- **Decision ID:** `ADR-011`
- **Area:** Data Governance & Taxonomy Architecture
- **Selected Decision:** **MVP CNMC Prototype Reference Format (`IN-IND-MECH-BLT-00492`) with Sequential Fallback (Subject to Formal National Governance Ratification)**
- **Status:** `APPROVED (PROTOTYPE SPECIFICATION)`
- **Alternatives Rejected:**
  1. *Pure Random UUID / Sequential Code (`CNMC-10049281`):* Zero human readability; unintuitive for plant engineers.
  2. *Pure Cryptographic Hash:* Unusable in spoken communication between plant storekeepers.
- **Rationale:** 
  - **Prototype Reference Model:** A structured, self-describing national code format (Country: `IN`, Sector: `IND`, Discipline: `MECH`, Item: `BLT`, Variant: `00492`) adopted to showcase hierarchical taxonomy capabilities during the SIH 2026 demonstration.
  - **Governance Clarification:** This format is an **MVP Prototype Reference Format**. Formal pan-India standardization requires Department of Public Enterprises (DPE) / line ministry policy ratification, multi-CPSE stakeholder consultation, and national data governance committee sign-off.
- **Dependencies:** National taxonomy definition.
- **Risks:** Category changes (mitigated by bi-directional cross-walk versioning).
- **Reversibility:** High during prototype phase; Low once enterprise ERP exports begin.
