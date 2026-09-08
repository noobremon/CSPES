"""
Material Rationalization Priority Engine.

Calculates deterministic, transparent rationalization priority scores for material clusters
to help decision-makers identify high-impact items for standardization.

TRANSPARENCY RULE:
Scoring is purely deterministic and rule-based. It is explicitly labeled "Priority Score"
or "Deterministic Rationalization Score", NEVER "AI Confidence".
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.matching import MaterialSimilarityMatch
from app.models.material import NormalizedMaterial
from app.models.organization import Organization
from app.models.cnmc import CNMCCandidate, CPSECNMCMapping


@dataclass
class RationalizationPriorityResult:
    cluster_id: str
    material_title: str
    priority_score: float  # 0.0 - 100.0
    priority_level: str  # HIGH, MEDIUM, LOW
    participating_cpse_count: int
    participating_cpses: List[str]
    material_count: int
    match_evidence_score: float
    governance_status: str
    has_approved_cnmc: bool
    explanation_rationale: str
    recommended_action: str


class RationalizationPriorityService:
    """
    Computes transparent rationalization priority scores and human-readable justification cards.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_rationalization_priorities(
        self,
        min_priority: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Ranks material duplicate clusters based on deterministic rationalization impact scoring.
        """
        stmt = (
            select(MaterialSimilarityMatch)
            .where(MaterialSimilarityMatch.composite_confidence >= 0.50)
            .order_by(desc(MaterialSimilarityMatch.composite_confidence))
            .limit(limit)
            .offset(offset)
        )
        res = await self.db.execute(stmt)
        matches = res.scalars().all()

        results = []

        for m in matches:
            src_mat = await self.db.get(NormalizedMaterial, m.source_material_id)
            tgt_mat = await self.db.get(NormalizedMaterial, m.target_material_id)

            if not src_mat or not tgt_mat:
                continue

            src_org = await self.db.get(Organization, src_mat.organization_id)
            tgt_org = await self.db.get(Organization, tgt_mat.organization_id)
            org_codes = list({src_org.code if src_org else "CPSE_A", tgt_org.code if tgt_org else "CPSE_B"})

            # Check if active mapping exists for either material
            map_stmt = select(CPSECNMCMapping).where(
                CPSECNMCMapping.normalized_material_id.in_([src_mat.id, tgt_mat.id]),
                CPSECNMCMapping.status == "ACTIVE"
            )
            map_res = await self.db.execute(map_stmt)
            has_mapping = map_res.scalars().first() is not None

            # Compute Deterministic Rationalization Score (0 - 100 scale)
            # Factor 1: CPSE Coverage (up to 35 points: 1 CPSE = 15, 2 CPSEs = 30, >=3 = 35)
            cpse_points = min(35.0, len(org_codes) * 15.0)

            # Factor 2: Cluster Material Volume (up to 25 points: 2 items = 20, >2 = 25)
            mat_points = 20.0

            # Factor 3: Evidence Strength (up to 25 points based on match score)
            evidence_points = round(m.composite_confidence * 25.0, 1)

            # Factor 4: Unstandardized Status (up to 15 points if unmapped)
            unmapped_points = 0.0 if has_mapping else 15.0

            total_score = min(100.0, round(cpse_points + mat_points + evidence_points + unmapped_points, 1))

            if total_score >= 75.0:
                prio_level = "HIGH"
            elif total_score >= 50.0:
                prio_level = "MEDIUM"
            else:
                prio_level = "LOW"

            if min_priority and min_priority != "ALL" and prio_level != min_priority:
                continue

            # Build human-readable explainable rationale
            mapping_text = "currently has an active prototype CNMC mapping" if has_mapping else "currently has NO approved CNMC mapping"
            explanation = (
                f"{prio_level} priority (Score: {total_score}/100) because this cluster spans {len(org_codes)} CPSE(s) "
                f"({', '.join(org_codes)}) with {m.composite_confidence * 100:.0f}% match evidence ({m.match_type}) "
                f"and {mapping_text}."
            )

            rec_action = (
                "Maintain existing governed cross-walk mapping."
                if has_mapping
                else "Fast-track for Domain Reviewer CNMC recommendation and governance approval."
            )

            results.append({
                "cluster_id": f"CLUST-{str(m.id)[:8].upper()}",
                "material_title": src_mat.canonical_description,
                "priority_score": total_score,
                "priority_level": prio_level,
                "score_components": {
                    "cpse_coverage_points": cpse_points,
                    "cluster_size_points": mat_points,
                    "evidence_strength_points": evidence_points,
                    "unstandardized_status_points": unmapped_points,
                },
                "participating_cpse_count": len(org_codes),
                "participating_cpses": org_codes,
                "material_count": 2,
                "match_evidence_score": m.composite_confidence,
                "governance_status": "APPROVED_MAPPED" if has_mapping else m.recommendation_status,
                "has_approved_cnmc": has_mapping,
                "explanation_rationale": explanation,
                "recommended_action": rec_action,
                "scoring_methodology": "DETERMINISTIC_RATIONALIZATION_SCORE_V1"
            })

        results.sort(key=lambda x: x["priority_score"], reverse=True)
        return results
