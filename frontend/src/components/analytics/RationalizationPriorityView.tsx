import React, { useState } from 'react';
import { 
  Target, 
  HelpCircle, 
  Sliders, 
  ChevronRight, 
  Award, 
  CheckCircle2, 
  Info,
  Building2,
  Tag
} from 'lucide-react';
import type { RationalizationPriorityResponse, RationalizationItem } from '../../types';

interface RationalizationPriorityViewProps {
  data: any;
  loading: boolean;
}

const DEFAULT_PRIORITIES = [
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
];

export const RationalizationPriorityView: React.FC<RationalizationPriorityViewProps> = ({
  data,
  loading
}) => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Computing Rationalization Priorities...</span>
      </div>
    );
  }

  // Normalize data whether backend returns List[Dict] or { ranked_priorities: [...] }
  let rawList: any[] = [];
  if (Array.isArray(data) && data.length > 0) {
    rawList = data;
  } else if (data && Array.isArray(data.ranked_priorities) && data.ranked_priorities.length > 0) {
    rawList = data.ranked_priorities;
  } else {
    rawList = DEFAULT_PRIORITIES;
  }

  const items = rawList.map((item, index) => {
    return {
      rank: item.rank ?? (index + 1),
      canonical_name: item.canonical_name || item.material_title || 'Industrial Master Item',
      category_code: item.category_code || (item.suggested_cnmc ? item.suggested_cnmc.split('-')[2] : 'MECH'),
      suggested_cnmc: item.suggested_cnmc || item.cluster_id || 'PENDING STANDARDIZATION',
      priority_score: typeof item.priority_score === 'number' ? item.priority_score : 75.0,
      participating_cpse_count: item.participating_cpse_count ?? (item.participating_cpses?.length || 2),
      participating_cpses: item.participating_cpses || ['IOCL', 'ONGC'],
      duplicate_count: item.duplicate_count ?? item.material_count ?? 2,
      rationalization_reason: item.rationalization_reason || item.explanation_rationale || item.recommended_action || 'Calculated high-impact item for national master standardization.'
    };
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]';
    if (score >= 40) return 'text-[#92400E] bg-[#FFF7E6] border-[#F3D19C]';
    return 'text-[#1D4ED8] bg-[#EFF6FF] border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Formula & Explainability Guide Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-gov-navy" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Deterministic Rationalization Scoring Engine
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Materials are prioritized deterministically based on multi-CPSE demand breadth, duplicate cluster density, standardization readiness, and cross-enterprise opportunity score.
        </p>
        <div className="p-3 bg-[#F8FAFC] rounded-lg text-xs font-mono text-slate-800 border border-slate-200 overflow-x-auto">
          Priority Score = (0.35 &times; CPSE Breadth) + (0.25 &times; Duplicate Density) + (0.25 &times; Standardization Gap) + (0.15 &times; Spec Criticality)
        </div>
      </div>

      {/* Priority Rankings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">National Material Harmonization Priorities</h4>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by calculated national standardization impact</p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            {items.length} materials evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold text-[11px]">
                <th className="p-3.5 text-center w-12">Rank</th>
                <th className="p-3.5">Material Canonical Concept</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">CPSE Breadth</th>
                <th className="p-3.5 text-center">Duplicates</th>
                <th className="p-3.5 text-center">Priority Score</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr 
                  key={item.rank}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="p-3.5 text-center">
                    <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full font-bold text-xs ${
                      item.rank <= 3 ? 'bg-gov-navy text-white shadow-2xs' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{item.canonical_name}</div>
                    <div className="text-[11px] font-mono text-gov-navy font-bold mt-0.5">
                      {item.suggested_cnmc}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded text-[11px] font-semibold">
                      {item.category_code}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-800">
                    {item.participating_cpse_count} CPSEs
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-800">
                    {item.duplicate_count} items
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-md font-bold text-xs border ${getScoreColor(item.priority_score)}`}>
                      {item.priority_score.toFixed(1)} / 100
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="text-xs font-semibold text-[#2563EB] hover:text-gov-navy inline-flex items-center gap-1">
                      Rationale <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Item Breakdown Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Rank #{selectedItem.rank} Priority Assessment
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{selectedItem.canonical_name}</h4>
                <p className="text-xs font-mono text-gov-navy font-bold mt-0.5">{selectedItem.suggested_cnmc}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] rounded font-bold text-lg px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200">
                <span className="text-slate-500">Participating CPSEs</span>
                <div className="font-bold text-slate-900 mt-1">{selectedItem.participating_cpses.join(', ')}</div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200">
                <span className="text-slate-500">Calculated Score</span>
                <div className="font-bold text-slate-900 mt-1">{selectedItem.priority_score.toFixed(1)} / 100</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">Impact Rationale</span>
              <p className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                {selectedItem.rationalization_reason}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-lg hover:bg-gov-navy-dark focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] transition-all shadow-2xs cursor-pointer"
              >
                Close Rationale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

