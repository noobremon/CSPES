import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Filter, 
  Building2, 
  Tag, 
  AlertCircle,
  Lightbulb,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import type { ProcurementOpportunityResponse, ProcurementOpportunityItem } from '../../types';

interface ProcurementOpportunitiesViewProps {
  data: ProcurementOpportunityResponse | null;
  loading: boolean;
}

export const ProcurementOpportunitiesView: React.FC<ProcurementOpportunitiesViewProps> = ({
  data,
  loading
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Analyzing Procurement Synergy Opportunities...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No procurement opportunity data available.</p>
      </div>
    );
  }

  const filteredOpportunities = data.opportunities.filter((opp) => {
    const matchCategory = selectedCategory === 'ALL' || opp.opportunity_type === selectedCategory;
    const matchPriority = selectedPriority === 'ALL' || opp.priority_level === selectedPriority;
    return matchCategory && matchPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CROSS_CPSE_COMMON_DEMAND':
        return 'Cross-CPSE Common Demand';
      case 'STANDARDIZATION_CANDIDATE':
        return 'Standardization Candidate';
      case 'SUPPLIER_BASE_CONSOLIDATION_CANDIDATE':
        return 'Supplier Consolidation Candidate';
      case 'BULK_RATE_CONTRACT_ELIGIBLE':
        return 'Bulk Rate Contract Eligible';
      case 'HIGH_VOLUME_DUPLICATE_CLUSTER':
        return 'High-Volume Duplicate Cluster';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mandatory Prominent Synthetic Demonstration Disclaimer */}
      <div className="p-4 rounded-xl border border-gov-notice-border bg-gov-notice-bg text-slate-800 shadow-2xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold uppercase tracking-wider text-slate-900">
            {data.disclaimer_notice}
          </div>
          <p className="text-slate-700 leading-relaxed">
            All opportunity metrics, priority categorizations, and synergy scores are generated from synthetic demonstration data.
            This engine respects Layer 1 commercial isolation and does not calculate verified government financial savings.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Identified Opportunities</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data.total_opportunities_identified}</div>
          <p className="text-xs text-slate-500 mt-1">Cross-enterprise synergy clusters</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">High Priority Synergies</span>
          <div className="text-2xl font-bold text-rose-800 mt-2">{data.high_priority_count}</div>
          <p className="text-xs text-slate-500 mt-1">&ge; 3 CPSEs or high duplicate density</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Demonstration Synergy Potential</span>
          <div className="text-2xl font-bold text-cyan-900 mt-2">{data.potential_savings_summary}</div>
          <p className="text-xs text-slate-500 mt-1">Relative opportunity indicator</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Opportunity Type:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy transition-all"
          >
            <option value="ALL">All Opportunity Types</option>
            <option value="CROSS_CPSE_COMMON_DEMAND">Cross-CPSE Common Demand</option>
            <option value="STANDARDIZATION_CANDIDATE">Standardization Candidate</option>
            <option value="SUPPLIER_BASE_CONSOLIDATION_CANDIDATE">Supplier Consolidation</option>
            <option value="BULK_RATE_CONTRACT_ELIGIBLE">Bulk Rate Contract Eligible</option>
            <option value="HIGH_VOLUME_DUPLICATE_CLUSTER">High-Volume Duplicate Cluster</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 ml-2">
            <span>Priority:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy transition-all"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredOpportunities.length} of {data.opportunities.length} opportunities
        </span>
      </div>

      {/* Opportunities Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.map((opp) => (
          <div 
            key={opp.opportunity_id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(opp.priority_level)}`}>
                  {opp.priority_level} Priority
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {getTypeLabel(opp.opportunity_type)}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {opp.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {opp.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {opp.participating_cpse_count} CPSEs: {opp.participating_cpses.join(', ')}
                </span>
                <span className="font-semibold text-slate-800">{opp.item_count} duplicate items</span>
              </div>

              {opp.recommended_next_step && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-700 leading-tight">
                    <strong className="text-slate-900">Next Action:</strong> {opp.recommended_next_step}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
