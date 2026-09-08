"""
Pydantic Schemas for Governance Reviews and Audit Logs.
"""

from typing import Optional, Dict, Any, List
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class GovernanceReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    reviewer_reference: str
    decision: str
    comments: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: str
    created_at: datetime


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    entity_type: str
    entity_id: str
    action: str
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    actor_reference: str
    ip_address: Optional[str] = None
    timestamp: datetime
    metadata_payload: Optional[Dict[str, Any]] = None
