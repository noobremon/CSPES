# AI-Powered National Unified Material Master Framework

**Smart India Hackathon (SIH) 2026**  
**Vision Statement:** *"One Nation – One Common Material Code"*  
**Target Entities:** Central Public Sector Enterprises (CPSEs) under Government of India  

---

## 1. Project Overview

In the Indian public enterprise ecosystem, hundreds of Central Public Sector Enterprises (CPSEs) manage massive industrial inventories across disparate, isolated ERP instances (SAP S/4HANA, ECC, Oracle ERP, bespoke legacy systems). 

The **AI-Powered National Unified Material Master Framework** acts as an intelligent data standardization, semantic understanding, deduplication, mapping, and governance platform operating alongside enterprise ERPs to:
- Ingest and normalize heterogeneous material master records.
- Extract structured technical attributes via industrial NLP.
- Uncover exact, duplicate, near-duplicate, and functionally equivalent items using multi-signal AI matching.
- Map legacy CPSE item codes to standardized **Common National Material Codes (CNMC)**.
- Enforce human-in-the-loop governance with tamper-proof immutable audit logging.
- Provide cross-CPSE procurement intelligence, price variance analysis, and surplus inventory redeployment insights.

---

## 2. Technology Stack & Architecture

- **Frontend:** React 18+ (Vite) + TypeScript + Tailwind CSS + TanStack Table / Query + Lucide Icons.
- **Backend API Gateway:** Python 3.11+ FastAPI (ASGI) + Pydantic v2 + SQLAlchemy (Async).
- **Asynchronous Task Workers:** Celery Worker Process + Single Redis Broker.
- **Database & Storage:** PostgreSQL 16+ with `pgvector` Extension (HNSW indexing) + Row-Level Security (RLS).
- **Caching & Rate Limiting:** Single Redis 7.2 Instance.
- **Containerization & CI/CD:** Docker Compose (5 multi-service containers) + GitHub Actions.

---

## 3. Repository Structure

```text
CSPES/
├── frontend/             # React 18+ (Vite) Single Page Application
├── backend/              # FastAPI ASGI API Gateway & Celery Worker
├── docs/                 # Complete Architecture, Design, & Audit Blueprints (45+ Docs)
├── infrastructure/       # Docker Compose & NGINX Configuration
├── scripts/              # Setup, migration, and development utilities
├── .github/              # CI/CD workflows (GitHub Actions)
├── .env.example          # Environment template with safe defaults
├── .gitignore            # Git exclusion rules
├── docker-compose.yml    # Root Docker Compose specification
└── README.md             # Project documentation
```

---

## 4. Getting Started Locally

### Prerequisites
- Node.js (v18+) & npm
- Python (3.11+)
- Docker & Docker Compose (Optional for containerized run)

### Running with Docker Compose (Recommended)
```bash
# 1. Clone the repository
git clone <repository-url>
cd CSPES

# 2. Copy environment template
cp .env.example .env

# 3. Build and launch all 5 containers
docker compose up --build
```
- **Frontend App:** `http://localhost:3000`
- **Backend API Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/api/v1/health`

### Running Locally without Docker
#### Backend:
```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate | On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Running Tests

### Frontend Test Suite (Vitest)
```bash
cd frontend
npm test
```

### Backend Test Suite (Pytest)
```bash
cd backend
pytest
```

---

## 6. Security & Governance Notice

This repository utilizes safe development environment placeholders. Production deployment requires proper configuration of secrets, PostgreSQL credentials, and Redis passwords. Direct live write-backs to production SAP databases are handled via isolated export adapters to preserve source enterprise integrity.
