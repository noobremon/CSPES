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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-500 font-medium">Computing National Material Intelligence KPIs...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">No national intelligence analytics data available.</p>
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
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      id: 'kpi-materials',
      label: 'Total Ingested Materials',
      value: data.total_ingested_materials.toLocaleString(),
      subtext: 'Line items across all ERPs',
      icon: Layers,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
    },
    {
      id: 'kpi-clusters',
      label: 'Duplicate Clusters',
      value: data.total_duplicate_clusters.toLocaleString(),
      subtext: 'Clusters identified by AI',
      icon: Copy,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: 'kpi-overlap-rate',
      label: 'Cross-CPSE Overlap Rate',
      value: `${data.cross_cpse_overlap_percentage.toFixed(1)}%`,
      subtext: 'Materials appearing in >1 CPSE',
      icon: Percent,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'kpi-unique-standard',
      label: 'Unique Standard Concepts',
      value: data.unique_standardized_concepts.toLocaleString(),
      subtext: 'Normalized material entities',
      icon: Target,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'kpi-cnmc-coverage',
      label: 'CNMC Mapping Coverage',
      value: `${data.cnmc_mapping_coverage_percentage.toFixed(1)}%`,
      subtext: 'Raw items mapped to CNMC Master',
      icon: CheckCircle2,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
    {
      id: 'kpi-pipeline',
      label: 'Candidate Pipeline',
      value: (data.cnmc_candidates_pending + data.cnmc_candidates_approved + data.cnmc_candidates_rejected).toLocaleString(),
      subtext: `${data.cnmc_candidates_approved} approved / ${data.cnmc_candidates_pending} pending`,
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      id: 'kpi-standardized-master',
      label: 'Standardized CNMC Masters',
      value: data.cnmc_master_codes_created.toLocaleString(),
      subtext: 'Governed prototype masters',
      icon: ShieldAlert,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'kpi-opportunities',
      label: 'Procurement Opportunities',
      value: data.identified_procurement_opportunities.toLocaleString(),
      subtext: 'High & medium impact synergy clusters',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50 border-orange-100',
    },
    {
      id: 'kpi-savings-score',
      label: 'Synthetic Savings Score',
      value: `${data.synthetic_potential_savings_score.toFixed(1)}/100`,
      subtext: 'Illustrative synergy potential',
      icon: BarChart3,
      color: 'text-cyan-700 bg-cyan-50 border-cyan-100',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Synthetic Demonstration Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold uppercase tracking-wider text-amber-800">
            {data.disclaimer_notice}
          </p>
          <p className="text-amber-700 leading-relaxed">
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
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-lg border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-1">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Macro Summary & Top Overlapping Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overlap Summary Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Cross-CPSE Overlap Summary</h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {data.cross_cpse_overlap_count} Overlapping Lines
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Out of {data.total_ingested_materials.toLocaleString()} ingested materials across {data.total_participating_cpses} CPSEs, {data.cross_cpse_overlap_count.toLocaleString()} materials ({data.cross_cpse_overlap_percentage.toFixed(1)}%) share identical or functionally equivalent specifications across multiple public sector enterprises.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Mapping Coverage Funnel</span>
                <span className="font-semibold">{data.cnmc_mapping_coverage_percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, data.cnmc_mapping_coverage_percentage)}%` }}
                />
              </div>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('matrix')}
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              Explore Cross-CPSE Matrix <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Top Overlapping Categories */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Highest Cross-CPSE Overlap Categories</h3>
              <p className="text-xs text-gray-500">Material categories with the densest cross-enterprise commonality</p>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('categories')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                View all categories <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {data.top_overlapping_categories.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No category overlap data available yet.</p>
            ) : (
              data.top_overlapping_categories.map((cat, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{cat.category_name}</h4>
                      <p className="text-xs text-gray-500">
                        {cat.distinct_cpses_involved} CPSEs • {cat.duplicate_cluster_count} duplicate clusters
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">
                      {cat.overlap_count} overlapping items
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Snapshot Timestamp Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Calculated: {new Date(data.generated_at).toLocaleString()}</span>
        </div>
        <span>Architecture Tier: Layer 2 / Layer 3 Analytical Intelligence (SIH 2026 Prototype)</span>
      </div>
    </div>
  );
};
