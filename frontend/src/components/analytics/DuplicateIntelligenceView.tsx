import React, { useState } from 'react';
import { 
  Copy, 
  Layers, 
  Building2, 
  Sparkles, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import type { DuplicateAnalyticsResponse, DuplicateClusterSummary } from '../../types';

interface DuplicateIntelligenceViewProps {
  data: DuplicateAnalyticsResponse | null;
  loading: boolean;
}

export const DuplicateIntelligenceView: React.FC<DuplicateIntelligenceViewProps> = ({
  data,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<DuplicateClusterSummary | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Loading Duplicate Intelligence Clusters...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No duplicate analytics data available.</p>
      </div>
    );
  }

  const filteredClusters = (data.duplicate_clusters || []).filter((cluster) => {
    const term = searchTerm.toLowerCase();
    return (
      (cluster.canonical_name && cluster.canonical_name.toLowerCase().includes(term)) ||
      (cluster.category_code && cluster.category_code.toLowerCase().includes(term)) ||
      (cluster.cnmc_code && cluster.cnmc_code.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Cluster Type Breakdown Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Clusters</span>
            <Copy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data.total_clusters}</div>
          <p className="text-xs text-slate-500 mt-1">Multi-item equivalence sets</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Exact Code Match</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 mt-2">{data.exact_match_clusters}</div>
          <p className="text-xs text-slate-500 mt-1">Direct standardized code matches</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Near Match (AI)</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800 mt-2">{data.near_match_clusters}</div>
          <p className="text-xs text-slate-500 mt-1">High semantic/fuzzy similarity (&ge; 85%)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Functional Equiv.</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-800 mt-2">{data.functional_clusters}</div>
          <p className="text-xs text-slate-500 mt-1">Attribute & standard grade equivalence</p>
        </div>
      </div>

      {/* CPSE Density Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Duplicate Density by Enterprise (CPSE)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(data.cpse_density_breakdown || []).map((cpse) => (
            <div key={cpse.cpse_id || cpse.cpse_code} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">{cpse.cpse_name}</span>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{cpse.cpse_code} • {cpse.total_materials} materials</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  {cpse.duplicate_density_percentage.toFixed(1)}%
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">{cpse.duplicate_materials_count} in clusters</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clusters List & Detail Modal/Drawer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Identified Duplicate & Equivalence Clusters</h3>
            <p className="text-xs text-slate-500 mt-0.5">Cross-enterprise material groups with high spec overlap</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cluster name or CNMC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-lg hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-[#0F172A] placeholder-[#64748B] transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
          {filteredClusters.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No duplicate clusters match your search query.
            </div>
          ) : (
            filteredClusters.map((cluster) => (
              <div 
                key={cluster.cluster_id} 
                className="p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setSelectedCluster(cluster)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{cluster.canonical_name}</span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {cluster.category_code}
                    </span>
                    {cluster.cnmc_code && (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-gov-navy border border-blue-200">
                        {cluster.cnmc_code}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {cluster.participating_cpse_count} CPSEs ({cluster.participating_cpses.join(', ')})
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{cluster.item_count} duplicate items</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                    cluster.match_type === 'EXACT_CODE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : cluster.match_type === 'NEAR_MATCH_AI'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}>
                    {cluster.match_type.replace(/_/g, ' ')}
                  </span>
                  <button className="text-slate-400 hover:text-gov-navy focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] rounded p-1">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cluster Detail Drawer / Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cluster Detail</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{selectedCluster.canonical_name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-1">Category: {selectedCluster.category_code}</p>
              </div>
              <button 
                onClick={() => setSelectedCluster(null)}
                className="text-slate-400 hover:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] rounded font-bold text-lg px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-slate-500">Participating Enterprises</span>
                <div className="font-bold text-slate-900 mt-1">{selectedCluster.participating_cpses.join(', ')}</div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-slate-500">Equivalence Method</span>
                <div className="font-bold text-slate-900 mt-1">{selectedCluster.match_type.replace(/_/g, ' ')}</div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Included Raw Catalog Items ({selectedCluster.items.length})
              </h5>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">CPSE</th>
                      <th className="p-2.5">Local Item Code</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {selectedCluster.items.map((item, i) => (
                      <tr key={i} className="hover:bg-[#F8FAFC]">
                        <td className="p-2.5 font-bold text-gov-navy">{item.cpse_code}</td>
                        <td className="p-2.5 font-mono font-semibold text-slate-900">{item.local_material_code}</td>
                        <td className="p-2.5 text-slate-600">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCluster(null)}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-lg hover:bg-gov-navy-dark focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] transition-all shadow-2xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

