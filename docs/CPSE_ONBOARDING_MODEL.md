# Multi-Sector CPSE Onboarding & Organization Model

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Audit Standard:** Extensible Enterprise Registry Architecture  
**Date:** September 2026

---

## 1. Statutory Demonstration Disclosure

> [!WARNING]
> **DEMONSTRATION ORGANIZATION PROFILES — NOT LIVE CONNECTED**  
> All Central Public Sector Enterprise (CPSE) profiles, source system names, and catalog samples registered in this platform are **SYNTHETIC DEMONSTRATION PROFILES** created exclusively for Smart India Hackathon (SIH) 2026 technical evaluation. They do not imply that any real enterprise has partnered with, integrated with, or authorized live production deployment.

---

## 2. Supported Industrial Sectors & CPSE Registry

The platform provides an extensible, database-driven organization registry spanning 10 key public sector industrial domains:

| Sector / Domain | CPSE Code | Organization Name | Public Sector Tier | Data Source Integration Channel | Demo Status |
|:---|:---|:---|:---|:---|:---|
| **1. Oil & Gas** | `IOCL` | Indian Oil Corporation Limited | Maharatna | `FUTURE_SAP_CONNECTOR` | Demonstration Profile |
| **1. Oil & Gas** | `ONGC` | Oil and Natural Gas Corporation | Maharatna | `FUTURE_SAP_CONNECTOR` | Demonstration Profile |
| **1. Oil & Gas** | `GAIL` | GAIL (India) Limited | Maharatna | `FUTURE_SAP_CONNECTOR` | Demonstration Profile |
| **2. Power Generation** | `NTPC` | NTPC Limited | Maharatna | `FUTURE_ERP_API` | Demonstration Profile |
| **3. Power Transmission** | `PGCIL` | Power Grid Corporation of India | Maharatna | `FUTURE_SAP_CONNECTOR` | Demonstration Profile |
| **4. Coal & Mining** | `CIL` | Coal India Limited | Maharatna | `MANUAL_CSV_UPLOAD` | Demonstration Profile |
| **5. Steel Manufacturing** | `SAIL` | Steel Authority of India Limited | Maharatna | `MANUAL_XLSX_UPLOAD` | Demonstration Profile |
| **6. Heavy Engineering** | `BHEL` | Bharat Heavy Electricals Limited | Maharatna | `MANUAL_CSV_UPLOAD` | Demonstration Profile |
| **7. Metals & Minerals** | `NMDC` | NMDC Limited | Navratna | `MANUAL_CSV_UPLOAD` | Demonstration Profile |
| **8. Defence Manufacturing** | `BEL` | Bharat Electronics Limited | Navratna | `FUTURE_ERP_API` | Demonstration Profile |

---

## 3. Database Schema: `organizations` Table

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,             -- e.g. 'IOCL', 'NTPC'
    name VARCHAR(255) NOT NULL,                    -- e.g. 'Indian Oil Corporation Limited'
    short_name VARCHAR(100),                       -- e.g. 'IndianOil'
    sector VARCHAR(100) NOT NULL,                  -- e.g. 'Oil & Gas'
    organization_type VARCHAR(50) NOT NULL,        -- 'MAHARATNA', 'NAVRATNA', 'MINIRATNA', 'CPSE'
    onboarding_status VARCHAR(50) NOT NULL,        -- 'ONBOARDED_ACTIVE', 'IN_ONBOARDING', 'PILOT_EVALUATION'
    demo_status VARCHAR(100) NOT NULL,             -- 'DEMONSTRATION_PROFILE', 'SYNTHETIC_DATA_ONLY'
    data_source_type VARCHAR(50) NOT NULL,         -- 'MANUAL_CSV_UPLOAD', 'MANUAL_XLSX_UPLOAD', 'FUTURE_ERP_API', 'FUTURE_SAP_CONNECTOR'
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,  -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

---

## 4. Multi-Tenant Isolation & Access Rules

1. **Organization-Scoped Tenant Boundary:** Every catalog file, raw material master record, and source system is bound to an `organization_id`.
2. **Access Control Enforcement:** The FastAPI dependency `validate_tenant_access` in [app/core/deps.py](file:///c:/Users/User/Desktop/CSPES/backend/app/core/deps.py) blocks CPSE officers from reading or mutating materials belonging to a different CPSE.
3. **Cross-Tenant Comparison Protection:** Cross-CPSE similarity calculations operate exclusively on sanitized Layer 2 attributes, strictly preventing exposure of Layer 1 private commercial data.
