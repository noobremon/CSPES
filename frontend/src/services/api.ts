import {
  ApiResponse,
  SystemStatus,
  CNMCCandidateItem,
  CNMCRecommendation,
  CPSEMappingItem,
  CNMCReviewSubmission,
  CNMCReviewResult,
  GovernanceReviewItem,
  NationalDashboardResponse,
  DuplicateAnalyticsResponse,
  CrossCPSEMatrixResponse,
  CNMCStandardizationAnalyticsResponse,
  ProcurementOpportunityResponse,
  RationalizationPriorityResponse,
  CategoryAnalyticsResponse,
  User,
  AuthResponse,
  LoginCredentials,
  CPSEOrganization,
  ColumnDiscoveryData,
  IngestionUploadData,
  IngestionJobStatusData
} from '../types';

function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!envUrl) {
    return 'http://localhost:8000/api/v1';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api/v1')) {
    return `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
}

const API_BASE_URL = getApiBaseUrl();

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...customHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// Authentication Client Functions
// ==========================================

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || errorData.detail || 'Login failed. Please check your credentials.';
    throw new Error(message);
  }

  const data: AuthResponse = await response.json();
  setAuthToken(data.access_token);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
    });
  } catch (e) {
    console.warn('Logout request failed or server unreachable:', e);
  } finally {
    setAuthToken(null);
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Session expired or unauthorized.');
  }

  return response.json();
}

// ==========================================
// System & Domain Endpoints
// ==========================================

export async function fetchHealth(): Promise<ApiResponse<SystemStatus>> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`API health check failed with status: ${response.status}`);
  }
  return response.json();
}

export async function fetchCNMCCandidates(statusFilter?: string, search?: string): Promise<CNMCCandidateItem[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== 'ALL') params.append('status_filter', statusFilter);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE_URL}/cnmc/candidates?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch CNMC candidates: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCandidateDetail(candidateId: string): Promise<CNMCCandidateItem> {
  const response = await fetch(`${API_BASE_URL}/cnmc/candidates/${candidateId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch candidate details: ${response.statusText}`);
  }
  return response.json();
}

export async function generateCNMCRecommendation(
  materialId: string,
  persistCandidate: boolean = true,
  demoReviewer: string = 'demo_reviewer@sih.gov.in'
): Promise<CNMCRecommendation> {
  const response = await fetch(`${API_BASE_URL}/cnmc/recommend`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'X-Demo-Reviewer': demoReviewer,
    }),
    body: JSON.stringify({
      material_id: materialId,
      persist_candidate: persistCandidate,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.error?.message || err.detail || `Failed to generate CNMC recommendation: ${response.status}`);
  }
  return response.json();
}

export async function submitCNMCReview(
  candidateId: string,
  submission: CNMCReviewSubmission,
  demoReviewer: string = 'demo_domain_reviewer@sih.gov.in'
): Promise<CNMCReviewResult> {
  const response = await fetch(`${API_BASE_URL}/cnmc/candidates/${candidateId}/review`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'X-Demo-Reviewer': demoReviewer,
    }),
    body: JSON.stringify(submission),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.error?.message || err.detail || `Failed to submit review decision: ${response.status}`);
  }
  return response.json();
}

export async function fetchCPSEMappings(orgId?: string, cnmcId?: string): Promise<CPSEMappingItem[]> {
  const params = new URLSearchParams();
  if (orgId) params.append('organization_id', orgId);
  if (cnmcId) params.append('cnmc_id', cnmcId);

  const response = await fetch(`${API_BASE_URL}/cnmc/mappings?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch cross-walk mappings: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchGovernanceReviews(entityId?: string): Promise<GovernanceReviewItem[]> {
  const params = new URLSearchParams();
  if (entityId) params.append('entity_id', entityId);

  const response = await fetch(`${API_BASE_URL}/governance/reviews?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch governance reviews: ${response.statusText}`);
  }
  return response.json();
}

// ==========================================
// Phase 9 National Analytics Client Functions
// ==========================================

export async function fetchNationalDashboard(): Promise<NationalDashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/analytics/dashboard/national`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch national dashboard KPIs: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDuplicateAnalytics(): Promise<DuplicateAnalyticsResponse> {
  const response = await fetch(`${API_BASE_URL}/analytics/duplicates`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch duplicate analytics: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCrossCPSEMatrix(minOverlap?: number): Promise<CrossCPSEMatrixResponse> {
  const params = new URLSearchParams();
  if (minOverlap !== undefined) params.append('min_overlap', String(minOverlap));

  const response = await fetch(`${API_BASE_URL}/analytics/matrix/cross-cpse?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch cross-CPSE overlap matrix: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCNMCStandardizationAnalytics(): Promise<CNMCStandardizationAnalyticsResponse> {
  const response = await fetch(`${API_BASE_URL}/analytics/standardization/cnmc`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch CNMC standardization analytics: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchProcurementOpportunities(type?: string, priority?: string): Promise<ProcurementOpportunityResponse> {
  const params = new URLSearchParams();
  if (type && type !== 'ALL') params.append('opportunity_type', type);
  if (priority && priority !== 'ALL') params.append('priority', priority);

  const response = await fetch(`${API_BASE_URL}/analytics/procurement/opportunities?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch procurement opportunities: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchRationalizationPriorities(priority?: string): Promise<RationalizationPriorityResponse> {
  const params = new URLSearchParams();
  if (priority && priority !== 'ALL') params.append('priority', priority);

  const response = await fetch(`${API_BASE_URL}/analytics/rationalization/priorities?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch rationalization priorities: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCategoryAnalytics(): Promise<CategoryAnalyticsResponse> {
  const response = await fetch(`${API_BASE_URL}/analytics/categories`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch category analytics: ${response.statusText}`);
  }
  return response.json();
}

// ==========================================
// Ingestion & Multi-CPSE Endpoints
// ==========================================

export async function fetchOrganizations(): Promise<CPSEOrganization[]> {
  const response = await fetch(`${API_BASE_URL}/ingestion/organizations`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch organizations: ${response.statusText}`);
  }
  return response.json();
}

export async function discoverFileColumns(file: File): Promise<ColumnDiscoveryData> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/ingestion/discover`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to inspect file columns. Please ensure a valid .csv or .xlsx file is provided.');
  }
  return response.json();
}

export async function uploadMaterialCatalog(
  organizationId: string,
  file: File,
  sourceSystemId?: string
): Promise<IngestionUploadData> {
  const formData = new FormData();
  formData.append('organization_id', organizationId);
  if (sourceSystemId) formData.append('source_system_id', sourceSystemId);
  formData.append('file', file);

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/ingestion/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload material catalog.');
  }
  return response.json();
}

export async function processIngestionJob(
  jobId: string,
  columnMapping?: Record<string, string>
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ingestion/process`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      job_id: jobId,
      column_mapping: columnMapping || {},
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to start ingestion processing.');
  }
  return response.json();
}

export async function fetchIngestionJobStatus(jobId: string): Promise<IngestionJobStatusData> {
  const response = await fetch(`${API_BASE_URL}/ingestion/${jobId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ingestion job status: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchIngestionJobErrors(jobId: string): Promise<{ job_id: string; total_errors: number; errors: any[] }> {
  const response = await fetch(`${API_BASE_URL}/ingestion/${jobId}/errors`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ingestion errors: ${response.statusText}`);
  }
  return response.json();
}

// Unified API Object for easy consumption
export const api = {
  login: loginUser,
  logout: logoutUser,
  fetchMe: fetchCurrentUser,
  fetchHealth,
  getNationalDashboard: fetchNationalDashboard,
  getDuplicateAnalytics: fetchDuplicateAnalytics,
  getCrossCPSEMatrix: fetchCrossCPSEMatrix,
  getCNMCStandardizationAnalytics: fetchCNMCStandardizationAnalytics,
  getProcurementOpportunities: fetchProcurementOpportunities,
  getRationalizationPriorities: fetchRationalizationPriorities,
  getCategoryAnalytics: fetchCategoryAnalytics,
  getCNMCCandidates: fetchCNMCCandidates,
  getCandidateDetail: fetchCandidateDetail,
  generateRecommendation: generateCNMCRecommendation,
  submitReview: submitCNMCReview,
  getCPSEMappings: fetchCPSEMappings,
  getGovernanceReviews: fetchGovernanceReviews,
  getOrganizations: fetchOrganizations,
  discoverColumns: discoverFileColumns,
  uploadCatalog: uploadMaterialCatalog,
  processJob: processIngestionJob,
  getJobStatus: fetchIngestionJobStatus,
  getJobErrors: fetchIngestionJobErrors,
};
