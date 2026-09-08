# DEMONSTRATION ACCOUNTS & EVALUATION GUIDE

> [!WARNING]
> **SIH MVP DEMONSTRATION CREDENTIALS — DEVELOPMENT/DEMO ENVIRONMENT ONLY**  
> These accounts are provided exclusively for prototype demonstration and automated testing in non-production environments. They do NOT represent real individuals or production credentials.

---

## 1. Demonstration Personas Overview

| Role Code | Evaluation Persona Name | Default Email | Assigned Scope | Key Demonstration Flow |
| :--- | :--- | :--- | :--- | :--- |
| `NATIONAL_MASTER_ADMIN` | Dr. Rajesh Sharma | `national_admin@sih.demo` | National Scope | View 5-tab macro analytics, cross-CPSE matrix, and master records. |
| `CPSE_MATERIAL_MANAGER` | Vikram Malhotra | `cpse_manager_a@sih.demo` | IOCL (Tenant A) | Ingest local catalog CSVs; verify cross-tenant upload to ONGC is blocked (403). |
| `CPSE_MATERIAL_MANAGER` | Pooja Verma | `cpse_manager_b@sih.demo` | ONGC (Tenant B) | Ingest local catalog; view tenant-specific cross-walk mappings. |
| `DOMAIN_REVIEWER` | Ananya Sen | `domain_reviewer@sih.demo` | Technical Reviewer | Review CNMC candidates, submit APPROVE / REJECT decisions with justification. |
| `AUDITOR` | Suresh Nair | `auditor@sih.demo` | National Auditor | Inspect immutable audit logs and analytics; verify mutating actions are blocked. |

---

## 2. Seeding Demonstration Accounts

In local development or evaluation environments:
```bash
curl -X POST http://localhost:8000/api/v1/auth/seed-demo-users
```
Or via Python CLI/scripts in development mode.

> [!IMPORTANT]
> **Production Guard:** `POST /api/v1/auth/seed-demo-users` is permanently disabled in production environments (`ENVIRONMENT=production`).
