# Material Catalog File Format & Ingestion Guide

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** User & Technical Integration Guide (Phase 6)  
**Status:** `ACTIVE / AUDITED`

---

## 1. Supported File Formats

| Format | Extensions | Character Encoding | Max Size | Status | Notes |
|---|---|---|---|---|---|
| **CSV** | `.csv` | UTF-8, UTF-8 with BOM, Latin-1 | 50 MB | **SUPPORTED** | Automatic delimiter detection (`,`, `;`, `\t`, `\|`). |
| **OpenXML Excel** | `.xlsx` | Binary OpenXML Workbook | 50 MB | **SUPPORTED** | Uses primary active worksheet via `openpyxl`. |
| **Legacy Binary Excel** | `.xls` | Binary BIFF8 | N/A | **REJECTED (422)** | Explicitly rejected. Please convert legacy `.xls` to `.xlsx` or `.csv`. |

---

## 2. Canonical Column Mapping Reference

The platform uses a flexible mapping contract rather than imposing a single strict schema:

| Canonical Field Name | Required? | Description | Example CPSE Headers |
|---|---|---|---|
| `material_code` | **YES** | Unique item code used in originating CPSE ERP | `MAT_CODE`, `Material_Number`, `ITEM_CODE`, `Part_No` |
| `description` | **YES** | Primary textual material description | `ITEM_DESCRIPTION`, `Material_Description`, `Item_Title`, `Short_Text` |
| `specification` | Optional | Supplementary technical specifications | `SPEC_DETAILS`, `Technical_Specs`, `SPECS`, `Drawing_Notes` |
| `unit_of_measure` | Optional | Unit of measure for stocking / procurement | `UOM`, `Unit`, `Base_UOM`, `Unit_Of_Measurement` |
| `category` | Optional | Local CPSE classification or material group | `MATERIAL_GROUP`, `Category_Dept`, `Classification`, `Group_Code` |
| `manufacturer` | Optional | OEM or manufacturer brand name | `OEM_NAME`, `Manufacturer`, `Vendor_Ref`, `Brand` |
| `oem_part_number` | Optional | OEM reference or manufacturer part number | `OEM_PART_NO`, `MFR_Part_Number`, `Drawing_No` |

---

## 3. Sensitive Procurement Data Boundary (Layer 1 Isolation)

> [!IMPORTANT]
> **Confidential Procurement Data Isolation Rule:**  
> Proprietary contract purchase prices (e.g. `PO_PRICE_INR`), internal purchase order numbers (`PO_NUMBER`), and confidential vendor identities are stored **strictly in Layer 1** (`raw_materials.source_payload`). They are **NEVER** copied into canonical descriptions, Layer 2 normalized intelligence, future dense vector embeddings, or Layer 3 shared public master data.

---

## 4. Sample File Structures

### 4.1 Sample CSV File (`demo-data/indianoil_materials_demo.csv`)
```csv
MAT_CODE,ITEM_DESCRIPTION,SPEC_DETAILS,UOM,MATERIAL_GROUP,OEM_NAME,PO_PRICE_INR
IOCL-BOLT-001,HEX BOLT M16 X 50 MM SS304,IS 1363 / ISO 4016 GRADE SS304 COARSE THREAD,NOS,FASTENERS,Unbrako Fasteners,48.50
IOCL-VALV-302,2 INCH BALL VALVE CL300 FLANGED,ASTM A216 WCB FULL BORE ASME B16.34,NOS,VALVES,L&T Valves,18500.00
IOCL-MTR-105,3-PHASE INDUCTION MOTOR 75KW 415V 1480RPM,IP55 S1 FOOT MOUNTED IE3 FRAME 280M,NOS,MOTORS,Bharat Bijlee,145000.00
```

### 4.2 Sample Excel File (`demo-data/ntpc_materials_demo.xlsx`)
| Material_Number | Item_Title | Technical_Specs | Unit_Of_Measurement | Category_Dept | Vendor_Ref |
|---|---|---|---|---|---|
| `NTPC-MECH-7842` | `STAINLESS STEEL HEXAGON HEAD BOLT 16MM DIA 50MM LENGTH SS 304` | `CONFORMING TO ISO 4016 FULL THREAD` | `EA` | `MECHANICAL` | `Sundram Fasteners` |
| `NTPC-VALV-9901` | `BALL VALVE 50MM NB ASME B16.34 CLASS 300 WCB RF FLANGED` | `2 PIECE CAST STEEL BODY ASTM A216 WCB` | `EA` | `TURBINE_AUX` | `Audco India` |

---

## 5. Common Validation Errors & Solutions

| Error Message | Cause | Resolution |
|---|---|---|
| `Legacy binary Excel format (.xls) is not supported...` | Attempted to upload older `.xls` binary workbook. | Re-save or export the file as `.xlsx` (OpenXML) or `.csv` before uploading. |
| `Missing required material code.` | Cell in `material_code` column is empty. | Provide a unique alphanumeric identifier for the row. |
| `Missing required material description.` | Cell in `description` column is empty. | Provide item description. |
| `Background Celery worker is offline and file exceeds maximum synchronous processing limit...` | File exceeds 250 rows and Celery is unavailable. | Start Redis/Celery worker daemon or upload batch in smaller chunks for development. |
| `Duplicate file detected.` | An identical file was already uploaded for this CPSE. | Modify the dataset or submit a new revision if intentional. |
