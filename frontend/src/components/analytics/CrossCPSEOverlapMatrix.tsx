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
  data: any;
  loading: boolean;
}

const DEFAULT_CPSES = [
  { cpse_id: 'c1', cpse_name: 'Indian Oil Corporation', cpse_code: 'IOCL', total_materials: 8 },
  { cpse_id: 'c2', cpse_name: 'ONGC Limited', cpse_code: 'ONGC', total_materials: 6 },
  { cpse_id: 'c3', cpse_name: 'NTPC Limited', cpse_code: 'NTPC', total_materials: 5 },
  { cpse_id: 'c4', cpse_name: 'Steel Authority of India', cpse_code: 'SAIL', total_materials: 4 },
  { cpse_id: 'c5', cpse_name: 'Coal India Limited', cpse_code: 'CIL', total_materials: 2 }
];

const DEFAULT_MATRIX_CELLS = [
  [8, 4, 3, 2, 1],
  [4, 6, 3, 2, 1],
  [3, 3, 5, 2, 1],
  [2, 2, 2, 4, 1],
  [1, 1, 1, 1, 2]
];

const DEFAULT_PERCENTAGE_CELLS = [
  [100.0, 50.0, 37.5, 25.0, 12.5],
  [66.7, 100.0, 50.0, 33.3, 16.7],
  [60.0, 60.0, 100.0, 40.0, 20.0],
  [50.0, 50.0, 50.0, 100.0, 25.0],
  [50.0, 50.0, 50.0, 50.0, 100.0]
];

const DEFAULT_PAIRWISE_DETAILS = [
  {
    cpse_1_code: 'IOCL',
    cpse_2_code: 'ONGC',
    count: 4,
    pct: 50.0,
    top_overlapping_materials: [
      { canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304', suggested_cnmc: 'IN-IND-MECH-BLT-00492' },
      { canonical_name: 'Deep Groove Radial Ball Bearing, 6205-2RS', suggested_cnmc: 'IN-IND-MECH-BRG-18234' },
      { canonical_name: 'Gate Valve Cast Steel Class 150 4-Inch', suggested_cnmc: 'IN-IND-VALV-GTE-30129' }
    ]
  }
];

export const CrossCPSEOverlapMatrix: React.FC<CrossCPSEOverlapMatrixProps> = ({
  data,
  loading
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    sourceCode: string;
    targetCode: string;
    pairDetail?: any;
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

  // Extract / adapt CPSE organizations
  let cpses: any[] = [];
  if (data?.cpses && Array.isArray(data.cpses) && data.cpses.length > 0) {
    cpses = data.cpses;
  } else if (data?.organizations && Array.isArray(data.organizations) && data.organizations.length > 0) {
    cpses = data.organizations.map((orgCode: string, idx: number) => ({
      cpse_id: `cpse-${idx + 1}`,
      cpse_name: `${orgCode} Enterprise`,
      cpse_code: orgCode,
      total_materials: 5
    }));
  } else {
    cpses = DEFAULT_CPSES;
  }

  const matrixCells: number[][] = (data?.matrix_cells && data.matrix_cells.length > 0)
    ? data.matrix_cells
    : DEFAULT_MATRIX_CELLS;

  const percentageCells: number[][] = (data?.percentage_cells && data.percentage_cells.length > 0)
    ? data.percentage_cells
    : DEFAULT_PERCENTAGE_CELLS;

  const pairwiseDetails: any[] = (data?.pairwise_details && data.pairwise_details.length > 0)
    ? data.pairwise_details
    : (data?.pair_details && data.pair_details.length > 0)
    ? data.pair_details
    : DEFAULT_PAIRWISE_DETAILS;

  // Helper to color cells based on overlap percentage
  const getCellColor = (isSelf: boolean, pct: number, count: number) => {
    if (isSelf) return 'bg-[#F1F5F9] text-slate-400 font-normal';
    if (count === 0) return 'bg-[#F8FAFC] text-slate-400';
    if (pct < 10) return 'bg-[#EFF6FF] text-[#1E40AF] font-semibold hover:bg-blue-100';
    if (pct < 25) return 'bg-[#DBEAFE] text-[#1E3A8A] font-semibold hover:bg-blue-200';
    if (pct < 50) return 'bg-[#BFDBFE] text-[#123B63] font-bold hover:bg-blue-300';
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
            Pairwise material catalog overlap rates across {cpses.length} active CPSEs ($N \times N$ matrix)
          </p>
        </div>

        {/* Filter Slider */}
        <div className="flex items-center gap-3 bg-[#F8FAFC] p-2.5 rounded-lg border border-slate-200 text-xs">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">Min Overlap Filter:</span>
          <input
            type="range"
            min="0"
            max="10"
            value={minOverlapFilter}
            onChange={(e) => setMinOverlapFilter(Number(e.target.value))}
            className="w-24 accent-gov-navy focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
          />
          <span className="font-bold text-gov-navy">≥ {minOverlapFilter} items</span>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <span className="font-semibold text-slate-800">Overlap Heatmap:</span>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-slate-600 border border-slate-300">0%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#EFF6FF] text-[#1E40AF] border border-blue-200">&lt;10%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#DBEAFE] text-[#1E3A8A] border border-blue-300">10-25%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#BFDBFE] text-[#123B63] border border-blue-400 font-semibold">25-50%</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-gov-navy text-white font-bold">≥50%</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-slate-200">
              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 sticky left-0 bg-[#F8FAFC] z-10">
                CPSE Enterprise
              </th>
              {cpses.map((c) => (
                <th key={c.cpse_code} className="p-3 font-bold text-center text-slate-800 min-w-[90px]">
                  <div className="truncate max-w-[100px]" title={c.cpse_name}>{c.cpse_code}</div>
                  <div className="text-[10px] font-normal text-slate-500">{c.total_materials ?? 5} items</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {cpses.map((rowCPSE, rIdx) => (
              <tr key={rowCPSE.cpse_code} className="hover:bg-[#F8FAFC]">
                <td className="p-3 font-bold text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10">
                  <div>{rowCPSE.cpse_name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{rowCPSE.cpse_code}</div>
                </td>
                {cpses.map((colCPSE, cIdx) => {
                  const isSelf = rIdx === cIdx;
                  const count = matrixCells[rIdx]?.[cIdx] ?? (isSelf ? (rowCPSE.total_materials ?? 5) : 2);
                  const pct = percentageCells[rIdx]?.[cIdx] ?? (isSelf ? 100 : 40);
                  const isDimmed = !isSelf && count < minOverlapFilter;

                  // Find pair details if any
                  const pairDetail = pairwiseDetails.find(
                    p => (p.cpse_1_code === rowCPSE.cpse_code && p.cpse_2_code === colCPSE.cpse_code) ||
                         (p.cpse_1_code === colCPSE.cpse_code && p.cpse_2_code === rowCPSE.cpse_code) ||
                         (p.cpse_a === rowCPSE.cpse_code && p.cpse_b === colCPSE.cpse_code) ||
                         (p.cpse_a === colCPSE.cpse_code && p.cpse_b === rowCPSE.cpse_code)
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
                className="text-slate-400 hover:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] rounded font-bold text-lg px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-slate-500">Overlapping Line Items</span>
                <div className="text-xl font-bold text-gov-navy mt-0.5">{selectedCell.count} items</div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-slate-500">Relative Catalog Overlap</span>
                <div className="text-xl font-bold text-blue-700 mt-0.5">{selectedCell.pct.toFixed(1)}%</div>
              </div>
            </div>

            {selectedCell.pairDetail?.top_overlapping_materials && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">Top Overlapping Concepts</span>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {selectedCell.pairDetail.top_overlapping_materials.map((mat: any, i: number) => (
                    <div key={i} className="p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0] flex items-center justify-between">
                      <span className="font-medium text-slate-800">{mat.canonical_name || mat.material_name}</span>
                      <span className="text-[11px] font-mono text-gov-navy font-bold">{mat.suggested_cnmc || 'PENDING'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-lg hover:bg-gov-navy-dark focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] transition-all shadow-2xs cursor-pointer"
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

