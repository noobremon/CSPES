# Environment Configuration & Secret Management Guide

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Security & Operations Manual (Phase 4)  
**Status:** `ACTIVE`

---

## 1. Environment Variable Architecture

Configuration is managed via Pydantic `BaseSettings` (`backend/app/core/config.py`) and Vite environment modes (`frontend/.env`).

All environment variables must be defined in `.env` (which is excluded from Git via `.gitignore`). Safe defaults and templates are provided in `.env.example`.

```mermaid
flowchart LR
    EnvFile[".env (Excluded from Git)"] --> Pydantic["Backend: Pydantic BaseSettings"]
    EnvFile --> Vite["Frontend: import.meta.env"]
    EnvFile --> Compose["Docker Compose: Environment Ingestion"]
```

---

## 2. Configuration Key Reference

| Variable Name | Default / Example Value | Required | Purpose |
|---|---|---|---|
| `ENVIRONMENT` | `development` / `production` | Yes | Controls debug logging, SQL echoing, and error verbosity. |
| `LOG_LEVEL` | `INFO` / `DEBUG` / `WARNING` | Yes | Structured logging threshold for Loguru. |
| `API_V1_STR` | `/api/v1` | Yes | URI prefix for version 1 REST API routes. |
| `SECRET_KEY` | *(Min 32-character string)* | Yes | Cryptographic key for signing JWT access/refresh tokens. |
| `CSRF_SECRET_KEY` | *(Min 32-character string)* | Yes | Cryptographic key for Double Submit Anti-CSRF token verification. |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/material_master` | Yes | Async SQLAlchemy connection string for PostgreSQL. |
| `REDIS_URL` | `redis://localhost:6379/0` | Yes | Redis connection URL for caching, session blacklist, and rate limiting. |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Yes | Celery task message broker connection. |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/0` | Yes | Celery task state and result backend. |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Yes | Base URL used by React frontend to communicate with API gateway. |
| `ALLOWED_CORS_ORIGINS` | `["http://localhost:3000","http://127.0.0.1:3000"]` | Yes | CORS allowlist restricting allowed client origins. |

---

## 3. Secret Management Guidelines

1. **Never Commit Secrets:** `.env` files are strictly listed in `.gitignore`.
2. **Production Rotation:** When deploying to government cloud infrastructure (e.g., NIC Cloud / MeghRaj), all default development secrets (`SECRET_KEY`, `POSTGRES_PASSWORD`) must be replaced with cryptographically secure random keys generated via `openssl rand -hex 32`.
