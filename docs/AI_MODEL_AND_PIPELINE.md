# AI Model & Embedding Pipeline Specification

**Project:** AI-Powered National Unified Material Master Framework  
**Vision:** "One Nation — One Common Material Code"  
**Audit Standard:** Zero Inflated AI Claims & Local Open-Source Architecture  
**Date:** September 2026

---

## 1. Machine Learning Model Architecture

The platform utilizes a **100% local, open-source embedding pipeline** designed to run efficiently on standard CPU architectures without requiring paid third-party cloud APIs (such as OpenAI or Gemini API keys):

| Specification | Parameter Value |
|:---|:---|
| **Model Name** | `sentence-transformers/all-MiniLM-L6-v2` |
| **Model Type** | Dense Bi-Encoder Transformer |
| **Vector Dimensions** | 384 dimensions |
| **Max Sequence Length** | 256 tokens |
| **Execution Hardware** | Standard Multi-Core CPU (Local / Server) |
| **Third-Party API Cost** | **$0.00 (Zero API calls or token billing)** |
| **Privacy Compliance** | Data never leaves local/on-premise memory space |

---

## 2. Vector Indexing & Similarity Calculation

1. **Storage Subsystem:** High-density embeddings are persisted in PostgreSQL using the `pgvector` extension (`Vector(384)`).
2. **Similarity Metric:** Vectors are compared using **Cosine Similarity**:
   $$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$
3. **Graceful Fallback Mode:** In offline evaluation environments lacking local SentenceTransformer model weights, the engine dynamically activates `LocalSentenceTransformerProvider` fallback mode:
   - Sets `semantic_status: "UNAVAILABLE"`
   - Automatically re-normalizes composite scoring to Tier 1 (Deterministic) and Tier 2 (Lexical) signals
   - **Never generates synthetic fake AI confidence scores**.

---

## 3. Sanitized Embedding Generation Flow

```
Normalized Material (Layer 2)
       ↓
Extract: Canonical Description, Engineering Term, Material Grade, Standard Code, Physical Attributes
       ↓
Exclude: Vendor Name, PO Number, Price, Store Bin, Contract Reference
       ↓
Construct AI-Safe String: "HEXAGONAL BOLT | DIAMETER 20 MM | LENGTH 100 MM | GRADE SS304"
       ↓
Generate Dense Vector (384-Dim float array) via SentenceTransformer
       ↓
Store in pgvector (material_embeddings table)
```
