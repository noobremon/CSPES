import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { LoginPage } from '../components/auth/LoginPage';
import { DataIngestionView } from '../components/ingestion/DataIngestionView';
import { RecommendationWorkspace } from '../components/cnmc/RecommendationWorkspace';
import { GovernanceReviewQueue } from '../components/cnmc/GovernanceReviewQueue';
import { ReviewDetailModal } from '../components/cnmc/ReviewDetailModal';
import { CPSEMappingView } from '../components/cnmc/CPSEMappingView';
import { AnalyticsContainer } from '../components/analytics/AnalyticsContainer';
import { Card } from '../components/ui/Card';
import { CNMCCandidateItem } from '../types';
import { 
  ShieldCheck, 
  Activity, 
  Layers, 
  Database, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Sparkles
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'ingestion' | 'workspace' | 'queue' | 'mappings' | 'analytics' | 'health'>('workspace');
  const [selectedCandidate, setSelectedCandidate] = useState<CNMCCandidateItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleSelectCandidate = (candidate: CNMCCandidateItem) => {
    setSelectedCandidate(candidate);
  };

  const handleReviewSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gov-navy/20 border-t-gov-navy rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
          Verifying National Unified Portal Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-gov-navy selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={2}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* National Material Intelligence Header Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-gov-navy uppercase tracking-wider">
                National Material Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Unified material analysis, AI-assisted matching, CNMC recommendation, and human governance for cross-CPSE material standardization.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0 self-stretch md:self-auto justify-end">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              <span className="font-bold text-gov-navy">4 Roles</span> RBAC Enabled
            </div>
            <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-semibold">
              SIH MVP Prototype
            </div>
          </div>
        </div>

        {/* Tab 0: Multi-CPSE Data Ingestion */}
        {activeTab === 'ingestion' && (
          <DataIngestionView
            onNavigateToWorkspace={(item) => {
              setActiveTab('workspace');
            }}
          />
        )}

        {/* Tab 1: CNMC Recommendation Workspace */}
        {activeTab === 'workspace' && (
          <RecommendationWorkspace
            onCandidateCreated={() => {
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        )}

        {/* Tab 2: Governance Review Queue */}
        {activeTab === 'queue' && (
          <GovernanceReviewQueue
            onSelectCandidate={handleSelectCandidate}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Tab 3: CPSE ↔ CNMC Cross-Walk Mapping */}
        {activeTab === 'mappings' && (
          <CPSEMappingView />
        )}

        {/* Tab 4: National Material Master Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsContainer />
        )}

        {/* Tab 5: System Health & Security Status */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                title="System Operational Status"
                subtitle="High-availability API & Pipeline Verification"
                icon={<Activity className="w-5 h-5 text-emerald-600" />}
              >
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Core FastAPI Backend</span>
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Healthy (200 OK)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">PostgreSQL Vector DB</span>
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Connected & Seeded
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Qdrant Vector Engine</span>
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> 768-dim Index Ready
                    </span>
                  </div>
                </div>
              </Card>

              <Card
                title="Active Security Profile"
                subtitle="Cryptographic Token & Access Boundary"
                icon={<Lock className="w-5 h-5 text-blue-600" />}
              >
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Authentication Scheme</span>
                    <span className="text-slate-900 font-mono text-[11px] font-semibold">JWT Bearer (HS256)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Active Tenant Scope</span>
                    <span className="text-slate-900 font-semibold">{user?.organization_code || 'ALL_CPSE'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">RBAC Enforcement</span>
                    <span className="text-emerald-700 font-semibold">STRICT Layer 1 Boundary</span>
                  </div>
                </div>
              </Card>

              <Card
                title="Database & Seed Audit"
                subtitle="Institutional Material Records"
                icon={<Database className="w-5 h-5 text-purple-600" />}
              >
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Multi-CPSE Demo Records</span>
                    <span className="text-slate-900 font-semibold">IOCL, ONGC, NTPC, SAIL, CIL</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">User Data Model</span>
                    <span className="text-slate-900 font-mono text-[11px] font-semibold">users + organizations</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Audit Trail</span>
                    <span className="text-slate-900 font-semibold">Append-Oriented audit_logs</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="rounded-xl border border-gov-notice-border bg-gov-notice-bg p-6 space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Phase 10 Governance & Security Non-Negotiable Boundary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                The authentication, RBAC, and CNMC codification implemented in this application are built for the <strong className="text-slate-900">SIH 2026 Prototype Demonstration</strong>.
                Approval in this portal indicates <strong className="text-slate-900">"Approved within the SIH MVP demonstration governance workflow"</strong> and does not constitute statutory Government of India gazetted standards.
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

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
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
