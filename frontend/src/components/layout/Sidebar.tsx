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
    <aside className="w-64 bg-gradient-to-b from-[#0F294A] via-[#0D233F] to-[#0A1A30] border-r border-[#1E3A8A]/40 text-white flex flex-col justify-between shrink-0 self-stretch min-h-full z-30 select-none shadow-md">
      {/* Top Main Navigation Items - Flush to header */}
      <div className="p-3 pt-3.5 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-900/30'
                  : 'text-[#BFDBFE] hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#93C5FD]'}`} />
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

      {/* Bottom Secondary Navigation (Help & Logout) - Flush to footer */}
      <div className="p-3 border-t border-[#1E3A8A]/40 space-y-1.5">
        <button
          onClick={() => alert('National Unified Material Master Framework — Help & Support Portal')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#BFDBFE] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-[#93C5FD]" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#FCA5A5] hover:bg-red-500/20 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#F87171]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
