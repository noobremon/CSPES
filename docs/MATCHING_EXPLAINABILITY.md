# Material Matching Explainability & Signal Architecture

**Document Version:** 1.0.0  
**Phase:** Phase 7 — AI-Ready Material Matching & Candidate Intelligence Foundation  

---

## 1. Objective

Material master engineers and procurement officers in CPSEs cannot trust "black-box" match scores. Every candidate match recommendation produced by the platform includes a structured, machine-readable **Explainability Card** (`MatchExplanation`) and **Side-by-Side Specification Diff** (`specification_diff`).

---

## 2. Structure of the Explainable Match Card

Every match record in `material_similarity_matches` stores structured explainability in `match_explanation` (JSON) and `specification_diff` (JSON):

### Example Match Card Response (`GET /api/v1/matches/{match_id}`)

```json
{
  "id": "e7c10b7a-8f52-4412-9c16-98129038201a",
  "source_material_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "target_material_id": "b2c3d4e5-0000-0000-0000-000000000002",
  "match_type": "EXACT_MATCH_CANDIDATE",
  "lexical_score": 0.885,
  "vector_score": 0.0,
  "attribute_score": 1.0,
  "composite_confidence": 0.98,
  "methodology": "RULE_BASED_EXACT",
  "recommendation_status": "PROPOSED",
  "specification_diff": {
    "diameter": {
      "source": "M16",
      "target": "M16",
      "status": "MATCH"
    },
    "length": {
      "source": "50MM",
      "target": "50MM",
      "status": "MATCH"
    },
    "material_grade": {
      "source": "SS304",
      "target": "SS304",
      "status": "MATCH"
    },
    "standard": {
      "source": "ISO 4017",
      "target": "ISO 4017",
      "status": "MATCH"
    }
  },
  "explanation": {
    "summary": "Exact candidate match (98.0%). Shared exact canonical signature / part number.",
    "candidate_classification": "EXACT_MATCH_CANDIDATE",
    "signals": [
      {
        "rule_id": "EXACT_ATTRIBUTE_SIGNATURE_V1",
        "name": "Canonical Attribute Signature",
        "score": 1.0,
        "status": "EXACT_MATCH",
        "source_value": "FASTENERS|HEX BOLT|SS304|ISO 4017|DIAMETER=M16;LENGTH=50MM",
        "target_value": "FASTENERS|HEX BOLT|SS304|ISO 4017|DIAMETER=M16;LENGTH=50MM",
        "explanation": "Materials share identical canonical category, engineering term, grade, and technical attributes."
      },
      {
        "rule_id": "MATERIAL_GRADE_MATCH",
        "name": "Material Grade",
        "score": 1.0,
        "status": "EXACT_MATCH",
        "source_value": "SS304",
        "target_value": "SS304",
        "explanation": "Material grades match: 'SS304'."
      },
      {
        "rule_id": "TEXT_SIMILARITY_TOKEN_JACCARD",
        "name": "Token Jaccard Similarity",
        "score": 0.80,
        "status": "COMPUTED",
        "source_value": "5 tokens",
        "target_value": "6 tokens",
        "explanation": "Shared 4 of 5 unique description tokens."
      },
      {
        "rule_id": "SEMANTIC_EMBEDDING_SIMILARITY",
        "name": "ML Semantic Embedding Similarity",
        "score": null,
        "status": "UNAVAILABLE",
        "source_value": "Model: N/A",
        "target_value": "Status: UNAVAILABLE",
        "explanation": "ML semantic embedding provider unavailable in current environment; score omitted from hybrid calculation."
      }
    ],
    "conflict_reasons": [],
    "weights_used": {
      "attribute_signature": 0.45,
      "text_similarity": 0.35,
      "grade_and_standard": 0.10
    }
  }
}
```

---

## 3. Signal Types & Status Codes

| Signal Rule ID | Signal Name | Possible Statuses | Description |
| :--- | :--- | :--- | :--- |
| `EXACT_ATTRIBUTE_SIGNATURE_V1` | Canonical Signature | `EXACT_MATCH`, `DIFFERENT` | Evaluates deterministic hash of core engineering fields |
| `PART_NUMBER_EXACT` | OEM Part Number | `EXACT_MATCH`, `MISMATCH`, `NOT_PRESENT` | Direct string comparison on normalized part numbers |
| `MATERIAL_GRADE_MATCH` | Material Grade | `EXACT_MATCH`, `CONFLICT`, `PARTIAL` | Validates metallurgical grade compatibility |
| `STANDARD_CODE_MATCH` | Engineering Standard | `EXACT_MATCH`, `DIFFERENT`, `PARTIAL` | Validates DIN, IS, ISO, ASTM standards |
| `DIMENSION_MISMATCH_*` | Critical Dimension | `CONFLICT` | Flags hard mismatches in diameter, length, pressure, etc. |
| `TEXT_SIMILARITY_TOKEN_JACCARD` | Lexical Jaccard | `COMPUTED` | Token set overlap between canonical titles |
| `SEMANTIC_EMBEDDING_SIMILARITY` | ML Cosine Sim | `COMPUTED`, `UNAVAILABLE` | Dense vector similarity when ML model is active |

---

## 4. Engineering Limitations

1. **Deterministic Rule Coverage:** Physical extraction patterns currently cover standard mechanical fasteners, piping, valves, and basic electrical equipment. Complex rotary equipment and instrumentation will require domain taxonomy expansion in future phases.
2. **Heuristic Weights:** Initial hybrid weights are versioned MVP defaults (`HYBRID_MATCH_V1`) and subject to domain calibration based on CPSE feedback.
3. **No Automatic Merge:** Match candidates are human-review-ready proposals. Domain experts must validate proposals prior to any downstream consolidation.
