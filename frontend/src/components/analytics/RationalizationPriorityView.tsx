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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-500 font-medium">Computing Rationalization Priorities...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">No rationalization priority data available.</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-blue-700 bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Formula & Explainability Guide Banner */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Deterministic Rationalization Scoring Engine
          </h3>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Materials are prioritized deterministically based on multi-CPSE demand breadth, duplicate cluster density, standardization readiness, and cross-enterprise opportunity score.
        </p>
        <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-700 border border-gray-200 overflow-x-auto">
          Priority Score = (0.35 &times; CPSE Breadth) + (0.25 &times; Duplicate Density) + (0.25 &times; Standardization Gap) + (0.15 &times; Spec Criticality)
        </div>
      </div>

      {/* Priority Rankings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">National Material Harmonization Priorities</h4>
            <p className="text-xs text-gray-500">Ranked by calculated national standardization impact</p>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {data.total_scored_materials} materials evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="p-3.5 text-center w-12">Rank</th>
                <th className="p-3.5">Material Canonical Concept</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">CPSE Breadth</th>
                <th className="p-3.5 text-center">Duplicates</th>
                <th className="p-3.5 text-center">Priority Score</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.ranked_priorities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No materials currently scored for rationalization.
                  </td>
                </tr>
              ) : (
                data.ranked_priorities.map((item) => (
                  <tr 
                    key={item.rank}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="p-3.5 text-center">
                      <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full font-bold text-xs ${
                        item.rank <= 3 ? 'bg-primary-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{item.canonical_name}</div>
                      <div className="text-[11px] font-mono text-primary-600 mt-0.5">
                        {item.suggested_cnmc || 'PENDING STANDARDIZATION'}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-medium">
                        {item.category_code}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-semibold text-gray-700">
                      {item.participating_cpse_count} CPSEs
                    </td>
                    <td className="p-3.5 text-center font-semibold text-gray-700">
                      {item.duplicate_count} items
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-xs border ${getScoreColor(item.priority_score)}`}>
                        {item.priority_score.toFixed(1)} / 100
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                  Rank #{selectedItem.rank} Priority Rationalization Candidate
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{selectedItem.canonical_name}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Calculated Priority Score:</span>
                <span className="text-lg font-bold text-primary-700">{selectedItem.priority_score.toFixed(1)} / 100</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Standardization Status:</span>
                <span className="font-semibold text-gray-800">{selectedItem.standardization_status}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Estimated Rationalization Effort:</span>
                <span className="font-semibold text-gray-800">{selectedItem.estimated_effort}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Deterministic Scoring Rationale:</h5>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed">
                {selectedItem.rationalization_rationale}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
