export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Array<Record<string, unknown>>;
  };
  timestamp?: string;
}

export interface SystemStatus {
  status: string;
  app_name: string;
  environment: string;
  version: string;
  timestamp: string;
}

export interface CNMCExplanation {
  outcome: string;
  recommendation_strength: 'HIGH' | 'MEDIUM' | 'LOW';
  generation_method: string;
  format_version: string;
  recommendation_reason: string;
  taxonomy_signals: Record<string, unknown>;
  matching_signals: Record<string, unknown>;
  existing_cluster_reference?: string | null;
  existing_cnmc_id?: string | null;
  warnings: string[];
  missing_information: string[];
  match_evidence_score?: number | null;
  governance_notice: string;
}

export interface CNMCRecommendation {
  material_id: string;
  outcome: string;
  proposed_cnmc: string;
  candidate_group_name: string;
  proposed_description: string;
  taxonomy_id?: string | null;
  recommendation_strength: 'HIGH' | 'MEDIUM' | 'LOW';
  strength_score: number;
  is_existing_candidate: boolean;
  candidate_id?: string | null;
  explanation: CNMCExplanation;
}

export interface CNMCCandidateItem {
  id: string;
  proposed_cnmc: string;
  candidate_group_name: string;
  proposed_description: string;
  taxonomy_id?: string | null;
  confidence_score: number;
  generation_source: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | string;
  created_at: string;
  updated_at: string;
  explanation_structured?: CNMCExplanation | Record<string, unknown> | null;
  source_materials?: Array<{
    material_id: string;
    organization_code: string;
    organization_name: string;
    canonical_description: string;
    uom: string;
    material_grade?: string;
    standard_code?: string;
  }>;
}

export interface CPSEMappingItem {
  id: string;
  raw_material_id: string;
  normalized_material_id: string;
  organization_id: string;
  organization_code?: string;
  organization_name?: string;
  local_material_code: string;
  cnmc_id: string;
  cnmc_code?: string;
  canonical_name?: string;
  mapping_type: string;
  confidence_score: number;
  status: string;
  approved_by: string;
  created_at: string;
  effective_from: string;
  effective_to?: string | null;
}

export interface GovernanceReviewItem {
  id: string;
  entity_type: string;
  entity_id: string;
  reviewer_reference: string;
  decision: 'APPROVED' | 'REJECTED' | 'MODIFIED' | string;
  comments?: string | null;
  previous_status?: string | null;
  new_status: string;
  created_at: string;
}

export interface CNMCReviewSubmission {
  action: 'APPROVE' | 'REJECT' | 'MODIFY';
  reviewer_reference?: string;
  comments?: string;
  modified_cnmc?: string;
  modified_group_name?: string;
  modified_description?: string;
  modified_taxonomy_id?: string;
  material_id_to_map?: string;
}

export interface CNMCReviewResult {
  candidate_id: string;
  decision: string;
  previous_status: string;
  new_status: string;
  reviewer_reference: string;
  comments?: string | null;
  master_id?: string | null;
  mapping_id?: string | null;
  governance_notice: string;
}

// ==========================================
// Phase 9 National Analytics Type Definitions
// ==========================================

export interface DashboardKPIs {
  total_materials_ingested: number;
  total_normalized_materials: number;
  total_participating_cpses: number;
  exact_duplicate_candidates: number;
  near_duplicate_candidates: number;
  functional_equivalent_candidates: number;
  total_match_candidates: number;
  approved_cnmc_records: number;
  pending_governance_reviews: number;
  cpse_legacy_codes_mapped: number;
  material_categories_covered: number;
  potential_overlap_opportunities: number;
}

export interface DashboardMacroMetrics {
  standardization_progress_pct: number;
  redundancy_density_pct: number;
  cnmc_format_version: string;
  governance_model: string;
  auto_approval_enabled: boolean;
}

export interface NationalDashboardSummary {
  kpis: DashboardKPIs;
  macro_metrics: DashboardMacroMetrics;
  disclaimer: string;
}

export interface DuplicateClassifications {
  exact_duplicates: number;
  near_duplicates: number;
  functional_equivalences: number;
  total_duplicates: number;
}

export interface DuplicateSummary {
  duplicate_classifications: DuplicateClassifications;
  density_by_cpse: Array<{
    organization_code: string;
    organization_name: string;
    match_candidate_count: number;
  }>;
  density_by_category: Array<{
    category_code: string;
    category_name: string;
    match_candidate_count: number;
  }>;
}

export interface DuplicateClusterItem {
  cluster_id: string;
  match_id: string;
  match_type: string;
  composite_confidence: number;
  lexical_score: number;
  attribute_score: number;
  methodology: string;
  recommendation_status: string;
  participating_cpse_count: number;
  participating_cpses: string[];
  material_count: number;
  canonical_description: string;
  specification_diff?: Record<string, unknown> | null;
  linked_cnmc_candidate?: string | null;
  linked_cnmc_status: string;
  members: Array<{
    material_id: string;
    organization_code: string;
    organization_name: string;
    local_material_code: string;
    canonical_description: string;
    material_grade?: string;
    standard_code?: string;
  }>;
}

export interface CrossCPSEPairDetail {
  cpse_a: string;
  cpse_b: string;
  total_overlapping_materials: number;
  exact_matches: number;
  near_duplicates: number;
  functional_equivalences: number;
  avg_confidence: number;
}

export interface CrossCPSEOverlapMatrix {
  status: string;
  message?: string | null;
  organizations: string[];
  matrix: Record<string, Record<string, number>>;
  pair_details: CrossCPSEPairDetail[];
  total_cross_cpse_clusters?: number;
}

export interface CNMCCandidatePipeline {
  total_candidates: number;
  pending_review: number;
  approved: number;
  rejected: number;
  modified_by_reviewer: number;
  reuse_recommendations: number;
  new_recommendations: number;
}

export interface CNMCMasterAndMappings {
  active_master_cnmcs: number;
  active_crosswalk_mappings: number;
  legacy_codes_preserved: number;
  format_version: string;
}

export interface CNMCFunnelStage {
  stage: string;
  count: number;
  description: string;
}

export interface CNMCSummaryData {
  candidate_pipeline: CNMCCandidatePipeline;
  master_and_mappings: CNMCMasterAndMappings;
  conversion_funnel: CNMCFunnelStage[];
}

export interface ProcurementOpportunityItem {
  opportunity_id: string;
  opportunity_type: string;
  title: string;
  material_cluster_title: string;
  participating_cpse_count: number;
  participating_cpses: string[];
  material_count: number;
  match_classification: string;
  confidence_score: number;
  priority_level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  supporting_evidence: string;
  recommendation: string;
  disclaimer: string;
}

export interface RationalizationPriorityItem {
  cluster_id: string;
  material_title: string;
  priority_score: number;
  priority_level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  score_components: {
    cpse_coverage_points: number;
    cluster_size_points: number;
    evidence_strength_points: number;
    unstandardized_status_points: number;
  };
  participating_cpse_count: number;
  participating_cpses: string[];
  material_count: number;
  match_evidence_score: number;
  governance_status: string;
  has_approved_cnmc: boolean;
  explanation_rationale: string;
  recommended_action: string;
  scoring_methodology: string;
}

export interface CategoryAnalyticsItem {
  category_id: string;
  category_code: string;
  category_name: string;
  taxonomy_path: string;
  level: number;
  total_materials: number;
  duplicate_candidates: number;
  approved_cnmc_mappings: number;
  pending_reviews: number;
  rationalization_priority: string;
}

// ==========================================
// Phase 10 Authentication & RBAC Types
// ==========================================

export type UserRole =
  | 'NATIONAL_MASTER_ADMIN'
  | 'CPSE_MATERIAL_MANAGER'
  | 'DOMAIN_REVIEWER'
  | 'AUDITOR';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id?: string | null;
  organization_code?: string | null;
  organization_name?: string | null;
  status: UserStatus;
  last_login_at?: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Legacy analytics aliases used by current UI components
export type NationalDashboardResponse = any;
export type DuplicateAnalyticsResponse = any;
export type DuplicateClusterSummary = any;
export type CrossCPSEMatrixResponse = any;
export type PairwiseOverlapDetail = any;
export type CNMCStandardizationAnalyticsResponse = any;
export type ProcurementOpportunityResponse = any;
export type RationalizationPriorityResponse = any;
export type RationalizationItem = any;
export type CategoryAnalyticsResponse = any;

// ==========================================
// Ingestion & Multi-CPSE Types
// ==========================================

export interface CPSEOrganization {
  id: string;
  code: string;
  name: string;
  short_name?: string;
  sector: string;
  organization_type: string;
  onboarding_status: string;
  demo_status: string;
  data_source_type: string;
  status: string;
}

export interface ColumnDiscoveryData {
  filename: string;
  file_type: 'CSV' | 'EXCEL';
  detected_columns: string[];
  estimated_row_count: number;
  sample_rows: Array<Record<string, unknown>>;
  suggested_mapping: Record<string, string>;
}

export interface IngestionUploadData {
  job_id: string;
  organization_id: string;
  filename: string;
  file_type: string;
  file_hash_sha256: string;
  status: string;
  message: string;
}

export interface IngestionJobStatusData {
  job_id: string;
  organization_id: string;
  source_system_id?: string | null;
  original_filename: string;
  file_type: string;
  status: 'PENDING' | 'VALIDATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL_SUCCESS' | string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  column_mapping?: Record<string, string>;
  error_summary?: Array<Record<string, unknown>>;
  created_at: string;
  updated_at: string;
}

