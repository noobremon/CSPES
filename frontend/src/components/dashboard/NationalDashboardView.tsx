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
  Compass
} from 'lucide-react';
import { Card } from '../ui/Card';
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
  onNavigateToAnalytics?: () => void;
}

export const NationalDashboardView: React.FC<NationalDashboardViewProps> = ({
  onNavigateToWorkspace,
  onNavigateToAnalytics
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
    <div className="space-y-5 text-left font-sans">
      {/* 1. National Material Intelligence Hero Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#1E3A8A] flex items-center gap-1.5">
              <span>🇮🇳</span> BHARAT | COMMON STANDARDS | STRONGER TOGETHER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            National Material Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-medium">
            Unified material analysis, AI-assisted matching, CNMC recommendation, and human governance for cross-CPSE material standardization.
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0 self-stretch lg:self-auto justify-between lg:justify-end">
          <IndiaMapGraphic />

          <div className="flex flex-col gap-2 shrink-0">
            <div className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-center shadow-xs">
              <span className="font-extrabold text-[#0F172A] text-lg block leading-none">4</span>
              <span className="text-[10px] text-[#475569] font-bold block mt-1">4 Roles</span>
              <span className="text-[9px] text-[#64748B] font-medium block">RBAC Enabled</span>
            </div>
            <div className="px-3 py-1 bg-[#EFF6FF] border border-blue-200 rounded-xl text-[#1D4ED8] text-[11px] font-bold tracking-tight text-center">
              SIH MVP Prototype
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Governance Scope Notice */}
      <div className="rounded-2xl border border-[#F3D19C] bg-[#FFF7E6] p-4 flex items-start gap-3.5 text-xs text-[#78350F] shadow-2xs">
        <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
          !
        </div>
        <div className="leading-relaxed">
          <strong className="text-[#92400E] font-bold">MANDATORY GOVERNANCE SCOPE NOTICE:</strong>{' '}
          All Common National Material Codes (CNMCs) generated in this platform use the{' '}
          <span className="bg-[#FEF3C7] border border-[#FCD34D] px-1.5 py-0.5 rounded text-[#92400E] font-mono font-bold">
            {current.proposed_cnmc}
          </span>{' '}
          CNMC Reference Format (e.g. <span className="font-bold text-[#92400E]">{current.proposed_cnmc}</span> for SIH 2026 evaluation. Approvals are strictly valid within the demonstration governance workflow and do not constitute official Government of India or DPE statutory codification.
        </div>
      </div>

      {/* 3. Scenario Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0] px-4 py-3 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-bold text-[#0F172A]">
            Select Ingested Material Scenario:
          </span>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioIndex(idx)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:bg-white hover:text-[#0F172A]'
                }`}
              >
                {sc.org_code}: {sc.material_code}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Top 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-lg font-extrabold text-[#0F172A]">12,480</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Materials Analyzed</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 12% vs last run</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-lg font-extrabold text-[#0F172A]">4,210</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Duplicate Candidates</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 8% vs last run</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-lg font-extrabold text-[#0F172A]">1,840</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Cross-CPSE Matches</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 15% vs last run</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-lg font-extrabold text-[#0F172A]">736</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">CNMC Candidates</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 11% vs last run</span>
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center font-bold text-lg shrink-0">
            ₹
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-lg font-extrabold text-[#0F172A]">₹ 2.8 Cr</div>
            <div className="text-[11px] font-medium text-[#64748B] leading-tight">Potential Savings</div>
            <div className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
              <span>↑ 18% est. impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 3-Step Intelligent Pipeline Workflow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Source CPSE Material */}
        <Card
          title="1. Source CPSE Material"
          subtitle="Layer 1 & 2 Normalized Ingestion Data"
          icon={<Building2 className="w-5 h-5 text-[#2563EB]" />}
        >
          <div className="space-y-4 text-xs pt-1">
            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Enterprise</span>
                <span className="font-bold text-[#0F172A]">{current.enterprise}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">CPSE Local Code</span>
                <span className="font-mono text-[#1D4ED8] font-bold bg-[#EFF6FF] px-2 py-0.5 rounded border border-blue-200">
                  {current.material_code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Raw Description</span>
                <span className="text-[#0F172A] font-semibold">{current.raw_description}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#475569]">
                Normalized Intelligence (Layer 2)
              </span>
              <p className="text-[#0F172A] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] leading-relaxed font-semibold">
                {current.normalized_intelligence}
              </p>
            </div>

            <div className="pt-2 text-right">
              <button 
                onClick={onNavigateToWorkspace}
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Card 2: AI & Candidate Intelligence */}
        <Card
          title="2. AI & Candidate Intelligence"
          subtitle="Multi-Tier Match Analysis & Signals"
          icon={<Cpu className="w-5 h-5 text-[#6366F1]" />}
        >
          <div className="space-y-4 text-xs pt-1">
            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Match Evidence:</span>
                <span className="text-[#059669] font-bold bg-[#ECFDF5] px-2.5 py-0.5 rounded border border-[#A7F3D0] text-[10px]">
                  {current.match_evidence}
                </span>
              </div>

              <div className="text-[#475569] space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Cluster Peer CPSE:</span>
                  <span className="text-[#0F172A] font-bold">{current.cluster_peer_cpse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Peer Material Code:</span>
                  <span className="font-mono font-bold text-[#0F172A]">{current.peer_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Evidence Score:</span>
                  <span className="font-bold text-[#059669]">
                    {current.evidence_score}% Match Evidence
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#475569]">
                Recommendation Engine Methodology
              </span>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#0F172A]">
                  <div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Semantic Similarity (NLP)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#0F172A]">
                  <div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Technical Attribute Matching</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#0F172A]">
                  <div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Standards & Specification Check</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Prototype CNMC Recommendation */}
        <Card
          title="3. Prototype CNMC Recommendation"
          subtitle="MVP Reference Format Output"
          icon={<Tag className="w-5 h-5 text-[#16A34A]" />}
        >
          <div className="space-y-4 text-xs pt-1">
            {/* Proposed CNMC Code Box */}
            <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46]">
                Proposed CNMC
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-base sm:text-lg font-mono font-extrabold text-[#065F46] tracking-wide">
                    {current.proposed_cnmc}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-white border border-[#A7F3D0] text-[#059669] hover:bg-[#D1FAE5] rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Copy CNMC to clipboard"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Taxonomy Breakdown Table */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Material Class</span>
                <span className="font-bold text-[#0F172A]">{current.material_class}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Category</span>
                <span className="font-bold text-[#0F172A]">{current.category}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Standard Reference</span>
                <span className="font-bold text-[#0F172A]">{current.standard_ref}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Confidence Score</span>
                <span className="font-extrabold text-[#16A34A] text-sm">{current.confidence_score}%</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onNavigateToAnalytics}
                className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
              >
                <span>Generate Detailed Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
