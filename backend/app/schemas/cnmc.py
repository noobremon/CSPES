"""
Pydantic Schemas for CNMC Recommendation, Candidate Proposals, and Cross-walk Mappings.
"""

from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CNMCRecommendationRequest(BaseModel):
    material_id: uuid.UUID = Field(..., description="ID of the NormalizedMaterial to analyze")
    persist_candidate: bool = Field(True, description="Whether to store proposal in cnmc_candidates")


class CNMCExplanationSchema(BaseModel):
    outcome: str
    recommendation_strength: str
    generation_method: str
    format_version: str
    recommendation_reason: str
    taxonomy_signals: Dict[str, Any] = Field(default_factory=dict)
    matching_signals: Dict[str, Any] = Field(default_factory=dict)
    existing_cluster_reference: Optional[str] = None
    existing_cnmc_id: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    match_evidence_score: Optional[float] = None
    governance_notice: str


class CNMCRecommendationResponse(BaseModel):
    material_id: uuid.UUID
    outcome: str
    proposed_cnmc: str
    candidate_group_name: str
    proposed_description: str
    taxonomy_id: Optional[uuid.UUID] = None
    recommendation_strength: str
    strength_score: float
    is_existing_candidate: bool
    candidate_id: Optional[uuid.UUID] = None
    explanation: CNMCExplanationSchema


class CNMCCandidateListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    proposed_cnmc: str
    candidate_group_name: str
    proposed_description: str
    taxonomy_id: Optional[uuid.UUID] = None
    confidence_score: float
    generation_source: str
    status: str
    created_at: datetime
    updated_at: datetime
    explanation_structured: Optional[Dict[str, Any]] = None


class CNMCCandidateDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    proposed_cnmc: str
    candidate_group_name: str
    proposed_description: str
    taxonomy_id: Optional[uuid.UUID] = None
    confidence_score: float
    generation_source: str
    status: str
    created_at: datetime
    updated_at: datetime
    explanation_structured: Optional[Dict[str, Any]] = None
    source_materials: List[Dict[str, Any]] = Field(default_factory=list)


class CNMCReviewRequest(BaseModel):
    action: str = Field(..., description="Action to perform: APPROVE, REJECT, MODIFY")
    reviewer_reference: Optional[str] = Field(None, description="Identifier of the human reviewer")
    comments: Optional[str] = Field(None, description="Justification comments (Mandatory for REJECT and MODIFY)")
    modified_cnmc: Optional[str] = Field(None, description="Overridden CNMC code if modifying")
    modified_group_name: Optional[str] = Field(None, description="Overridden group title if modifying")
    modified_description: Optional[str] = Field(None, description="Overridden description if modifying")
    modified_taxonomy_id: Optional[uuid.UUID] = Field(None, description="Overridden taxonomy ID if modifying")
    material_id_to_map: Optional[uuid.UUID] = Field(None, description="Optional NormalizedMaterial ID to link to approved CNMC")


class CNMCReviewResponse(BaseModel):
    candidate_id: str
    decision: str
    previous_status: str
    new_status: str
    reviewer_reference: str
    comments: Optional[str] = None
    master_id: Optional[str] = None
    mapping_id: Optional[str] = None
    governance_notice: str


class CPSEMappingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    raw_material_id: uuid.UUID
    normalized_material_id: uuid.UUID
    organization_id: uuid.UUID
    organization_code: Optional[str] = None
    organization_name: Optional[str] = None
    local_material_code: str
    cnmc_id: uuid.UUID
    cnmc_code: Optional[str] = None
    canonical_name: Optional[str] = None
    mapping_type: str
    confidence_score: float
    status: str
    approved_by: str
    created_at: datetime
    effective_from: datetime
    effective_to: Optional[datetime] = None


class CNMCMasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cnmc_code: str
    canonical_name: str
    standard_description: str
    taxonomy_id: Optional[uuid.UUID] = None
    spec_template: Optional[Dict[str, Any]] = None
    status: str
    governance_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
