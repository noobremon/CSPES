"""
Category & Taxonomy Analytics Service.

Aggregates material intelligence, duplication density, and standardization progress
across hierarchical engineering categories.
"""

from typing import Dict, Any, List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.models.taxonomy import MaterialTaxonomy
from app.models.material import NormalizedMaterial
from app.models.matching import MaterialSimilarityMatch
from app.models.cnmc import CPSECNMCMapping, CNMCCandidate


class CategoryAnalyticsService:
    """
    Computes category-level breakdowns and taxonomy drilldowns.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_category_analytics(self) -> List[Dict[str, Any]]:
        """
        Computes category-level statistics across all active taxonomy nodes.
        """
        stmt = select(MaterialTaxonomy).where(MaterialTaxonomy.is_active == True).order_by(MaterialTaxonomy.level, MaterialTaxonomy.name)
        res = await self.db.execute(stmt)
        taxonomies = res.scalars().all()

        categories = []

        for tax in taxonomies:
            # Query materials in this taxonomy
            mat_stmt = select(func.count(NormalizedMaterial.id)).where(NormalizedMaterial.taxonomy_id == tax.id)
            mat_res = await self.db.execute(mat_stmt)
            total_materials = mat_res.scalar() or 0

            # Query matches
            match_stmt = (
                select(func.count(MaterialSimilarityMatch.id))
                .join(NormalizedMaterial, NormalizedMaterial.id == MaterialSimilarityMatch.source_material_id)
                .where(NormalizedMaterial.taxonomy_id == tax.id)
            )
            match_res = await self.db.execute(match_stmt)
            duplicate_candidates = match_res.scalar() or 0

            # Query approved mappings
            map_stmt = (
                select(func.count(CPSECNMCMapping.id))
                .join(NormalizedMaterial, NormalizedMaterial.id == CPSECNMCMapping.normalized_material_id)
                .where(NormalizedMaterial.taxonomy_id == tax.id, CPSECNMCMapping.status == "ACTIVE")
            )
            map_res = await self.db.execute(map_stmt)
            approved_mappings = map_res.scalar() or 0

            # Pending reviews
            cand_stmt = select(func.count(CNMCCandidate.id)).where(
                CNMCCandidate.taxonomy_id == tax.id,
                CNMCCandidate.status == "PENDING_REVIEW"
            )
            cand_res = await self.db.execute(cand_stmt)
            pending_reviews = cand_res.scalar() or 0

            # Rationalization priority based on volume and unmapped duplicates
            priority = "LOW"
            if duplicate_candidates > 0 and approved_mappings == 0:
                priority = "HIGH"
            elif duplicate_candidates > 0:
                priority = "MEDIUM"

            categories.append({
                "category_id": str(tax.id),
                "category_code": tax.code,
                "category_name": tax.name,
                "taxonomy_path": tax.path,
                "level": tax.level,
                "total_materials": total_materials,
                "duplicate_candidates": duplicate_candidates,
                "approved_cnmc_mappings": approved_mappings,
                "pending_reviews": pending_reviews,
                "rationalization_priority": priority,
            })

        return categories

    async def get_category_detail(self, category_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """
        Retrieves detailed drilldown for a single category node.
        """
        tax = await self.db.get(MaterialTaxonomy, category_id)
        if not tax:
            return None

        # Materials list
        mat_stmt = (
            select(NormalizedMaterial)
            .where(NormalizedMaterial.taxonomy_id == category_id)
            .limit(20)
        )
        mat_res = await self.db.execute(mat_stmt)
        materials = mat_res.scalars().all()

        return {
            "category_id": str(tax.id),
            "category_code": tax.code,
            "category_name": tax.name,
            "taxonomy_path": tax.path,
            "level": tax.level,
            "materials_sample": [
                {
                    "material_id": str(m.id),
                    "canonical_description": m.canonical_description,
                    "uom": m.normalized_uom,
                    "material_grade": m.material_grade,
                    "standard_code": m.standard_code,
                }
                for m in materials
            ]
        }
