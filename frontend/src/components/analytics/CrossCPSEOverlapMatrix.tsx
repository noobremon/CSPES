import React, { useState } from 'react';
import { 
  Grid3X3, 
  Layers, 
  Building2, 
  Info,
  Sliders
} from 'lucide-react';
import type { CrossCPSEMatrixResponse, PairwiseOverlapDetail } from '../../types';

interface CrossCPSEOverlapMatrixProps {
  data: CrossCPSEMatrixResponse | null;
  loading: boolean;
}

export const CrossCPSEOverlapMatrix: React.FC<CrossCPSEOverlapMatrixProps> = ({
  data,
  loading
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    sourceCode: string;
    targetCode: string;
    pairDetail?: PairwiseOverlapDetail;
    count: number;
    pct: number;
  } | null>(null);
  const [minOverlapFilter, setMinOverlapFilter] = useState<number>(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-500 font-medium">Computing Dynamic Cross-CPSE Overlap Matrix...</span>
      </div>
    );
  }

  if (!data || data.cpses.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">No CPSE overlap matrix data available.</p>
      </div>
    );
  }

  // Helper to color cells based on overlap percentage
  const getCellColor = (isSelf: boolean, pct: number, count: number) => {
    if (isSelf) return 'bg-gray-100 text-gray-400 font-normal';
    if (count === 0) return 'bg-gray-50/50 text-gray-300';
    if (pct < 10) return 'bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100';
    if (pct < 25) return 'bg-indigo-100 text-indigo-800 font-semibold hover:bg-indigo-200';
    if (pct < 50) return 'bg-indigo-200 text-indigo-900 font-bold hover:bg-indigo-300';
    return 'bg-indigo-600 text-white font-bold hover:bg-indigo-700';
  };

  const cpseMap = new Map(data.cpses.map(c => [c.cpse_code, c]));

  return (
    <div className="space-y-6">
      {/* Top Header & Legend */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Dynamic Cross-CPSE Overlap Matrix</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pairwise material catalog overlap rates across {data.total_cpses} active CPSEs ($N \times N$ matrix)
          </p>
        </div>

        {/* Filter Slider */}
        <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs">
          <Sliders className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-700">Min Overlap Filter:</span>
          <input
            type="range"
            min="0"
            max="10"
            value={minOverlapFilter}
            onChange={(e) => setMinOverlapFilter(Number(e.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="font-bold text-indigo-600">&ge; {minOverlapFilter} items</span>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-lg border border-gray-100">
        <span className="font-semibold text-gray-700">Overlap Heatmap:</span>
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded text-[10px] bg-gray-50 text-gray-400 border border-gray-200">0%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">&lt;10%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200">10-25%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-200 text-indigo-900 border border-indigo-300">25-50%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-600 text-white font-bold">&ge;50%</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                CPSE Enterprise
              </th>
              {data.cpses.map((c) => (
                <th key={c.cpse_code} className="p-3 font-bold text-center text-gray-700 min-w-[90px]">
                  <div className="truncate max-w-[100px]" title={c.cpse_name}>{c.cpse_code}</div>
                  <div className="text-[10px] font-normal text-gray-400">{c.total_materials} items</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.cpses.map((rowCPSE, rIdx) => (
              <tr key={rowCPSE.cpse_code} className="hover:bg-gray-50/50">
                <td className="p-3 font-bold text-gray-800 border-r border-gray-200 sticky left-0 bg-white z-10">
                  <div>{rowCPSE.cpse_name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{rowCPSE.cpse_code}</div>
                </td>
                {data.cpses.map((colCPSE, cIdx) => {
                  const isSelf = rIdx === cIdx;
                  const count = data.matrix_cells[rIdx]?.[cIdx] ?? 0;
                  const pct = data.percentage_cells[rIdx]?.[cIdx] ?? 0;
                  const isDimmed = !isSelf && count < minOverlapFilter;

                  // Find pair details if any
                  const pairDetail = data.pairwise_details.find(
                    p => (p.cpse_1_code === rowCPSE.cpse_code && p.cpse_2_code === colCPSE.cpse_code) ||
                         (p.cpse_1_code === colCPSE.cpse_code && p.cpse_2_code === rowCPSE.cpse_code)
                  );

                  return (
                    <td 
                      key={colCPSE.cpse_code} 
                      className={`p-2 text-center transition-all cursor-pointer ${
                        isDimmed ? 'opacity-30 bg-gray-50 text-gray-400' : getCellColor(isSelf, pct, count)
                      }`}
                      onClick={() => !isSelf && setSelectedCell({
                        sourceCode: rowCPSE.cpse_code,
                        targetCode: colCPSE.cpse_code,
                        pairDetail,
                        count,
                        pct
                      })}
                      title={isSelf ? 'Self' : `${rowCPSE.cpse_code} ↔ ${colCPSE.cpse_code}: ${count} items (${pct.toFixed(1)}%)`}
                    >
                      {isSelf ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <div>
                          <div className="text-xs font-bold">{count}</div>
                          <div className="text-[10px] opacity-80">{pct.toFixed(1)}%</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Detail Drawer / Card */}
      {selectedCell && (
        <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              <h4 className="text-sm font-bold text-gray-900">
                Pairwise Catalog Overlap: {cpseMap.get(selectedCell.sourceCode)?.cpse_name} &harr; {cpseMap.get(selectedCell.targetCode)?.cpse_name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-xs text-gray-500 font-medium">Shared Overlap Items</span>
              <div className="text-xl font-bold text-indigo-900 mt-1">{selectedCell.count} items</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-xs text-gray-500 font-medium">Catalog Overlap Percentage</span>
              <div className="text-xl font-bold text-indigo-900 mt-1">{selectedCell.pct.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-xs text-gray-500 font-medium">Top Overlapping Category</span>
              <div className="text-xs font-bold text-gray-800 mt-2">
                {selectedCell.pairDetail?.top_overlapping_categories[0]?.category_name || 'Cross-category'}
              </div>
            </div>
          </div>

          {selectedCell.pairDetail && selectedCell.pairDetail.top_overlapping_categories.length > 0 && (
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Overlap by Category between these two CPSEs:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedCell.pairDetail.top_overlapping_categories.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-900 rounded-md text-xs font-medium">
                    {c.category_name}: <strong>{c.overlap_count}</strong> items
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
