# Deterministic Material Rationalization Priority Engine

## 1. Engine Purpose
The **Rationalization Priority Engine** provides deterministic, transparent, and explainable scoring for national material harmonization. It ranks material concepts by the potential impact of formal CNMC standardization and catalog deduplication.

---

## 2. Deterministic Scoring Formulation

$$\text{Priority Score} = w_1 \cdot S_{\text{breadth}} + w_2 \cdot S_{\text{density}} + w_3 \cdot S_{\text{gap}} + w_4 \cdot S_{\text{crit}}$$

### Component Definitions
1. **Multi-CPSE Breadth ($S_{\text{breadth}}$, Weight = 0.35)**:
   $$S_{\text{breadth}} = \min\left(100, \frac{\text{Distinct CPSE Count}}{5} \times 100\right)$$
2. **Duplicate Cluster Density ($S_{\text{density}}$, Weight = 0.25)**:
   $$S_{\text{density}} = \min\left(100, \frac{\text{Duplicate Item Count}}{6} \times 100\right)$$
3. **Standardization Gap ($S_{\text{gap}}$, Weight = 0.25)**:
   - $100$ if currently unstandardized (high need for harmonization)
   - $50$ if candidate is pending governance review
   - $10$ if already mapped to an active governed CNMC Master
4. **Specification Criticality ($S_{\text{crit}}$, Weight = 0.15)**:
   - $80$ for mechanical fasteners, valves, piping, electrical switchgear
   - $50$ for general industrial consumables

---

## 3. Explainability & Justification
Every scored item generates a plain-language justification string detailing:
- Exact contributing factors (e.g., `"Demand shared across 4 CPSEs (IOCL, ONGC, NTPC, GAIL)"`)
- Duplicate density factor (`"Cluster contains 5 duplicate catalog descriptions"`)
- Recommendation impact (`"High priority for joint standard specification alignment"`)
