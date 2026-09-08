# Material Matching Engine Architecture

**Document Version:** 1.0.0  
**Phase:** Phase 7 — AI-Ready Material Matching & Candidate Intelligence Foundation  
**System Layer:** Layer 2 Intelligence & Candidate Recommendation  

---

## 1. Executive Summary & Purpose

The **Material Matching Engine** provides explainable, multi-tiered candidate identification across Central Public Sector Enterprises (CPSEs). In heterogeneous legacy ERP environments, identical or functionally interchangeable items are recorded under completely different codes, non-standard abbreviations, and unstructured text descriptions.

The engine establishes a mathematically rigorous and technically honest methodology to identify candidate pairs without ever making unverified AI claims, fabricating confidence scores, or automatically modifying master records.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       INGESTED NORMALIZED MATERIALS                     │
│               (Sanitized Layer 2: Descriptions, Attributes, UOM)        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CANDIDATE BLOCKING & RETRIEVAL                      │
│     (Pre-filters by Taxonomy, Engineering Family, Dimensions, Part No)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      TIER 1      │       │      TIER 2      │       │      TIER 3      │
│  Deterministic   │       │ Text Similarity  │       │  ML Embeddings   │
│  Rules & Hashes  │       │ Token Jaccard &  │       │  (MiniLM-L6-v2   │
│ (Signature/OEM)  │       │ Sequence Matcher │       │  or UNAVAILABLE) │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      HYBRID SCORING ENGINE (V1)                         │
│       Dynamic Weight Normalization & Hard Conflict Invalidation        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               EXPLAINABLE MATCH CARD & SPECIFICATION DIFF               │
│   (EXACT_MATCH_CANDIDATE, NEAR_DUPLICATE_CANDIDATE, POSSIBLE_EQUIV)     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tier Matching Architecture

### Tier 1: Deterministic Exact & Structural Matching
- **Methodology Label:** `RULE_BASED_EXACT` / `RULE_BASED_STRUCTURAL`
- **Signals Evaluated:**
  1. `EXACT_ATTRIBUTE_SIGNATURE_V1`: Matches canonical hash computed from `CATEGORY|TERM|GRADE|STANDARD|SORTED_ATTRS`.
  2. `PART_NUMBER_EXACT`: Exact normalized OEM / Manufacturer part number match.
  3. `STRUCTURAL_ATTRIBUTE_EQUIVALENCE`: Field-by-field verification of primary physical dimensions (`diameter`, `length`, `pressure`, `voltage`, `schedule`, `power_kw`).
  4. `HARD_CONFLICT_DETECTION`: Flags physical incompatibilities (e.g. `M16` vs `M20`, `SS304` vs `MS`, `150#` vs `600#`). When a hard conflict is detected, the candidate composite score is capped at `0.49` and categorized as `REQUIRES_DOMAIN_REVIEW` or `NO_MEANINGFUL_MATCH`.

### Tier 2: Deterministic Text Similarity
- **Methodology Label:** `TEXT_SIMILARITY`
- **Algorithm:** `TOKEN_JACCARD_SEQUENCE_V1`
- **Signals Evaluated:**
  1. `TEXT_SIMILARITY_TOKEN_JACCARD`: Jaccard index over normalized alphanumeric description tokens ($|A \cap B| / |A \cup B|$).
  2. `TEXT_SIMILARITY_SEQUENCE_RATIO`: Levenshtein-like sequence alignment ratio over canonical description and structured AI-safe text.
  3. `TEXT_SIMILARITY_TOKEN_OVERLAP`: Overlap coefficient ($|A \cap B| / \min(|A|, |B|)$).
- **Classifications:** `HIGH_TEXT_SIMILARITY` ($\ge 0.85$), `MEDIUM_TEXT_SIMILARITY` ($\ge 0.60$), `LOW_TEXT_SIMILARITY` ($< 0.60$).

### Tier 3: ML / Semantic Vector Embeddings
- **Methodology Label:** `ML_EMBEDDING` / `HYBRID_AI_RULE_V1`
- **Provider Interface:** `BaseEmbeddingProvider` (`LocalSentenceTransformerProvider`).
- **Honest Fallback Behavior:** If machine learning model weights (`all-MiniLM-L6-v2`) are unavailable in the local environment, the provider reports `is_available() == False` and semantic similarity returns `None` / `UNAVAILABLE`. No fake numbers are ever generated.
- **Computation:** Cosine similarity over 384-dimensional dense vectors generated from sanitized `ai_safe_text`.

---

## 3. Hybrid Scoring Engine (`HYBRID_MATCH_V1`)

The hybrid scoring engine combines signals across all three tiers using configurable, versioned weights. When optional signals are absent or unavailable (e.g., semantic model offline, or items lack OEM part numbers), weights are **dynamically renormalized** across active signals so records are not arbitrarily penalized.

### Baseline Signal Weights

| Signal Component | Weight (With ML Semantic) | Weight (Without ML Semantic) |
| :--- | :--- | :--- |
| **Attribute Signature / Specs** | 0.35 | 0.45 |
| **Text Similarity** | 0.25 | 0.35 |
| **ML Semantic Similarity** | 0.20 | *0.00 (Omitted)* |
| **OEM Part Number Match** | 0.10 | 0.10 |
| **Grade & Standard Compatibility** | 0.10 | 0.10 |

$$\text{Composite Score} = \frac{\sum_{k \in \text{Active Signals}} W_k \cdot S_k}{\sum_{k \in \text{Active Signals}} W_k}$$

---

## 4. Conservative Candidate Classification

The engine classifies recommendations conservatively:

| Classification | Criteria | Meaning |
| :--- | :--- | :--- |
| `EXACT_MATCH_CANDIDATE` | Score $\ge 0.95$ AND (Exact Signature OR Exact Part Number) | Highly probable identical physical item |
| `NEAR_DUPLICATE_CANDIDATE` | Score $\ge 0.85$ AND No Hard Physical Conflict | Minor phrasing differences, matching technical attributes |
| `POSSIBLE_EQUIVALENT_CANDIDATE` | Score $\ge 0.70$ AND No Hard Physical Conflict | Functionally similar item requiring engineering validation |
| `REQUIRES_DOMAIN_REVIEW` | Score $\ge 0.45$ OR Conflict Detected with Moderate Similarity | Ambiguous attributes or potential dimensional conflict |
| `NO_MEANINGFUL_MATCH` | Score $< 0.45$ OR Hard Incompatibility | Unrelated materials |

---

## 5. Strict Safety Boundaries

1. **No Automatic Merging:** The engine produces *recommendations only*. No database records are merged or altered.
2. **No Automatic Policy Approval:** Candidate status remains `PROPOSED` or `UNDER_REVIEW`. The system never marks a candidate as `APPROVED`, `MERGED`, or `OFFICIALLY_EQUIVALENT`.
3. **Data Privacy Isolation:** Only Layer 2 sanitized representations (`canonical_description`, `normalized_uom`, `material_attributes`) are used. Layer 1 commercial data (PO pricing, vendor identities, store bin numbers) is strictly isolated.
