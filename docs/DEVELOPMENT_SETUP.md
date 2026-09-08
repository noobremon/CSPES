# Development Environment Setup Guide

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Development & DevOps Manual (Phase 4)  
**Status:** `ACTIVE / AUDITED`

---

## 1. Prerequisites

Before setting up the project locally, ensure you have the following installed on your machine:
- **Git** (v2.40+)
- **Node.js** (v18.0+ or v20.x) & **npm** (v9.0+)
- **Python** (v3.11 or v3.12)
- **Docker & Docker Compose** (Optional for containerized run)

---

## 2. Docker Compose Environment (Single Canonical Entry Point)

The **single canonical source of truth** for containerized development is the root **`/docker-compose.yml`**.

```bash
# 1. Clone repository
git clone https://github.com/organization/CSPES.git
cd CSPES

# 2. Configure environment file
cp .env.example .env

# 3. Build and launch all 5 containers
docker compose up --build
```

### Containerized Services Overview:
- **Frontend App (NGINX Container):** [http://localhost:3000](http://localhost:3000) *(Production-like static bundle preview)*
- **FastAPI OpenAPI Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Liveness Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **Readiness Health Check:** [http://localhost:8000/api/v1/readiness](http://localhost:8000/api/v1/readiness)
- **Diagnostic Celery Task Trigger:** `POST http://localhost:8000/api/v1/test-celery-ping` *(Development/Diagnostic only)*
- **PostgreSQL Database:** `localhost:5432` (User: `postgres`, Password: `postgres`, DB: `material_master`)
- **Redis Server:** `localhost:6379`
- **Celery Worker:** Running in background container consuming from Redis broker.

---

## 3. Native Local Development Setup (Recommended for Active Coding)

For rapid development with instant Hot Module Replacement (HMR) and live debugging, run frontend and backend natively:

### A. Frontend Setup (Vite Development Server with HMR)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite hot-reloading development server
npm run dev
```
*Note:* The Vite development server provides instant HMR on `http://localhost:3000` or `http://localhost:5173`. Use this for all UI development rather than rebuilding the NGINX container.

### B. Backend Setup (FastAPI & Celery Worker)
```bash
cd backend

# Create & activate Python virtual environment
py -3.12 -m venv .venv
# On Windows: .venv\Scripts\activate | On Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run initial technical database migration (Requires running PostgreSQL)
alembic upgrade head

# Start FastAPI ASGI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# In a separate terminal, start the Celery background worker (Requires running Redis):
celery -A app.core.celery_app worker --loglevel=info --concurrency=2
```

---

## 4. Running Test Suites

### Running Frontend Tests (Vitest in JSDOM):
```bash
cd frontend
npm test
```

### Running Backend Tests (Pytest with AsyncClient):
```bash
cd backend
pytest
```

---

## 5. Development Diagnostic Endpoints Notice

- **`POST /api/v1/test-celery-ping`:** A **DEVELOPMENT / DIAGNOSTIC ONLY** endpoint designed to verify Celery task dispatching to Redis. It is not part of the business API surface and will be disabled in production.
- **`system_health_checks` table:** A **TECHNICAL INFRASTRUCTURE TABLE** created to verify Alembic migration execution. Real material master domain models will be added in Phase 5.
