"""
Pydantic Schemas for National Analytics, Overlap Matrices, Opportunities, and Rationalization Priorities.
"""

from typing import Optional, List, Dict, Any
import uuid
from pydantic import BaseModel, Field, ConfigDict


class DashboardKPIs(BaseModel):
    total_materials_ingested: int
    total_normalized_materials: int
    total_participating_cpses: int
    exact_duplicate_candidates: int
    near_duplicate_candidates: int
    functional_equivalent_candidates: int
    total_match_candidates: int
    approved_cnmc_records: int
    pending_governance_reviews: int
    cpse_legacy_codes_mapped: int
    material_categories_covered: int
    potential_overlap_opportunities: int


class DashboardMacroMetrics(BaseModel):
    standardization_progress_pct: float
    redundancy_density_pct: float
    cnmc_format_version: str
    governance_model: str
    auto_approval_enabled: bool


class DashboardSummaryResponse(BaseModel):
    kpis: DashboardKPIs
    macro_metrics: DashboardMacroMetrics
    disclaimer: str


class DuplicateClassifications(BaseModel):
    exact_duplicates: int
    near_duplicates: int
    functional_equivalences: int
    total_duplicates: int


class DuplicateSummaryResponse(BaseModel):
    duplicate_classifications: DuplicateClassifications
    density_by_cpse: List[Dict[str, Any]]
    density_by_category: List[Dict[str, Any]]


class ClusterMember(BaseModel):
    material_id: str
    organization_code: str
    organization_name: str
    local_material_code: str
    canonical_description: str
    material_grade: Optional[str] = None
    standard_code: Optional[str] = None


class DuplicateClusterResponse(BaseModel):
    cluster_id: str
    match_id: str
    match_type: str
    composite_confidence: float
    lexical_score: float
    attribute_score: float
    methodology: str
    recommendation_status: str
    participating_cpse_count: int
    participating_cpses: List[str]
    material_count: int
    canonical_description: str
    specification_diff: Optional[Dict[str, Any]] = None
    linked_cnmc_candidate: Optional[str] = None
    linked_cnmc_status: str
    members: List[ClusterMember]


class CrossCPSEPairDetail(BaseModel):
    cpse_a: str
    cpse_b: str
    total_overlapping_materials: int
    exact_matches: int
    near_duplicates: int
    functional_equivalences: int
    avg_confidence: float


class CrossCPSEOverlapResponse(BaseModel):
    status: str
    message: Optional[str] = None
    organizations: List[str]
    matrix: Dict[str, Dict[str, int]]
    pair_details: List[CrossCPSEPairDetail]
    total_cross_cpse_clusters: Optional[int] = None


class CNMCCandidatePipeline(BaseModel):
    total_candidates: int
    pending_review: int
    approved: int
    rejected: int
    modified_by_reviewer: int
    reuse_recommendations: int
    new_recommendations: int


class CNMCMasterAndMappings(BaseModel):
    active_master_cnmcs: int
    active_crosswalk_mappings: int
    legacy_codes_preserved: int
    format_version: str


class CNMCFunnelStage(BaseModel):
    stage: str
    count: int
    description: str


class CNMCSummaryResponse(BaseModel):
    candidate_pipeline: CNMCCandidatePipeline
    master_and_mappings: CNMCMasterAndMappings
    conversion_funnel: List[CNMCFunnelStage]


class ProcurementOpportunityResponse(BaseModel):
    opportunity_id: str
    opportunity_type: str
    title: str
    material_cluster_title: str
    participating_cpse_count: int
    participating_cpses: List[str]
    material_count: int
    match_classification: str
    confidence_score: float
    priority_level: str
    supporting_evidence: str
    recommendation: str
    disclaimer: str


class RationalizationScoreComponents(BaseModel):
    cpse_coverage_points: float
    cluster_size_points: float
    evidence_strength_points: float
    unstandardized_status_points: float


class RationalizationPriorityResponse(BaseModel):
    cluster_id: str
    material_title: str
    priority_score: float
    priority_level: str
    score_components: RationalizationScoreComponents
    participating_cpse_count: int
    participating_cpses: List[str]
    material_count: int
    match_evidence_score: float
    governance_status: str
    has_approved_cnmc: bool
    explanation_rationale: str
    recommended_action: str
    scoring_methodology: str


class CategoryAnalyticsItem(BaseModel):
    category_id: str
    category_code: str
    category_name: str
    taxonomy_path: str
    level: int
    total_materials: int
    duplicate_candidates: int
    approved_cnmc_mappings: int
    pending_reviews: int
    rationalization_priority: str
