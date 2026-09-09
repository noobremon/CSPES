# Complete Render Deployment Guide

**Project:** AI-Powered National Unified Material Master Framework  
**Target Platform:** [Render.com](https://render.com)  
**Deployment Model:** Monorepo with PostgreSQL Database + FastAPI Backend + React/Vite Frontend

---

## Option 1: 1-Click Blueprint Deployment (Recommended)

Render supports Infrastructure-as-Code via the provided [render.yaml](file:///c:/Users/User/Desktop/CSPES/render.yaml) file in the root directory.

### Steps:
1. **Push your code to GitHub / GitLab:**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```
2. **Log into Render Dashboard:** [dashboard.render.com](https://dashboard.render.com)
3. Click **"New +"** in the top right $\rightarrow$ Select **"Blueprint"**.
4. Connect your GitHub/GitLab repository.
5. Render will automatically read `render.yaml` and configure:
   - `cpse-material-master-db` (PostgreSQL 16 Database)
   - `cpse-unified-material-master-backend` (FastAPI Web Service)
   - `cpse-unified-material-master-frontend` (Static Site)
6. Click **"Apply"**. Render will provision the database, run Alembic migrations, seed initial CPSE demo data, build the frontend, and deploy the entire platform automatically.

---

## Option 2: Step-by-Step Manual Dashboard Setup

If you prefer to configure each service manually in the Render UI, follow these steps:

---

### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** $\rightarrow$ **"PostgreSQL"**.
2. **Name:** `cpse-material-master-db`
3. **Database Name:** `material_master`
4. **User:** `postgres`
5. **Region:** Select closest region (e.g., Singapore, Frankfurt, Oregon).
6. **PostgreSQL Version:** 16
7. Click **"Create Database"**.
8. Once created, copy the **Internal Database URL** (e.g., `postgres://postgres:password@dpg-xxxx-a:5432/material_master`).

---

### Step 2: Deploy Backend Web Service

1. Click **"New +"** $\rightarrow$ **"Web Service"**.
2. Connect your repository.
3. Configure the settings:
   - **Name:** `cpse-backend`
   - **Language / Runtime:** `Python 3`
   - **Root Directory:** `backend`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && alembic upgrade head && python scripts/seed_demo_data.py
     ```
   - **Start Command:**
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. **Environment Variables:**
   - `DATABASE_URL`: *(Paste the Internal Database URL from Step 1)*
   - `ENVIRONMENT`: `production`
   - `SECRET_KEY`: *(Click "Generate" or provide min 32-character string)*
   - `CSRF_SECRET_KEY`: *(Click "Generate" or provide min 32-character string)*
   - `ALLOWED_CORS_ORIGINS`: `*` *(or your frontend render URL)*
   - `LOG_LEVEL`: `INFO`
5. Click **"Create Web Service"**.
6. Once deployed, note your backend URL (e.g., `https://cpse-backend.onrender.com`).
7. Test the API by opening `https://cpse-backend.onrender.com/docs` in your browser.

---

### Step 3: Deploy Frontend Static Site

1. Click **"New +"** $\rightarrow$ **"Static Site"**.
2. Connect the same repository.
3. Configure settings:
   - **Name:** `cpse-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Environment Variables:**
   - `VITE_API_BASE_URL`: `https://cpse-backend.onrender.com/api/v1` *(Replace with your actual backend URL from Step 2)*
5. **Redirects / Rewrites (Crucial for Single Page App routing):**
   - Go to **"Redirects/Rewrites"** tab.
   - Click **"Add Rule"**:
     - **Type:** `Rewrite`
     - **Source:** `/*`
     - **Destination:** `/index.html`
6. Click **"Create Static Site"**.

---

## Step 4: Verification & Login

Once both services are active:
1. Open your frontend URL (e.g. `https://cpse-frontend.onrender.com`).
2. Log in using any of the pre-seeded demo accounts:
   - **Domain Reviewer:** `domain_reviewer@sih.demo` (Password: `Demo@2026!`)
   - **Super Admin:** `superadmin@sih.demo` (Password: `Demo@2026!`)
   - **IOCL Officer:** `officer_iocl@sih.demo` (Password: `Demo@2026!`)
   - **NTPC Officer:** `officer_ntpc@sih.demo` (Password: `Demo@2026!`)
   - **National Auditor:** `auditor@sih.demo` (Password: `Demo@2026!`)
