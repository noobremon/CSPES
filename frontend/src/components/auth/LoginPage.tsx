import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  UserCheck, 
  FileCheck2,
  Info,
  Eye,
  EyeOff,
  SlidersHorizontal,
  TrendingUp,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NationalEmblem } from '../common/NationalEmblem';
import { IndiaMonumentsSkyline } from '../common/IndiaMonumentsSkyline';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  // By default, pre-populate National Master Admin credentials for instant 1-click evaluation
  const [email, setEmail] = useState('national_admin@sih.demo');
  const [password, setPassword] = useState('DemoAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  const demoAccounts = [
    {
      role: 'NATIONAL_MASTER_ADMIN',
      title: 'National Master Admin',
      email: 'national_admin@sih.demo',
      password: 'DemoAdmin@2026',
      icon: ShieldCheck,
      desc: 'National macro intelligence, cross-CPSE matrix, and governance visibility',
    },
    {
      role: 'CPSE_MATERIAL_MANAGER',
      title: 'CPSE Material Manager (IOCL)',
      email: 'cpse_manager_a@sih.demo',
      password: 'DemoManager@2026',
      icon: Building2,
      desc: 'Ingestion, catalog deduplication, and cross-walk mappings for IOCL',
    },
    {
      role: 'DOMAIN_REVIEWER',
      title: 'Domain Reviewer',
      email: 'domain_reviewer@sih.demo',
      password: 'DemoReviewer@2026',
      icon: UserCheck,
      desc: 'Technical specification review, APPROVE / REJECT / MODIFY candidates',
    },
    {
      role: 'AUDITOR',
      title: 'National Auditor',
      email: 'auditor@sih.demo',
      password: 'DemoAuditor@2026',
      icon: FileCheck2,
      desc: 'Read-only access to immutable audit trails and governance decision logs',
    }
  ];

  return (
    <div className="auth-page min-h-[100dvh] flex flex-col bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] selection:bg-[#1E3A8A] selection:text-white relative overflow-x-hidden border-t-0">
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH OFFICIAL GOVERNMENT HEADER (MATCHES REFERENCE 1)             */}
      {/* ========================================================================= */}
      <header className="auth-header w-full bg-white border-t-0 border-b border-[#E2E8F0] shrink-0 flex-none z-30 select-none relative overflow-hidden h-[88px]">
        {/* Subtle Decorative Left Tricolor Silk Ribbon Curve (Layer 2) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-28 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 88" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 Q50,44 0,88" fill="#FF9933" fillOpacity="0.6" />
            <path d="M0,18 Q68,44 0,70" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M0,32 Q80,44 0,56" fill="#138808" fillOpacity="0.6" />
          </svg>
        </div>

        {/* Subtle Background Indian Monuments Skyline Watermark (Layer 2 - Right: 0.08 opacity) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <IndiaMonumentsSkyline className="w-full h-full object-cover" opacity={0.08} />
        </div>

        {/* Semantic Responsive Header Container (Layer 3 & 4) */}
        <div className="government-header w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 h-full flex items-center justify-between relative z-10">
          {/* Government of India Identity Hierarchy */}
          <div className="government-identity flex items-center gap-3.5 sm:gap-4 text-left">
            <NationalEmblem className="h-11 sm:h-12 w-auto shrink-0" />
            <div className="h-10 w-[1.5px] bg-slate-300 hidden sm:block shrink-0" />
            <div className="text-left flex flex-col justify-center leading-tight">
              <h1 className="text-[17.5px] sm:text-[18px] font-bold text-[#0F172A] tracking-normal leading-snug">
                Government of India
              </h1>
              <span className="text-[12.5px] sm:text-[13px] font-medium text-[#1E3A8A] leading-normal">
                Ministry of Heavy Industries
              </span>
              <span className="text-[10.5px] sm:text-[11px] font-normal text-[#64748B] leading-tight">
                Department of Public Enterprises
              </span>
            </div>
          </div>

          {/* Institutional Links & Indian Flag */}
          <nav className="institutional-links flex items-center gap-4 sm:gap-5 text-[12.5px] sm:text-[13px] text-[#334155] font-medium" aria-label="Institutional Links">
            <a href="#digital-india" className="hidden md:inline hover:text-[#1E3A8A] transition-colors cursor-pointer">Digital India</a>
            <span className="text-slate-300 hidden md:inline" aria-hidden="true">|</span>
            <a href="#atmanirbhar" className="hidden lg:inline hover:text-[#1E3A8A] transition-colors cursor-pointer">Atmanirbhar Bharat</a>
            <span className="text-slate-300 hidden lg:inline" aria-hidden="true">|</span>
            <a href="#viksit" className="hidden sm:inline hover:text-[#1E3A8A] transition-colors cursor-pointer">Viksit Bharat</a>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>

            {/* Indian Flag SVG Badge */}
            <div className="w-6 h-4 rounded-xs overflow-hidden flex flex-col shadow-2xs border border-slate-300 shrink-0" title="National Flag of India" aria-label="National Flag of India">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#000080]" />
              </div>
              <div className="flex-1 bg-[#128807]" />
            </div>

            <span className="text-slate-300" aria-hidden="true">|</span>

            {/* Language Selector */}
            <div className="flex items-center gap-1 font-semibold text-[#0F172A] hover:text-[#1E3A8A] px-2 py-1 rounded transition-colors cursor-pointer text-[12.5px] sm:text-[13px]">
              <span>English</span>
              <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </nav>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. AUTH-MAIN: BALANCED VIEWPORT AUTHENTICATION AREA                      */}
      {/* ========================================================================= */}
      <main className="auth-main flex-1 min-h-0 flex items-center justify-center py-5 sm:py-7 px-4 sm:px-8 lg:px-12 w-full max-w-[1400px] mx-auto z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
          
          {/* Left Column: Branding, Roles & Mission */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 text-left">
            
            {/* Framework Branding */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-[#0F172A] text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
                  National Unified Material Master Framework
                </h2>
                <div className="text-[12.5px] sm:text-[13.5px] font-bold text-[#1E3A8A] tracking-wide">
                  “One Nation – One Common Material Code”
                </div>
              </div>
            </div>

            {/* Description / Mission */}
            <p className="text-[11.5px] sm:text-xs text-[#475569] leading-relaxed max-w-xl font-normal">
              A unified, intelligent and governed platform for cross-CPSE material standardization, enabling efficient procurement, better resource utilization and a stronger, self-reliant India.
            </p>

            {/* Role Selection Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  Select Your Role to Continue
                </span>
              </div>

              {/* 2x2 Desktop Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map((demo) => {
                  const isSelected = email === demo.email;
                  const RoleIcon = demo.icon;
                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoFill(demo.email, demo.password)}
                      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#F0F7FF] border-[#2563EB] shadow-xs ring-1 ring-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] hover:border-slate-300 hover:bg-[#FAFBFD] shadow-xs'
                      }`}
                    >
                      {/* Role Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#1E3A8A]'}`}>
                            <RoleIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[12px] font-bold text-[#0F172A] truncate">
                            {demo.title}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Technical Credentials Box */}
                      <div className="mt-2.5 px-2 py-1.5 bg-[#F8FAFC] rounded-lg border border-slate-200/80 text-[10px] font-mono space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#334155] font-semibold truncate">
                          <Mail className="w-3 h-3 text-[#64748B] shrink-0" />
                          <span className="truncate">{demo.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#64748B]">
                          <Lock className="w-3 h-3 text-[#64748B] shrink-0" />
                          <span>{demo.password}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[10px] text-[#64748B] mt-2 leading-relaxed line-clamp-2">
                        {demo.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Pillars of the Platform */}
            <div className="pt-3 border-t border-slate-200/80 grid grid-cols-4 gap-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#475569] font-semibold text-[11px]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Standardize</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[#475569] font-semibold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Optimize</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[#475569] font-semibold text-[11px]">
                <Leaf className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Sustain</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[#475569] font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Govern</span>
              </div>
            </div>

          </div>

          {/* Right Column: Portal Authentication Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white border border-[#CBD5E1] p-6 sm:p-7 rounded-2xl shadow-md space-y-4">
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h3 className="text-[17px] sm:text-[18px] font-bold text-[#0F172A] tracking-tight">
                      Portal Authentication
                    </h3>
                  </div>
                  <p className="text-[11.5px] text-[#64748B] mt-1">
                    Enter your registered enterprise credentials to access the platform.
                  </p>
                </div>
                <span className="text-[10.5px] font-semibold bg-[#F1F5F9] text-[#1E3A8A] border border-slate-200 px-2.5 py-0.5 rounded-md shrink-0">
                  Enterprise Portal
                </span>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1.5 text-[11px]">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. national_admin@sih.demo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[42px] pl-10 pr-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 font-medium transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-bold mb-1.5 text-[11px]">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[42px] pl-10 pr-10 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 font-medium transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer flex items-center"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[42px] mt-2 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-50 cursor-pointer text-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-0.5 flex items-center justify-between text-[10px] text-[#64748B]">
                <span>Session: Secure JWT Bearer</span>
                <span>Security Standard: ADR-007</span>
              </div>

              {/* Official Notice Callout */}
              <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[10px] text-[#92400E] flex items-start gap-2 shadow-2xs text-left">
                <Info className="w-3.5 h-3.5 text-[#D97706] mt-0.5 shrink-0" />
                <span className="leading-normal">
                  <strong className="text-[#92400E]">DEMONSTRATION ACCESS:</strong> Select any role above to load credentials or click <strong>Sign In to Platform</strong> with the pre-filled Admin account.
                </span>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. FULL-WIDTH INSTITUTIONAL FOOTER (MATCHES REFERENCE 2)                  */}
      {/* ========================================================================= */}
      <footer className="auth-footer w-full bg-[#F8FAFC] border-t border-[#DDE7EE] shrink-0 flex-none z-30 select-none relative overflow-hidden h-auto min-h-0">
        {/* Subtle Decorative Background Skyline Artwork (Layer 2 - Right: 0.06 opacity) */}
        <div className="footer-decoration absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <IndiaMonumentsSkyline className="w-full h-full object-cover" opacity={0.06} />
        </div>

        {/* Subtle Flowing Tricolor Curves on Bottom Left & Right (Layer 2) */}
        <div className="absolute left-0 bottom-0 w-28 sm:w-36 h-5 sm:h-6 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 30" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,30 Q80,0 160,30" fill="#FF9933" fillOpacity="0.35" />
            <path d="M0,30 Q80,10 160,30" fill="#FFFFFF" fillOpacity="0.5" />
            <path d="M0,30 Q80,18 160,30" fill="#138808" fillOpacity="0.35" />
          </svg>
        </div>
        <div className="absolute right-0 bottom-0 w-28 sm:w-36 h-5 sm:h-6 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 30" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,30 Q80,0 160,30" fill="#FF9933" fillOpacity="0.35" />
            <path d="M0,30 Q80,10 160,30" fill="#FFFFFF" fillOpacity="0.5" />
            <path d="M0,30 Q80,18 160,30" fill="#138808" fillOpacity="0.35" />
          </svg>
        </div>

        {/* Semantic Responsive Footer Container (Layer 3 & 4) */}
        <div className="footer-content w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-3.5 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          {/* Government Department Hierarchy */}
          <div className="footer-government flex items-center gap-3 text-left">
            <div className="h-8 w-0.5 bg-[#1E3A8A] rounded-full hidden sm:block shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-[#0F172A] text-[12.5px] sm:text-[13px]">Ministry of Heavy Industries</span>
              <span className="text-[11px] text-[#475569] font-medium">Department of Public Enterprises</span>
              <span className="text-[11px] text-[#64748B]">Government of India</span>
            </div>
          </div>

          {/* Legal & Accessibility Links + Browser Compatibility */}
          <div className="flex flex-col items-center gap-1 text-center">
            <nav className="footer-links flex items-center gap-3 sm:gap-4 text-[11.5px] sm:text-[12px] text-[#334155] font-medium" aria-label="Legal and Accessibility Links">
              <a href="#privacy" className="hover:text-[#1E3A8A] transition-colors">Privacy Policy</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="#accessibility" className="hover:text-[#1E3A8A] transition-colors">Accessibility</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="#terms" className="hover:text-[#1E3A8A] transition-colors">Terms of Use</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="#help" className="hover:text-[#1E3A8A] transition-colors">Help & Support</a>
            </nav>
            <span className="text-[9.5px] sm:text-[10px] text-[#64748B] font-normal">
              Site best viewed in latest versions of Chrome, Firefox, Edge and Safari
            </span>
          </div>

          {/* Dynamic Copyright & Institutional Badges */}
          <div className="footer-meta flex items-center gap-3.5">
            <div className="text-right leading-tight hidden lg:block">
              <span className="font-semibold text-[#0F172A] text-[11px] sm:text-[12px]">© {new Date().getFullYear()} Government of India</span>
            </div>

            {/* Official Digital India Vector Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <svg className="w-7 h-7 shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="20" cy="20" r="18.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <path d="M11 23 C13 14 27 10 29 19 C25 28 15 27 19 17" stroke="#FF9933" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M15 26 C17 19 26 17 26 23 C22 28 17 26 19 21" stroke="#138808" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="20" cy="20" r="2.2" fill="#000080" />
              </svg>
              <div className="text-left leading-tight flex flex-col justify-center">
                <div className="text-[13px] sm:text-[13.5px] font-extrabold text-[#0F172A] tracking-tight">Digital India</div>
                <div className="text-[9.5px] sm:text-[10px] text-[#475569] font-semibold tracking-wide">Power To Empower</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
