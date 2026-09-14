import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#DDE7EE] bg-[#F4F8FB] py-2.5 px-6 text-xs text-[#64748B] select-none mt-auto">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
        {/* Left: Institutional Attribution */}
        <div className="flex items-center gap-2.5 text-left">
          <div className="h-7 w-0.5 bg-[#1E3A8A] rounded-full hidden sm:block shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[#0F172A] text-[11px]">Ministry of Heavy Industries &nbsp;|&nbsp; Department of Public Enterprises</span>
            <span className="text-[10px] text-[#64748B]">Government of India</span>
          </div>
        </div>

        {/* Center: Legal & Accessibility Links */}
        <div className="flex items-center gap-2.5 text-[#475569] font-medium text-[11px]">
          <a href="#privacy" className="hover:text-[#1E3A8A] transition-colors">Privacy Policy</a>
          <span className="text-slate-300">|</span>
          <a href="#accessibility" className="hover:text-[#1E3A8A] transition-colors">Accessibility</a>
          <span className="text-slate-300">|</span>
          <a href="#terms" className="hover:text-[#1E3A8A] transition-colors">Terms of Use</a>
          <span className="text-slate-300">|</span>
          <a href="#help" className="hover:text-[#1E3A8A] transition-colors">Help & Support</a>
        </div>

        {/* Right: Copyright & National Badges */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10.5px] font-semibold text-[#0F172A] hidden lg:inline">© {new Date().getFullYear()} Government of India</span>

          {/* Digital India Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-2xs">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
              <path d="M12 24 C14 16 26 12 28 20 C24 28 16 26 20 18" stroke="#FF9933" strokeWidth="3" strokeLinecap="round" />
              <path d="M16 26 C18 20 26 18 26 24 C22 28 18 26 20 22" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="2" fill="#000080" />
            </svg>
            <div className="text-left leading-none">
              <div className="text-[8.5px] font-extrabold text-[#0F172A]">Digital India</div>
              <div className="text-[6.5px] text-[#64748B] font-medium">Power To Empower</div>
            </div>
          </div>

          {/* 75+ Azadi Ka Amrit Mahotsav Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-2xs">
            <span className="font-black text-[10px] text-[#1E3A8A] tracking-tighter">75<sup className="text-[7px]">+</sup></span>
            <div className="text-left leading-none">
              <div className="text-[7.5px] font-black text-[#FF9933]">Azadi<span className="text-[6px] font-normal text-slate-400"> Ka</span></div>
              <div className="text-[6.5px] font-black text-[#138808]">Amrit Mahotsav</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
