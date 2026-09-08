"""
CNMC Recommendation and Governance REST API Endpoints.

Endpoints:
- POST /api/v1/cnmc/recommend : Generate prototype CNMC recommendation for a normalized material
- GET /api/v1/cnmc/candidates : Retrieve list of CNMC candidates with status filtering
- GET /api/v1/cnmc/candidates/{candidate_id} : Detailed candidate with structured explainability
- POST /api/v1/cnmc/candidates/{candidate_id}/review : Submit APPROVE, REJECT, or MODIFY decision
- GET /api/v1/cnmc/mappings : Query CPSE <-> CNMC cross-walk mappings
- GET /api/v1/cnmc/masters : Query approved prototype CNMC masters
"""

from typing import List, Optional, Any, Dict
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc

from app.db.session import get_db
from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.material import NormalizedMaterial, RawMaterial
from app.models.organization import Organization
from app.schemas.cnmc import (
    CNMCRecommendationRequest,
    CNMCRecommendationResponse,
    CNMCExplanationSchema,
    CNMCCandidateListResponse,
    CNMCCandidateDetailResponse,
    CNMCReviewRequest,
    CNMCReviewResponse,
    CPSEMappingResponse,
    CNMCMasterResponse,
)
from app.services.cnmc.recommendation_engine import (
    CNMCRecommendationService,
    CNMCRecommendationResult,
)
from app.services.governance.workflow_service import (
    GovernanceWorkflowService,
    GOVERNANCE_DISCLAIMER,
)
from app.core.deps import get_current_user
from app.models.user import User, RoleEnum

router = APIRouter()


@router.post("/recommend", response_model=CNMCRecommendationResponse)
async def generate_cnmc_recommendation(
    req: CNMCRecommendationRequest,
    x_demo_reviewer: Optional[str] = Header(None, description="Demo Reviewer Identifier"),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a prototype CNMC recommendation for a given normalized material.
    Inspects taxonomy, technical attributes, and candidate clusters to either:
    - Recommend reusing an existing governed prototype CNMC, or
    - Recommend synthesizing a new prototype CNMC candidate, or
    - Flag insufficient data.
    """
    if current_user and current_user.role == RoleEnum.AUDITOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Auditor role is read-only and cannot trigger recommendation persistence."
        )

    service = CNMCRecommendationService(db)
    actor = current_user.email if current_user else (x_demo_reviewer or "CNMC_RECOMMENDATION_ENGINE_V1")

    try:
        res: CNMCRecommendationResult = await service.recommend_cnmc_for_material(
            material_id=req.material_id,
            persist_candidate=req.persist_candidate,
            actor_reference=actor
        )
        await db.commit()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    return CNMCRecommendationResponse(
        material_id=req.material_id,
        outcome=res.outcome,
        proposed_cnmc=res.proposed_cnmc,
        candidate_group_name=res.candidate_group_name,
        proposed_description=res.proposed_description,
        taxonomy_id=res.taxonomy_id,
        recommendation_strength=res.recommendation_strength,
        strength_score=res.strength_score,
        is_existing_candidate=res.is_existing_candidate,
        candidate_id=res.candidate_id,
        explanation=CNMCExplanationSchema(**res.explanation.to_dict())
    )


@router.get("/candidates", response_model=List[CNMCCandidateListResponse])
async def list_cnmc_candidates(
    status_filter: Optional[str] = Query(None, description="Filter by status (PENDING_REVIEW, APPROVED, REJECTED, MODIFIED)"),
    search: Optional[str] = Query(None, description="Search term in proposed CNMC or group title"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a list of CNMC candidates with optional status filtering and search.
    """
    stmt = select(CNMCCandidate)
    if status_filter:
        stmt = stmt.where(CNMCCandidate.status == status_filter.upper())
    if search:
        s = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                CNMCCandidate.proposed_cnmc.ilike(s),
                CNMCCandidate.candidate_group_name.ilike(s),
                CNMCCandidate.proposed_description.ilike(s),
            )
        )

    stmt = stmt.order_by(desc(CNMCCandidate.created_at)).limit(limit).offset(offset)
    res = await db.execute(stmt)
    candidates = res.scalars().all()

    items = []
    for c in candidates:
        expl_dict = None
        if c.recommendation_explanation:
            try:
                expl_dict = json.loads(c.recommendation_explanation)
            except Exception:
                expl_dict = {"summary": c.recommendation_explanation}

        items.append(CNMCCandidateListResponse(
            id=c.id,
            proposed_cnmc=c.proposed_cnmc,
            candidate_group_name=c.candidate_group_name,
            proposed_description=c.proposed_description,
            taxonomy_id=c.taxonomy_id,
            confidence_score=c.confidence_score,
            generation_source=c.generation_source,
            status=c.status,
            created_at=c.created_at,
            updated_at=c.updated_at,
            explanation_structured=expl_dict
        ))

    return items


@router.get("/candidates/{candidate_id}", response_model=CNMCCandidateDetailResponse)
async def get_cnmc_candidate_detail(
    candidate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves full detail of a single CNMC candidate proposal including structured explanation.
    """
    cand = await db.get(CNMCCandidate, candidate_id)
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found."
        )

    expl_dict = None
    if cand.recommendation_explanation:
        try:
            expl_dict = json.loads(cand.recommendation_explanation)
        except Exception:
            expl_dict = {"summary": cand.recommendation_explanation}

    # Query any associated normalized materials through mappings or explanation hints
    materials = []
    stmt = (
        select(NormalizedMaterial, Organization)
        .join(Organization, NormalizedMaterial.organization_id == Organization.id)
        .where(NormalizedMaterial.canonical_description.ilike(f"%{cand.candidate_group_name}%"))
        .limit(10)
    )
    res = await db.execute(stmt)
    for nm, org in res.all():
        materials.append({
            "material_id": str(nm.id),
            "organization_code": org.code,
            "organization_name": org.name,
            "canonical_description": nm.canonical_description,
            "uom": nm.normalized_uom,
            "material_grade": nm.material_grade,
            "standard_code": nm.standard_code,
        })

    return CNMCCandidateDetailResponse(
        id=cand.id,
        proposed_cnmc=cand.proposed_cnmc,
        candidate_group_name=cand.candidate_group_name,
        proposed_description=cand.proposed_description,
        taxonomy_id=cand.taxonomy_id,
        confidence_score=cand.confidence_score,
        generation_source=cand.generation_source,
        status=cand.status,
        created_at=cand.created_at,
        updated_at=cand.updated_at,
        explanation_structured=expl_dict,
        source_materials=materials
    )


@router.post("/candidates/{candidate_id}/review", response_model=CNMCReviewResponse)
async def review_cnmc_candidate(
    candidate_id: uuid.UUID,
    req: CNMCReviewRequest,
    x_demo_reviewer: Optional[str] = Header(None, description="Demo Reviewer Identifier"),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a human governance review action (APPROVE, REJECT, MODIFY) for a CNMC candidate.
    Enforces mandatory justifications for rejections and modifications.
    Enforces that reviewers have DOMAIN_REVIEWER or NATIONAL_MASTER_ADMIN role.
    """
    if current_user:
        if current_user.role not in [RoleEnum.DOMAIN_REVIEWER, RoleEnum.NATIONAL_MASTER_ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Governance review actions (APPROVE/REJECT/MODIFY) require DOMAIN_REVIEWER or NATIONAL_MASTER_ADMIN role. Current role: {current_user.role.value}"
            )
        reviewer = current_user.email
    else:
        reviewer = req.reviewer_reference or x_demo_reviewer or "demo_domain_reviewer@sih.gov.in"

    workflow = GovernanceWorkflowService(db)

    try:
        result = await workflow.review_candidate(
            candidate_id=candidate_id,
            action=req.action,
            reviewer_reference=reviewer,
            comments=req.comments,
            modified_cnmc=req.modified_cnmc,
            modified_group_name=req.modified_group_name,
            modified_description=req.modified_description,
            modified_taxonomy_id=req.modified_taxonomy_id,
            material_id_to_map=req.material_id_to_map
        )
        await db.commit()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    return CNMCReviewResponse(**result)


@router.get("/mappings", response_model=List[CPSEMappingResponse])
async def list_cpse_cnmc_mappings(
    organization_id: Optional[uuid.UUID] = Query(None, description="Filter by CPSE organization"),
    cnmc_id: Optional[uuid.UUID] = Query(None, description="Filter by CNMC master ID"),
    status_filter: Optional[str] = Query("ACTIVE", description="Filter by mapping status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Queries cross-walk mappings binding CPSE legacy material codes to approved prototype CNMCs.
    """
    stmt = (
        select(CPSECNMCMapping, Organization, CNMCMaster)
        .join(Organization, CPSECNMCMapping.organization_id == Organization.id)
        .join(CNMCMaster, CPSECNMCMapping.cnmc_id == CNMCMaster.id)
    )

    if organization_id:
        stmt = stmt.where(CPSECNMCMapping.organization_id == organization_id)
    if cnmc_id:
        stmt = stmt.where(CPSECNMCMapping.cnmc_id == cnmc_id)
    if status_filter:
        stmt = stmt.where(CPSECNMCMapping.status == status_filter.upper())

    stmt = stmt.order_by(desc(CPSECNMCMapping.created_at)).limit(limit).offset(offset)
    res = await db.execute(stmt)
    records = res.all()

    items = []
    for mapping, org, cnmc in records:
        items.append(CPSEMappingResponse(
            id=mapping.id,
            raw_material_id=mapping.raw_material_id,
            normalized_material_id=mapping.normalized_material_id,
            organization_id=mapping.organization_id,
            organization_code=org.code,
            organization_name=org.name,
            local_material_code=mapping.local_material_code,
            cnmc_id=mapping.cnmc_id,
            cnmc_code=cnmc.cnmc_code,
            canonical_name=cnmc.canonical_name,
            mapping_type=mapping.mapping_type,
            confidence_score=mapping.confidence_score,
            status=mapping.status,
            approved_by=mapping.approved_by,
            created_at=mapping.created_at,
            effective_from=mapping.effective_from,
            effective_to=mapping.effective_to
        ))

    return items


@router.get("/masters", response_model=List[CNMCMasterResponse])
async def list_cnmc_masters(
    search: Optional[str] = Query(None, description="Search term in CNMC code or title"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Queries governed prototype CNMC master records.
    """
    stmt = select(CNMCMaster).where(CNMCMaster.status == "ACTIVE")
    if search:
        s = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                CNMCMaster.cnmc_code.ilike(s),
                CNMCMaster.canonical_name.ilike(s),
                CNMCMaster.standard_description.ilike(s)
            )
        )
    stmt = stmt.order_by(desc(CNMCMaster.created_at)).limit(limit).offset(offset)
    res = await db.execute(stmt)
    masters = res.scalars().all()
    return masters
