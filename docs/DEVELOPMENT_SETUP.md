# Development Environment Setup Guide

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** Development & DevOps Manual (Phase 4)  
**Status:** `ACTIVE`

---

## 1. Prerequisites

Before setting up the project locally, ensure you have the following installed:
- **Git** (v2.40+)
- **Node.js** (v18.0+ or v20.x) & **npm** (v9.0+)
- **Python** (v3.11 or v3.12)
- **Docker & Docker Compose** (Optional for containerized run)

---

## 2. Quickstart with Docker Compose

The simplest and most reproducible method to launch the full 5-container stack is using Docker Compose:

```bash
# 1. Clone repository
git clone https://github.com/organization/CSPES.git
cd CSPES

# 2. Configure environment file
cp .env.example .env

# 3. Build and launch containers
docker compose up --build
```

### Accessing Running Services:
- **Frontend Single Page App:** [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Liveness Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **Readiness Health Check:** [http://localhost:8000/api/v1/readiness](http://localhost:8000/api/v1/readiness)
- **PostgreSQL Database:** `localhost:5432` (User: `postgres`, Password: `postgres`, DB: `material_master`)
- **Redis Server:** `localhost:6379`

---

## 3. Native Local Development Setup (Without Docker)

### Backend Setup (FastAPI & Celery)
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Upgrade pip and install requirements
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations (Ensure PostgreSQL is running locally)
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# In a separate terminal, start Celery worker:
celery -A app.core.celery_app worker --loglevel=info --concurrency=2
```

### Frontend Setup (React & Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
The frontend is available at [http://localhost:3000](http://localhost:3000) or [http://localhost:5173](http://localhost:5173).

---

## 4. Running Test Suites

### Running Frontend Tests:
```bash
cd frontend
npm test
```

### Running Backend Tests:
```bash
cd backend
pytest
```
