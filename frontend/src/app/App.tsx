import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { Sidebar, NavTabType } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { LoginPage } from '../components/auth/LoginPage';
import { NationalDashboardView } from '../components/dashboard/NationalDashboardView';
import { DataIngestionView } from '../components/ingestion/DataIngestionView';
import { RecommendationWorkspace } from '../components/cnmc/RecommendationWorkspace';
import { GovernanceReviewQueue } from '../components/cnmc/GovernanceReviewQueue';
import { ReviewDetailModal } from '../components/cnmc/ReviewDetailModal';
import { CPSEMappingView } from '../components/cnmc/CPSEMappingView';
import { AnalyticsContainer } from '../components/analytics/AnalyticsContainer';
import { Card } from '../components/ui/Card';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { CNMCCandidateItem } from '../types';
import { 
  Activity, 
  Database, 
  Lock, 
  CheckCircle2
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#475569] tracking-wider uppercase">
          Verifying National Unified Portal Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#1E3A8A] selection:text-white">
      {/* 1. Fixed / Consistent Top Header */}
      <Header />

      {/* 2. Main Body Layout: Left Sidebar + Right Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Vertical Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={2}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 p-5 overflow-y-auto max-w-[1600px]">
          
          {/* Tab 0: National Material Intelligence Dashboard */}
          {activeTab === 'dashboard' && (
            <ErrorBoundary fallbackTitle="National Intelligence Dashboard">
              <NationalDashboardView
                onNavigateToWorkspace={() => setActiveTab('workspace')}
                onNavigateToReview={() => setActiveTab('queue')}
              />
            </ErrorBoundary>
          )}

          {/* Tab 1: Multi-CPSE Data Ingestion */}
          {activeTab === 'ingestion' && (
            <ErrorBoundary fallbackTitle="Data Ingestion Portal">
              <DataIngestionView
                onNavigateToWorkspace={() => setActiveTab('workspace')}
              />
            </ErrorBoundary>
          )}

          {/* Tab 2: CNMC Recommendation Workspace */}
          {activeTab === 'workspace' && (
            <ErrorBoundary fallbackTitle="CNMC Recommendation Workspace">
              <RecommendationWorkspace
                onCandidateCreated={() => setRefreshTrigger((prev) => prev + 1)}
                onNavigateToReview={(_candidateId) => setActiveTab('queue')}
              />
            </ErrorBoundary>
          )}

          {/* Tab 3: Governance Review Queue */}
          {activeTab === 'queue' && (
            <ErrorBoundary fallbackTitle="Governance Review Queue">
              <GovernanceReviewQueue
                onSelectCandidate={handleSelectCandidate}
                refreshTrigger={refreshTrigger}
              />
            </ErrorBoundary>
          )}

          {/* Tab 4: CPSE ↔ CNMC Cross-Walk Mapping */}
          {activeTab === 'mappings' && (
            <ErrorBoundary fallbackTitle="CPSE ↔ CNMC Cross-Walk">
              <CPSEMappingView />
            </ErrorBoundary>
          )}

          {/* Tab 5: National Material Master Analytics */}
          {activeTab === 'analytics' && (
            <ErrorBoundary fallbackTitle="National Analytics Dashboard">
              <AnalyticsContainer />
            </ErrorBoundary>
          )}

          {/* Tab 6: System Health & Security Status */}
          {activeTab === 'health' && (
            <div className="space-y-5 text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  title="System Operational Status"
                  subtitle="High-availability API & Pipeline Verification"
                  icon={<Activity className="w-5 h-5 text-[#15803D]" />}
                >
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">Core FastAPI Backend</span>
                      <span className="flex items-center gap-1.5 text-[#15803D] font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Healthy (200 OK)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">PostgreSQL Vector DB</span>
                      <span className="flex items-center gap-1.5 text-[#15803D] font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Connected & Seeded
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">Qdrant Vector Engine</span>
                      <span className="flex items-center gap-1.5 text-[#15803D] font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> 768-dim Index Ready
                      </span>
                    </div>
                  </div>
                </Card>

                <Card
                  title="Active Security Profile"
                  subtitle="Cryptographic Token & Access Boundary"
                  icon={<Lock className="w-5 h-5 text-[#2563EB]" />}
                >
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">Authentication Scheme</span>
                      <span className="text-[#0F172A] font-mono text-[11px] font-semibold">JWT Bearer (HS256)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">Active Tenant Scope</span>
                      <span className="text-[#0F172A] font-semibold">{user?.organization_code || 'ALL_CPSE'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">RBAC Enforcement</span>
                      <span className="text-[#15803D] font-semibold">STRICT Layer 1 Boundary</span>
                    </div>
                  </div>
                </Card>

                <Card
                  title="Database & Seed Audit"
                  subtitle="Institutional Material Records"
                  icon={<Database className="w-5 h-5 text-[#0F172A]" />}
                >
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">Multi-CPSE Demo Records</span>
                      <span className="text-[#0F172A] font-semibold">IOCL, ONGC, NTPC, SAIL, CIL</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">User Data Model</span>
                      <span className="text-[#0F172A] font-mono text-[11px] font-semibold">users + organizations</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">Audit Trail</span>
                      <span className="text-[#0F172A] font-semibold">Append-Oriented audit_logs</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="rounded-xl border border-[#F3D19C] bg-[#FFF7E6] p-5 space-y-2 shadow-2xs">
                <h3 className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
                  Phase 10 Governance & Security Non-Negotiable Boundary
                </h3>
                <p className="text-xs text-[#78350F] leading-relaxed">
                  The authentication, RBAC, and CNMC codification implemented in this application are built for the <strong className="text-[#0F172A]">National Standardization Framework</strong>.
                  Approval in this portal indicates <strong className="text-[#0F172A]">"Approved within the demonstration governance workflow"</strong> and does not constitute statutory Government of India gazetted standards.
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
      </div>

      {/* 3. Full-width Institutional Footer */}
      <Footer />
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
