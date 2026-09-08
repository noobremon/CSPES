"""
Material Matching API Endpoints for Candidate Intelligence & Explainability.

Endpoints:
- POST /api/v1/materials/{material_id}/match : Generate candidate matches for a material
- GET /api/v1/materials/{material_id}/matches : Retrieve existing candidate matches
- GET /api/v1/matches/{match_id} : Retrieve full explainable match card and attribute diff
"""

from typing import List, Optional, Any, Dict
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_

from app.db.session import get_db
from app.models.matching import MaterialSimilarityMatch
from app.models.material import NormalizedMaterial, RawMaterial
from app.models.organization import Organization
from app.services.matching.hybrid_engine import (
    generate_and_persist_matches_for_material,
    load_representation_for_material,
    score_candidate_pair
)
from app.services.matching.embedding_provider import get_embedding_provider

router = APIRouter()


# Schemas
class MatchCandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    source_material_id: uuid.UUID
    target_material_id: uuid.UUID
    match_type: str
    lexical_score: float
    vector_score: float
    attribute_score: float
    composite_confidence: float
    methodology: str
    recommendation_status: str
    ai_model_version: Optional[str] = None
    specification_diff: Optional[Dict[str, Any]] = None
    match_explanation_structured: Optional[Dict[str, Any]] = None
    target_material_description: Optional[str] = None
    target_organization_code: Optional[str] = None


class MatchDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    source_material_id: uuid.UUID
    target_material_id: uuid.UUID
    match_type: str
    lexical_score: float
    vector_score: float
    attribute_score: float
    composite_confidence: float
    methodology: str
    recommendation_status: str
    ai_model_version: Optional[str] = None
    specification_diff: Optional[Dict[str, Any]] = None
    explanation: Optional[Dict[str, Any]] = None
    source_material: Optional[Dict[str, Any]] = None
    target_material: Optional[Dict[str, Any]] = None


class EmbeddingStatusResponse(BaseModel):
    provider: str
    model_name: str
    dimensions: int
    version: str
    is_available: bool
    status: str


@router.get("/status/embeddings", response_model=EmbeddingStatusResponse)
async def get_embedding_model_status():
    """
    Returns the live status and availability of the ML semantic embedding provider.
    """
    provider = get_embedding_provider()
    info = provider.get_model_info()
    return EmbeddingStatusResponse(
        provider=info.get("provider", "Unknown"),
        model_name=info.get("model_name", "None"),
        dimensions=info.get("dimensions", 0),
        version=info.get("version", "1.0.0"),
        is_available=info.get("is_available", False),
        status=info.get("status", "UNAVAILABLE")
    )


@router.post("/materials/{material_id}/match", response_model=List[MatchCandidateResponse])
async def trigger_material_matching(
    material_id: uuid.UUID,
    cross_org_only: bool = Query(True, description="Compare only across different CPSEs"),
    min_confidence: float = Query(0.40, ge=0.0, le=1.0, description="Minimum composite confidence score"),
    limit: int = Query(20, ge=1, le=100, description="Max candidate results to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers candidate matching engine for a given source material.
    Retrieves candidates via blocking strategy, evaluates Tier 1, Tier 2, and Tier 3 signals,
    computes hybrid score, persists candidate matches, and returns explainable recommendations.
    """
    source_mat = await db.get(NormalizedMaterial, material_id)
    if not source_mat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"NormalizedMaterial with ID {material_id} not found."
        )

    matches = await generate_and_persist_matches_for_material(
        source_material_id=material_id,
        session=db,
        cross_org_only=cross_org_only,
        min_score_threshold=min_confidence,
        limit=limit
    )

    responses = []
    for m in matches:
        target_mat = await db.get(NormalizedMaterial, m.target_material_id)
        org = await db.get(Organization, target_mat.organization_id) if target_mat else None

        expl_data = {}
        if m.match_explanation:
            try:
                expl_data = json.loads(m.match_explanation)
            except Exception:
                expl_data = {"summary": m.match_explanation}

        responses.append(MatchCandidateResponse(
            id=m.id,
            source_material_id=m.source_material_id,
            target_material_id=m.target_material_id,
            match_type=m.match_type,
            lexical_score=m.lexical_score,
            vector_score=m.vector_score,
            attribute_score=m.attribute_score,
            composite_confidence=m.composite_confidence,
            methodology=m.methodology,
            recommendation_status=m.recommendation_status,
            ai_model_version=m.ai_model_version,
            specification_diff=m.specification_diff,
            match_explanation_structured=expl_data,
            target_material_description=target_mat.canonical_description if target_mat else None,
            target_organization_code=org.code if org else None
        ))

    return responses


@router.get("/materials/{material_id}/matches", response_model=List[MatchCandidateResponse])
async def get_material_matches(
    material_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves all previously generated candidate matches for a source material.
    """
    stmt = (
        select(MaterialSimilarityMatch)
        .where(
            or_(
                MaterialSimilarityMatch.source_material_id == material_id,
                MaterialSimilarityMatch.target_material_id == material_id
            )
        )
        .order_by(MaterialSimilarityMatch.composite_confidence.desc())
    )
    result = await db.execute(stmt)
    matches = result.scalars().all()

    responses = []
    for m in matches:
        other_id = m.target_material_id if m.source_material_id == material_id else m.source_material_id
        target_mat = await db.get(NormalizedMaterial, other_id)
        org = await db.get(Organization, target_mat.organization_id) if target_mat else None

        expl_data = {}
        if m.match_explanation:
            try:
                expl_data = json.loads(m.match_explanation)
            except Exception:
                expl_data = {"summary": m.match_explanation}

        responses.append(MatchCandidateResponse(
            id=m.id,
            source_material_id=m.source_material_id,
            target_material_id=m.target_material_id,
            match_type=m.match_type,
            lexical_score=m.lexical_score,
            vector_score=m.vector_score,
            attribute_score=m.attribute_score,
            composite_confidence=m.composite_confidence,
            methodology=m.methodology,
            recommendation_status=m.recommendation_status,
            ai_model_version=m.ai_model_version,
            specification_diff=m.specification_diff,
            match_explanation_structured=expl_data,
            target_material_description=target_mat.canonical_description if target_mat else None,
            target_organization_code=org.code if org else None
        ))

    return responses


@router.get("/matches/{match_id}", response_model=MatchDetailResponse)
async def get_match_detail(
    match_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a single explainable match card with detailed specification diff,
    signal evaluation breakdown, and sanitized material representations.
    """
    match = await db.get(MaterialSimilarityMatch, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match record with ID {match_id} not found."
        )

    s_rep = await load_representation_for_material(match.source_material_id, db)
    t_rep = await load_representation_for_material(match.target_material_id, db)

    expl_data = {}
    if match.match_explanation:
        try:
            expl_data = json.loads(match.match_explanation)
        except Exception:
            expl_data = {"summary": match.match_explanation}

    s_data = {
        "material_id": str(s_rep.material_id) if s_rep else str(match.source_material_id),
        "canonical_description": s_rep.canonical_description if s_rep else "N/A",
        "uom": s_rep.normalized_uom if s_rep else "N/A",
        "material_grade": s_rep.material_grade if s_rep else None,
        "standard_code": s_rep.standard_code if s_rep else None,
        "technical_attributes": s_rep.technical_attributes if s_rep else {}
    } if s_rep else None

    t_data = {
        "material_id": str(t_rep.material_id) if t_rep else str(match.target_material_id),
        "canonical_description": t_rep.canonical_description if t_rep else "N/A",
        "uom": t_rep.normalized_uom if t_rep else "N/A",
        "material_grade": t_rep.material_grade if t_rep else None,
        "standard_code": t_rep.standard_code if t_rep else None,
        "technical_attributes": t_rep.technical_attributes if t_rep else {}
    } if t_rep else None

    return MatchDetailResponse(
        id=match.id,
        source_material_id=match.source_material_id,
        target_material_id=match.target_material_id,
        match_type=match.match_type,
        lexical_score=match.lexical_score,
        vector_score=match.vector_score,
        attribute_score=match.attribute_score,
        composite_confidence=match.composite_confidence,
        methodology=match.methodology,
        recommendation_status=match.recommendation_status,
        ai_model_version=match.ai_model_version,
        specification_diff=match.specification_diff,
        explanation=expl_data,
        source_material=s_data,
        target_material=t_data
    )
