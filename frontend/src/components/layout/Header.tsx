import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  CheckCircle, 
  FileText, 
  CheckSquare, 
  GitCompare, 
  Info,
  LogOut,
  Building2,
  UserCheck,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab: 'ingestion' | 'workspace' | 'queue' | 'mappings' | 'analytics' | 'health';
  setActiveTab: (tab: 'ingestion' | 'workspace' | 'queue' | 'mappings' | 'analytics' | 'health') => void;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, pendingCount = 0 }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'NATIONAL_MASTER_ADMIN':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'CPSE_MATERIAL_MANAGER':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'DOMAIN_REVIEWER':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'AUDITOR':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const formatRoleName = (role?: string) => {
    if (!role) return 'Authenticated User';
    return role.replace(/_/g, ' ');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Platform Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-brand-600/20 text-brand-400 rounded-xl border border-brand-500/30 shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight sm:text-lg">
                National Unified Material Master Framework
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Phase 10
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Smart India Hackathon (SIH) 2026 • “One Nation – One Common Material Code”
            </p>
          </div>
        </div>

        {/* Enterprise Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ingestion'
                ? 'bg-brand-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Data Ingestion
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'workspace'
                ? 'bg-brand-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            CNMC Workspace
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
              activeTab === 'queue'
                ? 'bg-brand-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Governance Queue
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mappings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'mappings'
                ? 'bg-brand-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            CPSE ↔ CNMC Cross-Walk
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-brand-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            National Analytics
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'health'
                ? 'bg-brand-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            System Status
          </button>
        </nav>

        {/* Authenticated User Profile & Logout */}
        <div className="flex items-center space-x-3 text-xs">
          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xs">
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-[11px] truncate max-w-[130px]" title={user.full_name}>
                    {user.full_name}
                  </span>
                  {user.organization_code && (
                    <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px] font-mono font-semibold">
                      {user.organization_code}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded border w-fit mt-0.5 ${getRoleBadge(user.role)}`}>
                  {formatRoleName(user.role)}
                </span>
              </div>

              <button
                onClick={() => logout()}
                title="Sign Out of Portal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Unauthenticated</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
