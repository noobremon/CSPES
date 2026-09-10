import React, { useState } from 'react';
import { 
  Layers, 
  FileText, 
  CheckSquare, 
  GitCompare, 
  Info,
  LogOut,
  UploadCloud,
  LayoutDashboard,
  BarChart3,
  Search,
  Bell,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTabType = 'dashboard' | 'ingestion' | 'workspace' | 'queue' | 'mappings' | 'analytics' | 'health';

interface HeaderProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, pendingCount = 2 }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'NATIONAL_MASTER_ADMIN':
        return 'bg-[#0F172A] text-white border-[#0F172A]';
      case 'CPSE_MATERIAL_MANAGER':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-blue-200';
      case 'DOMAIN_REVIEWER':
        return 'bg-slate-100 text-[#123B63] border-slate-300 font-bold';
      case 'AUDITOR':
        return 'bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]';
      default:
        return 'bg-slate-100 text-[#475569] border-[#E2E8F0]';
    }
  };

  const getDisplayName = () => {
    if (!user) return 'Demo User';
    if (user.role === 'NATIONAL_MASTER_ADMIN') return 'Dr. Rajesh Sharma';
    if (user.role === 'CPSE_MATERIAL_MANAGER') return 'S. K. Verma (IOCL)';
    if (user.role === 'DOMAIN_REVIEWER') return 'Ananya Roy (Reviewer)';
    if (user.role === 'AUDITOR') return 'P. N. Murthy (Auditor)';
    return user.full_name || user.email;
  };

  const getRoleDisplayTitle = () => {
    if (!user) return 'NATIONAL MASTER ADMIN';
    return (user.role || 'NATIONAL MASTER ADMIN').replace(/_/g, ' ');
  };

  return (
    <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50 shadow-2xs">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Brand & Platform Identity */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#0F172A] text-white rounded-xl shadow-xs shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight">
                National Unified Material Master Framework
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium">
              Unified Material Intelligence Platform
            </p>
          </div>
        </div>

        {/* Header Right Actions: Search, Notifications & Profile */}
        <div className="flex items-center space-x-3 text-xs">
          
          {/* Search Button */}
          <button
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
            title="Global Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              4
            </span>
          </div>

          {/* Authenticated User Profile Dropdown Pill */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 bg-[#F8FAFC] hover:bg-white px-3 py-1.5 rounded-2xl border border-[#CBD5E1] shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-200 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#0F172A] text-[11px]">
                      {getDisplayName()}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      (National Admin)
                    </span>
                  </div>
                  <div>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadge(user.role)}`}>
                      {getRoleDisplayTitle()}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] ml-1" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg p-2 z-50 text-left">
                  <div className="p-2.5 border-b border-slate-100">
                    <div className="text-xs font-bold text-[#0F172A]">{getDisplayName()}</div>
                    <div className="text-[10px] text-[#64748B] font-mono truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Platform</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[#64748B] text-xs italic">Unauthenticated Demo</div>
          )}
        </div>
      </div>

      {/* Sub Header Navbar: 7 Full Width Tabs Matching Reference UI */}
      <div className="border-t border-[#F1F5F9] bg-[#FAFAFA] px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ingestion'
                ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Data Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'workspace'
                ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CNMC Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Governance Queue</span>
            {pendingCount > 0 && (
              <span className="ml-1 w-5 h-5 text-[10px] font-bold bg-[#F59E0B] text-white rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mappings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mappings'
                ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>CPSE ↔ CNMC Cross-Walk</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>National Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'health'
                ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>System Status</span>
          </button>
        </div>
      </div>
    </header>
  );
};
