import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { CNMCCandidateItem } from '../../types';
import { fetchCNMCCandidates } from '../../services/api';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  ExternalLink,
  RefreshCw,
  Tag,
  AlertCircle
} from 'lucide-react';

interface GovernanceReviewQueueProps {
  onSelectCandidate: (candidate: CNMCCandidateItem) => void;
  refreshTrigger: number;
}

// Initial demonstration queue items
const INITIAL_DEMO_CANDIDATES: CNMCCandidateItem[] = [
  {
    id: 'cand-001',
    proposed_cnmc: 'IN-IND-MECH-BLT-00492',
    candidate_group_name: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
    proposed_description: 'MVP Prototype Master Specification: Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363) [Standard: IS 1363] [Grade: SS304]',
    confidence_score: 0.95,
    generation_source: 'ENGINE_V1_TAXONOMY_RULE_BASED',
    status: 'PENDING_REVIEW',
    created_at: '2026-09-08T10:30:00Z',
    updated_at: '2026-09-08T10:30:00Z',
    explanation_structured: {
      outcome: 'NEW_CNMC_CANDIDATE',
      recommendation_strength: 'HIGH',
      generation_method: 'TAXONOMY_RULE_BASED',
      format_version: 'MVP_CNMC_V1',
      recommendation_reason: "Generated new prototype CNMC candidate 'IN-IND-MECH-BLT-00492' from sector 'IND', category 'MECH', type 'BLT'.",
      taxonomy_signals: { sector: 'IND', category: 'MECH', material_type: 'BLT' },
      matching_signals: { top_match_type: 'EXACT_MATCH_CANDIDATE', composite_confidence: 0.98 },
      warnings: ['Prototype recommendation generated within SIH 2026 MVP demonstration governance workflow.'],
      missing_information: [],
      governance_notice: 'Recommended within the SIH MVP demonstration governance workflow. Does not constitute official Government of India national standard approval.'
    },
    source_materials: [
      {
        material_id: 'mat-001',
        organization_code: 'IOCL',
        organization_name: 'Indian Oil Corporation',
        canonical_description: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
        uom: 'EA',
        material_grade: 'SS304',
        standard_code: 'IS 1363'
      },
      {
        material_id: 'mat-002',
        organization_code: 'ONGC',
        organization_name: 'ONGC Limited',
        canonical_description: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
        uom: 'EA',
        material_grade: 'SS304',
        standard_code: 'IS 1363'
      }
    ]
  },
  {
    id: 'cand-002',
    proposed_cnmc: 'IN-IND-MECH-BLT-47854',
    candidate_group_name: 'Hexagon Head Bolt, M20 x 70 mm, Grade 8.8 Carbon Steel',
    proposed_description: 'MVP Prototype Master Specification: Hexagon Head Bolt, M20 x 70 mm, Grade 8.8 Carbon Steel [Standard: IS 1363] [Grade: 8.8]',
    confidence_score: 0.90,
    generation_source: 'ENGINE_V1_TAXONOMY_RULE_BASED',
    status: 'PENDING_REVIEW',
    created_at: '2026-09-08T11:15:00Z',
    updated_at: '2026-09-08T11:15:00Z',
    explanation_structured: {
      outcome: 'NEW_CNMC_CANDIDATE',
      recommendation_strength: 'HIGH',
      generation_method: 'TAXONOMY_RULE_BASED',
      format_version: 'MVP_CNMC_V1',
      recommendation_reason: "Generated prototype CNMC candidate 'IN-IND-MECH-BLT-47854' for Grade 8.8 structural bolt.",
      taxonomy_signals: { sector: 'IND', category: 'MECH', material_type: 'BLT' },
      matching_signals: {},
      warnings: [],
      missing_information: [],
      governance_notice: 'Recommended within the SIH MVP demonstration governance workflow.'
    },
    source_materials: [
      {
        material_id: 'mat-003',
        organization_code: 'NTPC',
        organization_name: 'NTPC Limited',
        canonical_description: 'Hexagon Head Bolt, M20 x 70 mm, Grade 8.8 Carbon Steel',
        uom: 'EA',
        material_grade: '8.8',
        standard_code: 'IS 1363'
      }
    ]
  }
];

export const GovernanceReviewQueue: React.FC<GovernanceReviewQueueProps> = ({
  onSelectCandidate,
  refreshTrigger
}) => {
  const [candidates, setCandidates] = useState<CNMCCandidateItem[]>(INITIAL_DEMO_CANDIDATES);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await fetchCNMCCandidates(statusFilter === 'ALL' ? undefined : statusFilter, searchTerm || undefined);
      if (data && data.length > 0) {
        setCandidates(data);
      } else {
        setCandidates(INITIAL_DEMO_CANDIDATES);
      }
    } catch {
      setCandidates(INITIAL_DEMO_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [statusFilter, refreshTrigger]);

  const filteredCandidates = candidates.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      c.proposed_cnmc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.candidate_group_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-300 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      case 'MODIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-300 px-2.5 py-0.5 rounded-full">
            <Edit3 className="w-3 h-3 text-blue-600" /> Modified
          </span>
        );
      case 'PENDING_REVIEW':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls: Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate CNMC or material title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'MODIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md transition-all font-medium text-xs ${
                statusFilter === st
                  ? 'bg-gov-navy text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadCandidates}
          className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:text-gov-navy hover:border-slate-400 shadow-sm transition-all"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Queue Table */}
      <Card
        title="Human Governance Review Queue"
        subtitle={`Showing ${filteredCandidates.length} candidate proposal(s) awaiting domain verification.`}
        icon={<CheckSquare className="w-5 h-5 text-gov-navy" />}
      >
        <div className="overflow-x-auto -mx-6 -mb-6">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Proposed Prototype CNMC</th>
                <th className="py-3 px-4">Material Cluster Title</th>
                <th className="py-3 px-4">Generation Source</th>
                <th className="py-3 px-4">Confidence / Strength</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-gov-navy flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{candidate.proposed_cnmc}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 truncate">{candidate.candidate_group_name}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{candidate.proposed_description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {candidate.generation_source}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        {(candidate.confidence_score * 100).toFixed(0)}% HIGH
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(candidate.status)}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onSelectCandidate(candidate)}
                        className="py-1 px-3 bg-white hover:bg-gov-navy hover:text-white text-gov-navy border border-slate-300 hover:border-gov-navy rounded-lg font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
                      >
                        <span>Examine</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No candidate proposals found matching current filter.
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
