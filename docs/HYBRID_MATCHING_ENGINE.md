# 3-Tier Hybrid Matching Engine Architecture

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Module:** `backend/app/services/matching/hybrid_engine.py`  
**Date:** September 2026

---

## 1. The 3-Tier Hybrid Scoring Pipeline

To avoid false positive merging of non-interchangeable industrial components, the framework combines deterministic engineering rules, token lexical metrics, and semantic vector similarity into an explainable composite score:

```
                              INCOMING NORMALIZED ITEM
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
           [ TIER 1 ]              [ TIER 2 ]              [ TIER 3 ]
       DETERMINISTIC RULES     LEXICAL / FUZZY         DENSE EMBEDDINGS
       • Attribute Signatures  • Levenshtein Distance  • all-MiniLM-L6-v2
       • Conflict Safety Engine• Token Set Ratio       • 384 Dimensions
       • Part Number Matches   • Token Sort Ratio      • pgvector Cosine Sim
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         │
                                         ▼
                             [ HYBRID COMPOSITE SCORER ]
                           • Dynamic Weight Normalization
                           • Hard Conflict Safety Override
                           • Explainable Signal Decomposition
```

---

## 2. Dynamic Signal Weighting

### With Semantic Embeddings Available:
- **Attribute Signature Match:** 35%
- **Lexical & Text Similarity:** 25%
- **Semantic Embedding Cosine Similarity:** 20%
- **Manufacturer / Part Number Match:** 10%
- **Material Grade & Standard Match:** 10%

### Offline / Fallback (No Semantic Embeddings):
- **Attribute Signature Match:** 45%
- **Lexical & Text Similarity:** 35%
- **Manufacturer / Part Number Match:** 10%
- **Material Grade & Standard Match:** 10%

---

## 3. Engineering Conflict Safety Override (`has_hard_conflict`)

If two materials share identical noun words but have conflicting physical attributes, the engine activates the **Hard Conflict Safety Override**:

| Attribute Conflict | Example Scenario | System Response |
|:---|:---|:---|
| **Pressure Class Mismatch** | `Class 150` vs `Class 600` | Flags `has_hard_conflict = True`, drops score, and forces classification to `REQUIRES_DOMAIN_REVIEW`. |
| **Metallurgy / Grade Incompatibility** | `SS304` vs `SS316` | Flags metallurgy conflict; blocks automated candidate clustering. |
| **Dimension Discrepancy** | `M16 x 50` vs `M16 x 100` | Flags length mismatch; classified as `NO_MEANINGFUL_MATCH`. |

---

## 4. Output Candidate Classifications

1. **`EXACT_MATCH_CANDIDATE` ($\ge 0.95$):** Identical canonical signature or exact manufacturer part number.
2. **`NEAR_DUPLICATE_CANDIDATE` ($0.85 - 0.94$):** Compatible physical attributes with minor descriptive wording variations.
3. **`POSSIBLE_EQUIVALENT_CANDIDATE` ($0.70 - 0.84$):** Shared primary parameters with minor non-critical grade or standard variance.
4. **`REQUIRES_DOMAIN_REVIEW` ($0.45 - 0.69$ or Conflict):** Moderate similarity with incomplete attribute data or engineering variations requiring human engineer sign-off.
5. **`NO_MEANINGFUL_MATCH` ($< 0.45$):** Dissimilar or incompatible items.
