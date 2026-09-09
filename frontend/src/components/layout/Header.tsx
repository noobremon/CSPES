import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  FileText, 
  CheckSquare, 
  GitCompare, 
  Info,
  LogOut,
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
        return 'bg-gov-navy text-white border-gov-navy';
      case 'CPSE_MATERIAL_MANAGER':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DOMAIN_REVIEWER':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'AUDITOR':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatRoleName = (role?: string) => {
    if (!role) return 'Authenticated User';
    return role.replace(/_/g, ' ');
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-3.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Platform Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-gov-navy text-white rounded-lg shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gov-navy tracking-tight sm:text-base">
                National Unified Material Master Framework
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-gov-blue border border-blue-200">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Smart India Hackathon 2026 • Unified Material Intelligence Platform
            </p>
          </div>
        </div>

        {/* Enterprise Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ingestion'
                ? 'bg-gov-navy text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Data Ingestion
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'workspace'
                ? 'bg-gov-navy text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            CNMC Workspace
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
              activeTab === 'queue'
                ? 'bg-gov-navy text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Governance Queue
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mappings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'mappings'
                ? 'bg-gov-navy text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            CPSE ↔ CNMC Cross-Walk
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-gov-navy text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            National Analytics
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'health'
                ? 'bg-gov-navy text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            System Status
          </button>
        </nav>

        {/* Authenticated User Profile & Logout */}
        <div className="flex items-center space-x-3 text-xs">
          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900">{user.full_name || user.email}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(user.role)}`}>
                    {formatRoleName(user.role)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.organization_code || 'ALL_CPSE'} • {user.email}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sign Out of Portal"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-slate-400 text-xs italic">Unauthenticated Demo</div>
          )}
        </div>
      </div>
    </header>
  );
};
