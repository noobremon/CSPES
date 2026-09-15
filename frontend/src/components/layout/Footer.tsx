import React from 'react';
import { useNavigation } from '../../context/NavigationContext';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();

  const handleLegalNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

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
          <a href="/privacy-policy" onClick={(e) => handleLegalNav(e, '/privacy-policy')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Privacy Policy</a>
          <span className="text-slate-300">|</span>
          <a href="/accessibility" onClick={(e) => handleLegalNav(e, '/accessibility')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Accessibility</a>
          <span className="text-slate-300">|</span>
          <a href="/terms-of-use" onClick={(e) => handleLegalNav(e, '/terms-of-use')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Terms of Use</a>
          <span className="text-slate-300">|</span>
          <a href="/help-support" onClick={(e) => handleLegalNav(e, '/help-support')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Help & Support</a>
        </div>

        {/* Right: Copyright & National Badges */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10.5px] font-semibold text-[#0F172A] hidden lg:inline">© {new Date().getFullYear()} Government of India</span>

          {/* Digital India Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              <path d="M11 23 C13 14 27 10 29 19 C25 28 15 27 19 17" stroke="#FF9933" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M15 26 C17 19 26 17 26 23 C22 28 17 26 19 21" stroke="#138808" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="20" cy="20" r="2.2" fill="#000080" />
            </svg>
            <div className="text-left leading-tight flex flex-col justify-center whitespace-nowrap">
              <span className="text-[11px] font-bold text-[#0F172A] tracking-normal font-sans">Digital India</span>
              <span className="text-[7.5px] text-[#64748B] font-medium tracking-wide">Power To Empower</span>
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
