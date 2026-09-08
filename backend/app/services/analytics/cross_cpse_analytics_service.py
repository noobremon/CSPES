"""
Cross-CPSE Material Intelligence & Overlap Matrix Service.

Dynamically computes pairwise material overlap, shared similarity clusters,
and common CNMC prototype mappings across participating CPSE organizations.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from app.models.organization import Organization
from app.models.material import NormalizedMaterial
from app.models.matching import MaterialSimilarityMatch
from app.models.cnmc import CPSECNMCMapping


class CrossCPSEAnalyticsService:
    """
    Computes dynamic N x N cross-enterprise overlap matrices and pairwise collaboration intelligence.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_cross_cpse_overlap_matrix(self) -> Dict[str, Any]:
        """
        Dynamically calculates the N x N overlap matrix across all participating CPSE organizations.
        """
        # Fetch all active CPSEs
        org_stmt = select(Organization).where(Organization.status == "ACTIVE").order_by(Organization.code)
        org_res = await self.db.execute(org_stmt)
        orgs = org_res.scalars().all()

        if len(orgs) < 2:
            return {
                "status": "INSUFFICIENT_DATA",
                "message": "INSUFFICIENT DATA FOR CROSS-CPSE OVERLAP ANALYSIS (Requires at least 2 active CPSE organizations).",
                "organizations": [o.code for o in orgs],
                "matrix": {},
                "pair_details": []
            }

        org_codes = [o.code for o in orgs]
        org_id_to_code = {o.id: o.code for o in orgs}

        # Initialize NxN matrix with 0s
        matrix: Dict[str, Dict[str, int]] = {row: {col: 0 for col in org_codes} for row in org_codes}

        # Query all match pairs
        match_stmt = select(MaterialSimilarityMatch).where(MaterialSimilarityMatch.composite_confidence >= 0.50)
        match_res = await self.db.execute(match_stmt)
        matches = match_res.scalars().all()

        pair_stats: Dict[str, Dict[str, Any]] = {}

        for m in matches:
            src_mat = await self.db.get(NormalizedMaterial, m.source_material_id)
            tgt_mat = await self.db.get(NormalizedMaterial, m.target_material_id)

            if not src_mat or not tgt_mat:
                continue

            src_code = org_id_to_code.get(src_mat.organization_id)
            tgt_code = org_id_to_code.get(tgt_mat.organization_id)

            if not src_code or not tgt_code or src_code == tgt_code:
                continue

            # Symmetric matrix update
            matrix[src_code][tgt_code] += 1
            matrix[tgt_code][src_code] += 1

            # Aggregate pair details
            pair_key = tuple(sorted([src_code, tgt_code]))
            pair_label = f"{pair_key[0]} <-> {pair_key[1]}"
            if pair_label not in pair_stats:
                pair_stats[pair_label] = {
                    "cpse_a": pair_key[0],
                    "cpse_b": pair_key[1],
                    "total_overlapping_materials": 0,
                    "exact_matches": 0,
                    "near_duplicates": 0,
                    "functional_equivalences": 0,
                    "avg_confidence": 0.0,
                    "_scores": []
                }

            pair_stats[pair_label]["total_overlapping_materials"] += 1
            pair_stats[pair_label]["_scores"].append(m.composite_confidence)

            if "EXACT" in m.match_type:
                pair_stats[pair_label]["exact_matches"] += 1
            elif "NEAR" in m.match_type:
                pair_stats[pair_label]["near_duplicates"] += 1
            else:
                pair_stats[pair_label]["functional_equivalences"] += 1

        # Finalize averages
        pair_details = []
        for p in pair_stats.values():
            scores = p.pop("_scores")
            p["avg_confidence"] = round(sum(scores) / len(scores), 2) if scores else 0.0
            pair_details.append(p)

        pair_details.sort(key=lambda x: x["total_overlapping_materials"], reverse=True)

        return {
            "status": "COMPLETED",
            "organizations": org_codes,
            "matrix": matrix,
            "pair_details": pair_details,
            "total_cross_cpse_clusters": len(matches)
        }
