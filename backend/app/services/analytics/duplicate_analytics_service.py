"""
Duplicate & Overlap Analytics Service.

Provides granular clustering, density by category and CPSE, and prioritized duplicate intelligence.
"""

from typing import Dict, Any, List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc

from app.models.organization import Organization
from app.models.material import NormalizedMaterial, RawMaterial
from app.models.matching import MaterialSimilarityMatch
from app.models.cnmc import CNMCCandidate, CPSECNMCMapping
from app.models.taxonomy import MaterialTaxonomy


class DuplicateAnalyticsService:
    """
    Computes duplicate cluster intelligence, density breakdowns, and cross-enterprise similarity groupings.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_duplicate_summary(self) -> Dict[str, Any]:
        """
        Retrieves duplicate density breakdowns by match type, taxonomy category, and CPSE organization.
        """
        # Match type counts
        match_types = ["EXACT_MATCH_CANDIDATE", "NEAR_DUPLICATE_CANDIDATE", "POSSIBLE_EQUIVALENT_CANDIDATE"]
        legacy_types = ["EXACT_DUPLICATE", "NEAR_DUPLICATE", "FUNCTIONALLY_EQUIVALENT", "POSSIBLE_EQUIVALENT"]
        
        stmt = (
            select(MaterialSimilarityMatch.match_type, func.count(MaterialSimilarityMatch.id))
            .group_by(MaterialSimilarityMatch.match_type)
        )
        res = await self.db.execute(stmt)
        by_type_raw = dict(res.all())

        exact_count = by_type_raw.get("EXACT_MATCH_CANDIDATE", 0) + by_type_raw.get("EXACT_DUPLICATE", 0)
        near_count = by_type_raw.get("NEAR_DUPLICATE_CANDIDATE", 0) + by_type_raw.get("NEAR_DUPLICATE", 0)
        func_count = (
            by_type_raw.get("POSSIBLE_EQUIVALENT_CANDIDATE", 0)
            + by_type_raw.get("FUNCTIONALLY_EQUIVALENT", 0)
            + by_type_raw.get("POSSIBLE_EQUIVALENT", 0)
        )

        # Duplicate density by CPSE
        cpse_stmt = (
            select(Organization.code, Organization.name, func.count(MaterialSimilarityMatch.id))
            .join(NormalizedMaterial, NormalizedMaterial.organization_id == Organization.id)
            .join(
                MaterialSimilarityMatch,
                or_(
                    MaterialSimilarityMatch.source_material_id == NormalizedMaterial.id,
                    MaterialSimilarityMatch.target_material_id == NormalizedMaterial.id
                )
            )
            .group_by(Organization.code, Organization.name)
            .order_by(desc(func.count(MaterialSimilarityMatch.id)))
        )
        cpse_res = await self.db.execute(cpse_stmt)
        by_cpse = [
            {"organization_code": row[0], "organization_name": row[1], "match_candidate_count": row[2]}
            for row in cpse_res.all()
        ]

        # Duplicate density by Taxonomy Category
        tax_stmt = (
            select(MaterialTaxonomy.code, MaterialTaxonomy.name, func.count(MaterialSimilarityMatch.id))
            .join(NormalizedMaterial, NormalizedMaterial.taxonomy_id == MaterialTaxonomy.id)
            .join(
                MaterialSimilarityMatch,
                or_(
                    MaterialSimilarityMatch.source_material_id == NormalizedMaterial.id,
                    MaterialSimilarityMatch.target_material_id == NormalizedMaterial.id
                )
            )
            .group_by(MaterialTaxonomy.code, MaterialTaxonomy.name)
            .order_by(desc(func.count(MaterialSimilarityMatch.id)))
        )
        tax_res = await self.db.execute(tax_stmt)
        by_category = [
            {"category_code": row[0], "category_name": row[1], "match_candidate_count": row[2]}
            for row in tax_res.all()
        ]

        return {
            "duplicate_classifications": {
                "exact_duplicates": exact_count,
                "near_duplicates": near_count,
                "functional_equivalences": func_count,
                "total_duplicates": exact_count + near_count + func_count,
            },
            "density_by_cpse": by_cpse,
            "density_by_category": by_category,
        }

    async def get_duplicate_clusters(
        self,
        match_type: Optional[str] = None,
        min_confidence: float = 0.50,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Retrieves formatted duplicate clusters grouping matched pairs with CPSE metadata.
        """
        stmt = (
            select(MaterialSimilarityMatch)
            .where(MaterialSimilarityMatch.composite_confidence >= min_confidence)
        )
        if match_type and match_type != "ALL":
            stmt = stmt.where(MaterialSimilarityMatch.match_type.ilike(f"%{match_type}%"))

        stmt = stmt.order_by(desc(MaterialSimilarityMatch.composite_confidence)).limit(limit).offset(offset)
        res = await self.db.execute(stmt)
        matches = res.scalars().all()

        clusters = []
        for idx, m in enumerate(matches):
            src_mat = await self.db.get(NormalizedMaterial, m.source_material_id)
            tgt_mat = await self.db.get(NormalizedMaterial, m.target_material_id)

            if not src_mat or not tgt_mat:
                continue

            src_org = await self.db.get(Organization, src_mat.organization_id)
            tgt_org = await self.db.get(Organization, tgt_mat.organization_id)
            src_raw = await self.db.get(RawMaterial, src_mat.raw_material_id)
            tgt_raw = await self.db.get(RawMaterial, tgt_mat.raw_material_id)

            # Check if linked CNMC candidate exists
            cand_stmt = select(CNMCCandidate).where(
                CNMCCandidate.candidate_group_name.ilike(f"%{src_mat.canonical_description[:30]}%")
            )
            cand_res = await self.db.execute(cand_stmt)
            cand = cand_res.scalars().first()

            # Determine distinct CPSE count
            org_codes = list({src_org.code if src_org else "ORG_A", tgt_org.code if tgt_org else "ORG_B"})

            clusters.append({
                "cluster_id": f"CLUST-{str(m.id)[:8].upper()}",
                "match_id": str(m.id),
                "match_type": m.match_type,
                "composite_confidence": m.composite_confidence,
                "lexical_score": m.lexical_score,
                "attribute_score": m.attribute_score,
                "methodology": m.methodology,
                "recommendation_status": m.recommendation_status,
                "participating_cpse_count": len(org_codes),
                "participating_cpses": org_codes,
                "material_count": 2,
                "canonical_description": src_mat.canonical_description,
                "specification_diff": m.specification_diff,
                "linked_cnmc_candidate": cand.proposed_cnmc if cand else None,
                "linked_cnmc_status": cand.status if cand else "UNPROPOSED",
                "members": [
                    {
                        "material_id": str(src_mat.id),
                        "organization_code": src_org.code if src_org else "CPSE_A",
                        "organization_name": src_org.name if src_org else "CPSE A",
                        "local_material_code": src_raw.material_code if src_raw else "MAT-SRC",
                        "canonical_description": src_mat.canonical_description,
                        "material_grade": src_mat.material_grade,
                        "standard_code": src_mat.standard_code,
                    },
                    {
                        "material_id": str(tgt_mat.id),
                        "organization_code": tgt_org.code if tgt_org else "CPSE_B",
                        "organization_name": tgt_org.name if tgt_org else "CPSE B",
                        "local_material_code": tgt_raw.material_code if tgt_raw else "MAT-TGT",
                        "canonical_description": tgt_mat.canonical_description,
                        "material_grade": tgt_mat.material_grade,
                        "standard_code": tgt_mat.standard_code,
                    }
                ]
            })

        return clusters
