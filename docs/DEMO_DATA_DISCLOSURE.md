# Demonstration Data Disclosure & Ethical AI Declaration

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Audit Standard:** Government Data Integrity & Ethical AI Transparency  
**Audit Date:** September 2026

---

## 1. Transparency Statement

All material records, pricing figures, purchase order numbers, vendor references, and expenditure metrics bundled within this prototype repository are **SYNTHETIC DEMONSTRATION DATA** generated exclusively for Smart India Hackathon 2026 technical evaluation.

- **No Classified Government Data:** No proprietary, classified, or confidential information belonging to any Central Public Sector Enterprise (CPSE) or Ministry is included in this repository.
- **Representative Industrial Patterns:** Demonstration records model real-world industrial taxonomy patterns (valves, pipes, fasteners, electrical switchgear, pumps) based on public engineering standards (IS, ISO, DIN, ASME, ASTM).
- **Synthetic Price & Volume Figures:** Any demand aggregation volumes or illustrative procurement values displayed in dashboard cards are algorithmic aggregations of synthetic demonstration rows, **not audited Government expenditures**.

---

## 2. Seed Data Inventory

| Dataset / File | Format | Record Count | Description | Primary Target |
|:---|:---|:---|:---|:---|
| `indianoil_materials_demo.csv` | CSV | 20 records | Representative refinery/pipeline mechanical and piping items. | IOCL Ingestion Testing |
| `ntpc_materials_demo.xlsx` | OpenXML Excel | 25 records | Representative thermal power generation mechanical/electrical items. | NTPC Ingestion Testing |
| `backend/scripts/seed_demo_data.py` | Python Script | 6 Organizations, ~120 Materials | Complete multi-CPSE seed script generating cross-CPSE duplicates, near-duplicates, and candidates. | Local & E2E Testing |

---

## 3. Disclaimers Embedded in Code & UI

1. **Dashboard Disclaimer Banner:**  
   *"SYNTHETIC DEMONSTRATION INSIGHT — Metrics and potential opportunities are dynamically aggregated from the demonstration dataset for SIH 2026 evaluation. Does not represent verified Government of India expenditure or official audited savings."*

2. **Governance Decision Notice:**  
   *"Approved within the SIH MVP demonstration governance workflow. Does not constitute Government of India, DPE, or statutory national policy approval."*

3. **CNMC Code Classification:**  
   *"MVP Prototype Reference Format — Created for prototype taxonomy evaluation."*
