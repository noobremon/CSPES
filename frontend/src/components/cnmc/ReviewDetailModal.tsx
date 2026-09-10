import React, { useState } from 'react';
import { CNMCCandidateItem, CNMCReviewSubmission } from '../../types';
import { submitCNMCReview } from '../../services/api';
import {
  X,
  CheckCircle2,
  XCircle,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  Cpu,
  Building2,
  Tag,
  RefreshCw
} from 'lucide-react';

interface ReviewDetailModalProps {
  candidate: CNMCCandidateItem;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  candidate,
  onClose,
  onReviewSubmitted
}) => {
  const [activeAction, setActiveAction] = useState<'APPROVE' | 'REJECT' | 'MODIFY'>('APPROVE');
  const [comments, setComments] = useState<string>('');
  const [modifiedCNMC, setModifiedCNMC] = useState<string>(candidate.proposed_cnmc);
  const [modifiedTitle, setModifiedTitle] = useState<string>(candidate.candidate_group_name);
  const [modifiedDesc, setModifiedDesc] = useState<string>(candidate.proposed_description);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if ((activeAction === 'REJECT' || activeAction === 'MODIFY') && (!comments || comments.trim().length < 5)) {
      setError(`A mandatory justification comment (minimum 5 characters) is required to ${activeAction.toLowerCase()} this candidate.`);
      return;
    }

    setSubmitting(true);
    try {
      const submission: CNMCReviewSubmission = {
        action: activeAction,
        reviewer_reference: 'domain_reviewer_01@gov.in',
        comments: comments,
        modified_cnmc: activeAction === 'MODIFY' ? modifiedCNMC : undefined,
        modified_group_name: activeAction === 'MODIFY' ? modifiedTitle : undefined,
        modified_description: activeAction === 'MODIFY' ? modifiedDesc : undefined,
      };

      // If candidate is a synthetic demo ID, emulate instant success
      if (candidate.id.startsWith('cand-')) {
        candidate.status = activeAction === 'APPROVE' ? 'APPROVED' : activeAction === 'REJECT' ? 'REJECTED' : 'MODIFIED';
      } else {
        await submitCNMCReview(candidate.id, submission);
      }

      onReviewSubmitted();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit governance review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const expl = candidate.explanation_structured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gov-navy border-b border-[#0F2F4F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 text-white rounded-lg border border-white/20 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Governance Review Decision Detail
                </h3>
                <span className="text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded font-mono font-bold">
                  {candidate.proposed_cnmc}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                Authorized Domain Reviewer Resolution Console • Smart India Hackathon 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Column Layout */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Mandatory Boundary Notice */}
          <div className="p-3.5 bg-[#FFF7E6] border border-[#F3D19C] rounded-xl text-[#78350F] flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-bold uppercase text-[#92400E]">Statutory Notice:</span> Approvals made in this console are strictly valid within the demonstration governance workflow and do not constitute Government of India statutory codification.
            </div>
          </div>

          {/* Section 1: Candidate Proposal Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                Proposed CNMC
              </span>
              <div className="text-lg font-mono font-bold text-gov-navy">{candidate.proposed_cnmc}</div>
              <div className="text-[#0F172A] font-semibold pt-1">{candidate.candidate_group_name}</div>
              <p className="text-[11px] text-[#475569] leading-relaxed bg-white p-2.5 rounded border border-[#E2E8F0] shadow-2xs">
                {candidate.proposed_description}
              </p>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2.5">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                Explainability & Evidence Signals
              </span>
              <div className="flex justify-between items-center text-[#475569]">
                <span>Recommendation Strength:</span>
                <span className="font-bold text-[#15803D] bg-[#ECFDF3] border border-[#BBF7D0] px-2 py-0.5 rounded text-[11px]">
                  {(candidate.confidence_score * 100).toFixed(0)}% HIGH
                </span>
              </div>
              <div className="flex justify-between items-center text-[#475569]">
                <span>Generation Methodology:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{candidate.generation_source}</span>
              </div>
              <div className="text-[11px] text-[#475569] bg-white p-2.5 rounded border border-[#E2E8F0] shadow-2xs leading-relaxed">
                {typeof expl === 'object' && expl && 'recommendation_reason' in expl
                  ? String(expl.recommendation_reason)
                  : "Derived deterministically from normalized technical attributes and engineering taxonomy."}
              </div>
            </div>
          </div>

          {/* Section 2: Associated CPSE Materials Cluster */}
          {candidate.source_materials && candidate.source_materials.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Cluster Members (CPSE Cross-Walk Candidates)
              </span>
              <div className="overflow-hidden border border-[#E2E8F0] rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] text-[10px] font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">CPSE</th>
                      <th className="py-2.5 px-3">Canonical Description</th>
                      <th className="py-2.5 px-3">Standard</th>
                      <th className="py-2.5 px-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                    {candidate.source_materials.map((m, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-semibold text-gov-navy">{m.organization_code}</td>
                        <td className="py-2.5 px-3">{m.canonical_description}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#475569]">{m.standard_code || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#475569]">{m.material_grade || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Human Governance Action Resolution Form */}
          <div className="p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-4">
            <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider block">
              3. Human Reviewer Action
            </span>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveAction('APPROVE')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 border transition-all focus:outline-hidden focus:ring-2 focus:ring-[#15803D] cursor-pointer ${
                  activeAction === 'APPROVE'
                    ? 'bg-[#15803D] border-[#166534] text-white shadow-xs'
                    : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#15803D] hover:border-[#BBF7D0]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction('REJECT')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 border transition-all focus:outline-hidden focus:ring-2 focus:ring-[#B91C1C] cursor-pointer ${
                  activeAction === 'REJECT'
                    ? 'bg-[#B91C1C] border-[#991B1B] text-white shadow-xs'
                    : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#B91C1C] hover:border-[#FECACA]'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction('MODIFY')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 border transition-all focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer ${
                  activeAction === 'MODIFY'
                    ? 'bg-gov-navy border-gov-navy text-white shadow-xs'
                    : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:text-gov-navy hover:border-slate-400'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>MODIFY</span>
              </button>
            </div>

            {/* Modify Overrides Form */}
            {activeAction === 'MODIFY' && (
              <div className="p-4 bg-white rounded-lg border border-[#E2E8F0] shadow-2xs space-y-3">
                <span className="text-[10px] font-bold text-gov-navy uppercase tracking-wider block">
                  Reviewer Overrides (Original Recommendation Will Be Preserved in History)
                </span>
                <div className="space-y-1.5">
                  <label className="text-[#475569] block text-[11px] font-medium">Modified CNMC Code:</label>
                  <input
                    type="text"
                    value={modifiedCNMC}
                    onChange={(e) => setModifiedCNMC(e.target.value)}
                    className="w-full p-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] font-mono text-xs hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#475569] block text-[11px] font-medium">Modified Group Title:</label>
                  <input
                    type="text"
                    value={modifiedTitle}
                    onChange={(e) => setModifiedTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] text-xs hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>
            )}

            {/* Comments / Mandatory Justification Field */}
            <div className="space-y-1.5">
              <label className="text-[#0F172A] font-medium block text-xs">
                Review Justification Comments {activeAction !== 'APPROVE' && <span className="text-[#B91C1C] font-bold">* (Mandatory)</span>}:
              </label>
              <textarea
                rows={3}
                placeholder={
                  activeAction === 'APPROVE'
                    ? 'Optional approval comments or governance notes...'
                    : `Provide mandatory technical justification for ${activeAction.toLowerCase()}ing this candidate...`
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder-[#64748B] hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-xs"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[#B91C1C] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-slate-400 text-[#475569] hover:text-gov-navy font-semibold transition-colors text-xs shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-gov-navy hover:bg-gov-navy-dark text-white font-semibold flex items-center gap-2 shadow-xs transition-all text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Confirm & Submit Decision</span>
          </button>
        </div>
      </div>
    </div>
  );
};

