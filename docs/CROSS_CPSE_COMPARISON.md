# Cross-CPSE Material Comparison & Harmonization

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Date:** September 2026

---

## 1. Cross-CPSE Comparison Model

When multiple CPSEs (e.g. IOCL, NTPC, SAIL, BHEL) ingest their material catalogs into the framework:
1. **Local Codes are Immutably Preserved:** IOCL retains `MAT-1001`, NTPC retains `BOLT-778`, SAIL retains `MECH-4521`.
2. **Layer 2 Normalization:** Each description is sanitized into standardized engineering terms and attributes.
3. **Candidate Clustering:** The 3-tier hybrid matching engine identifies equivalence and generates a Common National Material Code (CNMC) recommendation.

```
CPSE A (IOCL)                         CPSE B (NTPC)
Code: MAT-1001                        Code: BOLT-778
Desc: "HEX BOLT M16X50 SS304"         Desc: "HEXAGONAL BOLT 16MM X 50MM SS 304"
        │                                     │
        ▼                                     ▼
Normalized:                           Normalized:
"HEXAGON HEAD BOLT M16 x 50 MM SS304" "HEXAGON HEAD BOLT M16 x 50 MM SS304"
Attributes:                           Attributes:
• thread_pitch: M16                   • thread_pitch: M16
• diameter: 16 mm                     • diameter: 16 mm
• length: 50 mm                       • length: 50 mm
• material_grade: SS304               • material_grade: SS304
        │                                     │
        └──────────────────┬──────────────────┘
                           ▼
              HYBRID MATCHING ENGINE
              • Attribute Score: 100%
              • Lexical Token Set Ratio: 94%
              • Semantic Cosine Similarity: 96%
              • Composite Match Score: 97%
              • Classification: EXACT_MATCH_CANDIDATE
                           ▼
             RECOMMENDED PROTOTYPE CNMC
                IN-IND-MECH-BLT-00492
```

---

## 2. Cross-CPSE Overlap Matrix ($N \times N$)

The platform calculates dynamic pairwise overlap percentages across participating CPSE organizations without exposing confidential purchase order numbers or vendor prices:

| CPSE Name | IOCL | NTPC | SAIL | CIL | BHEL |
|:---|:---:|:---:|:---:|:---:|:---:|
| **IOCL (Oil & Gas)** | 100% | 42% | 38% | 24% | 46% |
| **NTPC (Power)** | 42% | 100% | 45% | 31% | 52% |
| **SAIL (Steel)** | 38% | 45% | 100% | 35% | 48% |
| **CIL (Mining)** | 24% | 31% | 35% | 100% | 33% |
| **BHEL (Heavy Eng.)** | 46% | 52% | 48% | 33% | 100% |

---

## 3. Human Governance & Conflict Resolution

- High-confidence identical items ($\ge 95\%$) are grouped into prototype CNMC proposals.
- Engineering variations (e.g. `Class 150` vs `Class 300` valves) are flagged as `REQUIRES_DOMAIN_REVIEW` with clear conflict warnings, preventing unintended auto-merging.
