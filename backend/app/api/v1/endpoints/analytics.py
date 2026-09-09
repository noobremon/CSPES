"""
National Material Intelligence Analytics REST API Endpoints.

Endpoints:
- GET /api/v1/analytics/dashboard (and /dashboard/national) : Macro national KPIs and summary metrics
- GET /api/v1/analytics/duplicates : Duplication density by match type, CPSE, and category
- GET /api/v1/analytics/duplicates/clusters : Granular duplicate cluster listings
- GET /api/v1/analytics/cross-cpse-overlap (and /matrix/cross-cpse) : Dynamic N x N Cross-CPSE Overlap Matrix
- GET /api/v1/analytics/cnmc-summary (and /standardization/cnmc) : CNMC standardization pipeline & conversion funnel
- GET /api/v1/analytics/procurement-opportunities (and /procurement/opportunities) : Illustrative procurement opportunity cards
- GET /api/v1/analytics/rationalization-priorities (and /rationalization/priorities) : Ranked rationalization priority items
- GET /api/v1/analytics/categories : Category & taxonomy breakdowns
- GET /api/v1/analytics/categories/{category_id} : Single category drilldown
"""

from typing import List, Optional, Any, Dict
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.analytics import (
    DashboardSummaryResponse,
    DuplicateSummaryResponse,
    DuplicateClusterResponse,
    CrossCPSEOverlapResponse,
    CNMCSummaryResponse,
    ProcurementOpportunityResponse,
    RationalizationPriorityResponse,
    CategoryAnalyticsItem,
)
from app.services.analytics import (
    NationalDashboardService,
    DuplicateAnalyticsService,
    CrossCPSEAnalyticsService,
    CNMCAnalyticsService,
    ProcurementOpportunityService,
    RationalizationPriorityService,
    CategoryAnalyticsService,
)

router = APIRouter()


@router.get("/dashboard", response_model=DashboardSummaryResponse)
@router.get("/dashboard/national")
async def get_national_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns high-level national material KPIs, standardization progress, and duplication ratios.
    """
    service = NationalDashboardService(db)
    return await service.get_dashboard_summary()


@router.get("/duplicates", response_model=DuplicateSummaryResponse)
async def get_duplicate_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns duplicate density breakdowns across classifications, CPSE organizations, and taxonomy categories.
    """
    service = DuplicateAnalyticsService(db)
    return await service.get_duplicate_summary()


@router.get("/duplicates/clusters", response_model=List[DuplicateClusterResponse])
async def list_duplicate_clusters(
    match_type: Optional[str] = Query(None, description="Filter by match type (EXACT, NEAR, FUNCTIONAL, ALL)"),
    min_confidence: float = Query(0.50, ge=0.0, le=1.0, description="Minimum match confidence threshold"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns detailed duplicate material clusters with participating CPSEs and sanitized member metadata.
    """
    service = DuplicateAnalyticsService(db)
    return await service.get_duplicate_clusters(
        match_type=match_type,
        min_confidence=min_confidence,
        limit=limit,
        offset=offset
    )


@router.get("/cross-cpse-overlap", response_model=CrossCPSEOverlapResponse)
@router.get("/matrix/cross-cpse")
async def get_cross_cpse_overlap_matrix(
    min_overlap: Optional[int] = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the dynamic pairwise N x N material overlap matrix across all participating CPSEs.
    """
    service = CrossCPSEAnalyticsService(db)
    return await service.get_cross_cpse_overlap_matrix()


@router.get("/cnmc-summary", response_model=CNMCSummaryResponse)
@router.get("/standardization/cnmc")
async def get_cnmc_standardization_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns CNMC candidate pipeline metrics, master catalog statistics, and conversion funnel.
    """
    service = CNMCAnalyticsService(db)
    return await service.get_cnmc_summary()


@router.get("/procurement-opportunities", response_model=List[ProcurementOpportunityResponse])
@router.get("/procurement/opportunities")
async def list_procurement_opportunities(
    opportunity_type: Optional[str] = Query(None, description="Filter by opportunity type"),
    priority: Optional[str] = Query(None, description="Filter by priority (HIGH, MEDIUM, LOW)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns illustrative cross-CPSE procurement and demand aggregation opportunities.
    """
    service = ProcurementOpportunityService(db)
    return await service.get_procurement_opportunities(
        opportunity_type=opportunity_type,
        priority=priority,
        limit=limit,
        offset=offset
    )


@router.get("/rationalization-priorities", response_model=List[RationalizationPriorityResponse])
@router.get("/rationalization/priorities")
async def list_rationalization_priorities(
    priority: Optional[str] = Query(None, description="Filter by priority level (HIGH, MEDIUM, LOW)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns ranked material duplicate clusters with transparent deterministic rationalization priority scores.
    """
    service = RationalizationPriorityService(db)
    return await service.get_rationalization_priorities(
        min_priority=priority,
        limit=limit,
        offset=offset
    )


@router.get("/categories", response_model=List[CategoryAnalyticsItem])
async def list_category_analytics(db: AsyncSession = Depends(get_db)):
    """
    Returns category-level statistics and rationalization density across all engineering taxonomy nodes.
    """
    service = CategoryAnalyticsService(db)
    return await service.get_category_analytics()


@router.get("/categories/{category_id}", response_model=Dict[str, Any])
async def get_category_detail(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns drilldown details and sample materials for a specific category node.
    """
    service = CategoryAnalyticsService(db)
    detail = await service.get_category_detail(category_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found."
        )
    return detail
