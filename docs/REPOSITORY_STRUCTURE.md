# Repository Structure & Directory Organization

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Development & Architecture Manual (Phase 4)  
**Status:** `ACTIVE / AUDITED`

---

## 1. Directory Tree Overview

```text
c:\Users\User\Desktop\CSPES
├── .github/                       # CI/CD workflows (GitHub Actions)
│   └── workflows/
│       └── ci.yml                 # Automated testing & linting pipeline
├── backend/                       # Python FastAPI Backend & Celery Worker
│   ├── alembic/                   # Database migration framework
│   │   ├── versions/              # Migration scripts (pgvector & initial schema)
│   │   │   └── 2026_09_08_0001-initial_health_foundation.py
│   │   ├── env.py                 # Async migration runner
│   │   └── script.py.mako         # Migration template
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/     # API routes (health, diagnostics)
│   │   │       │   └── health.py  # Liveness, readiness, diagnostic ping
│   │   │       ├── dependencies.py
│   │   │       └── router.py      # v1 Router aggregator
│   │   ├── core/                  # Core configurations & security
│   │   │   ├── config.py          # Pydantic BaseSettings
│   │   │   ├── celery_app.py      # Celery task broker configuration
│   │   │   ├── exceptions.py      # Global exception handlers
│   │   │   └── logging.py         # Structured Loguru logging
│   │   ├── db/                    # Database session & base declarative models
│   │   │   ├── base.py
│   │   │   └── session.py         # Async SQLAlchemy engine
│   │   ├── models/                # SQLAlchemy ORM models
│   │   │   └── __init__.py        # Technical table: SystemHealthCheck
│   │   ├── schemas/               # Pydantic v2 DTO validation schemas
│   │   │   ├── health.py
│   │   │   └── response.py        # Generic API envelope schemas
│   │   ├── workers/               # Celery worker background task definitions
│   │   │   └── tasks.py           # Technical ping task & batch jobs
│   │   └── main.py                # FastAPI application entry point & CORS
│   ├── tests/                     # Backend Pytest suite
│   │   ├── conftest.py
│   │   └── test_health.py
│   ├── alembic.ini
│   ├── Dockerfile                 # Backend container image build
│   ├── pyproject.toml             # Pytest configuration
│   └── requirements.txt           # Python dependency manifest
├── frontend/                      # React 18+ (Vite) Single Page Application
│   ├── public/                    # Static assets & icons
│   │   └── favicon.svg
│   ├── src/
│   │   ├── app/                   # Root application components
│   │   │   └── App.tsx
│   │   ├── components/            # Reusable UI component library
│   │   │   ├── common/
│   │   │   ├── layout/            # Navigation Header & Footers
│   │   │   │   └── Header.tsx
│   │   │   └── ui/                # Base cards, badges, inputs
│   │   │       └── Card.tsx
│   │   ├── services/              # API clients & HTTP services
│   │   │   └── api.ts
│   │   ├── styles/                # Tailwind CSS & design tokens
│   │   │   └── index.css
│   │   ├── types/                 # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── main.tsx               # React DOM entry point
│   ├── tests/                     # Frontend Vitest test suite
│   │   ├── setup.ts
│   │   └── App.test.tsx
│   ├── Dockerfile                 # Frontend container build (NGINX preview)
│   ├── nginx.conf                 # NGINX reverse proxy config
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts             # Vite configuration with Vitest setup
├── docs/                          # Complete Documentation Suite (47+ Docs)
│   ├── phases/                    # Phase sign-off records
│   │   ├── PHASE_01_DISCOVERY.md
│   │   ├── PHASE_02_PRODUCT_SYSTEM_DESIGN.md
│   │   ├── PHASE_03_SYSTEM_ARCHITECTURE.md
│   │   └── PHASE_04_FOUNDATION.md
│   ├── ADR_DECISION_SUMMARY.md
│   ├── AI_ARCHITECTURE.md
│   ├── ARCHITECTURE_DECISIONS.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── CROSS_CPSE_DATA_ACCESS_MODEL.md
│   ├── DATABASE_ARCHITECTURE.md
│   ├── DEVELOPMENT_SETUP.md
│   ├── DEVOPS_ARCHITECTURE.md
│   ├── ENVIRONMENT_CONFIGURATION.md
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── FUNCTIONAL_REQUIREMENTS.md
│   ├── HANDOFF.md
│   ├── INTEGRATION_ARCHITECTURE.md
│   ├── MATERIAL_LIFECYCLE.md
│   ├── NON_FUNCTIONAL_REQUIREMENTS.md
│   ├── OBSERVABILITY_ARCHITECTURE.md
│   ├── PERFORMANCE_ARCHITECTURE.md
│   ├── PHASE_04_VERIFICATION_MATRIX.md
│   ├── PRODUCT_MODULES.md
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── REPOSITORY_STRUCTURE.md
│   ├── SCALABILITY_STRATEGY.md
│   ├── SECURITY_ARCHITECTURE.md
│   ├── SIH_DEMO_SCENARIOS.md
│   ├── SIH_MVP_SCOPE.md
│   ├── STAKEHOLDERS_AND_USERS.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── SYSTEM_CONTEXT.md
│   └── TESTING_STRATEGY.md
├── infrastructure/                # Deployment configs & cloud assets
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git exclusion rules
├── docker-compose.yml             # Single Canonical Root Docker Compose file
└── README.md                      # Primary project overview
```
