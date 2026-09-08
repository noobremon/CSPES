import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../src/app/App';

const mockUser = {
  id: 'usr-001',
  email: 'domain_reviewer@sih.demo',
  full_name: 'Ananya Sen (Domain Reviewer)',
  role: 'DOMAIN_REVIEWER',
  organization_id: null,
  organization_code: null,
  organization_name: null,
  status: 'ACTIVE',
  created_at: '2026-09-08T00:00:00Z',
};

// Mock global fetch
global.fetch = vi.fn((url: string) => {
  if (url.includes('/auth/login')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'mock_jwt_access_token_sih2026',
          refresh_token: 'mock_jwt_refresh_token_sih2026',
          token_type: 'Bearer',
          expires_in: 900,
          user: mockUser,
        }),
    });
  }
  if (url.includes('/auth/logout')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Successfully logged out.', success: true }),
    });
  }
  if (url.includes('/auth/me')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });
  }
  if (url.includes('/health')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'healthy',
          app_name: 'AI-Powered National Unified Material Master Framework',
          environment: 'development',
          version: '0.1.0',
          timestamp: '2026-09-08T00:00:00Z',
        }),
    });
  }
  if (url.includes('/cnmc/candidates')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'cand-001',
            proposed_cnmc: 'IN-IND-MECH-BLT-00492',
            candidate_group_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
            proposed_description: 'MVP Prototype Master Specification: Hexagon Head Bolt M16x50 SS304',
            confidence_score: 0.95,
            generation_source: 'ENGINE_V1_TAXONOMY_RULE_BASED',
            status: 'PENDING_REVIEW',
            created_at: '2026-09-08T10:30:00Z',
            updated_at: '2026-09-08T10:30:00Z',
            explanation_structured: {
              outcome: 'NEW_CNMC_CANDIDATE',
              recommendation_strength: 'HIGH',
              generation_method: 'TAXONOMY_RULE_BASED',
              format_version: 'MVP_CNMC_V1',
              recommendation_reason: 'Taxonomy and attribute analysis',
              taxonomy_signals: { sector: 'IND', category: 'MECH' },
              matching_signals: {},
              warnings: [],
              missing_information: [],
              governance_notice: 'SIH MVP demonstration governance workflow'
            }
          }
        ]),
    });
  }
  if (url.includes('/cnmc/mappings')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'map-001',
            raw_material_id: 'raw-001',
            normalized_material_id: 'norm-001',
            organization_id: 'org-001',
            organization_code: 'IOCL',
            organization_name: 'Indian Oil Corporation',
            local_material_code: 'MAT-1001',
            cnmc_id: 'cnmc-001',
            cnmc_code: 'IN-IND-MECH-BLT-00492',
            canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304',
            mapping_type: 'DIRECT_MATCH',
            confidence_score: 1.0,
            status: 'ACTIVE',
            approved_by: 'domain_reviewer',
            created_at: '2026-09-08T10:35:00Z',
            effective_from: '2026-09-08T10:35:00Z'
          }
        ]),
    });
  }
  if (url.includes('/analytics/dashboard/national')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          total_participating_cpses: 5,
          total_ingested_materials: 25,
          total_duplicate_clusters: 8,
          cross_cpse_overlap_count: 14,
          cross_cpse_overlap_percentage: 56.0,
          unique_standardized_concepts: 12,
          cnmc_mapping_coverage_percentage: 48.0,
          cnmc_candidates_pending: 3,
          cnmc_candidates_approved: 5,
          cnmc_candidates_rejected: 1,
          cnmc_master_codes_created: 5,
          identified_procurement_opportunities: 6,
          synthetic_potential_savings_score: 74.5,
          disclaimer_notice: 'SYNTHETIC DEMONSTRATION INSIGHT — Illustrative procurement opportunity generated from demonstration dataset. Does not represent verified Government savings.',
          top_overlapping_categories: [
            {
              category_name: 'Mechanical & Hardware Fasteners',
              overlap_count: 8,
              distinct_cpses_involved: 4,
              duplicate_cluster_count: 3
            }
          ],
          generated_at: '2026-09-08T12:00:00Z'
        }),
    });
  }
  if (url.includes('/analytics/duplicates')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          total_clusters: 8,
          exact_match_clusters: 3,
          near_match_clusters: 4,
          functional_clusters: 1,
          cpse_density_breakdown: [
            {
              cpse_id: 'cpse-1',
              cpse_name: 'Indian Oil Corporation',
              cpse_code: 'IOCL',
              total_materials: 5,
              duplicate_materials_count: 3,
              duplicate_density_percentage: 60.0
            }
          ],
          category_density_breakdown: [],
          duplicate_clusters: [
            {
              cluster_id: 'cl-001',
              canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304',
              category_code: 'MECH',
              cnmc_code: 'IN-IND-MECH-BLT-00492',
              cluster_type: 'EXACT_MATCH',
              total_materials: 3,
              distinct_cpse_count: 3,
              participating_cpses: ['IOCL', 'ONGC', 'NTPC'],
              average_similarity: 0.98
            }
          ]
        }),
    });
  }
  if (url.includes('/analytics/matrix/cross-cpse')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          total_cpses: 2,
          cpses: [
            { cpse_id: 'c1', cpse_name: 'IOCL', cpse_code: 'IOCL', total_materials: 5 },
            { cpse_id: 'c2', cpse_name: 'ONGC', cpse_code: 'ONGC', total_materials: 5 }
          ],
          matrix_cells: [[0, 3], [3, 0]],
          percentage_cells: [[0.0, 60.0], [60.0, 0.0]],
          pairwise_details: []
        }),
    });
  }
  if (url.includes('/analytics/standardization/cnmc')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          funnel: {
            stage_1_raw_materials: 25,
            stage_2_duplicate_matches: 14,
            stage_3_cnmc_candidates: 9,
            stage_4_approved_masters: 5,
            stage_5_active_mappings: 12
          },
          candidate_pipeline: {
            total_candidates: 9,
            pending_candidates: 3,
            approved_candidates: 5,
            rejected_candidates: 1
          },
          master_stats: {
            total_master_codes: 5,
            active_master_codes: 5,
            total_mapped_line_items: 12
          },
          mapping_coverage_percentage: 48.0
        }),
    });
  }
  if (url.includes('/analytics/procurement/opportunities')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          total_opportunities_identified: 6,
          high_priority_count: 3,
          potential_savings_summary: 'HIGH POTENTIAL (6 Synergy Opportunities)',
          disclaimer_notice: 'SYNTHETIC DEMONSTRATION INSIGHT — Illustrative procurement opportunity generated from demonstration dataset. Does not represent verified Government savings.',
          opportunities: [
            {
              opportunity_id: 'opp-001',
              material_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304',
              cnmc_code: 'IN-IND-MECH-BLT-00492',
              opportunity_type: 'CROSS_CPSE_COMMON_DEMAND',
              priority_level: 'HIGH',
              participating_cpse_count: 3,
              participating_cpses: ['IOCL', 'ONGC', 'NTPC'],
              opportunity_description: 'Standardized demand identified across 3 CPSEs',
              recommended_action: 'Initiate joint demand aggregation'
            }
          ]
        }),
    });
  }
  if (url.includes('/analytics/rationalization/priorities')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          total_scored_materials: 1,
          top_priority_count: 1,
          ranked_priorities: [
            {
              rank: 1,
              canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304',
              category_code: 'MECH',
              suggested_cnmc: 'IN-IND-MECH-BLT-00492',
              priority_score: 88.5,
              participating_cpse_count: 3,
              duplicate_count: 3,
              standardization_status: 'GOVERNED_MASTER',
              estimated_effort: 'LOW',
              rationalization_rationale: 'High multi-enterprise demand across 3 CPSEs'
            }
          ]
        }),
    });
  }
  if (url.includes('/analytics/categories')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          total_categories: 1,
          categories: [
            {
              category_code: 'MECH',
              category_name: 'Mechanical & Hardware Fasteners',
              total_materials: 10,
              standardized_master_count: 3,
              standardization_rate: 30.0,
              overlap_count: 6,
              overlap_percentage: 60.0,
              distinct_cpses_involved: 3
            }
          ]
        }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as unknown as typeof fetch;

describe('Phase 10 Authentication, RBAC & Multi-Tenant Access UI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login page with demo account selector when unauthenticated', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Portal Authentication/i)).toBeInTheDocument();
      expect(screen.getByText(/SIH Prototype Demo Personas/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Platform/i })).toBeInTheDocument();
    });
  });

  it('signs in successfully using demo persona and renders protected 5-tab portal', async () => {
    render(<App />);
    const reviewerBtn = await screen.findByText(/Domain Reviewer/i);
    fireEvent.click(reviewerBtn);

    const passwordInput = screen.getByPlaceholderText(/Enter demonstration password/i);
    fireEvent.change(passwordInput, { target: { value: 'Reviewer@SIH2026' } });

    const submitBtn = screen.getByRole('button', { name: /Sign In to Platform/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const headings = screen.getAllByText(/National Unified Material Master Framework/i);
      expect(headings.length).toBeGreaterThan(0);
      expect(screen.getByText(/CNMC Workspace/i)).toBeInTheDocument();
      expect(screen.getByText(/Governance Queue/i)).toBeInTheDocument();
      expect(screen.getByText(/CPSE ↔ CNMC Cross-Walk/i)).toBeInTheDocument();
      expect(screen.getByText(/National Analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/System Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Ananya Sen/i)).toBeInTheDocument();
    });
  });

  it('generates CNMC recommendation in workspace on user interaction', async () => {
    localStorage.setItem('auth_token', 'mock_jwt_access_token_sih2026');
    render(<App />);

    const generateBtn = await screen.findByRole('button', { name: /Generate CNMC Recommendation/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Recommended Prototype CNMC/i)).toBeInTheDocument();
      expect(screen.getAllByText(/IN-IND-MECH-BLT-00492/i).length).toBeGreaterThan(0);
    });
  });

  it('navigates to Governance Queue tab and displays candidate list', async () => {
    localStorage.setItem('auth_token', 'mock_jwt_access_token_sih2026');
    render(<App />);

    const queueTab = await screen.findByRole('button', { name: /Governance Queue/i });
    fireEvent.click(queueTab);

    await waitFor(() => {
      expect(screen.getByText(/Human Governance Review Queue/i)).toBeInTheDocument();
      expect(screen.getAllByText(/IN-IND-MECH-BLT-00492/i).length).toBeGreaterThan(0);
    });
  });

  it('navigates to CPSE Cross-Walk tab and displays legacy code preservation', async () => {
    localStorage.setItem('auth_token', 'mock_jwt_access_token_sih2026');
    render(<App />);

    const mapTab = await screen.findByRole('button', { name: /CPSE ↔ CNMC Cross-Walk/i });
    fireEvent.click(mapTab);

    await waitFor(() => {
      expect(screen.getByText(/Cross-Walk Traceability/i)).toBeInTheDocument();
      expect(screen.getAllByText(/MAT-1001/i).length).toBeGreaterThan(0);
    });
  });

  it('navigates to National Analytics tab and renders 10 KPIs and disclaimer', async () => {
    localStorage.setItem('auth_token', 'mock_jwt_access_token_sih2026');
    render(<App />);

    const analyticsTab = await screen.findByRole('button', { name: /National Analytics/i });
    fireEvent.click(analyticsTab);

    await waitFor(() => {
      expect(screen.getByText(/Participating CPSEs/i)).toBeInTheDocument();
      expect(screen.getByText(/Cross-CPSE Overlap Rate/i)).toBeInTheDocument();
      expect(screen.getByText(/Synthetic Savings Score/i)).toBeInTheDocument();
      expect(screen.getAllByText(/SYNTHETIC DEMONSTRATION INSIGHT/i).length).toBeGreaterThan(0);
    });
  });

  it('logs out authenticated user when clicking logout button', async () => {
    localStorage.setItem('auth_token', 'mock_jwt_access_token_sih2026');
    render(<App />);

    const logoutBtn = await screen.findByTitle('Sign Out of Portal');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByText(/Portal Authentication/i)).toBeInTheDocument();
    });
  });
});
