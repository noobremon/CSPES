import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E2E8F0] bg-white py-3 px-6 text-xs text-[#64748B] select-none mt-auto">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
        {/* Left Side: Institutional Identity */}
        <div className="flex items-center gap-2 text-center md:text-left">
          <span>© 2026 National Unified Material Master Framework</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-[#0F172A]">Government of India</span>
          <span className="text-slate-300">|</span>
          <span className="text-[#2563EB] font-bold">SIH 2026</span>
        </div>

        {/* Middle: Standard Links */}
        <div className="flex items-center gap-3 text-[#475569] font-medium">
          <a href="#privacy" className="hover:text-[#0F172A] transition-colors">Privacy</a>
          <span className="text-slate-300">|</span>
          <a href="#terms" className="hover:text-[#0F172A] transition-colors">Terms</a>
          <span className="text-slate-300">|</span>
          <a href="#accessibility" className="hover:text-[#0F172A] transition-colors">Accessibility</a>
          <span className="text-slate-300">|</span>
          <a href="#contact" className="hover:text-[#0F172A] transition-colors">Contact</a>
        </div>

        {/* Right Side: Tricolor Flag and Motto */}
        <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
          {/* Small Indian Tricolor Indicator */}
          <div className="w-4 h-3 rounded-xs overflow-hidden flex flex-col shadow-2xs border border-slate-200 shrink-0">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#000080]" />
            </div>
            <div className="flex-1 bg-[#128807]" />
          </div>
          <span>One Nation – One Common Material Code</span>
        </div>
      </div>
    </footer>
  );
};
