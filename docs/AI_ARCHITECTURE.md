# AI & Semantic Matching Architecture (ADR-005 Approved)

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** System Architecture (Phase 3)  
**Technology Decision:** Hybrid Local Sentence-Transformers + Deterministic Industrial NER + Controlled Standards Matrix + Pluggable LLM Adapter  
**Status:** `APPROVED`

---

## 1. Decision Record (ADR-005 Finalization)

### Selected AI Strategy: Hybrid Local NLP + Controlled Standards Matrix
- **Selected Option:** Hybrid Architecture combining:
  1. **Local Open-Source Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (384-dim embeddings, zero cloud token costs, 100% offline hackathon execution).
  2. **Deterministic RegEx & Spacy Industrial NER:** Fast, reproducible attribute extraction for metric/imperial dimensions, metallurgy grades, and pressure ratings.
  3. **Controlled Standards Equivalence Matrix:** Multi-tier verification framework (IS $\leftrightarrow$ DIN $\leftrightarrow$ ISO $\leftrightarrow$ ASTM) enforcing mandatory human engineering sign-off for functional equivalence.
  4. **Pluggable LLM Reasoning Adapter:** Optional cloud adapter (Google Gemini / OpenAI) for natural language reasoning on ambiguous edge cases.

---

## 2. Controlled Engineering Standards Relationship Model

To prevent catastrophic industrial failures, the platform does **not** assume automatic interchangeability based solely on superficial standard names. The standards matrix enforces a 4-tier categorization:

```mermaid
flowchart TD
    StdQuery["Candidate Standards Comparison (e.g., DIN 933 vs ISO 4017)"] --> Matrix{"Controlled Standards Matrix Evaluation"}
    
    Matrix -->|"1. Verified Dimensional & Mechanical Match"| Cat1["VERIFIED EQUIVALENT\n(Pre-validated dimensional & metallurgical equivalence)"]
    Matrix -->|"2. Partial Tolerance / Finish Discrepancy"| Cat2["POSSIBLE EQUIVALENT\n(Similar standard; minor tolerance variance flagged)"]
    Matrix -->|"3. Explicitly Incompatible Standards"| Cat3["NOT EQUIVALENT\n(Conflicting metallurgy or pressure threshold)"]
    Matrix -->|"4. Safety-Critical / Specialized Application"| Cat4["REQUIRES DOMAIN REVIEW\n(High-pressure, nuclear, or defense certified components)"]

    Cat1 --> HumanSignoff["Mandatory Human Domain Specialist Review & Sign-Off"]
    Cat2 --> HumanSignoff
    Cat3 --> Reject["Automatic System Disqualification"]
    Cat4 --> HumanSignoff
```

### Standards Classification Definitions:
1. **`VERIFIED EQUIVALENT`:** Dimensions, thread pitch, property classes, and metallurgy are proven interchangeable across standards (e.g., DIN 933 $\leftrightarrow$ ISO 4017 for standard hex screws). *Requires standard human validation.*
2. **`POSSIBLE EQUIVALENT`:** Materials share general engineering function but have minor coating, thread tolerance, or dimensional discrepancies that may affect specific assemblies. *Requires domain specialist justification.*
3. **`NOT EQUIVALENT`:** Incompatible standards with conflicting chemical compositions, yield strengths, or pressure ratings (e.g., Class 150 vs. Class 300). *System automatically suppresses merge.*
4. **`REQUIRES DOMAIN REVIEW`:** High-risk or statutory equipment (e.g., boiler tubes, explosive atmosphere switchgear) where regulatory certifications prohibit automatic substitution. *Requires formal engineering authorization.*

---

## 3. End-to-End AI Matching Pipeline

```mermaid
flowchart TD
    Raw["Raw CPSE Description (Sanitized Layer 2)"]
    
    subgraph S1["Stage 1: Pre-Processing & Normalization (Deterministic)"]
        Clean["Text Cleaner & Abbreviation Expander\n('SS' -> 'Stainless Steel', '2 INCH' -> '50 mm')"]
        NER["Industrial Attribute Extractor (RegEx + Spacy NER)\nExtracts: Item=Bolt, Grade=SS 316, Size=M12, Len=50mm"]
    end

    subgraph S2["Stage 2: Candidate Generation (Vector Retrieval)"]
        Embed["Local Dense Embedding Generator\n(all-MiniLM-L6-v2 -> 384-dim vector)"]
        VectorSearch["pgvector HNSW Nearest Neighbor Search\n(Category Pre-Filtered, Top 20 Candidates)"]
    end

    subgraph S3["Stage 3: Multi-Signal Scoring Engine"]
        LexScore["Signal 1: Lexical Jaccard/BM25 Score (S_lex)"]
        VecScore["Signal 2: Cosine Vector Similarity (S_vec)"]
        AttrScore["Signal 3: Attribute Value Overlap (S_attr)"]
        NumScore["Signal 4: Numerical Dimension Delta (S_num)"]
        StdScore["Signal 5: Standards Equivalence Status (S_std)"]
    end

    subgraph S4["Stage 4: Evaluation & Explainability"]
        Formula["Weighted Confidence Score Calculator\nConfidence = w1*S_lex + w2*S_vec + w3*S_attr + w4*S_num + w5*S_std"]
        Taxonomy["Match Type Categorizer\n(Exact >=98%, Duplicate >=90%, Near-Duplicate >=75%, Equivalent >=60%)"]
        Expl["Explainability Card Generator\n(Visual Color-Coded Diff + Technical Reasoning)"]
    end

    subgraph S5["Stage 5: Human Governance"]
        GovQueue["Staged Review Queue -> Mandatory Human Review & Sign-Off"]
    end

    Raw --> Clean --> NER
    NER --> Embed --> VectorSearch
    VectorSearch --> LexScore & VecScore & AttrScore & NumScore & StdScore
    LexScore & VecScore & AttrScore & NumScore & StdScore --> Formula --> Taxonomy --> Expl --> GovQueue
```

---

## 4. Multi-Signal Scoring Mathematical Model & Performance Targets

$$\text{Composite Confidence Score } (C) = 0.15 S_{\text{lex}} + 0.25 S_{\text{vec}} + 0.30 S_{\text{attr}} + 0.15 S_{\text{num}} + 0.15 S_{\text{std}}$$

*Performance Note:* Embedding generation time (target: $< 25\text{ ms}$ on CPU per item) and similarity search latency (target: $< 100\text{ ms}$ on HNSW index) are **illustrative performance targets**. Actual production latency requires formal benchmark validation across target CPU/GPU infrastructure and dataset scale.
