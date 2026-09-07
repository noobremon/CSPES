import React from 'react';
import { Layers, ShieldCheck, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-500 rounded-lg border border-brand-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              National Unified Material Master Framework
            </h1>
            <p className="text-xs text-slate-400">Smart India Hackathon (SIH) 2026 • “One Nation – One Common Material Code”</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Phase 4 Foundation Initialized</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>Government of India CPSE Sandbox</span>
          </div>
        </div>
      </div>
    </header>
  );
};
