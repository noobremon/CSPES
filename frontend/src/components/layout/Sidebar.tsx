import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  CheckSquare, 
  GitCompare, 
  BarChart3, 
  Activity, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTabType = 'dashboard' | 'ingestion' | 'workspace' | 'queue' | 'mappings' | 'analytics' | 'health';

interface SidebarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount = 2,
}) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingestion' as NavTabType, label: 'Data Ingestion', icon: UploadCloud },
    { id: 'workspace' as NavTabType, label: 'CNMC Workspace', icon: FileText },
    { id: 'queue' as NavTabType, label: 'Governance Queue', icon: CheckSquare, badge: pendingCount },
    { id: 'mappings' as NavTabType, label: 'CPSE ↔ CNMC Cross-Walk', icon: GitCompare },
    { id: 'analytics' as NavTabType, label: 'National Analytics', icon: BarChart3 },
    { id: 'health' as NavTabType, label: 'System Status', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 h-[calc(100vh-3.75rem)] sticky top-[3.75rem] z-30 select-none">
      {/* Top Main Navigation Items */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] font-bold shadow-2xs'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1D4ED8]' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom Secondary Navigation (Help & Logout) */}
      <div className="p-3 border-t border-[#F1F5F9] space-y-1">
        <button
          onClick={() => alert('National Unified Material Master Framework — SIH 2026 Help & Support Portal')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-[#64748B]" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#DC2626]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
