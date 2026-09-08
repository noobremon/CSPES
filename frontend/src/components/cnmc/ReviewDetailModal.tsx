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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-lg border border-brand-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Governance Review Decision Detail
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {candidate.proposed_cnmc}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorized Domain Reviewer Resolution Console • Smart India Hackathon 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Column Layout */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Mandatory Boundary Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold uppercase text-amber-300">Statutory Notice:</span> Approvals made in this console are strictly valid within the SIH MVP demonstration governance workflow and do not constitute Government of India or national policy approval.
            </div>
          </div>

          {/* Section 1: Candidate Proposal Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Proposed Prototype CNMC
              </span>
              <div className="text-lg font-mono font-bold text-brand-300">{candidate.proposed_cnmc}</div>
              <div className="text-slate-300 font-medium pt-1">{candidate.candidate_group_name}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900 p-2 rounded border border-slate-800/80">
                {candidate.proposed_description}
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Explainability & Evidence Signals
              </span>
              <div className="flex justify-between items-center text-slate-300">
                <span>Recommendation Strength:</span>
                <span className="font-bold text-emerald-400">
                  {(candidate.confidence_score * 100).toFixed(0)}% HIGH
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Generation Methodology:</span>
                <span className="font-mono text-slate-200">{candidate.generation_source}</span>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80 leading-relaxed">
                {typeof expl === 'object' && expl && 'recommendation_reason' in expl
                  ? String(expl.recommendation_reason)
                  : "Derived deterministically from normalized technical attributes and engineering taxonomy."}
              </div>
            </div>
          </div>

          {/* Section 2: Associated CPSE Materials Cluster */}
          {candidate.source_materials && candidate.source_materials.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Cluster Members (CPSE Cross-Walk Candidates)
              </span>
              <div className="overflow-hidden border border-slate-800 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">CPSE</th>
                      <th className="py-2 px-3">Canonical Description</th>
                      <th className="py-2 px-3">Standard</th>
                      <th className="py-2 px-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {candidate.source_materials.map((m, idx) => (
                      <tr key={idx} className="bg-slate-900/50">
                        <td className="py-2 px-3 font-semibold text-white">{m.organization_code}</td>
                        <td className="py-2 px-3">{m.canonical_description}</td>
                        <td className="py-2 px-3 font-mono">{m.standard_code || 'N/A'}</td>
                        <td className="py-2 px-3 font-mono">{m.material_grade || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Human Governance Action Resolution Form */}
          <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              3. Human Reviewer Action
            </span>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveAction('APPROVE')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 border transition-all ${
                  activeAction === 'APPROVE'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>MODIFY</span>
              </button>
            </div>

            {/* Modify Overrides Form */}
            {activeAction === 'MODIFY' && (
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Reviewer Overrides (Original Recommendation Will Be Preserved in History)
                </span>
                <div className="space-y-2">
                  <label className="text-slate-400 block text-[11px]">Modified CNMC Code:</label>
                  <input
                    type="text"
                    value={modifiedCNMC}
                    onChange={(e) => setModifiedCNMC(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-400 block text-[11px]">Modified Group Title:</label>
                  <input
                    type="text"
                    value={modifiedTitle}
                    onChange={(e) => setModifiedTitle(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Comments / Mandatory Justification Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block text-xs">
                Review Justification Comments {activeAction !== 'APPROVE' && <span className="text-rose-400 font-bold">* (Mandatory)</span>}:
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
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all text-xs disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Confirm & Submit Decision</span>
          </button>
        </div>
      </div>
    </div>
  );
};
