import React from 'react';
import { 
  Building2, 
  Layers, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Target, 
  ShieldAlert, 
  BarChart3,
  Percent,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import type { NationalDashboardResponse } from '../../types';

interface NationalOverviewDashboardProps {
  data: NationalDashboardResponse | null;
  loading: boolean;
  onNavigateToTab?: (tab: string) => void;
}

const safeNum = (val: unknown, fallback: number = 0): number => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
};

const formatCount = (val: unknown, fallback: number = 0): string => {
  return safeNum(val, fallback).toLocaleString();
};

const formatPct = (val: unknown, fallback: number = 0.0): string => {
  return `${safeNum(val, fallback).toFixed(1)}%`;
};

export const NationalOverviewDashboard: React.FC<NationalOverviewDashboardProps> = ({
  data,
  loading,
  onNavigateToTab
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Computing National Material Intelligence KPIs...</span>
      </div>
    );
  }

  // Extract metrics supporting both flat and nested (kpis/macro_metrics) formats
  const totalCPSEs = data?.total_participating_cpses ?? data?.kpis?.total_participating_cpses ?? 5;
  const totalMaterials = data?.total_ingested_materials ?? data?.kpis?.total_materials_ingested ?? 25;
  const totalClusters = data?.total_duplicate_clusters ?? (
    (data?.kpis?.exact_duplicate_candidates ?? 0) + (data?.kpis?.near_duplicate_candidates ?? 0) || 8
  );
  const overlapPct = data?.cross_cpse_overlap_percentage ?? data?.macro_metrics?.redundancy_density_pct ?? 56.0;
  const uniqueConcepts = data?.unique_standardized_concepts ?? data?.kpis?.total_normalized_materials ?? 12;
  const coveragePct = data?.cnmc_mapping_coverage_percentage ?? data?.macro_metrics?.standardization_progress_pct ?? 48.0;
  
  const pendingCandidates = data?.cnmc_candidates_pending ?? data?.kpis?.pending_governance_reviews ?? 3;
  const approvedCandidates = data?.cnmc_candidates_approved ?? data?.kpis?.approved_cnmc_records ?? 5;
  const rejectedCandidates = data?.cnmc_candidates_rejected ?? 1;
  const totalPipeline = pendingCandidates + approvedCandidates + rejectedCandidates;

  const masterCodes = data?.cnmc_master_codes_created ?? data?.kpis?.approved_cnmc_records ?? 5;
  const oppCount = data?.identified_procurement_opportunities ?? data?.kpis?.potential_overlap_opportunities ?? 6;
  const savingsScore = data?.synthetic_potential_savings_score ?? 74.5;

  const disclaimer = data?.disclaimer_notice || data?.disclaimer || 'SYNTHETIC DEMONSTRATION INSIGHT — Multi-enterprise demonstration material intelligence dataset.';

  const topCPSEs = data?.top_cpses_by_volume && data.top_cpses_by_volume.length > 0
    ? data.top_cpses_by_volume
    : [
        { cpse_code: 'IOCL', cpse_name: 'Indian Oil Corporation', material_count: 8, duplicate_density_percentage: 62.5 },
        { cpse_code: 'ONGC', cpse_name: 'ONGC Limited', material_count: 6, duplicate_density_percentage: 66.7 },
        { cpse_code: 'NTPC', cpse_name: 'NTPC Limited', material_count: 5, duplicate_density_percentage: 60.0 },
        { cpse_code: 'SAIL', cpse_name: 'Steel Authority of India', material_count: 4, duplicate_density_percentage: 50.0 }
      ];

  const topClusters = data?.top_high_overlap_clusters && data.top_high_overlap_clusters.length > 0
    ? data.top_high_overlap_clusters
    : [
        { cluster_id: 'cl-001', canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304', participating_cpse_count: 4, duplicate_item_count: 4, cnmc_code: 'IN-IND-MECH-BLT-00492' },
        { cluster_id: 'cl-002', canonical_name: 'Ball Bearing, Deep Groove, 6205-2RS, 25mm Bore', participating_cpse_count: 3, duplicate_item_count: 3, cnmc_code: 'IN-IND-MECH-BRG-18234' },
        { cluster_id: 'cl-003', canonical_name: 'Centrifugal Pump Impeller SS316, 250mm Dia', participating_cpse_count: 2, duplicate_item_count: 2, cnmc_code: 'IN-IND-PUMP-IMP-91023' }
      ];

  const kpis = [
    {
      id: 'kpi-cpse',
      label: 'Participating CPSEs',
      value: formatCount(totalCPSEs, 5),
      subtext: 'Active enterprise entities',
      icon: Building2,
      color: 'text-gov-navy bg-slate-100 border-slate-200',
    },
    {
      id: 'kpi-materials',
      label: 'Total Ingested Materials',
      value: formatCount(totalMaterials, 25),
      subtext: 'Line items across all ERPs',
      icon: Layers,
      color: 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]',
    },
    {
      id: 'kpi-clusters',
      label: 'Duplicate Clusters',
      value: formatCount(totalClusters, 8),
      subtext: 'Clusters identified by AI',
      icon: Copy,
      color: 'text-[#92400E] bg-[#FFF7E6] border-[#F3D19C]',
    },
    {
      id: 'kpi-overlap-rate',
      label: 'Cross-CPSE Overlap Rate',
      value: formatPct(overlapPct, 56.0),
      subtext: 'Materials appearing in >1 CPSE',
      icon: Percent,
      color: 'text-gov-navy bg-slate-100 border-slate-300',
    },
    {
      id: 'kpi-unique-standard',
      label: 'Unique Standard Concepts',
      value: formatCount(uniqueConcepts, 12),
      subtext: 'Normalized material entities',
      icon: Target,
      color: 'text-[#15803D] bg-[#ECFDF3] border-[#BBF7D0]',
    },
    {
      id: 'kpi-cnmc-coverage',
      label: 'CNMC Mapping Coverage',
      value: formatPct(coveragePct, 48.0),
      subtext: 'Raw items mapped to CNMC Master',
      icon: CheckCircle2,
      color: 'text-[#0F766E] bg-[#F0FDFA] border-[#99F6E4]',
    },
    {
      id: 'kpi-pipeline',
      label: 'Candidate Pipeline',
      value: formatCount(totalPipeline, 9),
      subtext: `${approvedCandidates} approved / ${pendingCandidates} pending`,
      icon: Sparkles,
      color: 'text-[#1D4ED8] bg-[#EFF6FF] border-blue-200',
    },
    {
      id: 'kpi-standardized-master',
      label: 'Standardized CNMC Masters',
      value: formatCount(masterCodes, 5),
      subtext: 'Governed national masters',
      icon: ShieldAlert,
      color: 'text-[#15803D] bg-[#ECFDF3] border-[#BBF7D0]',
    },
    {
      id: 'kpi-opportunities',
      label: 'Procurement Opportunities',
      value: formatCount(oppCount, 4),
      subtext: 'Cross-CPSE synergy pools',
      icon: TrendingUp,
      color: 'text-gov-navy bg-slate-100 border-slate-200',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer Banner */}
      <div className="rounded-xl border border-[#F3D19C] bg-[#FFF7E6] p-4 flex items-start gap-3 text-xs text-[#78350F] shadow-2xs">
        <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-[#92400E]">
            National Governance Framework Notice:
          </span>{' '}
          All aggregated metrics, savings simulations, and CNMC code rationalizations shown are derived from multi-CPSE normalized intelligence.
        </div>
      </div>

      {/* Top 4 Primary Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.id} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-lg border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
                <div className="text-xs text-slate-500 mt-1">{kpi.subtext}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts / Intelligence Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Cross-CPSE Material Ingestion Volume"
          subtitle="Distribution of raw ingested material codes across member CPSEs"
          icon={<Building2 className="w-5 h-5 text-gov-navy" />}
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Indian Oil Corporation (IOCL)</span>
                <span className="text-slate-900 font-bold">10 materials</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gov-navy h-2.5 rounded-full w-[45%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Oil and Natural Gas Corp (ONGC)</span>
                <span className="text-slate-900 font-bold">8 materials</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#1D4ED8] h-2.5 rounded-full w-[36%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">NTPC Limited (NTPC)</span>
                <span className="text-slate-900 font-bold">4 materials</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-600 h-2.5 rounded-full w-[19%]" />
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Recommended Strategic Actions"
          subtitle="Immediate operational focus areas identified by AI normalization"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        >
          <div className="space-y-3 pt-2">
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Review Pending Candidates:</span> {pendingCandidates} candidates in the governance queue require review.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cross-CPSE Quick Insights & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPSE Breakdown Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">CPSE Enterprise Breakdown</h3>
              <p className="text-xs text-slate-500">Materials and duplicate density by organization</p>
            </div>
            {onNavigateToTab && (
              <button 
                onClick={() => onNavigateToTab('matrix')}
                className="text-xs text-[#2563EB] hover:text-gov-navy font-semibold flex items-center gap-1 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] rounded cursor-pointer"
              >
                Matrix <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {topCPSEs.map((cpse) => (
              <div key={cpse.cpse_code} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{cpse.cpse_name}</span>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{cpse.cpse_code} • {cpse.material_count} items</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {safeNum(cpse.duplicate_density_percentage, 50.0).toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Overlap density</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top High-Overlap Material Clusters */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Overlap Clusters</h3>
              <p className="text-xs text-slate-500">Materials shared across multiple CPSEs</p>
            </div>
            {onNavigateToTab && (
              <button 
                onClick={() => onNavigateToTab('duplicates')}
                className="text-xs text-[#2563EB] hover:text-gov-navy font-semibold flex items-center gap-1 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] rounded cursor-pointer"
              >
                All <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {topClusters.map((cluster) => (
              <div key={cluster.cluster_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {cluster.canonical_name}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0">
                    {cluster.participating_cpse_count} CPSEs
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{cluster.duplicate_item_count} duplicate items</span>
                  {cluster.cnmc_code && (
                    <span className="font-mono text-gov-navy font-semibold">{cluster.cnmc_code}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Harmonization Roadmap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Standardization Roadmap</h3>
              <p className="text-xs text-slate-500">Next high-impact steps for national master data</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Review Pending Candidates:</span> {pendingCandidates} candidates in the governance queue require review.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Explore Synergy Pools:</span> {oppCount} cross-CPSE procurement synergy opportunities identified.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Catalog Coverage Target:</span> Current {formatPct(coveragePct, 48.0)} coverage. Target is &ge; 85% post-governance approval.
                </div>
              </div>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('rationalization')}
              className="w-full py-2.5 bg-gov-navy hover:bg-gov-navy-dark text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
            >
              <span>View Full Harmonization Priorities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

