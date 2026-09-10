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
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-[#15803D]" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-[#B91C1C]" /> Rejected
          </span>
        );
      case 'MODIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200 px-2.5 py-0.5 rounded-full">
            <Edit3 className="w-3 h-3 text-[#2563EB]" /> Modified
          </span>
        );
      case 'PENDING_REVIEW':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FFF7E6] text-[#92400E] border border-[#F3D19C] px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-[#D97706]" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls: Filters & Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate CNMC or material title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-[#CBD5E1] text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0] text-xs">
          {['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'MODIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md transition-all font-medium text-xs cursor-pointer ${
                statusFilter === st
                  ? 'bg-gov-navy text-white font-semibold shadow-2xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadCandidates}
          className="p-2 bg-white border border-[#CBD5E1] rounded-lg text-[#475569] hover:text-gov-navy hover:border-slate-400 shadow-2xs transition-all cursor-pointer"
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
          <table className="w-full text-left text-xs text-[#475569]">
            <thead className="bg-[#F8FAFC] border-y border-[#E2E8F0] text-[#475569] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Proposed Prototype CNMC</th>
                <th className="py-3 px-4">Material Cluster Title</th>
                <th className="py-3 px-4">Generation Source</th>
                <th className="py-3 px-4">Confidence / Strength</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-gov-navy flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span>{candidate.proposed_cnmc}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-[#0F172A] truncate">{candidate.candidate_group_name}</div>
                      <div className="text-[11px] text-[#64748B] truncate mt-0.5">{candidate.proposed_description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">
                      {candidate.generation_source}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#15803D] bg-[#ECFDF3] border border-[#BBF7D0] px-2 py-0.5 rounded text-[11px]">
                        {(candidate.confidence_score * 100).toFixed(0)}% HIGH
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(candidate.status)}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onSelectCandidate(candidate)}
                        className="py-1 px-3 bg-white hover:bg-gov-navy hover:text-white text-gov-navy border border-[#CBD5E1] hover:border-gov-navy rounded-lg font-semibold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Examine</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B]">
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
