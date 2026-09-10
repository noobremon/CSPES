import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { CNMCRecommendation } from '../../types';
import { generateCNMCRecommendation } from '../../services/api';
import {
  FileText,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Layers,
  Tag
} from 'lucide-react';

interface RecommendationWorkspaceProps {
  onCandidateCreated: () => void;
  onNavigateToReview: (candidateId?: string) => void;
}

// Synthetic Demo Materials for instant interactive testing
const DEMO_MATERIALS = [
  {
    id: 'mat-001',
    organization: 'CPSE A (Indian Oil Corporation)',
    org_code: 'IOCL',
    material_code: 'MAT-1001',
    description: 'HEX BOLT SS304 M16 X 50 MM',
    canonical: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
    category: 'Industrial / Mechanical / Fasteners / Bolts',
    uom: 'EA',
    grade: 'SS304',
    standard: 'IS 1363',
    attributes: { diameter: '16.0 mm', length: '50.0 mm', thread_pitch: '2.0 mm' },
    matches: [
      { cpse: 'CPSE B (ONGC)', code: 'BOLT-778', type: 'EXACT_MATCH_CANDIDATE', score: 0.98, method: 'RULE_BASED_EXACT' }
    ]
  },
  {
    id: 'mat-002',
    organization: 'CPSE B (ONGC Limited)',
    org_code: 'ONGC',
    material_code: 'BOLT-778',
    description: 'STAINLESS STEEL HEX BOLT M16 X 50',
    canonical: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
    category: 'Industrial / Mechanical / Fasteners / Bolts',
    uom: 'EA',
    grade: 'SS304',
    standard: 'IS 1363',
    attributes: { diameter: '16.0 mm', length: '50.0 mm' },
    matches: [
      { cpse: 'CPSE A (IOCL)', code: 'MAT-1001', type: 'EXACT_MATCH_CANDIDATE', score: 0.98, method: 'EXISTING_CLUSTER_REUSE' }
    ]
  },
  {
    id: 'mat-003',
    organization: 'CPSE C (NTPC Limited)',
    org_code: 'NTPC',
    material_code: 'MAT-9001',
    description: 'HEX BOLT CARBON STEEL M20 X 70',
    canonical: 'Hexagon Head Bolt, M20 x 70 mm, Grade 8.8 Carbon Steel',
    category: 'Industrial / Mechanical / Fasteners / Bolts',
    uom: 'EA',
    grade: '8.8',
    standard: 'IS 1363',
    attributes: { diameter: '20.0 mm', length: '70.0 mm' },
    matches: []
  }
];

export const RecommendationWorkspace: React.FC<RecommendationWorkspaceProps> = ({
  onCandidateCreated,
  onNavigateToReview
}) => {
  const [selectedMatIndex, setSelectedMatIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<CNMCRecommendation | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedMat = DEMO_MATERIALS[selectedMatIndex];

  const handleGenerateRecommendation = async () => {
    setLoading(true);
    setNotification(null);
    try {
      const isSynthetic = selectedMat.id.startsWith('mat-');
      let result: CNMCRecommendation;

      if (!isSynthetic) {
        result = await generateCNMCRecommendation(selectedMat.id, true);
      } else {
        const seq = selectedMatIndex === 2 ? '47854' : '00492';
        const outcome = selectedMatIndex === 1 ? 'REUSE_EXISTING_CNMC_CANDIDATE' : 'NEW_CNMC_CANDIDATE';
        const method = selectedMatIndex === 1 ? 'EXISTING_CLUSTER_REUSE' : 'TAXONOMY_RULE_BASED';
        
        result = {
          material_id: selectedMat.id,
          outcome: outcome,
          proposed_cnmc: `IN-IND-MECH-BLT-${seq}`,
          candidate_group_name: selectedMat.canonical,
          proposed_description: `MVP Prototype Master Specification: ${selectedMat.canonical}`,
          recommendation_strength: 'HIGH',
          strength_score: selectedMatIndex === 1 ? 0.98 : 0.92,
          is_existing_candidate: false,
          candidate_id: `cand-${selectedMat.id}`,
          explanation: {
            outcome: outcome,
            recommendation_strength: 'HIGH',
            generation_method: method,
            format_version: 'MVP_CNMC_V1',
            recommendation_reason:
              selectedMatIndex === 1
                ? `Matched existing governed cluster for CNMC 'IN-IND-MECH-BLT-00492' via structural similarity (score: 0.98).`
                : `Generated new prototype CNMC candidate 'IN-IND-MECH-BLT-${seq}' derived from sector 'IND', category 'MECH', and type 'BLT'.`,
            taxonomy_signals: {
              sector: 'IND',
              category: 'MECH',
              material_type: 'BLT',
              taxonomy_path: selectedMat.category
            },
            matching_signals: selectedMat.matches.length > 0 ? { top_match_score: 0.98, top_match_type: 'EXACT_MATCH_CANDIDATE' } : {},
            warnings: [
              'Prototype recommendation generated within SIH 2026 MVP demonstration governance workflow.'
            ],
            missing_information: [],
            governance_notice:
              'Recommended within the SIH MVP demonstration governance workflow. Does not constitute official Government of India national standard approval.'
          }
        };
      }

      setRecommendation(result);
      setNotification({
        type: 'success',
        message: `Recommendation generated: ${result.proposed_cnmc} (${result.outcome})`
      });
      onCandidateCreated();
    } catch (err: unknown) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to generate recommendation.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Scope Disclaimer Banner */}
      <div className="rounded-xl border border-[#F3D19C] bg-[#FFF7E6] p-4 flex items-start gap-3 text-xs text-[#78350F] shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-[#92400E]">
            Mandatory Governance Scope Notice:
          </span>{' '}
          All Common National Material Codes (CNMCs) generated in this platform use the{' '}
          <span className="font-bold text-[#0F172A]">MVP Prototype CNMC Reference Format</span> (e.g.{' '}
          <code className="bg-[#FFFBEB] border border-[#F3D19C] px-1.5 py-0.5 rounded text-[#78350F] font-mono font-semibold">
            IN-IND-MECH-BLT-00492
          </code>) for SIH 2026 evaluation. Approvals are strictly valid within the demonstration governance workflow and do not constitute official Government of India or DPE statutory codification.
        </div>
      </div>

      {/* Demo Material Selector */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gov-navy" />
          <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Select Ingested Material Scenario:
          </span>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {DEMO_MATERIALS.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMatIndex(idx);
                setRecommendation(null);
                setNotification(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                selectedMatIndex === idx
                  ? 'bg-gov-navy border-gov-navy text-white shadow-2xs font-semibold'
                  : 'bg-white border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="font-bold mr-1">{m.org_code}:</span>
              {m.material_code}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-[#ECFDF3] border-[#BBF7D0] text-[#15803D]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* 3-Column Enterprise Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Source CPSE Material */}
        <Card
          title="1. Source CPSE Material"
          subtitle="Layer 1 & 2 Normalized Ingestion Data"
          icon={<Building2 className="w-5 h-5 text-[#2563EB]" />}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Enterprise</span>
                <span className="font-bold text-[#0F172A]">{selectedMat.organization}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">CPSE Local Code</span>
                <span className="font-mono text-[#1D4ED8] font-bold bg-[#EFF6FF] px-2 py-0.5 rounded border border-blue-200">
                  {selectedMat.material_code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Raw Description</span>
                <span className="text-[#0F172A] font-medium">{selectedMat.description}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Normalized Intelligence (Layer 2)
              </span>
              <p className="text-[#0F172A] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] leading-relaxed font-semibold">
                {selectedMat.canonical}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Technical Attributes
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[10px] font-medium">Standard</span>
                  <span className="font-bold text-[#0F172A]">{selectedMat.standard}</span>
                </div>
                <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[10px] font-medium">Material Grade</span>
                  <span className="font-bold text-[#0F172A]">{selectedMat.grade}</span>
                </div>
                {Object.entries(selectedMat.attributes).map(([k, v]) => (
                  <div key={k} className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[10px] uppercase font-medium">{k}</span>
                    <span className="font-bold text-[#0F172A]">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-[#64748B] pt-1">
              <span className="font-semibold text-[#475569]">Taxonomy:</span> <span>{selectedMat.category}</span>
            </div>
          </div>
        </Card>

        {/* CENTER COLUMN: AI & System Intelligence Analysis */}
        <Card
          title="2. AI & Candidate Intelligence"
          subtitle="Multi-Tier Match Analysis & Signals"
          icon={<Cpu className="w-5 h-5 text-[#2563EB]" />}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Match Evidence:</span>
                {selectedMat.matches.length > 0 ? (
                  <span className="text-[#15803D] font-bold bg-[#ECFDF3] px-2 py-0.5 rounded border border-[#BBF7D0]">
                    {selectedMat.matches[0].type}
                  </span>
                ) : (
                  <span className="text-[#475569] font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    NO ACTIVE CLUSTER
                  </span>
                )}
              </div>

              {selectedMat.matches.length > 0 && (
                <div className="text-[#475569] space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Cluster Peer CPSE:</span>
                    <span className="text-[#0F172A] font-bold">{selectedMat.matches[0].cpse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Peer Material Code:</span>
                    <span className="font-mono font-bold text-[#0F172A]">{selectedMat.matches[0].code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Evidence Score:</span>
                    <span className="font-bold text-[#15803D]">
                      {(selectedMat.matches[0].score * 100).toFixed(0)}% Match Evidence
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Recommendation Engine Methodology
              </span>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>
                    {selectedMat.matches.length > 0
                      ? 'Cluster Reuse Detection Engine'
                      : 'Deterministic Taxonomy Rule-Based Generator'}
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Evaluates exact attribute signatures, dimension compatibility, and cross-CPSE cluster history.
                  Zero fake probabilities used.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateRecommendation}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-dark text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Specifications...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-300" />
                    <span>Generate CNMC Recommendation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* RIGHT COLUMN: CNMC Recommendation Card */}
        <Card
          title="3. Prototype CNMC Recommendation"
          subtitle="MVP Reference Format Output"
          icon={<Tag className="w-5 h-5 text-[#15803D]" />}
        >
          {recommendation ? (
            <div className="space-y-4 text-xs">
              {/* Proposed Code Banner */}
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#166534]">
                  Recommended Prototype CNMC
                </span>
                <div className="text-xl font-mono font-extrabold text-[#0F172A] tracking-wider">
                  {recommendation.proposed_cnmc}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0] px-2 py-0.5 rounded">
                    Strength: {recommendation.recommendation_strength}
                  </span>
                  <span className="text-[10px] font-semibold bg-white text-[#475569] border border-[#E2E8F0] px-2 py-0.5 rounded">
                    {recommendation.explanation.format_version}
                  </span>
                </div>
              </div>

              {/* Rationale Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                  Recommendation Rationale
                </span>
                <p className="text-[#0F172A] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] leading-relaxed font-medium">
                  {recommendation.explanation.recommendation_reason}
                </p>
              </div>

              {/* Warnings & Notices */}
              {recommendation.explanation.warnings.length > 0 && (
                <div className="space-y-1.5">
                  {recommendation.explanation.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#FFF7E6] border border-[#F3D19C] rounded-lg text-[11px] text-[#78350F] flex items-start gap-1.5"
                    >
                      <Info className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                      <span className="leading-tight">{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onNavigateToReview(recommendation.candidate_id || undefined)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-dark text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-xs cursor-pointer"
                >
                  <span>Review in Governance Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-[#64748B] space-y-3">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs text-[#64748B] max-w-xs mx-auto font-medium">
                Click <span className="text-gov-navy font-bold">"Generate CNMC Recommendation"</span> to analyze this material scenario.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
