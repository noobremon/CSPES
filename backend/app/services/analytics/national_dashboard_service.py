"""
National Material Intelligence Dashboard Analytics Service.

Aggregates high-level executive and operational KPIs across participating CPSEs,
ingested catalogs, duplicate candidates, CNMC standardization pipeline, and overlap opportunities.

DATA CLASSIFICATION GUARANTEE:
All numbers are derived dynamically from Layer 2 and Layer 3 records. Zero Layer 1
confidential purchase order pricing or vendor identities are exposed.
"""

from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, or_, and_

from app.models.organization import Organization
from app.models.material import RawMaterial, NormalizedMaterial
from app.models.matching import MaterialSimilarityMatch
from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.taxonomy import MaterialTaxonomy


DEMONSTRATION_DATASET_DISCLAIMER = (
    "SYNTHETIC DEMONSTRATION INSIGHT — Metrics and potential opportunities are dynamically "
    "aggregated from the demonstration dataset for SIH 2026 evaluation. Does not represent "
    "verified Government of India expenditure or official audited savings."
)


class NationalDashboardService:
    """
    Service responsible for computing macro-level KPIs and high-level national summary metrics.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_summary(self) -> Dict[str, Any]:
        """
        Computes the 10 core national KPI cards and macro standardization metrics.
        """
        # 1. Total Materials Ingested (Raw Materials count)
        res_raw = await self.db.execute(select(func.count(RawMaterial.id)))
        total_materials_ingested = res_raw.scalar() or 0

        # 2. Total Normalized Materials (Layer 2)
        res_norm = await self.db.execute(select(func.count(NormalizedMaterial.id)))
        total_normalized_materials = res_norm.scalar() or 0

        # 3. Total Participating CPSE Organizations
        res_org = await self.db.execute(select(func.count(Organization.id)).where(Organization.status == "ACTIVE"))
        total_participating_cpses = res_org.scalar() or 0

        # 4. Duplicate Candidates by Classification
        # Exact Duplicates
        res_exact = await self.db.execute(
            select(func.count(MaterialSimilarityMatch.id)).where(
                or_(
                    MaterialSimilarityMatch.match_type == "EXACT_DUPLICATE",
                    MaterialSimilarityMatch.match_type == "EXACT_MATCH_CANDIDATE"
                )
            )
        )
        exact_duplicate_candidates = res_exact.scalar() or 0

        # Near Duplicates
        res_near = await self.db.execute(
            select(func.count(MaterialSimilarityMatch.id)).where(
                or_(
                    MaterialSimilarityMatch.match_type == "NEAR_DUPLICATE",
                    MaterialSimilarityMatch.match_type == "NEAR_DUPLICATE_CANDIDATE"
                )
            )
        )
        near_duplicate_candidates = res_near.scalar() or 0

        # Functionally Equivalent Candidates
        res_equiv = await self.db.execute(
            select(func.count(MaterialSimilarityMatch.id)).where(
                or_(
                    MaterialSimilarityMatch.match_type == "FUNCTIONALLY_EQUIVALENT",
                    MaterialSimilarityMatch.match_type == "POSSIBLE_EQUIVALENT",
                    MaterialSimilarityMatch.match_type == "POSSIBLE_EQUIVALENT_CANDIDATE"
                )
            )
        )
        functional_equivalent_candidates = res_equiv.scalar() or 0

        total_match_candidates = exact_duplicate_candidates + near_duplicate_candidates + functional_equivalent_candidates

        # 5. Approved CNMC Master Records (Layer 3)
        res_masters = await self.db.execute(
            select(func.count(CNMCMaster.id)).where(CNMCMaster.status == "ACTIVE")
        )
        approved_cnmc_records = res_masters.scalar() or 0

        # 6. Pending Governance Reviews (Candidates awaiting domain sign-off)
        res_pending = await self.db.execute(
            select(func.count(CNMCCandidate.id)).where(
                or_(
                    CNMCCandidate.status == "PENDING_REVIEW",
                    CNMCCandidate.status == "REQUIRES_DOMAIN_REVIEW"
                )
            )
        )
        pending_governance_reviews = res_pending.scalar() or 0

        # 7. CPSE Legacy Material Codes Mapped (Cross-walk entries)
        res_mapped = await self.db.execute(
            select(func.count(CPSECNMCMapping.id)).where(CPSECNMCMapping.status == "ACTIVE")
        )
        cpse_legacy_codes_mapped = res_mapped.scalar() or 0

        # 8. Material Categories Covered
        res_cats = await self.db.execute(
            select(func.count(distinct(MaterialTaxonomy.code))).where(MaterialTaxonomy.is_active == True)
        )
        material_categories_covered = res_cats.scalar() or 0

        # 9. Cross-CPSE Overlap Pairs / Opportunities
        # Distinct pairs of CPSEs involved in matches
        res_cross_pairs = await self.db.execute(
            select(func.count(MaterialSimilarityMatch.id)).where(
                MaterialSimilarityMatch.composite_confidence >= 0.70
            )
        )
        potential_overlap_opportunities = res_cross_pairs.scalar() or 0

        # 10. Standardization Progress Ratio
        standardization_rate = 0.0
        if total_normalized_materials > 0:
            standardization_rate = round((cpse_legacy_codes_mapped / total_normalized_materials) * 100, 1)

        # 11. Redundancy Elimination Ratio
        redundancy_rate = 0.0
        if total_materials_ingested > 0:
            redundancy_rate = round((total_match_candidates / total_materials_ingested) * 100, 1)

        return {
            "kpis": {
                "total_materials_ingested": total_materials_ingested,
                "total_normalized_materials": total_normalized_materials,
                "total_participating_cpses": total_participating_cpses,
                "exact_duplicate_candidates": exact_duplicate_candidates,
                "near_duplicate_candidates": near_duplicate_candidates,
                "functional_equivalent_candidates": functional_equivalent_candidates,
                "total_match_candidates": total_match_candidates,
                "approved_cnmc_records": approved_cnmc_records,
                "pending_governance_reviews": pending_governance_reviews,
                "cpse_legacy_codes_mapped": cpse_legacy_codes_mapped,
                "material_categories_covered": material_categories_covered,
                "potential_overlap_opportunities": potential_overlap_opportunities,
            },
            "macro_metrics": {
                "standardization_progress_pct": standardization_rate,
                "redundancy_density_pct": redundancy_rate,
                "cnmc_format_version": "MVP_CNMC_V1",
                "governance_model": "HUMAN_IN_THE_LOOP_SOVEREIGN",
                "auto_approval_enabled": False,
            },
            "disclaimer": DEMONSTRATION_DATASET_DISCLAIMER
        }
