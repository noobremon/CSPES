import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { fetchHealth } from '../services/api';
import { SystemStatus } from '../types';
import { Server, Database, Cpu, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHealth();
      setHealth(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Backend connection unavailable in offline mode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Foundation Hero Banner */}
        <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-900/40 via-slate-900/60 to-slate-900/40 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-md border border-brand-500/20">
              Phase 4 — Repository Foundation
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              AI-Powered National Unified Material Master Framework
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Standardized, sovereign material harmonization platform for Indian Central Public Sector Enterprises (CPSEs). Designed to eliminate duplicate catalog records, rationalize legacy codes, and govern the Common National Material Code (CNMC).
            </p>
          </div>
        </div>

        {/* Development Environment Health & Readiness Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Frontend Tier" subtitle="React 18+ / Vite / TypeScript" icon={<Cpu className="w-5 h-5" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready & Healthy
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Build Tooling</span>
                <span className="text-slate-200">Vite 5.3 + Tailwind CSS</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Runtime Mode</span>
                <span className="text-slate-200">{import.meta.env.MODE}</span>
              </div>
            </div>
          </Card>

          <Card title="Backend API Gateway" subtitle="Python 3.11+ FastAPI ASGI" icon={<Server className="w-5 h-5" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Endpoint Connectivity</span>
                {loading ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...
                  </span>
                ) : error ? (
                  <span className="text-slate-400 flex items-center gap-1" title={error}>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Offline / Standalone
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">API Prefix</span>
                <span className="text-slate-200 font-mono text-[11px]">/api/v1</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">App Name</span>
                <span className="text-slate-200 truncate max-w-[150px]">{health?.app_name || 'FastAPI Service'}</span>
              </div>
            </div>
          </Card>

          <Card title="Data & Storage Layer" subtitle="PostgreSQL 16 + pgvector + Redis" icon={<Database className="w-5 h-5" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Multi-Tenancy Isolation</span>
                <span className="text-slate-200 font-medium">Row-Level Security (RLS)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Vector Index Engine</span>
                <span className="text-slate-200 font-mono text-[11px]">pgvector (HNSW)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Async Queue Broker</span>
                <span className="text-slate-200">Celery + Redis 7.2</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Phase 4 Scope Boundary Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Phase 4 Foundation Boundary Notice
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            This screen confirms that the frontend application shell, TypeScript configuration, and API communication contracts are established. Business features (Material Ingestion, NLP Attribute Extraction, AI Deduplication, CNMC Recommendation, and Analytics) will be implemented systematically across subsequent phases according to the approved product blueprint.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        AI-Powered National Unified Material Master Framework • SIH 2026 • Ministry of Heavy Industries / DPE
      </footer>
    </div>
  );
};
