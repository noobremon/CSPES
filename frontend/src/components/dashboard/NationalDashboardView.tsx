import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Tag, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers, 
  FileText, 
  Database,
  Share2,
  Users,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { IndiaMapGraphic } from '../common/IndiaMapGraphic';

interface ScenarioData {
  id: string;
  org_code: string;
  material_code: string;
  enterprise: string;
  raw_description: string;
  normalized_intelligence: string;
  standard: string;
  match_evidence: string;
  cluster_peer_cpse: string;
  peer_code: string;
  evidence_score: number;
  proposed_cnmc: string;
  material_class: string;
  category: string;
  standard_ref: string;
  confidence_score: number;
}

const SCENARIOS: ScenarioData[] = [
  {
    id: 'iocl-1001',
    org_code: 'IOCL',
    material_code: 'MAT-1001',
    enterprise: 'CPSE A (Indian Oil Corporation)',
    raw_description: 'HEX BOLT SS304 M16 X 50 MM',
    normalized_intelligence: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
    standard: 'IS 1363',
    match_evidence: 'EXACT_MATCH_CANDIDATE',
    cluster_peer_cpse: 'CPSE B (ONGC)',
    peer_code: 'BOLT-778',
    evidence_score: 98,
    proposed_cnmc: 'IN-IND-MECH-BLT-00492',
    material_class: 'Mechanical Fasteners',
    category: 'Bolts & Screws',
    standard_ref: 'IS 1363',
    confidence_score: 96,
  },
  {
    id: 'ongc-778',
    org_code: 'ONGC',
    material_code: 'BOLT-778',
    enterprise: 'CPSE B (ONGC)',
    raw_description: 'STAINLESS STEEL HEX BOLT M16 X 50',
    normalized_intelligence: 'Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)',
    standard: 'IS 1363',
    match_evidence: 'EXACT_MATCH_CANDIDATE',
    cluster_peer_cpse: 'CPSE A (IOCL)',
    peer_code: 'MAT-1001',
    evidence_score: 98,
    proposed_cnmc: 'IN-IND-MECH-BLT-00492',
    material_class: 'Mechanical Fasteners',
    category: 'Bolts & Screws',
    standard_ref: 'IS 1363',
    confidence_score: 98,
  },
  {
    id: 'ntpc-9001',
    org_code: 'NTPC',
    material_code: 'MAT-9001',
    enterprise: 'CPSE C (NTPC Limited)',
    raw_description: 'HEX BOLT CARBON STEEL M20 X 70',
    normalized_intelligence: 'Hexagon Head Bolt, M20 x 70 mm, Grade 8.8 Carbon Steel (IS 1363)',
    standard: 'IS 1363',
    match_evidence: 'PARTIAL_MATCH_CANDIDATE',
    cluster_peer_cpse: 'CPSE D (SAIL)',
    peer_code: 'SAIL-BLT-2070',
    evidence_score: 91,
    proposed_cnmc: 'IN-IND-MECH-BLT-47854',
    material_class: 'Mechanical Fasteners',
    category: 'Bolts & Screws',
    standard_ref: 'IS 1363',
    confidence_score: 92,
  },
];

interface NationalDashboardViewProps {
  onNavigateToWorkspace?: () => void;
  onNavigateToReview?: () => void;
}

export const NationalDashboardView: React.FC<NationalDashboardViewProps> = ({
  onNavigateToWorkspace,
  onNavigateToReview
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = SCENARIOS[selectedScenarioIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(current.proposed_cnmc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-left font-sans select-none">
      
      {/* 1. Hero / Page Introduction */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#1D4ED8] flex items-center gap-1.5">
              <span>🇮🇳</span> BHARAT | COMMON STANDARDS | STRONGER TOGETHER
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            NATIONAL MATERIAL INTELLIGENCE
          </h1>
          <p className="text-xs text-[#475569] leading-relaxed font-medium">
            Unified material analysis, AI-assisted matching, CNMC recommendation, and human governance for cross-CPSE material standardization.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 self-stretch lg:self-auto justify-between lg:justify-end">
          <IndiaMapGraphic />

          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] rounded-xl text-center shadow-2xs">
              <span className="font-extrabold text-[#0F172A] text-base block leading-none">4</span>
              <span className="text-[9px] text-[#475569] font-bold block mt-0.5">4 Roles</span>
              <span className="text-[8px] text-[#64748B] font-medium block">RBAC Enabled</span>
            </div>
            <div className="px-2.5 py-1 bg-[#EFF6FF] border border-blue-200 rounded-lg text-[#1D4ED8] text-[10px] font-bold tracking-tight text-center">
              Enterprise Master
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Governance Scope Notice */}
      <div className="rounded-xl border border-[#FCD34D] bg-[#FFFBEB] px-4 py-3 flex items-start gap-3 text-xs text-[#78350F] shadow-2xs">
        <div className="w-4 h-4 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-2xs">
          !
        </div>
        <div className="leading-relaxed text-[11px]">
          <strong className="text-[#92400E] font-bold">MANDATORY GOVERNANCE SCOPE NOTICE:</strong>{' '}
          All Common National Material Codes (CNMCs) generated in this framework use the{' '}
          <span className="bg-[#FEF3C7] border border-[#FCD34D] px-1 py-0.5 rounded text-[#92400E] font-mono font-bold">
            {current.proposed_cnmc}
          </span>{' '}
          CNMC Reference Format for cross-CPSE standardization evaluation. Approval is strictly within the demonstration governance workflow and does not constitute official Government of India or DPE statutory codification.
        </div>
      </div>

      {/* 3. Scenario Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0] px-4 py-2.5 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-bold text-[#0F172A]">
            SELECT INGESTED MATERIAL SCENARIO:
          </span>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioIndex(idx)}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                {sc.org_code}: {sc.material_code}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Top 5 KPI Metric Cards (Single Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-base font-extrabold text-[#0F172A]">12,480</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Materials Analyzed</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 12% vs last week</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-base font-extrabold text-[#0F172A]">4,210</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Duplicate Candidates</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 8% vs last week</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-base font-extrabold text-[#0F172A]">1,840</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Cross-CPSE Matches</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 15% vs last week</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-base font-extrabold text-[#0F172A]">736</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">CNMC Candidates</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 10% vs last week</span>
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center font-bold text-base shrink-0">
            ₹
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-base font-extrabold text-[#16A34A]">₹ 48.6 Cr</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Potential Savings</div>
            <div className="text-[10px] text-[#16A34A] font-bold">Estimated Opportunity</div>
          </div>
        </div>
      </div>

      {/* 5. 3-Column Main Intelligence Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* COLUMN 1: 1. SOURCE CPSE MATERIAL */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3 text-xs">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-2.5">
              <div className="p-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#0F172A] tracking-tight">
                  1. SOURCE CPSE MATERIAL
                </h3>
                <p className="text-[10px] text-[#64748B]">
                  Layer 1 & 2 Normalized Ingestion Data
                </p>
              </div>
            </div>

            {/* Key-Value Fields */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">Enterprise:</span>
                <span className="font-bold text-[#0F172A]">{current.enterprise}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">CPSE Local Code:</span>
                <span className="font-mono text-[#1D4ED8] font-bold bg-[#EFF6FF] px-1.5 py-0.2 rounded border border-blue-200">
                  {current.material_code}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">Raw Description:</span>
                <span className="font-bold text-[#0F172A]">{current.raw_description}</span>
              </div>
            </div>

            {/* Normalized Intelligence Layer 2 */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                NORMALIZED INTELLIGENCE LAYER 2
              </span>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-[11px] font-semibold text-[#0F172A] leading-relaxed">
                {current.normalized_intelligence}
              </div>
            </div>
          </div>

          <div className="pt-3 text-right">
            <button 
              onClick={onNavigateToWorkspace}
              className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* COLUMN 2: 2. AI & CANDIDATE INTELLIGENCE */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3 text-xs">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-2.5">
              <div className="p-1.5 bg-[#EEF2FF] text-[#6366F1] rounded-lg">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#0F172A] tracking-tight">
                  2. AI & CANDIDATE INTELLIGENCE
                </h3>
                <p className="text-[10px] text-[#64748B]">
                  Multi-Tier Match Analysis & Signals
                </p>
              </div>
            </div>

            {/* Match Evidence Box */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">Match Evidence:</span>
                <span className="font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.2 rounded text-[10px]">
                  {current.match_evidence}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">Cluster Peer CPSE:</span>
                <span className="font-bold text-[#0F172A]">{current.cluster_peer_cpse}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">Peer Material Code:</span>
                <span className="font-mono font-bold text-[#0F172A]">{current.peer_code}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">Evidence Score:</span>
                <span className="font-bold text-[#059669]">{current.evidence_score}% Match Evidence</span>
              </div>
            </div>

            {/* Methodology Section */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                RECOMMENDATION ENGINE METHODOLOGY
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0F172A]">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Semantic Similarity (NLP)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0F172A]">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Technical Attribute Matching</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0F172A]">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Standards & Specification Check</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: 3. CNMC RECOMMENDATION */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3 text-xs">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-2.5">
              <div className="p-1.5 bg-[#ECFDF5] text-[#16A34A] rounded-lg">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#0F172A] tracking-tight">
                  3. CNMC RECOMMENDATION
                </h3>
                <p className="text-[10px] text-[#64748B]">
                  National Reference Format Output
                </p>
              </div>
            </div>

            {/* Proposed CNMC Highlight Box */}
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-3 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#065F46]">
                PROPOSED CNMC
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0">
                    <Compass className="w-3 h-3" />
                  </div>
                  <span className="text-sm sm:text-base font-mono font-extrabold text-[#065F46] tracking-wide">
                    {current.proposed_cnmc}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-1 bg-white border border-[#A7F3D0] text-[#059669] hover:bg-[#D1FAE5] rounded-md transition-colors cursor-pointer shadow-2xs"
                  title="Copy CNMC to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Specs Table */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-[#64748B]">Material Class:</span>
                <span className="font-bold text-[#0F172A]">{current.material_class}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-[#64748B]">Category:</span>
                <span className="font-bold text-[#0F172A]">{current.category}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-[#64748B]">Standard Reference:</span>
                <span className="font-bold text-[#0F172A]">{current.standard_ref}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#64748B]">Confidence Score:</span>
                <span className="font-extrabold text-[#16A34A]">{current.confidence_score}%</span>
              </div>
            </div>
          </div>

          {/* Primary Blue CTA Button */}
          <div className="pt-3">
            <button
              onClick={onNavigateToReview || onNavigateToWorkspace}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-xs cursor-pointer"
            >
              <span>Generate CNMC Recommendation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
