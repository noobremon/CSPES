"""
CNMC Standardization & Governance Analytics Service.

Provides metrics and pipeline funnel analytics for the Common National Material Code
prototype reference lifecycle and cross-walk adoption.
"""

from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, or_

from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.governance import GovernanceReview
from app.models.material import RawMaterial, NormalizedMaterial
from app.models.matching import MaterialSimilarityMatch


class CNMCAnalyticsService:
    """
    Computes standardization adoption metrics, candidate review funnel, and mapping coverage.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_cnmc_summary(self) -> Dict[str, Any]:
        """
        Computes the complete CNMC standardization metrics and conversion funnel.
        """
        # 1. Candidate pipeline counts
        res_total = await self.db.execute(select(func.count(CNMCCandidate.id)))
        total_candidates = res_total.scalar() or 0

        res_pending = await self.db.execute(
            select(func.count(CNMCCandidate.id)).where(
                or_(
                    CNMCCandidate.status == "PENDING_REVIEW",
                    CNMCCandidate.status == "REQUIRES_DOMAIN_REVIEW"
                )
            )
        )
        pending_review = res_pending.scalar() or 0

        res_approved = await self.db.execute(
            select(func.count(CNMCCandidate.id)).where(CNMCCandidate.status == "APPROVED")
        )
        approved_candidates = res_approved.scalar() or 0

        res_rejected = await self.db.execute(
            select(func.count(CNMCCandidate.id)).where(CNMCCandidate.status == "REJECTED")
        )
        rejected_candidates = res_rejected.scalar() or 0

        res_modified = await self.db.execute(
            select(func.count(CNMCCandidate.id)).where(CNMCCandidate.status == "MODIFIED")
        )
        modified_candidates = res_modified.scalar() or 0

        # 2. Recommendation types: Reuse vs New
        res_reuse = await self.db.execute(
            select(func.count(CNMCCandidate.id)).where(
                CNMCCandidate.generation_source.ilike("%REUSE%")
            )
        )
        reuse_recommendations = res_reuse.scalar() or 0

        new_recommendations = max(0, total_candidates - reuse_recommendations)

        # 3. Governed Master Catalog & Mappings
        res_masters = await self.db.execute(
            select(func.count(CNMCMaster.id)).where(CNMCMaster.status == "ACTIVE")
        )
        active_master_records = res_masters.scalar() or 0

        res_mappings = await self.db.execute(
            select(func.count(CPSECNMCMapping.id)).where(CPSECNMCMapping.status == "ACTIVE")
        )
        active_crosswalk_mappings = res_mappings.scalar() or 0

        # 4. Preserved legacy codes
        res_legacy = await self.db.execute(
            select(func.count(distinct(CPSECNMCMapping.local_material_code))).where(
                CPSECNMCMapping.status == "ACTIVE"
            )
        )
        legacy_codes_preserved = res_legacy.scalar() or 0

        # 5. Visual Funnel Stages
        res_raw = await self.db.execute(select(func.count(RawMaterial.id)))
        raw_count = res_raw.scalar() or 0

        res_matched = await self.db.execute(select(func.count(MaterialSimilarityMatch.id)))
        matched_count = res_matched.scalar() or 0

        funnel = [
            {"stage": "1. Ingested CPSE Materials", "count": raw_count, "description": "Raw ERP catalog records"},
            {"stage": "2. Similarity Candidate Pairs", "count": matched_count, "description": "Multi-tier match intelligence"},
            {"stage": "3. CNMC Candidate Proposals", "count": total_candidates, "description": "Deterministic prototype recommendations"},
            {"stage": "4. Governed Master Records", "count": active_master_records, "description": "Approved Layer 3 prototype master catalog"},
            {"stage": "5. Active Cross-Walk Mappings", "count": active_crosswalk_mappings, "description": "CPSE legacy codes mapped"}
        ]

        return {
            "candidate_pipeline": {
                "total_candidates": total_candidates,
                "pending_review": pending_review,
                "approved": approved_candidates,
                "rejected": rejected_candidates,
                "modified_by_reviewer": modified_candidates,
                "reuse_recommendations": reuse_recommendations,
                "new_recommendations": new_recommendations,
            },
            "master_and_mappings": {
                "active_master_cnmcs": active_master_records,
                "active_crosswalk_mappings": active_crosswalk_mappings,
                "legacy_codes_preserved": legacy_codes_preserved,
                "format_version": "MVP_CNMC_V1",
            },
            "conversion_funnel": funnel,
        }
