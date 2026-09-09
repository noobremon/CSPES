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
  ArrowRight
} from 'lucide-react';
import type { NationalDashboardResponse } from '../../types';

interface NationalOverviewDashboardProps {
  data: NationalDashboardResponse | null;
  loading: boolean;
  onNavigateToTab?: (tab: string) => void;
}

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

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No national intelligence analytics data available.</p>
      </div>
    );
  }

  const kpis = [
    {
      id: 'kpi-cpse',
      label: 'Participating CPSEs',
      value: data.total_participating_cpses.toLocaleString(),
      subtext: 'Active enterprise entities',
      icon: Building2,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      id: 'kpi-materials',
      label: 'Total Ingested Materials',
      value: data.total_ingested_materials.toLocaleString(),
      subtext: 'Line items across all ERPs',
      icon: Layers,
      color: 'text-slate-700 bg-slate-50 border-slate-200',
    },
    {
      id: 'kpi-clusters',
      label: 'Duplicate Clusters',
      value: data.total_duplicate_clusters.toLocaleString(),
      subtext: 'Clusters identified by AI',
      icon: Copy,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      id: 'kpi-overlap-rate',
      label: 'Cross-CPSE Overlap Rate',
      value: `${data.cross_cpse_overlap_percentage.toFixed(1)}%`,
      subtext: 'Materials appearing in >1 CPSE',
      icon: Percent,
      color: 'text-gov-navy bg-slate-100 border-slate-300',
    },
    {
      id: 'kpi-unique-standard',
      label: 'Unique Standard Concepts',
      value: data.unique_standardized_concepts.toLocaleString(),
      subtext: 'Normalized material entities',
      icon: Target,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'kpi-cnmc-coverage',
      label: 'CNMC Mapping Coverage',
      value: `${data.cnmc_mapping_coverage_percentage.toFixed(1)}%`,
      subtext: 'Raw items mapped to CNMC Master',
      icon: CheckCircle2,
      color: 'text-teal-800 bg-teal-50 border-teal-200',
    },
    {
      id: 'kpi-pipeline',
      label: 'Candidate Pipeline',
      value: (data.cnmc_candidates_pending + data.cnmc_candidates_approved + data.cnmc_candidates_rejected).toLocaleString(),
      subtext: `${data.cnmc_candidates_approved} approved / ${data.cnmc_candidates_pending} pending`,
      icon: Sparkles,
      color: 'text-purple-800 bg-purple-50 border-purple-200',
    },
    {
      id: 'kpi-standardized-master',
      label: 'Standardized CNMC Masters',
      value: data.cnmc_master_codes_created.toLocaleString(),
      subtext: 'Governed prototype masters',
      icon: ShieldAlert,
      color: 'text-emerald-900 bg-emerald-50 border-emerald-300',
    },
    {
      id: 'kpi-opportunities',
      label: 'Procurement Opportunities',
      value: data.identified_procurement_opportunities.toLocaleString(),
      subtext: 'High & medium impact synergy clusters',
      icon: TrendingUp,
      color: 'text-amber-900 bg-amber-50 border-amber-300',
    },
    {
      id: 'kpi-savings-score',
      label: 'Synthetic Savings Score',
      value: `${data.synthetic_potential_savings_score.toFixed(1)}/100`,
      subtext: 'Illustrative synergy potential',
      icon: BarChart3,
      color: 'text-cyan-900 bg-cyan-50 border-cyan-200',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Synthetic Demonstration Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-gov-notice-border bg-gov-notice-bg text-slate-800 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold uppercase tracking-wider text-slate-900">
            {data.disclaimer_notice}
          </p>
          <p className="text-slate-700 leading-relaxed">
            All overlap counts, standardization funnels, and procurement opportunity scores shown below are derived from demonstration multi-CPSE datasets.
            This intelligence system operates with strict Layer 1 commercial isolation (no commercial PO pricing, contract terms, or vendor identities are ingested).
          </p>
        </div>
      </div>

      {/* Top 10 KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
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
                className="text-xs text-blue-600 hover:text-gov-navy font-semibold flex items-center gap-1"
              >
                Matrix <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(data.top_cpses_by_volume || []).map((cpse) => (
              <div key={cpse.cpse_code} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{cpse.cpse_name}</span>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{cpse.cpse_code} • {cpse.material_count} items</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {cpse.duplicate_density_percentage.toFixed(1)}%
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
                className="text-xs text-blue-600 hover:text-gov-navy font-semibold flex items-center gap-1"
              >
                All <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(data.top_high_overlap_clusters || []).map((cluster) => (
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
                  <span className="font-bold text-slate-900">Review Pending Candidates:</span> {data.cnmc_candidates_pending} prototype candidates in the governance queue require review.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Explore Synergy Pools:</span> {data.identified_procurement_opportunities} cross-CPSE procurement synergy opportunities identified.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Catalog Coverage Target:</span> Current {data.cnmc_mapping_coverage_percentage.toFixed(1)}% coverage. Target is &ge; 85% post-governance approval.
                </div>
              </div>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('rationalization')}
              className="w-full py-2 bg-gov-navy hover:bg-gov-navy-dark text-white rounded-lg font-semibold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5"
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
