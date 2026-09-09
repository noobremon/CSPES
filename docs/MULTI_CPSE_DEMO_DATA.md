# Multi-CPSE Synthetic Demonstration Datasets

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Audit Standard:** Government Data Integrity & Ethical AI Disclosure  
**Date:** September 2026

---

## 1. Transparency Statement

> [!NOTE]
> All records in these demonstration catalogs are **SYNTHETIC DEMONSTRATION DATA** engineered to model realistic public sector procurement categories across 10 major industrial domains. No classified, proprietary, or actual internal Government of India records are included.

---

## 2. Demonstration Catalog Categories

The demonstration dataset includes multi-sector records with intentional matching, near-duplicate, and conflict scenarios:

| Category / Component | Sample Item Descriptions Across CPSEs | Expected Hybrid Match Result | Reason / Explanation |
|:---|:---|:---|:---|
| **Fasteners (Hex Bolts)** | `IOCL: HEX BOLT M16X50 SS304` <br> `NTPC: HEXAGONAL BOLT 16MM X 50MM SS 304` | `EXACT_MATCH_CANDIDATE` | Identical physical parameters (M16, 50mm length, Grade SS304). |
| **Ball Valves (Identical)** | `ONGC: BALL VALVE 50MM CL300 WCB FLANGED` <br> `GAIL: 2" FLANGED BALL VALVE CLASS 300 ASTM A216 WCB` | `EXACT_MATCH_CANDIDATE` | Identical size (2" = 50mm NB), Class 300, WCB metallurgy. |
| **Ball Valves (Conflict)** | `IOCL: BALL VALVE 50MM CL150 WCB` <br> `NTPC: BALL VALVE 50MM CL600 WCB` | `REQUIRES_DOMAIN_REVIEW` | **Hard Conflict:** Pressure rating mismatch (Class 150 vs Class 600). Auto-merging strictly blocked. |
| **Centrifugal Pumps** | `BHEL: CENTRIFUGAL PUMP 50M3/HR 75KW 2900RPM` <br> `NTPC: 50 M3/HR WATER PUMP 75 KW MOTOR 2-POLE` | `NEAR_DUPLICATE_CANDIDATE` | Compatible flow capacity and power rating; minor text variations. |
| **Induction Motors** | `SAIL: 3-PHASE SQUIRREL CAGE MOTOR 415V 15KW 1450RPM` <br> `CIL: AC INDUCTION MOTOR 15 KW 415 VAC 4 POLE` | `EXACT_MATCH_CANDIDATE` | Standard electrical parameters match (15kW, 415V, 4-pole / ~1450 RPM). |
| **Gaskets & Seals** | `IOCL: SPIRAL WOUND GASKET 2" 300# SS316 GRAPHITE` <br> `ONGC: SWG 50MM NB CLASS 300 SS316/GRA` | `EXACT_MATCH_CANDIDATE` | Identical nominal size, pressure rating, and filler material. |
| **Piping (Seamless Pipes)** | `GAIL: SEAMLESS STEEL PIPE 6" SCH 40 ASTM A106 GR B` <br> `IOCL: 150MM NB SCH40 CS SEAMLESS PIPE A106-B` | `EXACT_MATCH_CANDIDATE` | Standard piping schedule and metallurgy alignment. |
| **Electrical Switchgear** | `PGCIL: VACUUM CIRCUIT BREAKER 33KV 1250A 25KA` <br> `NTPC: 33 KV VCB 1250 AMP 25 KA INDOOR` | `EXACT_MATCH_CANDIDATE` | Voltage (33kV), current (1250A), and breaking capacity (25kA) match. |

---

## 3. Pre-Configured Demonstration Files

- `demo-data/indianoil_materials_demo.csv` — Representative IOCL refinery piping & mechanical catalog.
- `demo-data/ntpc_materials_demo.xlsx` — Representative NTPC thermal power mechanical & electrical catalog.
- `backend/scripts/seed_demo_data.py` — Multi-sector seed script populating 10 CPSE demonstration profiles, taxonomy nodes, match clusters, and audit records.
