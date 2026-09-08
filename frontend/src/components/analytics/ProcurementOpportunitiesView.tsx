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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-500 font-medium">Analyzing Procurement Synergy Opportunities...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">No procurement opportunity data available.</p>
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
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 shadow-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold uppercase tracking-wider text-amber-800">
            {data.disclaimer_notice}
          </div>
          <p className="text-amber-700 leading-relaxed">
            All opportunity metrics, priority categorizations, and synergy scores are generated from synthetic demonstration data.
            This engine respects Layer 1 commercial isolation and does not calculate verified government financial savings.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Identified Opportunities</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">{data.total_opportunities_identified}</div>
          <p className="text-xs text-gray-500 mt-1">Cross-enterprise synergy clusters</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase">High Priority Synergies</span>
          <div className="text-2xl font-bold text-rose-700 mt-2">{data.high_priority_count}</div>
          <p className="text-xs text-gray-500 mt-1">&ge; 3 CPSEs or high duplicate density</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-cyan-700 uppercase">Demonstration Synergy Potential</span>
          <div className="text-2xl font-bold text-cyan-800 mt-2">{data.potential_savings_summary}</div>
          <p className="text-xs text-gray-500 mt-1">Relative opportunity indicator</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Filter className="w-4 h-4 text-gray-400" />
            <span>Opportunity Type:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Opportunity Types</option>
            <option value="CROSS_CPSE_COMMON_DEMAND">Cross-CPSE Common Demand</option>
            <option value="STANDARDIZATION_CANDIDATE">Standardization Candidate</option>
            <option value="SUPPLIER_BASE_CONSOLIDATION_CANDIDATE">Supplier Consolidation</option>
            <option value="BULK_RATE_CONTRACT_ELIGIBLE">Bulk Rate Contract Eligible</option>
            <option value="HIGH_VOLUME_DUPLICATE_CLUSTER">High-Volume Duplicate Cluster</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 ml-2">
            <span>Priority:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        <span className="text-xs text-gray-500">
          Showing <strong>{filteredOpportunities.length}</strong> of {data.opportunities.length} opportunities
        </span>
      </div>

      {/* Opportunities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-400 text-xs">
            No procurement opportunities match the selected filters.
          </div>
        ) : (
          filteredOpportunities.map((opp) => (
            <div 
              key={opp.opportunity_id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(opp.priority_level)}`}>
                    {opp.priority_level} Priority
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100 font-semibold">
                    {opp.cnmc_code || 'PROTOTYPE-CANDIDATE'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900">{opp.material_name}</h4>
                <div className="text-xs text-primary-700 font-medium mt-1">
                  {getTypeLabel(opp.opportunity_type)}
                </div>

                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {opp.opportunity_description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <strong>{opp.participating_cpse_count}</strong> Participating CPSEs:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {opp.participating_cpses.join(', ')}
                  </span>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Recommended Action:
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    {opp.recommended_action}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
