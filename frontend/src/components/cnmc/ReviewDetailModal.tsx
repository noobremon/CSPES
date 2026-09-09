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
        reviewer_reference: 'domain_reviewer_01@sih.gov.in',
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
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gov-navy border-b border-gov-navy/80 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 text-white rounded-lg border border-white/20">
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
            className="p-1.5 text-slate-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Column Layout */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Mandatory Boundary Notice */}
          <div className="p-3.5 bg-gov-notice-bg border border-gov-notice-border rounded-xl text-slate-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-gov-saffron shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-bold uppercase text-slate-900">Statutory Notice:</span> Approvals made in this console are strictly valid within the SIH MVP demonstration governance workflow and do not constitute Government of India or national policy approval.
            </div>
          </div>

          {/* Section 1: Candidate Proposal Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Proposed Prototype CNMC
              </span>
              <div className="text-lg font-mono font-bold text-gov-navy">{candidate.proposed_cnmc}</div>
              <div className="text-slate-900 font-semibold pt-1">{candidate.candidate_group_name}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                {candidate.proposed_description}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Explainability & Evidence Signals
              </span>
              <div className="flex justify-between items-center text-slate-700">
                <span>Recommendation Strength:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                  {(candidate.confidence_score * 100).toFixed(0)}% HIGH
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Generation Methodology:</span>
                <span className="font-mono font-semibold text-slate-900">{candidate.generation_source}</span>
              </div>
              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200 shadow-2xs leading-relaxed">
                {typeof expl === 'object' && expl && 'recommendation_reason' in expl
                  ? String(expl.recommendation_reason)
                  : "Derived deterministically from normalized technical attributes and engineering taxonomy."}
              </div>
            </div>
          </div>

          {/* Section 2: Associated CPSE Materials Cluster */}
          {candidate.source_materials && candidate.source_materials.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Cluster Members (CPSE Cross-Walk Candidates)
              </span>
              <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">CPSE</th>
                      <th className="py-2.5 px-3">Canonical Description</th>
                      <th className="py-2.5 px-3">Standard</th>
                      <th className="py-2.5 px-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {candidate.source_materials.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-gov-navy">{m.organization_code}</td>
                        <td className="py-2.5 px-3">{m.canonical_description}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{m.standard_code || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{m.material_grade || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Human Governance Action Resolution Form */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              3. Human Reviewer Action
            </span>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveAction('APPROVE')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 border transition-all ${
                  activeAction === 'APPROVE'
                    ? 'bg-emerald-700 border-emerald-800 text-white shadow-md'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction('REJECT')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 border transition-all ${
                  activeAction === 'REJECT'
                    ? 'bg-rose-700 border-rose-800 text-white shadow-md'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction('MODIFY')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 border transition-all ${
                  activeAction === 'MODIFY'
                    ? 'bg-gov-navy border-gov-navy text-white shadow-md'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>MODIFY</span>
              </button>
            </div>

            {/* Modify Overrides Form */}
            {activeAction === 'MODIFY' && (
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <span className="text-[10px] font-bold text-gov-navy uppercase tracking-wider block">
                  Reviewer Overrides (Original Recommendation Will Be Preserved in History)
                </span>
                <div className="space-y-1.5">
                  <label className="text-slate-700 block text-[11px] font-medium">Modified CNMC Code:</label>
                  <input
                    type="text"
                    value={modifiedCNMC}
                    onChange={(e) => setModifiedCNMC(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 block text-[11px] font-medium">Modified Group Title:</label>
                  <input
                    type="text"
                    value={modifiedTitle}
                    onChange={(e) => setModifiedTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
                  />
                </div>
              </div>
            )}

            {/* Comments / Mandatory Justification Field */}
            <div className="space-y-1.5">
              <label className="text-slate-800 font-medium block text-xs">
                Review Justification Comments {activeAction !== 'APPROVE' && <span className="text-rose-600 font-bold">* (Mandatory)</span>}:
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
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy text-xs"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition-colors text-xs shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-gov-navy hover:bg-gov-navy-dark text-white font-semibold flex items-center gap-2 shadow-md transition-all text-xs disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Confirm & Submit Decision</span>
          </button>
        </div>
      </div>
    </div>
  );
};
