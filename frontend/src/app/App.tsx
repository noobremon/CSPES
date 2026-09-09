import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoginPage } from '../components/auth/LoginPage';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { RecommendationWorkspace } from '../components/cnmc/RecommendationWorkspace';
import { GovernanceReviewQueue } from '../components/cnmc/GovernanceReviewQueue';
import { ReviewDetailModal } from '../components/cnmc/ReviewDetailModal';
import { CPSEMappingView } from '../components/cnmc/CPSEMappingView';
import { AnalyticsContainer } from '../components/analytics/AnalyticsContainer';
import { DataIngestionView } from '../components/ingestion/DataIngestionView';
import { fetchHealth } from '../services/api';
import { SystemStatus, CNMCCandidateItem } from '../types';
import { Server, Database, Cpu, CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, Tag, GitCompare, UploadCloud } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ingestion' | 'workspace' | 'queue' | 'mappings' | 'analytics' | 'health'>('workspace');
  const [selectedCandidate, setSelectedCandidate] = useState<CNMCCandidateItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [health, setHealth] = useState<SystemStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await fetchHealth();
      setHealth(res.data);
    } catch (err: unknown) {
      setHealthError(err instanceof Error ? err.message : 'Backend connection unavailable in offline mode.');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkHealth();
    }
  }, [isAuthenticated]);

  const handleCandidateCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateToReview = (candidateId?: string) => {
    setActiveTab('queue');
  };

  const handleReviewSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Verifying National Unified Portal Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={2}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Top Level Platform Overview Banner */}
        <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/60 via-slate-900/80 to-slate-900/60 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
                  Phase 10 • Authenticated Enterprise Portal
                </span>
                {user?.organization_code ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    Tenant: {user.organization_code} ({user.organization_name || 'Assigned CPSE'})
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    National Cross-CPSE Scope
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
                National Material Code Governance & Analytics Hub
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connects Ingestion → AI Matching → CNMC Recommendation → Human Governance Sign-Off → National Material Intelligence.
                Protected by server-side Role-Based Access Control and Layer 1 CPSE commercial data isolation.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 shrink-0">
              <div className="text-center px-2">
                <span className="block text-base font-bold text-white font-mono">4 ROLES</span>
                <span className="text-[10px] text-slate-400 uppercase">RBAC Model</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-2">
                <span className="block text-base font-bold text-brand-400 font-mono">JWT</span>
                <span className="text-[10px] text-slate-400 uppercase">Auth Standard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 0: Multi-CPSE Material Ingestion & Catalog Upload */}
        {activeTab === 'ingestion' && (
          <DataIngestionView
            onNavigateToWorkspace={() => setActiveTab('workspace')}
            onNavigateToAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {/* Tab 1: Recommendation Workspace */}
        {activeTab === 'workspace' && (
          <RecommendationWorkspace
            onCandidateCreated={handleCandidateCreated}
            onNavigateToReview={handleNavigateToReview}
          />
        )}

        {/* Tab 2: Governance Review Queue */}
        {activeTab === 'queue' && (
          <GovernanceReviewQueue
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Tab 3: CPSE ↔ CNMC Cross-Walk Mappings */}
        {activeTab === 'mappings' && <CPSEMappingView />}

        {/* Tab 4: National Material Intelligence Analytics */}
        {activeTab === 'analytics' && <AnalyticsContainer />}

        {/* Tab 5: System Architecture & Infrastructure Health */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Frontend Tier" subtitle="React 18+ / Vite / TypeScript" icon={<Cpu className="w-5 h-5 text-indigo-400" />}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready & Authenticated
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">UI Module</span>
                    <span className="text-slate-200">Phase 10 Multi-Tenant Governance</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Session Role</span>
                    <span className="text-brand-300 font-semibold">{user?.role}</span>
                  </div>
                </div>
              </Card>

              <Card title="Backend API Gateway" subtitle="Python 3.12+ FastAPI ASGI" icon={<Server className="w-5 h-5 text-brand-400" />}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Endpoint Connectivity</span>
                    {loadingHealth ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...
                      </span>
                    ) : healthError ? (
                      <span className="text-slate-400 flex items-center gap-1" title={healthError}>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Standalone / Test Mode
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Auth Standard</span>
                    <span className="text-slate-200 font-mono text-[11px]">JWT Bearer / Cookie</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Services</span>
                    <span className="text-slate-200">RBAC + Multi-Tenant Scoping</span>
                  </div>
                </div>
              </Card>

              <Card title="Data & Storage Layer" subtitle="PostgreSQL 16 + pgvector + Redis" icon={<Database className="w-5 h-5 text-emerald-400" />}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Multi-Tenancy Isolation</span>
                    <span className="text-slate-200 font-medium">Tenant FK + Application Validation</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">User Data Model</span>
                    <span className="text-slate-200 font-mono text-[11px]">users + organizations</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Audit Trail</span>
                    <span className="text-slate-200">Append-Oriented audit_logs</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Phase 10 Governance & Security Non-Negotiable Boundary
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The authentication, RBAC, and CNMC codification implemented in this application are built for the <strong className="text-slate-200">SIH 2026 Prototype Demonstration</strong>.
                Approval in this portal indicates <strong className="text-slate-200">"Approved within the SIH MVP demonstration governance workflow"</strong> and does not constitute statutory Government of India gazetted standards.
              </p>
            </div>
          </div>
        )}

        {/* Modal: Review Resolution Modal */}
        {selectedCandidate && (
          <ReviewDetailModal
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        AI-Powered National Unified Material Master Framework • SIH 2026 • Phase 10 Authentication & Secure Access
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};
