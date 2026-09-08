"""
Illustrative Procurement Opportunity Engine.

Identifies collaborative cross-CPSE procurement, demand aggregation, and specification
harmonization opportunities derived from duplicate and equivalent material clusters.

NON-NEGOTIABLE FINANCIAL INTEGRITY RULE:
Do NOT calculate fake monetary savings. All opportunity outputs from demonstration data
are explicitly flagged with the required illustrative demonstration disclaimer.
"""

from typing import Dict, Any, List, Optional
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc

from app.models.matching import MaterialSimilarityMatch
from app.models.material import NormalizedMaterial, RawMaterial
from app.models.organization import Organization
from app.models.cnmc import CNMCCandidate, CNMCMaster


DEMONSTRATION_OPPORTUNITY_NOTICE = (
    "ILLUSTRATIVE PROCUREMENT OPPORTUNITY — This insight is generated from demonstration data "
    "and does not represent verified Government savings or official audited expenditure."
)


class ProcurementOpportunityType(str, Enum):
    CROSS_CPSE_DEMAND_AGGREGATION = "CROSS_CPSE_DEMAND_AGGREGATION"
    STANDARDIZATION_OPPORTUNITY = "STANDARDIZATION_OPPORTUNITY"
    DUPLICATE_CODE_RATIONALIZATION = "DUPLICATE_CODE_RATIONALIZATION"
    INVENTORY_VISIBILITY_OPPORTUNITY = "INVENTORY_VISIBILITY_OPPORTUNITY"
    SPECIFICATION_HARMONIZATION_OPPORTUNITY = "SPECIFICATION_HARMONIZATION_OPPORTUNITY"


class ProcurementOpportunityService:
    """
    Synthesizes actionable procurement, pooling, and harmonization opportunities from material clusters.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_procurement_opportunities(
        self,
        opportunity_type: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes structured illustrative procurement opportunities from high-confidence match clusters.
        """
        stmt = (
            select(MaterialSimilarityMatch)
            .where(MaterialSimilarityMatch.composite_confidence >= 0.65)
            .order_by(desc(MaterialSimilarityMatch.composite_confidence))
            .limit(limit)
            .offset(offset)
        )
        res = await self.db.execute(stmt)
        matches = res.scalars().all()

        opportunities = []

        for idx, m in enumerate(matches):
            src_mat = await self.db.get(NormalizedMaterial, m.source_material_id)
            tgt_mat = await self.db.get(NormalizedMaterial, m.target_material_id)

            if not src_mat or not tgt_mat:
                continue

            src_org = await self.db.get(Organization, src_mat.organization_id)
            tgt_org = await self.db.get(Organization, tgt_mat.organization_id)

            org_codes = list({src_org.code if src_org else "CPSE_A", tgt_org.code if tgt_org else "CPSE_B"})

            # Determine opportunity category and recommendation based on match type and confidence
            if "EXACT" in m.match_type:
                opp_type = ProcurementOpportunityType.CROSS_CPSE_DEMAND_AGGREGATION
                prio = "HIGH" if len(org_codes) > 1 else "MEDIUM"
                rec = (
                    f"Consolidate future purchase tenders for '{src_mat.canonical_description}' "
                    f"across {', '.join(org_codes)} to achieve volume demand aggregation under a unified specification."
                )
                evidence = f"Exact canonical attribute signature match with {m.composite_confidence * 100:.0f}% evidence."
            elif "NEAR" in m.match_type:
                opp_type = ProcurementOpportunityType.STANDARDIZATION_OPPORTUNITY
                prio = "HIGH" if m.composite_confidence >= 0.85 else "MEDIUM"
                rec = (
                    f"Adopt standardized prototype CNMC for '{src_mat.canonical_description}' "
                    f"to eliminate near-duplicate item variants across {', '.join(org_codes)}."
                )
                evidence = f"Near-duplicate match with {m.composite_confidence * 100:.0f}% evidence. Minor descriptive variance."
            else:
                opp_type = ProcurementOpportunityType.SPECIFICATION_HARMONIZATION_OPPORTUNITY
                prio = "LOW"
                rec = (
                    f"Conduct domain engineering review for '{src_mat.canonical_description}' "
                    f"to verify functional interchangeability between {', '.join(org_codes)}."
                )
                evidence = f"Possible functional equivalence detected (score: {m.composite_confidence * 100:.0f}%)."

            if opportunity_type and opportunity_type != "ALL" and opp_type.value != opportunity_type:
                continue
            if priority and priority != "ALL" and prio != priority:
                continue

            opp_id = f"OPP-{str(m.id)[:8].upper()}"
            opportunities.append({
                "opportunity_id": opp_id,
                "opportunity_type": opp_type.value,
                "title": f"{opp_type.value.replace('_', ' ').title()} — {src_mat.canonical_description[:45]}",
                "material_cluster_title": src_mat.canonical_description,
                "participating_cpse_count": len(org_codes),
                "participating_cpses": org_codes,
                "material_count": 2,
                "match_classification": m.match_type,
                "confidence_score": m.composite_confidence,
                "priority_level": prio,
                "supporting_evidence": evidence,
                "recommendation": rec,
                "disclaimer": DEMONSTRATION_OPPORTUNITY_NOTICE
            })

        return opportunities
