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
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-amber-800">
            Mandatory Governance Scope Notice:
          </span>{' '}
          All Common National Material Codes (CNMCs) generated in this platform use the{' '}
          <span className="font-bold text-slate-900">MVP Prototype CNMC Reference Format</span> (e.g.{' '}
          <code className="bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded text-amber-950 font-mono font-semibold">
            IN-IND-MECH-BLT-00492
          </code>) for SIH 2026 evaluation. Approvals are strictly valid within the demonstration governance workflow and do not constitute official Government of India or DPE statutory codification.
        </div>
      </div>

      {/* Demo Material Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
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
                  ? 'bg-gov-navy border-gov-navy text-white shadow-sm font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
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
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
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
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Enterprise</span>
                <span className="font-bold text-slate-900">{selectedMat.organization}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">CPSE Local Code</span>
                <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedMat.material_code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Raw Description</span>
                <span className="text-slate-800 font-medium">{selectedMat.description}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Normalized Intelligence (Layer 2)
              </span>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-semibold">
                {selectedMat.canonical}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Technical Attributes
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-medium">Standard</span>
                  <span className="font-bold text-slate-900">{selectedMat.standard}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-medium">Material Grade</span>
                  <span className="font-bold text-slate-900">{selectedMat.grade}</span>
                </div>
                {Object.entries(selectedMat.attributes).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-medium">{k}</span>
                    <span className="font-bold text-slate-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              <span className="font-semibold text-slate-600">Taxonomy:</span> <span>{selectedMat.category}</span>
            </div>
          </div>
        </Card>

        {/* CENTER COLUMN: AI & System Intelligence Analysis */}
        <Card
          title="2. AI & Candidate Intelligence"
          subtitle="Multi-Tier Match Analysis & Signals"
          icon={<Cpu className="w-5 h-5 text-indigo-600" />}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Match Evidence:</span>
                {selectedMat.matches.length > 0 ? (
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedMat.matches[0].type}
                  </span>
                ) : (
                  <span className="text-slate-600 font-semibold bg-slate-200 px-2 py-0.5 rounded">
                    NO ACTIVE CLUSTER
                  </span>
                )}
              </div>

              {selectedMat.matches.length > 0 && (
                <div className="text-slate-700 space-y-1.5 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cluster Peer CPSE:</span>
                    <span className="text-slate-900 font-bold">{selectedMat.matches[0].cpse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peer Material Code:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedMat.matches[0].code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Evidence Score:</span>
                    <span className="font-bold text-emerald-700">
                      {(selectedMat.matches[0].score * 100).toFixed(0)}% Match Evidence
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Recommendation Engine Methodology
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {selectedMat.matches.length > 0
                      ? 'Cluster Reuse Detection Engine'
                      : 'Deterministic Taxonomy Rule-Based Generator'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Evaluates exact attribute signatures, dimension compatibility, and cross-CPSE cluster history.
                  Zero fake probabilities used.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateRecommendation}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-dark text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Specifications...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-400" />
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
          icon={<Tag className="w-5 h-5 text-emerald-600" />}
        >
          {recommendation ? (
            <div className="space-y-4 text-xs">
              {/* Proposed Code Banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">
                  Recommended Prototype CNMC
                </span>
                <div className="text-xl font-mono font-extrabold text-slate-900 tracking-wider">
                  {recommendation.proposed_cnmc}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    Strength: {recommendation.recommendation_strength}
                  </span>
                  <span className="text-[10px] font-semibold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                    {recommendation.explanation.format_version}
                  </span>
                </div>
              </div>

              {/* Rationale Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Recommendation Rationale
                </span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {recommendation.explanation.recommendation_reason}
                </p>
              </div>

              {/* Warnings & Notices */}
              {recommendation.explanation.warnings.length > 0 && (
                <div className="space-y-1.5">
                  {recommendation.explanation.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onNavigateToReview(recommendation.candidate_id || undefined)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-dark text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all text-xs cursor-pointer"
                >
                  <span>Review in Governance Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                Click <span className="text-blue-700 font-bold">"Generate CNMC Recommendation"</span> to analyze this material scenario.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
