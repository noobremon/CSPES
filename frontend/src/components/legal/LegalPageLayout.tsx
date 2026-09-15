import React from 'react';
import { ArrowLeft, Layers, Shield } from 'lucide-react';
import { NationalEmblem } from '../common/NationalEmblem';
import { IndiaMonumentsSkyline } from '../common/IndiaMonumentsSkyline';
import { useNavigation } from '../../context/NavigationContext';

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  categoryBadge: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  subtitle,
  categoryBadge,
  lastUpdated = 'September 2026',
  children,
}) => {
  const { navigate } = useNavigation();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#1E3A8A] selection:text-white">
      {/* 1. Official Government Header */}
      <header className="w-full bg-white border-b border-[#E2E8F0] shrink-0 z-30 select-none relative overflow-hidden h-[76px] sm:h-[80px]">
        {/* Decorative Left Tricolor Silk Ribbon Curve */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-28 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 Q50,40 0,80" fill="#FF9933" fillOpacity="0.6" />
            <path d="M0,16 Q68,40 0,64" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M0,28 Q80,40 0,52" fill="#138808" fillOpacity="0.6" />
          </svg>
        </div>

        {/* Decorative Background Indian Monuments Skyline */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <IndiaMonumentsSkyline className="w-full h-full object-cover" opacity={0.08} />
        </div>

        {/* Semantic Header Container */}
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 h-full flex items-center justify-between relative z-10">
          {/* Government of India Identity Hierarchy */}
          <div className="flex items-center gap-3.5 sm:gap-4 text-left">
            <NationalEmblem className="h-10 sm:h-11 w-auto shrink-0" />
            <div className="h-9 w-[1.5px] bg-slate-300 hidden sm:block shrink-0" />
            <div className="text-left flex flex-col justify-center leading-tight">
              <h1 className="text-[16.5px] sm:text-[17.5px] font-bold text-[#0F172A] tracking-normal leading-snug">
                Government of India
              </h1>
              <span className="text-[12px] sm:text-[12.5px] font-medium text-[#1E3A8A] leading-normal">
                Ministry of Heavy Industries
              </span>
              <span className="text-[10px] sm:text-[10.5px] font-normal text-[#64748B] leading-tight">
                Department of Public Enterprises
              </span>
            </div>
          </div>

          {/* Institutional Links & Indian Flag */}
          <nav className="flex items-center gap-4 sm:gap-5 text-[12px] sm:text-[12.5px] text-[#334155] font-medium" aria-label="Institutional Links">
            <a
              href="https://www.digitalindia.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              Digital India
            </a>
            <span className="text-slate-300 hidden md:inline" aria-hidden="true">|</span>
            <a
              href="https://transformingindia.mygov.in/aatmanirbharbharat/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              Atmanirbhar Bharat
            </a>
            <span className="text-slate-300 hidden lg:inline" aria-hidden="true">|</span>
            <a
              href="https://innovateindia.mygov.in/viksitbharat2047/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              Viksit Bharat
            </a>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>

            {/* Indian Flag SVG Badge */}
            <div className="w-6 h-4 rounded-xs overflow-hidden flex flex-col shadow-2xs border border-slate-300 shrink-0" title="National Flag of India" aria-label="National Flag of India">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#000080]" />
              </div>
              <div className="flex-1 bg-[#128807]" />
            </div>
          </nav>
        </div>
      </header>

      {/* 2. Main Policy / Document Body */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Navigation / Return Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => navigate('/')}
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#0F172A] font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Return to Portal</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>National Unified Material Master</span>
            </span>
          </div>
        </div>

        {/* Page Header Banner */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-3 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1E3A8A] border border-blue-200 inline-flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#2563EB]" />
              {categoryBadge}
            </span>
            <span className="text-xs text-[#64748B] font-medium">
              Version 1.0 &bull; Effective {lastUpdated}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {title}
          </h1>

          <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        </div>

        {/* Policy Document Content Card */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-10 shadow-xs text-left space-y-8">
          {children}
        </div>

        {/* Bottom Return Action */}
        <div className="pt-2 pb-4 text-center">
          <button
            onClick={() => navigate('/')}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Authentication / Dashboard</span>
          </button>
        </div>
      </main>

      {/* 3. Reusable Institutional Footer */}
      <footer className="w-full bg-[#F8FAFC] border-t border-[#DDE7EE] shrink-0 flex-none z-30 select-none relative overflow-hidden h-auto min-h-0">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 relative z-10">
          {/* Government Department Hierarchy with National Emblem */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-left shrink-0">
            <NationalEmblem className="h-8 sm:h-9 w-auto shrink-0" />
            <div className="h-7 w-[1.5px] bg-slate-300 hidden sm:block shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-[#0F172A] text-[11.5px] sm:text-[12px]">Ministry of Heavy Industries</span>
              <span className="text-[10px] sm:text-[10.5px] text-[#475569] font-medium">Department of Public Enterprises</span>
              <span className="text-[9.5px] sm:text-[10px] text-[#64748B]">Government of India</span>
            </div>
          </div>

          {/* Legal & Accessibility Links */}
          <div className="flex flex-col items-center gap-0.5 text-center">
            <nav className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-[11.5px] text-[#334155] font-medium" aria-label="Legal and Accessibility Links">
              <a href="/privacy-policy" onClick={(e) => handleLinkClick(e, '/privacy-policy')} className="hover:text-[#1E3A8A] transition-colors">Privacy Policy</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="/accessibility" onClick={(e) => handleLinkClick(e, '/accessibility')} className="hover:text-[#1E3A8A] transition-colors">Accessibility</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="/terms-of-use" onClick={(e) => handleLinkClick(e, '/terms-of-use')} className="hover:text-[#1E3A8A] transition-colors">Terms of Use</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="/help-support" onClick={(e) => handleLinkClick(e, '/help-support')} className="hover:text-[#1E3A8A] transition-colors">Help & Support</a>
            </nav>
            <span className="text-[9px] sm:text-[9.5px] text-[#64748B] font-normal">
              Site best viewed in latest versions of Chrome, Firefox, Edge and Safari
            </span>
          </div>

          {/* Dynamic Copyright & Institutional Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right leading-tight hidden lg:block">
              <span className="font-semibold text-[#0F172A] text-[10.5px] sm:text-[11px]">© {new Date().getFullYear()} Government of India</span>
            </div>

            {/* Official Digital India Vector Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs shrink-0">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="20" cy="20" r="18.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <path d="M11 23 C13 14 27 10 29 19 C25 28 15 27 19 17" stroke="#FF9933" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M15 26 C17 19 26 17 26 23 C22 28 17 26 19 21" stroke="#138808" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="20" cy="20" r="2.2" fill="#000080" />
              </svg>
              <div className="text-left flex flex-col justify-center whitespace-nowrap leading-tight">
                <span className="text-[12px] sm:text-[12.5px] font-bold text-[#0F172A] tracking-normal font-sans">
                  Digital India
                </span>
                <span className="text-[8.5px] sm:text-[9px] text-[#64748B] font-medium tracking-wide">
                  Power To Empower
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
