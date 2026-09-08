"""
Governance Reviews and Immutable Audit Log REST API Endpoints.

Endpoints:
- GET /api/v1/governance/reviews : Query review history with entity type/ID filtering
- GET /api/v1/governance/reviews/{review_id} : Specific review decision details
- GET /api/v1/governance/audit-logs : Query append-only audit trail logs
"""

from typing import List, Optional, Any
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc

from app.db.session import get_db
from app.models.governance import GovernanceReview, AuditLog
from app.schemas.governance import (
    GovernanceReviewResponse,
    AuditLogResponse,
)

router = APIRouter()


@router.get("/reviews", response_model=List[GovernanceReviewResponse])
async def list_governance_reviews(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (CNMC_CANDIDATE, SIMILARITY_MATCH, etc.)"),
    entity_id: Optional[uuid.UUID] = Query(None, description="Filter by target entity ID"),
    decision: Optional[str] = Query(None, description="Filter by decision (APPROVED, REJECTED, MODIFIED)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves human governance review decisions and rationales across candidates and matches.
    """
    stmt = select(GovernanceReview)
    if entity_type:
        stmt = stmt.where(GovernanceReview.entity_type == entity_type.upper())
    if entity_id:
        stmt = stmt.where(GovernanceReview.entity_id == entity_id)
    if decision:
        stmt = stmt.where(GovernanceReview.decision == decision.upper())

    stmt = stmt.order_by(desc(GovernanceReview.created_at)).limit(limit).offset(offset)
    res = await db.execute(stmt)
    reviews = res.scalars().all()
    return reviews


@router.get("/reviews/{review_id}", response_model=GovernanceReviewResponse)
async def get_governance_review_detail(
    review_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves detail of a single governance review record.
    """
    review = await db.get(GovernanceReview, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GovernanceReview with ID {review_id} not found."
        )
    return review


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    action: Optional[str] = Query(None, description="Filter by action code"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves immutable audit trail log entries. Sensitive Layer 1 data is guaranteed excluded.
    """
    stmt = select(AuditLog)
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)
    if entity_id:
        stmt = stmt.where(AuditLog.entity_id == entity_id)
    if action:
        stmt = stmt.where(AuditLog.action == action)

    stmt = stmt.order_by(desc(AuditLog.timestamp)).limit(limit).offset(offset)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return logs
