import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-[3.75rem] bg-white border-b border-[#E2E8F0] sticky top-0 z-40 px-5 flex items-center justify-between gap-4 select-none">
      
      {/* Left: Brand Identity */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="p-2 bg-[#0F172A] text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="text-left leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold text-[#0F172A] tracking-tight whitespace-nowrap">
              National Unified Material Master Framework
            </h1>
          </div>
          <p className="text-[11px] text-[#64748B] font-medium">
            SIH 2026 • Material Intelligence Platform
          </p>
        </div>
      </div>

      {/* Center: Search Field */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search materials, CNMC, CPSE..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile Pill */}
      <div className="flex items-center space-x-3 shrink-0">
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 bg-[#F8FAFC] hover:bg-slate-100/80 px-2.5 py-1 rounded-xl border border-[#CBD5E1] shadow-2xs transition-all cursor-pointer"
          >
            {/* User Avatar with Initials "RS" */}
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200 flex items-center justify-center font-bold text-xs">
              RS
            </div>
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="font-bold text-[#0F172A] text-[11px]">
                {user?.full_name || 'Dr. Rajesh Sharma'}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">
                National Material Master Admin
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] ml-0.5" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg p-2 z-50 text-left">
              <div className="p-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-[#0F172A]">{user?.full_name || 'Dr. Rajesh Sharma'}</div>
                <div className="text-[10px] text-[#64748B] font-mono truncate">{user?.email || 'national_admin@sih.demo'}</div>
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
      </div>
    </header>
  );
};
