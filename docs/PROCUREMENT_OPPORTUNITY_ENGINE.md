# Illustrative Procurement Opportunity Engine

## 1. Purpose & Scope
The **Procurement Opportunity Engine** converts duplicate detection, cross-enterprise catalog overlap, and candidate standardization data into actionable synergy recommendations across participating CPSEs.

---

## 2. Standard Opportunity Classifications

| Opportunity Type | Identification Criteria | Recommended Action |
|---|---|---|
| `CROSS_CPSE_COMMON_DEMAND` | Material required across $\ge 2$ CPSEs with high specification similarity. | Initiate joint cross-CPSE demand aggregation for standard specs. |
| `STANDARDIZATION_CANDIDATE` | Fragmented descriptions across CPSEs sharing standard grade/standard. | Adopt unified prototype CNMC specification across catalogs. |
| `SUPPLIER_BASE_CONSOLIDATION_CANDIDATE` | Standard commodity procured across $>2$ CPSEs with duplicate items. | Coordinate vendor qualification standards & technical specs. |
| `BULK_RATE_CONTRACT_ELIGIBLE` | High multi-enterprise duplicate density across $\ge 3$ CPSEs. | Formulate common rate contract framework on GeM. |
| `HIGH_VOLUME_DUPLICATE_CLUSTER` | Cluster containing $\ge 4$ duplicate line items across enterprises. | Prioritize governance review and standardize master definition. |

---

## 3. Priority Level Determination

- **HIGH**: Involves $\ge 3$ distinct CPSEs OR duplicate cluster size $\ge 4$.
- **MEDIUM**: Involves 2 distinct CPSEs with high confidence match ($\ge 85\%$).
- **LOW**: Internal enterprise duplicate or exploratory functional equivalence candidate.

---

## 4. Governance & Synthetic Demonstration Disclaimer

> [!CAUTION]
> **Mandatory Disclaimer**: All opportunity categorizations and synergy potential values are generated from synthetic demonstration datasets for the Smart India Hackathon (SIH) 2026. The platform does not ingest commercial PO prices or vendor bids and does not compute real financial savings figures.
