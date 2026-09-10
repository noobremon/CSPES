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
  data: any;
  loading: boolean;
}

const DEFAULT_OPPORTUNITIES = [
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
];

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

  // Normalize data whether backend returns List[Dict] or { opportunities: [...] }
  let rawList: any[] = [];
  if (Array.isArray(data) && data.length > 0) {
    rawList = data;
  } else if (data && Array.isArray(data.opportunities) && data.opportunities.length > 0) {
    rawList = data.opportunities;
  } else {
    rawList = DEFAULT_OPPORTUNITIES;
  }

  const opportunities = rawList.map((opp, index) => {
    return {
      opportunity_id: opp.opportunity_id || `opp-${index + 1}`,
      title: opp.title || opp.material_cluster_title || 'Cross-Enterprise Material Synergy',
      description: opp.description || opp.opportunity_description || opp.supporting_evidence || 'Cross-CPSE standard specifications identified with high collaborative potential.',
      opportunity_type: opp.opportunity_type || 'CROSS_CPSE_COMMON_DEMAND',
      priority_level: opp.priority_level || 'HIGH',
      participating_cpse_count: opp.participating_cpse_count ?? (opp.participating_cpses?.length || 2),
      participating_cpses: opp.participating_cpses || ['IOCL', 'ONGC'],
      item_count: opp.item_count ?? opp.material_count ?? 2,
      recommended_next_step: opp.recommended_next_step || opp.recommended_action || opp.recommendation || 'Initiate multi-enterprise joint specification alignment.'
    };
  });

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchCategory = selectedCategory === 'ALL' || opp.opportunity_type === selectedCategory;
    const matchPriority = selectedPriority === 'ALL' || opp.priority_level === selectedPriority;
    return matchCategory && matchPriority;
  });

  const highPriorityCount = opportunities.filter(o => o.priority_level === 'HIGH').length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
      case 'MEDIUM':
        return 'bg-[#FFF7E6] text-[#92400E] border-[#F3D19C]';
      case 'LOW':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-blue-200';
      default:
        return 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CROSS_CPSE_COMMON_DEMAND':
      case 'CROSS_CPSE_DEMAND_AGGREGATION':
        return 'Cross-CPSE Demand Aggregation';
      case 'STANDARDIZATION_CANDIDATE':
      case 'STANDARDIZATION_OPPORTUNITY':
        return 'Standardization Candidate';
      case 'SUPPLIER_BASE_CONSOLIDATION_CANDIDATE':
      case 'DUPLICATE_CODE_RATIONALIZATION':
        return 'Duplicate Code Rationalization';
      case 'BULK_RATE_CONTRACT_ELIGIBLE':
      case 'SPECIFICATION_HARMONIZATION_OPPORTUNITY':
        return 'Specification Harmonization';
      case 'HIGH_VOLUME_DUPLICATE_CLUSTER':
      case 'INVENTORY_VISIBILITY_OPPORTUNITY':
        return 'Inventory Visibility Opportunity';
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
            {data?.disclaimer_notice || data?.disclaimer || 'SYNTHETIC DEMONSTRATION INSIGHT — Illustrative procurement synergy analysis.'}
          </div>
          <p className="text-slate-700 leading-relaxed">
            All opportunity metrics, priority categorizations, and synergy scores are generated from demonstration data.
            This engine respects Layer 1 commercial isolation and does not calculate verified government financial savings.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Identified Opportunities</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">{opportunities.length}</div>
          <p className="text-xs text-slate-500 mt-1">Cross-enterprise synergy clusters</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider">High Priority Synergies</span>
          <div className="text-2xl font-bold text-[#B91C1C] mt-2">{highPriorityCount}</div>
          <p className="text-xs text-slate-500 mt-1">≥ 3 CPSEs or high duplicate density</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">Demonstration Synergy Potential</span>
          <div className="text-2xl font-bold text-gov-navy mt-2">HIGH POTENTIAL ({opportunities.length} Clusters)</div>
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
            className="text-xs bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-slate-900 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          >
            <option value="ALL">All Opportunity Types</option>
            <option value="CROSS_CPSE_COMMON_DEMAND">Cross-CPSE Demand Aggregation</option>
            <option value="STANDARDIZATION_CANDIDATE">Standardization Candidate</option>
            <option value="SUPPLIER_BASE_CONSOLIDATION_CANDIDATE">Duplicate Code Rationalization</option>
            <option value="BULK_RATE_CONTRACT_ELIGIBLE">Specification Harmonization</option>
            <option value="HIGH_VOLUME_DUPLICATE_CLUSTER">Inventory Visibility Opportunity</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 ml-2">
            <span>Priority:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-slate-900 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </span>
      </div>

      {/* Opportunities Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.map((opp) => (
          <div 
            key={opp.opportunity_id}
            className="bg-white hover:bg-[#F8FAFC]/50 p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
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
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-slate-200 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
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

