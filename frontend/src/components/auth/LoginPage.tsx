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
import { IndiaGateIllustration } from '../common/IndiaGateIllustration';
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
    <div className="auth-page min-h-[100dvh] flex flex-col bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] selection:bg-[#1E3A8A] selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Ambient Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH OFFICIAL GOVERNMENT HEADER (76–82px height)                */}
      {/* ========================================================================= */}
      <header className="auth-header w-full h-[76px] sm:h-[80px] bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between relative overflow-hidden shrink-0 z-20 select-none shadow-xs">
        {/* Left Tricolor Graceful Flowing Silk Ribbon */}
        <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 90" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 Q60,45 0,90" fill="#FF9933" fillOpacity="0.75" />
            <path d="M0,18 Q80,45 0,72" fill="#FFFFFF" fillOpacity="0.9" />
            <path d="M0,32 Q95,45 0,58" fill="#138808" fillOpacity="0.75" />
          </svg>
        </div>

        {/* Background Full Monuments Skyline Watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <IndiaMonumentsSkyline className="w-full h-full object-cover" opacity={0.06} />
        </div>

        {/* Left: Government of India Official Identity */}
        <div className="flex items-center gap-3.5 z-10 pl-3 sm:pl-4">
          <NationalEmblem className="w-8 h-12 text-[#1E293B] shrink-0" />
          <div className="h-10 w-[1.5px] bg-slate-300 hidden sm:block shrink-0" />
          <div className="text-left flex flex-col justify-center leading-tight">
            <h1 className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-normal">
              Government of India
            </h1>
            <span className="text-xs sm:text-sm font-semibold text-[#1E3A8A]">
              Ministry of Heavy Industries
            </span>
            <span className="text-[11px] sm:text-xs font-normal text-[#64748B]">
              Department of Public Enterprises
            </span>
          </div>
        </div>

        {/* Right: Institutional Links, Flag & Language Selector */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#475569] font-medium z-10">
          <span className="hidden md:inline hover:text-[#1E3A8A] transition-colors cursor-pointer">Digital India</span>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="hidden lg:inline hover:text-[#1E3A8A] transition-colors cursor-pointer">Atmanirbhar Bharat</span>
          <span className="text-slate-300 hidden lg:inline">|</span>
          <span className="hidden sm:inline hover:text-[#1E3A8A] transition-colors cursor-pointer">Viksit Bharat</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          
          {/* Indian Tricolor Flag Badge */}
          <div className="w-6 h-4 rounded-xs overflow-hidden flex flex-col shadow-2xs border border-slate-300 shrink-0">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#000080]" />
            </div>
            <div className="flex-1 bg-[#128807]" />
          </div>

          <span className="text-slate-300">|</span>

          {/* Language Dropdown Selector */}
          <div className="flex items-center gap-1 font-semibold text-[#0F172A] hover:text-[#1E3A8A] px-1.5 py-1 rounded transition-colors cursor-pointer text-xs">
            <span>English</span>
            <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. AUTH-MAIN: FULL-SCREEN VIEWPORT FIT (VERTICALLY CENTERED)              */}
      {/* ========================================================================= */}
      <main className="auth-main flex-1 min-h-0 flex items-center justify-center p-3 sm:p-5 lg:p-6 w-full max-w-7xl mx-auto z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Branding, Roles & Mission */}
          <div className="lg:col-span-7 space-y-3.5 text-left">
            
            {/* Platform Title */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-[#0F172A] text-white rounded-2xl shadow-md shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-normal leading-tight">
                  National Unified Material Master Framework
                </h2>
                <div className="text-xs sm:text-sm font-bold text-[#2563EB]">
                  “One Nation – One Common Material Code”
                </div>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed max-w-2xl font-medium">
              A unified, intelligent and governed platform for cross-CPSE material standardization, enabling efficient procurement, better resource utilization and a stronger, self-reliant India.
            </p>

            {/* Role Selection Grid */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">
                  Select Your Role to Continue
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoAccounts.map((demo) => {
                  const isSelected = email === demo.email;
                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoFill(demo.email, demo.password)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#2563EB] shadow-xs ring-2 ring-[#2563EB]/40'
                          : 'bg-white/95 backdrop-blur-xs border-[#E2E8F0] hover:border-blue-300 hover:bg-white shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#2563EB]'}`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[#0F172A]">
                            {demo.title}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="mt-2 space-y-0.5 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5 text-[#334155] font-semibold truncate">
                          <Mail className="w-3 h-3 text-[#64748B] shrink-0" />
                          <span className="truncate">{demo.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#64748B]">
                          <Lock className="w-3 h-3 text-[#64748B] shrink-0" />
                          <span>{demo.password}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#64748B] mt-1.5 leading-tight line-clamp-2">
                        {demo.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Pillars of the Platform */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="flex items-center justify-center gap-1 text-[#334155] font-semibold text-[11px]">
                <SlidersHorizontal className="w-3 h-3 text-[#2563EB]" />
                <span>Standardize</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[#334155] font-semibold text-[11px]">
                <TrendingUp className="w-3 h-3 text-[#2563EB]" />
                <span>Optimize</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[#334155] font-semibold text-[11px]">
                <Leaf className="w-3 h-3 text-[#15803D]" />
                <span>Sustain</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[#334155] font-semibold text-[11px]">
                <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
                <span>Govern</span>
              </div>
            </div>

          </div>

          {/* Right Column: Portal Authentication Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/95 backdrop-blur-md border border-[#CBD5E1] p-5 sm:p-6 rounded-2xl shadow-lg space-y-4">
              
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#0F172A] tracking-normal">
                      Portal Authentication
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Enter your registered enterprise credentials to access the platform.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-blue-200 px-2 py-0.5 rounded-md font-semibold shrink-0">
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
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1 text-[11px]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. national_admin@sih.demo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-bold mb-1 text-[11px]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-50 cursor-pointer text-xs"
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

              <div className="pt-1 flex items-center justify-between text-[10px] text-[#64748B]">
                <span>Session: Secure JWT Bearer</span>
                <span>Security Standard: ADR-007</span>
              </div>

              {/* Official Notice Callout */}
              <div className="p-2.5 rounded-xl bg-[#FFF7E6] border border-[#F3D19C] text-[10px] text-[#78350F] flex items-start gap-2 shadow-2xs text-left">
                <Info className="w-3.5 h-3.5 text-[#D97706] mt-0.5 shrink-0" />
                <span className="leading-tight">
                  <strong className="text-[#92400E]">DEMONSTRATION ACCESS:</strong> Select any role above to load credentials or click <strong>Sign In to Platform</strong> with the pre-filled Admin account.
                </span>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. FULL-WIDTH INSTITUTIONAL FOOTER                                        */}
      {/* ========================================================================= */}
      <footer className="auth-footer w-full bg-[#F4F8FB] border-t border-[#DDE7EE] relative overflow-hidden shrink-0 z-20 select-none">
        {/* Upper Subtle Skyline Silhouette Watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <IndiaMonumentsSkyline className="w-full h-full object-cover" opacity={0.06} />
        </div>

        {/* Left & Right Flowing Tricolor Ribbon Curves */}
        <div className="absolute left-0 bottom-0 w-36 h-10 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 40" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,40 Q80,0 160,40" fill="#FF9933" fillOpacity="0.5" />
            <path d="M0,40 Q80,12 160,40" fill="#FFFFFF" fillOpacity="0.7" />
            <path d="M0,40 Q80,24 160,40" fill="#138808" fillOpacity="0.5" />
          </svg>
        </div>
        <div className="absolute right-0 bottom-0 w-36 h-10 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 40" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,40 Q80,0 160,40" fill="#FF9933" fillOpacity="0.5" />
            <path d="M0,40 Q80,12 160,40" fill="#FFFFFF" fillOpacity="0.7" />
            <path d="M0,40 Q80,24 160,40" fill="#138808" fillOpacity="0.5" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs relative z-10">
          {/* Left: Department Hierarchy with Vertical Divider */}
          <div className="flex items-center gap-3 text-left">
            <div className="h-9 w-0.5 bg-[#1E3A8A] rounded-full hidden sm:block shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-[#0F172A] text-xs">Ministry of Heavy Industries</span>
              <span className="text-[11px] text-[#475569] font-medium">Department of Public Enterprises</span>
              <span className="text-[11px] text-[#64748B]">Government of India</span>
            </div>
          </div>

          {/* Center: Legal & Accessibility Links + Browser Note */}
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2.5 text-xs text-[#475569] font-semibold">
              <a href="#privacy" className="hover:text-[#1E3A8A] transition-colors">Privacy Policy</a>
              <span className="text-slate-300">|</span>
              <a href="#accessibility" className="hover:text-[#1E3A8A] transition-colors">Accessibility</a>
              <span className="text-slate-300">|</span>
              <a href="#terms" className="hover:text-[#1E3A8A] transition-colors">Terms of Use</a>
              <span className="text-slate-300">|</span>
              <a href="#help" className="hover:text-[#1E3A8A] transition-colors">Help & Support</a>
            </div>
            <span className="text-[10px] text-[#64748B]">
              Site best viewed in latest versions of Chrome, Firefox, Edge and Safari
            </span>
          </div>

          {/* Right: Copyright & National Badges */}
          <div className="flex items-center gap-3.5">
            <div className="text-right leading-tight hidden lg:block">
              <span className="font-semibold text-[#0F172A] text-[11px]">© 2024 Government of India</span>
            </div>

            {/* Official Digital India Logo */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <path d="M12 24 C14 16 26 12 28 20 C24 28 16 26 20 18" stroke="#FF9933" strokeWidth="3" strokeLinecap="round" />
                <path d="M16 26 C18 20 26 18 26 24 C22 28 18 26 20 22" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="20" cy="20" r="2" fill="#000080" />
              </svg>
              <div className="text-left leading-none">
                <div className="text-[10px] font-extrabold text-[#0F172A]">Digital India</div>
                <div className="text-[7.5px] text-[#64748B] font-medium tracking-tight">Power To Empower</div>
              </div>
            </div>

            {/* Official 75+ Azadi Ka Amrit Mahotsav Logo Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="font-black text-xs text-[#1E3A8A] tracking-tighter">75<sup className="text-[8px]">+</sup></span>
              <div className="text-left leading-none">
                <div className="text-[8.5px] font-black text-[#FF9933]">Azadi<span className="text-[7px] font-normal text-slate-400"> Ka</span></div>
                <div className="text-[7.5px] font-black text-[#138808]">Amrit Mahotsav</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
