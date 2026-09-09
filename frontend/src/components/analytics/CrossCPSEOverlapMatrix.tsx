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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Computing Dynamic Cross-CPSE Overlap Matrix...</span>
      </div>
    );
  }

  if (!data || data.cpses.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No CPSE overlap matrix data available.</p>
      </div>
    );
  }

  // Helper to color cells based on overlap percentage
  const getCellColor = (isSelf: boolean, pct: number, count: number) => {
    if (isSelf) return 'bg-slate-100 text-slate-400 font-normal';
    if (count === 0) return 'bg-slate-50/50 text-slate-400';
    if (pct < 10) return 'bg-blue-50 text-blue-800 font-semibold hover:bg-blue-100';
    if (pct < 25) return 'bg-blue-100 text-blue-900 font-semibold hover:bg-blue-200';
    if (pct < 50) return 'bg-blue-200 text-blue-950 font-bold hover:bg-blue-300';
    return 'bg-gov-navy text-white font-bold hover:bg-gov-navy-dark';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Legend */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-gov-navy" />
            <h3 className="text-base font-bold text-slate-900">Dynamic Cross-CPSE Overlap Matrix</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pairwise material catalog overlap rates across {data.total_cpses} active CPSEs ($N \times N$ matrix)
          </p>
        </div>

        {/* Filter Slider */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">Min Overlap Filter:</span>
          <input
            type="range"
            min="0"
            max="10"
            value={minOverlapFilter}
            onChange={(e) => setMinOverlapFilter(Number(e.target.value))}
            className="w-24 accent-gov-navy"
          />
          <span className="font-bold text-gov-navy">&ge; {minOverlapFilter} items</span>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <span className="font-semibold text-slate-800">Overlap Heatmap:</span>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-300">0%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-800 border border-blue-200">&lt;10%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-900 border border-blue-300">10-25%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-200 text-blue-950 border border-blue-400">25-50%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-gov-navy text-white font-bold">&ge;50%</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 sticky left-0 bg-slate-50 z-10">
                CPSE Enterprise
              </th>
              {data.cpses.map((c) => (
                <th key={c.cpse_code} className="p-3 font-bold text-center text-slate-800 min-w-[90px]">
                  <div className="truncate max-w-[100px]" title={c.cpse_name}>{c.cpse_code}</div>
                  <div className="text-[10px] font-normal text-slate-500">{c.total_materials} items</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.cpses.map((rowCPSE, rIdx) => (
              <tr key={rowCPSE.cpse_code} className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10">
                  <div>{rowCPSE.cpse_name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{rowCPSE.cpse_code}</div>
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
                        isDimmed ? 'opacity-30 bg-slate-50 text-slate-400' : getCellColor(isSelf, pct, count)
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
                        <span className="text-[11px] font-mono text-slate-400">—</span>
                      ) : (
                        <div>
                          <span className="text-xs font-bold block">{count}</span>
                          <span className="text-[10px] opacity-80">{pct.toFixed(0)}%</span>
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

      {/* Selected Pair Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pairwise Catalog Interlock</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedCell.sourceCode} &harr; {selectedCell.targetCode}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-slate-500">Overlapping Line Items</span>
                <div className="text-xl font-bold text-gov-navy mt-0.5">{selectedCell.count} items</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-slate-500">Relative Catalog Overlap</span>
                <div className="text-xl font-bold text-blue-700 mt-0.5">{selectedCell.pct.toFixed(1)}%</div>
              </div>
            </div>

            {selectedCell.pairDetail && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">Top Overlapping Concepts</span>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {selectedCell.pairDetail.top_overlapping_materials.map((mat, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200/80 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{mat.canonical_name}</span>
                      <span className="text-[11px] font-mono text-gov-navy font-bold">{mat.suggested_cnmc || 'PENDING'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-lg hover:bg-gov-navy-dark transition-all shadow-2xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
