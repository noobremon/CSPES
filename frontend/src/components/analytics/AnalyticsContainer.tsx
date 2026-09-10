import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Copy, 
  Grid3X3, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  PieChart, 
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import type { 
  NationalDashboardResponse, 
  DuplicateAnalyticsResponse, 
  CrossCPSEMatrixResponse, 
  CNMCStandardizationAnalyticsResponse, 
  ProcurementOpportunityResponse, 
  RationalizationPriorityResponse, 
  CategoryAnalyticsResponse 
} from '../../types';

import { NationalOverviewDashboard } from './NationalOverviewDashboard';
import { DuplicateIntelligenceView } from './DuplicateIntelligenceView';
import { CrossCPSEOverlapMatrix } from './CrossCPSEOverlapMatrix';
import { CNMCStandardizationView } from './CNMCStandardizationView';
import { ProcurementOpportunitiesView } from './ProcurementOpportunitiesView';
import { RationalizationPriorityView } from './RationalizationPriorityView';
import { CategoryAnalyticsView } from './CategoryAnalyticsView';

// ==========================================
// Rich Multi-CPSE Fallback Demonstration Data
// ==========================================

const DEFAULT_NATIONAL_DATA: NationalDashboardResponse = {
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
  disclaimer_notice: 'SYNTHETIC DEMONSTRATION INSIGHT — Illustrative procurement opportunity generated from multi-CPSE dataset. Does not represent verified Government savings.',
  top_cpses_by_volume: [
    { cpse_code: 'IOCL', cpse_name: 'Indian Oil Corporation', material_count: 8, duplicate_density_percentage: 62.5 },
    { cpse_code: 'ONGC', cpse_name: 'ONGC Limited', material_count: 6, duplicate_density_percentage: 66.7 },
    { cpse_code: 'NTPC', cpse_name: 'NTPC Limited', material_count: 5, duplicate_density_percentage: 60.0 },
    { cpse_code: 'SAIL', cpse_name: 'Steel Authority of India', material_count: 4, duplicate_density_percentage: 50.0 },
    { cpse_code: 'CIL', cpse_name: 'Coal India Limited', material_count: 2, duplicate_density_percentage: 50.0 }
  ],
  top_high_overlap_clusters: [
    { cluster_id: 'cl-001', canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304', participating_cpse_count: 4, duplicate_item_count: 4, cnmc_code: 'IN-IND-MECH-BLT-00492' },
    { cluster_id: 'cl-002', canonical_name: 'Ball Bearing, Deep Groove, 6205-2RS, 25mm Bore', participating_cpse_count: 3, duplicate_item_count: 3, cnmc_code: 'IN-IND-MECH-BRG-18234' },
    { cluster_id: 'cl-003', canonical_name: 'Centrifugal Pump Impeller SS316, 250mm Dia', participating_cpse_count: 2, duplicate_item_count: 2, cnmc_code: 'IN-IND-PUMP-IMP-91023' }
  ],
  generated_at: '2026-09-08T12:00:00Z'
};

const DEFAULT_DUPLICATE_DATA: DuplicateAnalyticsResponse = {
  total_clusters: 8,
  exact_match_clusters: 3,
  near_match_clusters: 4,
  functional_clusters: 1,
  cpse_density_breakdown: [
    { cpse_id: 'cpse-1', cpse_name: 'Indian Oil Corporation', cpse_code: 'IOCL', total_materials: 8, duplicate_materials_count: 5, duplicate_density_percentage: 62.5 },
    { cpse_id: 'cpse-2', cpse_name: 'ONGC Limited', cpse_code: 'ONGC', total_materials: 6, duplicate_materials_count: 4, duplicate_density_percentage: 66.7 },
    { cpse_id: 'cpse-3', cpse_name: 'NTPC Limited', cpse_code: 'NTPC', total_materials: 5, duplicate_materials_count: 3, duplicate_density_percentage: 60.0 },
    { cpse_id: 'cpse-4', cpse_name: 'Steel Authority of India', cpse_code: 'SAIL', total_materials: 4, duplicate_materials_count: 2, duplicate_density_percentage: 50.0 }
  ],
  category_density_breakdown: [],
  duplicate_clusters: [
    {
      cluster_id: 'cl-001',
      canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
      category_code: 'MECH',
      cnmc_code: 'IN-IND-MECH-BLT-00492',
      match_type: 'EXACT_CODE',
      participating_cpse_count: 3,
      participating_cpses: ['IOCL', 'ONGC', 'NTPC'],
      item_count: 3,
      items: [
        { cpse_code: 'IOCL', local_material_code: 'MAT-1001', description: 'HEX BOLT SS304 M16 X 50 MM' },
        { cpse_code: 'ONGC', local_material_code: 'BOLT-778', description: 'BOLT HEX HEAD M16X50 SS-304' },
        { cpse_code: 'NTPC', local_material_code: 'NTPC-BLT-99', description: 'FASTENER BOLT HEX M16*50 SS304' }
      ]
    },
    {
      cluster_id: 'cl-002',
      canonical_name: 'Deep Groove Radial Ball Bearing, 6205-2RS (ISO 15)',
      category_code: 'MECH',
      cnmc_code: 'IN-IND-MECH-BRG-18234',
      match_type: 'NEAR_MATCH_AI',
      participating_cpse_count: 3,
      participating_cpses: ['IOCL', 'SAIL', 'ONGC'],
      item_count: 3,
      items: [
        { cpse_code: 'IOCL', local_material_code: 'BRG-6205', description: 'BALL BEARING 6205 2RS DGRB' },
        { cpse_code: 'SAIL', local_material_code: 'SAIL-B-6205', description: 'RADIAL BALL BEARING 6205-2RS 25MM' },
        { cpse_code: 'ONGC', local_material_code: 'ONGC-BRG-205', description: 'BEARING DEEP GROOVE 6205 2RS' }
      ]
    },
    {
      cluster_id: 'cl-003',
      canonical_name: 'Centrifugal Pump Impeller SS316, 250mm Diameter',
      category_code: 'PUMP',
      cnmc_code: 'IN-IND-PUMP-IMP-91023',
      match_type: 'FUNCTIONAL_EQUIVALENCE',
      participating_cpse_count: 2,
      participating_cpses: ['IOCL', 'NTPC'],
      item_count: 2,
      items: [
        { cpse_code: 'IOCL', local_material_code: 'IMP-250-SS', description: 'PUMP IMPELLER SS316 D250MM' },
        { cpse_code: 'NTPC', local_material_code: 'NTPC-PMP-IMP', description: 'IMPELLER CENTRIFUGAL 250MM SS316' }
      ]
    }
  ]
};

const DEFAULT_MATRIX_DATA: CrossCPSEMatrixResponse = {
  total_cpses: 5,
  cpses: [
    { cpse_id: 'c1', cpse_name: 'Indian Oil Corporation', cpse_code: 'IOCL', total_materials: 8 },
    { cpse_id: 'c2', cpse_name: 'ONGC Limited', cpse_code: 'ONGC', total_materials: 6 },
    { cpse_id: 'c3', cpse_name: 'NTPC Limited', cpse_code: 'NTPC', total_materials: 5 },
    { cpse_id: 'c4', cpse_name: 'Steel Authority of India', cpse_code: 'SAIL', total_materials: 4 },
    { cpse_id: 'c5', cpse_name: 'Coal India Limited', cpse_code: 'CIL', total_materials: 2 }
  ],
  matrix_cells: [
    [8, 4, 3, 2, 1],
    [4, 6, 3, 2, 1],
    [3, 3, 5, 2, 1],
    [2, 2, 2, 4, 1],
    [1, 1, 1, 1, 2]
  ],
  percentage_cells: [
    [100.0, 50.0, 37.5, 25.0, 12.5],
    [66.7, 100.0, 50.0, 33.3, 16.7],
    [60.0, 60.0, 100.0, 40.0, 20.0],
    [50.0, 50.0, 50.0, 100.0, 25.0],
    [50.0, 50.0, 50.0, 50.0, 100.0]
  ],
  pairwise_details: [
    {
      cpse_1_code: 'IOCL',
      cpse_2_code: 'ONGC',
      count: 4,
      pct: 50.0,
      top_overlapping_materials: [
        { canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304', suggested_cnmc: 'IN-IND-MECH-BLT-00492' },
        { canonical_name: 'Deep Groove Radial Ball Bearing, 6205-2RS', suggested_cnmc: 'IN-IND-MECH-BRG-18234' },
        { canonical_name: 'Gate Valve Cast Steel Class 150 4-Inch', suggested_cnmc: 'IN-IND-VALV-GTE-30129' }
      ]
    }
  ]
};

const DEFAULT_CNMC_DATA: CNMCStandardizationAnalyticsResponse = {
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
    total_masters_created: 5,
    top_masters: [
      { cnmc_code: 'IN-IND-MECH-BLT-00492', canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)', mapped_raw_materials_count: 4 },
      { cnmc_code: 'IN-IND-MECH-BRG-18234', canonical_name: 'Deep Groove Radial Ball Bearing 6205-2RS (ISO 15)', mapped_raw_materials_count: 3 },
      { cnmc_code: 'IN-IND-PUMP-IMP-91023', canonical_name: 'Centrifugal Pump Impeller SS316, 250mm Dia', mapped_raw_materials_count: 2 },
      { cnmc_code: 'IN-IND-VALV-GTE-30129', canonical_name: 'Gate Valve Cast Steel Class 150 4-Inch Flanged', mapped_raw_materials_count: 2 },
      { cnmc_code: 'IN-IND-ELEC-MOT-44820', canonical_name: '3-Phase Induction Motor 15kW 4-Pole 415V IE3', mapped_raw_materials_count: 1 }
    ]
  },
  mapping_coverage_percentage: 48.0
};

const DEFAULT_OPPORTUNITY_DATA: ProcurementOpportunityResponse = {
  total_opportunities_identified: 6,
  high_priority_count: 3,
  potential_savings_summary: 'HIGH POTENTIAL (6 Synergy Opportunities Across 5 CPSEs)',
  disclaimer_notice: 'SYNTHETIC DEMONSTRATION INSIGHT — Illustrative procurement opportunity generated from demonstration dataset. Does not represent verified Government savings.',
  opportunities: [
    {
      opportunity_id: 'opp-001',
      title: 'Joint Demand Aggregation: SS304 Fastener Specifications',
      description: 'Identified 4 overlapping fastener line items across IOCL, ONGC, and NTPC with identical grade SS304 and IS 1363 standard specs.',
      opportunity_type: 'CROSS_CPSE_COMMON_DEMAND',
      priority_level: 'HIGH',
      participating_cpse_count: 3,
      participating_cpses: ['IOCL', 'ONGC', 'NTPC'],
      item_count: 4,
      recommended_next_step: 'Standardize tender specifications and initiate joint GeM category pooling.'
    },
    {
      opportunity_id: 'opp-002',
      title: 'Deep Groove Radial Bearings Standard Consolidation (6205-2RS)',
      description: '3 CPSEs (IOCL, SAIL, ONGC) procure functionally identical 6205-2RS bearings under distinct internal naming conventions.',
      opportunity_type: 'STANDARDIZATION_CANDIDATE',
      priority_level: 'HIGH',
      participating_cpse_count: 3,
      participating_cpses: ['IOCL', 'SAIL', 'ONGC'],
      item_count: 3,
      recommended_next_step: 'Formally approve CNMC IN-IND-MECH-BRG-18234 and align ERP catalog line items.'
    },
    {
      opportunity_id: 'opp-003',
      title: 'Pump Spare Parts Rationalization (Centrifugal Impellers SS316)',
      description: 'Identified equivalent impeller replacements between IOCL refining units and NTPC thermal cooling loops.',
      opportunity_type: 'BULK_RATE_CONTRACT_ELIGIBLE',
      priority_level: 'MEDIUM',
      participating_cpse_count: 2,
      participating_cpses: ['IOCL', 'NTPC'],
      item_count: 2,
      recommended_next_step: 'Explore mutual emergency spare-part pooling arrangement between regional plant hubs.'
    }
  ]
};

const DEFAULT_PRIORITY_DATA: RationalizationPriorityResponse = {
  total_scored_materials: 5,
  ranked_priorities: [
    {
      rank: 1,
      canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
      category_code: 'MECH',
      suggested_cnmc: 'IN-IND-MECH-BLT-00492',
      priority_score: 88.5,
      participating_cpse_count: 3,
      participating_cpses: ['IOCL', 'ONGC', 'NTPC'],
      duplicate_count: 4,
      rationalization_reason: 'High multi-enterprise demand across 3 CPSEs with active duplicate cluster and high standardization readiness.'
    },
    {
      rank: 2,
      canonical_name: 'Deep Groove Radial Ball Bearing, 6205-2RS (ISO 15)',
      category_code: 'MECH',
      suggested_cnmc: 'IN-IND-MECH-BRG-18234',
      priority_score: 79.2,
      participating_cpse_count: 3,
      participating_cpses: ['IOCL', 'SAIL', 'ONGC'],
      duplicate_count: 3,
      rationalization_reason: 'Moderate multi-CPSE demand breadth with high semantic similarity and direct ISO standard correlation.'
    },
    {
      rank: 3,
      canonical_name: 'Centrifugal Pump Impeller SS316, 250mm Diameter',
      category_code: 'PUMP',
      suggested_cnmc: 'IN-IND-PUMP-IMP-91023',
      priority_score: 64.0,
      participating_cpse_count: 2,
      participating_cpses: ['IOCL', 'NTPC'],
      duplicate_count: 2,
      rationalization_reason: 'Cross-sector plant equipment overlap with potential emergency inventory interchangeability.'
    },
    {
      rank: 4,
      canonical_name: 'Cast Steel Gate Valve Class 150 4-Inch Flanged',
      category_code: 'VALV',
      suggested_cnmc: 'IN-IND-VALV-GTE-30129',
      priority_score: 55.4,
      participating_cpse_count: 2,
      participating_cpses: ['IOCL', 'ONGC'],
      duplicate_count: 2,
      rationalization_reason: 'High single-item unit value with shared pressure class specifications across hydrocarbon units.'
    },
    {
      rank: 5,
      canonical_name: '3-Phase Induction Motor 15kW 4-Pole 415V IE3',
      category_code: 'ELEC',
      suggested_cnmc: 'IN-IND-ELEC-MOT-44820',
      priority_score: 46.8,
      participating_cpse_count: 1,
      participating_cpses: ['NTPC'],
      duplicate_count: 1,
      rationalization_reason: 'Critical high-efficiency industrial driver ready for prospective cross-CPSE master codification.'
    }
  ]
};

const DEFAULT_CATEGORY_DATA: CategoryAnalyticsResponse = {
  total_categories: 4,
  categories: [
    {
      category_code: 'MECH',
      category_name: 'Mechanical & Hardware Fasteners',
      overlap_percentage: 65.0,
      distinct_cpses_involved: 4,
      total_materials: 12,
      standardized_master_count: 2,
      standardization_rate: 66.7
    },
    {
      category_code: 'PUMP',
      category_name: 'Pumps & Rotating Equipment Spares',
      overlap_percentage: 50.0,
      distinct_cpses_involved: 2,
      total_materials: 5,
      standardized_master_count: 1,
      standardization_rate: 40.0
    },
    {
      category_code: 'VALV',
      category_name: 'Piping, Flanges & Industrial Valves',
      overlap_percentage: 45.0,
      distinct_cpses_involved: 2,
      total_materials: 4,
      standardized_master_count: 1,
      standardization_rate: 50.0
    },
    {
      category_code: 'ELEC',
      category_name: 'Electrical Distribution & Motors',
      overlap_percentage: 25.0,
      distinct_cpses_involved: 1,
      total_materials: 4,
      standardized_master_count: 1,
      standardization_rate: 25.0
    }
  ]
};

export const AnalyticsContainer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Analytics states with resilient fallback demonstration defaults
  const [nationalData, setNationalData] = useState<NationalDashboardResponse>(DEFAULT_NATIONAL_DATA);
  const [duplicateData, setDuplicateData] = useState<DuplicateAnalyticsResponse>(DEFAULT_DUPLICATE_DATA);
  const [matrixData, setMatrixData] = useState<CrossCPSEMatrixResponse>(DEFAULT_MATRIX_DATA);
  const [cnmcData, setCnmcData] = useState<CNMCStandardizationAnalyticsResponse>(DEFAULT_CNMC_DATA);
  const [opportunityData, setOpportunityData] = useState<ProcurementOpportunityResponse>(DEFAULT_OPPORTUNITY_DATA);
  const [priorityData, setPriorityData] = useState<RationalizationPriorityResponse>(DEFAULT_PRIORITY_DATA);
  const [categoryData, setCategoryData] = useState<CategoryAnalyticsResponse>(DEFAULT_CATEGORY_DATA);

  const fetchAllAnalytics = async () => {
    try {
      setRefreshing(true);
      const results = await Promise.allSettled([
        api.getNationalDashboard(),
        api.getDuplicateAnalytics(),
        api.getCrossCPSEMatrix(),
        api.getCNMCStandardizationAnalytics(),
        api.getProcurementOpportunities(),
        api.getRationalizationPriorities(),
        api.getCategoryAnalytics()
      ]);

      if (results[0].status === 'fulfilled' && results[0].value) {
        setNationalData(results[0].value);
      }
      if (results[1].status === 'fulfilled' && results[1].value) {
        setDuplicateData(results[1].value);
      }
      if (results[2].status === 'fulfilled' && results[2].value) {
        setMatrixData(results[2].value);
      }
      if (results[3].status === 'fulfilled' && results[3].value) {
        setCnmcData(results[3].value);
      }
      if (results[4].status === 'fulfilled' && results[4].value) {
        setOpportunityData(results[4].value);
      }
      if (results[5].status === 'fulfilled' && results[5].value) {
        setPriorityData(results[5].value);
      }
      if (results[6].status === 'fulfilled' && results[6].value) {
        setCategoryData(results[6].value);
      }
    } catch (err) {
      console.warn('Backend analytics service returned notice; maintaining active demonstration state:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const subTabs = [
    { id: 'overview', label: 'National Overview', icon: BarChart3 },
    { id: 'duplicates', label: 'Duplicate Intelligence', icon: Copy },
    { id: 'matrix', label: 'Cross-CPSE Matrix', icon: Grid3X3 },
    { id: 'standardization', label: 'CNMC Standardization', icon: ShieldCheck },
    { id: 'opportunities', label: 'Procurement Opportunities', icon: TrendingUp },
    { id: 'rationalization', label: 'Rationalization Priorities', icon: Target },
    { id: 'categories', label: 'Taxonomy Breakdown', icon: PieChart },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer ${
                  isActive
                    ? 'bg-gov-navy text-white shadow-2xs'
                    : 'text-[#475569] hover:text-gov-navy hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchAllAnalytics}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] rounded-lg hover:text-gov-navy hover:bg-[#F8FAFC] hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] shadow-2xs shrink-0 self-end sm:self-auto disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>


      {/* View Routing */}
      {activeSubTab === 'overview' && (
        <NationalOverviewDashboard 
          data={nationalData} 
          loading={loading} 
          onNavigateToTab={(tab) => setActiveSubTab(tab)} 
        />
      )}
      {activeSubTab === 'duplicates' && (
        <DuplicateIntelligenceView 
          data={duplicateData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'matrix' && (
        <CrossCPSEOverlapMatrix 
          data={matrixData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'standardization' && (
        <CNMCStandardizationView 
          data={cnmcData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'opportunities' && (
        <ProcurementOpportunitiesView 
          data={opportunityData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'rationalization' && (
        <RationalizationPriorityView 
          data={priorityData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'categories' && (
        <CategoryAnalyticsView 
          data={categoryData} 
          loading={loading} 
        />
      )}
    </div>
  );
};
