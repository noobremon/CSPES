import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Tag, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Database,
  ArrowUpRight
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
    enterprise: 'CPSE B (Oil and Natural Gas Corp)',
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
    <div className="space-y-6 text-left">
      {/* 1. National Material Intelligence Hero Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
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

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 self-stretch lg:self-auto justify-end">
          <IndiaMapGraphic />

          <div className="flex flex-col gap-2">
            <div className="px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#334155] text-center shadow-2xs">
              <span className="font-extrabold text-[#0F172A] text-sm block">4 Roles</span>
              <span className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">RBAC Enabled</span>
            </div>
            <div className="px-3 py-1 bg-[#EFF6FF] border border-blue-200 rounded-lg text-[#1D4ED8] text-[10px] font-bold tracking-wider text-center uppercase">
              SIH MVP Prototype
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Governance Scope Notice */}
      <div className="rounded-2xl border border-[#F3D19C] bg-[#FFF7E6] p-4 flex items-start gap-3.5 text-xs text-[#78350F] shadow-2xs">
        <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
          !
        </div>
        <div className="leading-relaxed">
          <strong className="text-[#92400E] uppercase tracking-wider">MANDATORY GOVERNANCE SCOPE NOTICE:</strong>{' '}
          All Common National Material Codes (CNMCs) generated in this platform use the{' '}
          <code className="bg-[#FFFBEB] border border-[#F3D19C] px-1.5 py-0.5 rounded text-[#92400E] font-mono font-bold">
            {current.proposed_cnmc}
          </code>{' '}
          CNMC Reference Format for SIH 2026 evaluation. Approvals are strictly within the demonstration governance workflow and do not constitute official Government of India or DPE statutory codification.
        </div>
      </div>

      {/* 3. Scenario Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0] p-3.5 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1E3A8A]" />
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B]">Materials Analyzed</span>
            <Database className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F172A]">12,480</div>
          <div className="text-[10px] text-[#15803D] font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 12% vs last run</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B]">Duplicate Candidates</span>
            <Layers className="w-3.5 h-3.5 text-[#D97706]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F172A]">4,210</div>
          <div className="text-[10px] text-[#15803D] font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 8% vs last run</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B]">Cross-CPSE Matches</span>
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F172A]">1,840</div>
          <div className="text-[10px] text-[#15803D] font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 15% vs last run</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B]">CNMC Candidates</span>
            <FileText className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F172A]">736</div>
          <div className="text-[10px] text-[#15803D] font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 11% vs last run</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B]">Potential Savings</span>
            <span className="text-xs font-bold text-[#15803D]">₹</span>
          </div>
          <div className="text-xl font-extrabold text-[#15803D]">₹ 2.8 Cr</div>
          <div className="text-[10px] text-[#15803D] font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 18% est. impact</span>
          </div>
        </div>
      </div>

      {/* 5. 3-Step Intelligent Pipeline Workflow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
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
          icon={<Cpu className="w-5 h-5 text-[#2563EB]" />}
        >
          <div className="space-y-4 text-xs pt-1">
            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Match Evidence:</span>
                <span className="text-[#15803D] font-bold bg-[#ECFDF3] px-2.5 py-0.5 rounded border border-[#BBF7D0]">
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
                  <span className="font-bold text-[#15803D]">
                    {current.evidence_score}% Match Evidence
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Recommendation Engine Methodology
              </span>
              <div className="space-y-2 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span>Semantic Similarity (NLP)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span>Technical Attribute Matching</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
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
          icon={<Tag className="w-5 h-5 text-[#15803D]" />}
        >
          <div className="space-y-4 text-xs pt-1">
            {/* Proposed CNMC Code Box */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                Proposed CNMC
              </span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-extrabold text-[#0F172A] tracking-wide">
                  {current.proposed_cnmc}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-white border border-[#BBF7D0] text-[#15803D] hover:bg-[#ECFDF3] rounded-lg transition-colors cursor-pointer"
                  title="Copy CNMC to clipboard"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Taxonomy Breakdown */}
            <div className="space-y-2 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#64748B]">Material Class</span>
                <span className="font-bold text-[#0F172A]">{current.material_class}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#64748B]">Category</span>
                <span className="font-bold text-[#0F172A]">{current.category}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#64748B]">Standard Reference</span>
                <span className="font-bold text-[#0F172A]">{current.standard_ref}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-[#E2E8F0] pt-1.5">
                <span className="text-[#64748B]">Confidence Score</span>
                <span className="font-extrabold text-[#15803D]">{current.confidence_score}%</span>
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
