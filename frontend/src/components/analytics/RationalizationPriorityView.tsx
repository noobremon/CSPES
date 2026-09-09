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
  data: RationalizationPriorityResponse | null;
  loading: boolean;
}

export const RationalizationPriorityView: React.FC<RationalizationPriorityViewProps> = ({
  data,
  loading
}) => {
  const [selectedItem, setSelectedItem] = useState<RationalizationItem | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Computing Rationalization Priorities...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No rationalization priority data available.</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-rose-800 bg-rose-50 border-rose-200';
    if (score >= 40) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-blue-800 bg-blue-50 border-blue-200';
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
        <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 border border-slate-200 overflow-x-auto">
          Priority Score = (0.35 &times; CPSE Breadth) + (0.25 &times; Duplicate Density) + (0.25 &times; Standardization Gap) + (0.15 &times; Spec Criticality)
        </div>
      </div>

      {/* Priority Rankings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">National Material Harmonization Priorities</h4>
            <p className="text-xs text-slate-500">Ranked by calculated national standardization impact</p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            {data.total_scored_materials} materials evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold text-[11px]">
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
              {data.ranked_priorities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No materials currently scored for rationalization.
                  </td>
                </tr>
              ) : (
                data.ranked_priorities.map((item) => (
                  <tr 
                    key={item.rank}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
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
                        {item.suggested_cnmc || 'PENDING STANDARDIZATION'}
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
                      <span className="text-xs font-semibold text-blue-600 hover:text-gov-navy inline-flex items-center gap-1">
                        Rationale <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
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
                <p className="text-xs font-mono text-gov-navy font-bold mt-0.5">{selectedItem.suggested_cnmc || 'PENDING CNMC ASSIGNMENT'}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-slate-500">Participating CPSEs</span>
                <div className="font-bold text-slate-900 mt-1">{selectedItem.participating_cpses.join(', ')}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-slate-500">Calculated Score</span>
                <div className="font-bold text-slate-900 mt-1">{selectedItem.priority_score.toFixed(1)} / 100</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">Impact Rationale</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                {selectedItem.rationalization_reason}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-lg hover:bg-gov-navy-dark transition-all shadow-2xs"
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
