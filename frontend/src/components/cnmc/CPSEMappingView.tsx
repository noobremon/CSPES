import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { CPSEMappingItem } from '../../types';
import { fetchCPSEMappings } from '../../services/api';
import {
  GitCompare,
  Building2,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Search,
  RefreshCw,
  Layers,
  Info
} from 'lucide-react';

// Initial synthetic demo mappings
const INITIAL_DEMO_MAPPINGS: CPSEMappingItem[] = [
  {
    id: 'map-001',
    raw_material_id: 'raw-001',
    normalized_material_id: 'norm-001',
    organization_id: 'org-001',
    organization_code: 'IOCL',
    organization_name: 'Indian Oil Corporation Limited',
    local_material_code: 'MAT-1001',
    cnmc_id: 'cnmc-001',
    cnmc_code: 'IN-IND-MECH-BLT-00492',
    canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
    mapping_type: 'DIRECT_MATCH',
    confidence_score: 1.0,
    status: 'ACTIVE',
    approved_by: 'domain_reviewer_01@sih.gov.in',
    created_at: '2026-09-08T10:35:00Z',
    effective_from: '2026-09-08T10:35:00Z'
  },
  {
    id: 'map-002',
    raw_material_id: 'raw-002',
    normalized_material_id: 'norm-002',
    organization_id: 'org-002',
    organization_code: 'ONGC',
    organization_name: 'ONGC Limited',
    local_material_code: 'BOLT-778',
    cnmc_id: 'cnmc-001',
    cnmc_code: 'IN-IND-MECH-BLT-00492',
    canonical_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
    mapping_type: 'NORMALIZED_MATCH',
    confidence_score: 0.98,
    status: 'ACTIVE',
    approved_by: 'domain_reviewer_01@sih.gov.in',
    created_at: '2026-09-08T10:36:00Z',
    effective_from: '2026-09-08T10:36:00Z'
  }
];

export const CPSEMappingView: React.FC = () => {
  const [mappings, setMappings] = useState<CPSEMappingItem[]>(INITIAL_DEMO_MAPPINGS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const data = await fetchCPSEMappings();
      if (data && data.length > 0) {
        setMappings(data);
      } else {
        setMappings(INITIAL_DEMO_MAPPINGS);
      }
    } catch {
      setMappings(INITIAL_DEMO_MAPPINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMappings();
  }, []);

  const filteredMappings = mappings.filter(
    (m) =>
      !searchTerm ||
      (m.cnmc_code && m.cnmc_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.local_material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.organization_code && m.organization_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.canonical_name && m.canonical_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer Banner */}
      <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 flex items-start gap-3 text-xs text-brand-200">
        <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-brand-300">
            Cross-Walk Traceability & Safety Principle:
          </span>{' '}
          Original CPSE local item codes (e.g. <code className="bg-brand-950/60 px-1 py-0.5 rounded text-brand-200">MAT-1001</code>, <code className="bg-brand-950/60 px-1 py-0.5 rounded text-brand-200">BOLT-778</code>) are permanently preserved in Layer 1 and are <span className="font-bold text-white">NEVER overwritten</span> in source ERPs. The platform establishes an immutable cross-walk binding to the governed prototype CNMC.
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by CNMC code, CPSE, or local item code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 rounded-lg border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          onClick={loadMappings}
          className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs px-3"
          title="Refresh Mappings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Cross-Walk</span>
        </button>
      </div>

      {/* Mappings Table */}
      <Card
        title="Active CPSE ↔ Governed Prototype CNMC Cross-Walk Mappings"
        subtitle={`Showing ${filteredMappings.length} approved cross-walk record(s).`}
        icon={<GitCompare className="w-5 h-5 text-brand-400" />}
      >
        <div className="overflow-x-auto -mx-6 -mb-6">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-y border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Governed Prototype CNMC</th>
                <th className="py-3 px-4">CPSE Enterprise</th>
                <th className="py-3 px-4">Preserved Local Code</th>
                <th className="py-3 px-4">Standardized Title</th>
                <th className="py-3 px-4">Mapping Type</th>
                <th className="py-3 px-6">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMappings.length > 0 ? (
                filteredMappings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-white flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-brand-400" />
                      <span>{m.cnmc_code || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.organization_code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-950 text-brand-300 px-2 py-0.5 rounded border border-slate-800 font-bold">
                        {m.local_material_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                      {m.canonical_name || 'Standardized Master Item'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {m.mapping_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 font-mono text-[11px]">
                      {m.approved_by}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No approved cross-walk mappings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
