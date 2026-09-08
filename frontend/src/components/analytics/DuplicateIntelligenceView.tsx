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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-500 font-medium">Loading Duplicate Intelligence Clusters...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">No duplicate analytics data available.</p>
      </div>
    );
  }

  const filteredClusters = data.duplicate_clusters.filter((cluster) => {
    const term = searchTerm.toLowerCase();
    return (
      cluster.canonical_name.toLowerCase().includes(term) ||
      cluster.category_code.toLowerCase().includes(term) ||
      (cluster.cnmc_code && cluster.cnmc_code.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Cluster Type Breakdown Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Clusters</span>
            <Copy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{data.total_clusters}</div>
          <p className="text-xs text-gray-500 mt-1">Multi-item equivalence sets</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Exact Code Match</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{data.exact_match_clusters}</div>
          <p className="text-xs text-gray-500 mt-1">Direct standardized code matches</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase">Near Match (AI)</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{data.near_match_clusters}</div>
          <p className="text-xs text-gray-500 mt-1">High semantic/fuzzy similarity (&ge; 85%)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 uppercase">Functional Equiv.</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">{data.functional_clusters}</div>
          <p className="text-xs text-gray-500 mt-1">Attribute & standard grade equivalence</p>
        </div>
      </div>

      {/* CPSE Density Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
          Duplicate Density by Enterprise (CPSE)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.cpse_density_breakdown.map((cpse) => (
            <div key={cpse.cpse_id} className="p-3 bg-gray-50/70 rounded-lg border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800">{cpse.cpse_name}</span>
                <p className="text-xs text-gray-500">{cpse.cpse_code} • {cpse.total_materials} materials</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  {cpse.duplicate_density_percentage.toFixed(1)}%
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">{cpse.duplicate_materials_count} in clusters</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clusters List & Detail Modal/Drawer */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Identified Duplicate & Equivalence Clusters</h3>
            <p className="text-xs text-gray-500">Cross-enterprise material groups with high spec overlap</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cluster name or CNMC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filteredClusters.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No duplicate clusters match your search query.
            </div>
          ) : (
            filteredClusters.map((cluster) => (
              <div 
                key={cluster.cluster_id} 
                className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setSelectedCluster(cluster)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{cluster.canonical_name}</span>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                      {cluster.cnmc_code || 'UNASSIGNED'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      cluster.cluster_type === 'EXACT_MATCH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      cluster.cluster_type === 'NEAR_MATCH' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {cluster.cluster_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {cluster.category_code}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      {cluster.distinct_cpse_count} CPSEs ({cluster.participating_cpses.join(', ')})
                    </span>
                    <span>•</span>
                    <span>{cluster.total_materials} materials in cluster</span>
                    <span>•</span>
                    <span className="font-medium text-emerald-600">
                      {(cluster.average_similarity * 100).toFixed(1)}% avg similarity
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cluster Detail Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Cluster Detail</span>
                <h3 className="text-base font-bold text-gray-900">{selectedCluster.canonical_name}</h3>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-gray-500 font-medium">Assigned Prototype CNMC:</span>
                  <div className="font-mono font-bold text-gray-900 mt-0.5">{selectedCluster.cnmc_code || 'None'}</div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Category Code:</span>
                  <div className="font-bold text-gray-900 mt-0.5">{selectedCluster.category_code}</div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Match Type:</span>
                  <div className="font-bold text-gray-900 mt-0.5">{selectedCluster.cluster_type}</div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Average Confidence:</span>
                  <div className="font-bold text-emerald-600 mt-0.5">{(selectedCluster.average_similarity * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Participating Public Sector Enterprises:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCluster.participating_cpses.map((cpse, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-semibold">
                      {cpse}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-[11px] leading-relaxed">
                <strong>SIH Governance Rule:</strong> Clustering reflects technical and specification equivalence. Individual CPSE ERP codes remain strictly preserved in Layer 1.
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedCluster(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
