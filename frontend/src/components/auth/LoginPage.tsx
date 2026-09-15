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
import { useNavigation } from '../../context/NavigationContext';
import { NationalEmblem } from '../common/NationalEmblem';
import { IndiaMonumentsSkyline } from '../common/IndiaMonumentsSkyline';
import { LanguageSelector } from '../common/LanguageSelector';
import { useTranslation } from '../../i18n';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useNavigation();
  const { t } = useTranslation();
  // By default, pre-populate National Master Admin credentials for instant 1-click evaluation
  const [email, setEmail] = useState('national_admin@sih.demo');
  const [password, setPassword] = useState('DemoAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.missingCreds'));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.invalidCreds'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  const handleLegalNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const demoAccounts = [
    {
      role: 'NATIONAL_MASTER_ADMIN',
      titleKey: 'auth.roles.adminTitle',
      descKey: 'auth.roles.adminDesc',
      email: 'national_admin@sih.demo',
      password: 'DemoAdmin@2026',
      icon: ShieldCheck,
    },
    {
      role: 'CPSE_MATERIAL_MANAGER',
      titleKey: 'auth.roles.managerTitle',
      descKey: 'auth.roles.managerDesc',
      email: 'cpse_manager_a@sih.demo',
      password: 'DemoManager@2026',
      icon: Building2,
    },
    {
      role: 'DOMAIN_REVIEWER',
      titleKey: 'auth.roles.reviewerTitle',
      descKey: 'auth.roles.reviewerDesc',
      email: 'domain_reviewer@sih.demo',
      password: 'DemoReviewer@2026',
      icon: UserCheck,
    },
    {
      role: 'AUDITOR',
      titleKey: 'auth.roles.auditorTitle',
      descKey: 'auth.roles.auditorDesc',
      email: 'auditor@sih.demo',
      password: 'DemoAuditor@2026',
      icon: FileCheck2,
    }
  ];

  return (
    <div className="auth-page min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden flex flex-col bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] selection:bg-[#1E3A8A] selection:text-white relative overflow-x-hidden border-t-0">
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH OFFICIAL GOVERNMENT HEADER (MATCHES REFERENCE 1)             */}
      {/* ========================================================================= */}
      <header className="auth-header w-full bg-white border-t-0 border-b border-[#E2E8F0] shrink-0 flex-none z-30 select-none relative overflow-hidden h-[76px] sm:h-[80px]">
        {/* Subtle Decorative Left Tricolor Silk Ribbon Curve (Layer 2) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-28 pointer-events-none z-0" aria-hidden="true">
          <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 Q50,40 0,80" fill="#FF9933" fillOpacity="0.6" />
            <path d="M0,16 Q68,40 0,64" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M0,28 Q80,40 0,52" fill="#138808" fillOpacity="0.6" />
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
            <NationalEmblem className="h-10 sm:h-11 w-auto shrink-0" />
            <div className="h-9 w-[1.5px] bg-slate-300 hidden sm:block shrink-0" />
            <div className="text-left flex flex-col justify-center leading-tight">
              <h1 className="text-[16.5px] sm:text-[17.5px] font-bold text-[#0F172A] tracking-normal leading-snug">
                {t('header.govTitle')}
              </h1>
              <span className="text-[12px] sm:text-[12.5px] font-medium text-[#1E3A8A] leading-normal">
                {t('header.ministry')}
              </span>
              <span className="text-[10px] sm:text-[10.5px] font-normal text-[#64748B] leading-tight">
                {t('header.department')}
              </span>
            </div>
          </div>

          {/* Institutional Links & Indian Flag */}
          <nav className="institutional-links flex items-center gap-4 sm:gap-5 text-[12px] sm:text-[12.5px] text-[#334155] font-medium" aria-label="Institutional Links">
            <a
              href="https://www.digitalindia.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              {t('header.digitalIndia')}
            </a>
            <span className="text-slate-300 hidden md:inline" aria-hidden="true">|</span>
            <a
              href="https://transformingindia.mygov.in/aatmanirbharbharat/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              {t('header.atmanirbhar')}
            </a>
            <span className="text-slate-300 hidden lg:inline" aria-hidden="true">|</span>
            <a
              href="https://innovateindia.mygov.in/viksitbharat2047/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              {t('header.viksit')}
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

            <span className="text-slate-300" aria-hidden="true">|</span>

            {/* Language Selector */}
            <LanguageSelector />
          </nav>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. AUTH-MAIN: BALANCED VIEWPORT AUTHENTICATION AREA                      */}
      {/* ========================================================================= */}
      <main className="auth-main flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4 lg:py-3 px-4 sm:px-8 lg:px-12 w-full max-w-[1400px] mx-auto z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Branding, Roles & Mission */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-3.5 text-left">
            
            {/* Framework Branding */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#0F172A] text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-[20px] sm:text-[22px] lg:text-[23px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
                  {t('auth.frameworkTitle')}
                </h2>
                <div className="text-[12px] sm:text-[13px] font-bold text-[#1E3A8A] tracking-wide">
                  {t('auth.frameworkTagline')}
                </div>
              </div>
            </div>

            {/* Description / Mission */}
            <p className="text-[11px] sm:text-[11.5px] text-[#475569] leading-relaxed max-w-xl font-normal">
              {t('auth.frameworkDesc')}
            </p>

            {/* Role Selection Section */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  {t('auth.selectRole')}
                </span>
              </div>

              {/* 2x2 Desktop Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoAccounts.map((demo) => {
                  const isSelected = email === demo.email;
                  const RoleIcon = demo.icon;
                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoFill(demo.email, demo.password)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#F0F7FF] border-[#2563EB] shadow-xs ring-1 ring-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] hover:border-slate-300 hover:bg-[#FAFBFD] shadow-xs'
                      }`}
                    >
                      {/* Role Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1 rounded-md shrink-0 ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#1E3A8A]'}`}>
                            <RoleIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11.5px] sm:text-[12px] font-bold text-[#0F172A] truncate">
                            {t(demo.titleKey)}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Technical Credentials Box */}
                      <div className="mt-2 px-2 py-1 bg-[#F8FAFC] rounded-lg border border-slate-200/80 text-[9.5px] sm:text-[10px] font-mono space-y-0.5">
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
                      <p className="text-[9.5px] sm:text-[10px] text-[#64748B] mt-1.5 leading-snug line-clamp-1 sm:line-clamp-2">
                        {t(demo.descKey)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Pillars of the Platform */}
            <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-4 gap-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[#475569] font-semibold text-[10.5px] sm:text-[11px]">
                <SlidersHorizontal className="w-3 h-3 text-[#2563EB]" />
                <span>{t('auth.pillars.standardize')}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[#475569] font-semibold text-[10.5px] sm:text-[11px]">
                <TrendingUp className="w-3 h-3 text-[#2563EB]" />
                <span>{t('auth.pillars.optimize')}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[#475569] font-semibold text-[10.5px] sm:text-[11px]">
                <Leaf className="w-3 h-3 text-[#15803D]" />
                <span>{t('auth.pillars.sustain')}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[#475569] font-semibold text-[10.5px] sm:text-[11px]">
                <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
                <span>{t('auth.pillars.govern')}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Portal Authentication Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white border border-[#CBD5E1] p-5 sm:p-5.5 lg:p-6 rounded-2xl shadow-md space-y-3 sm:space-y-3.5">
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] tracking-tight">
                      {t('auth.portalAuth')}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {t('auth.portalSubtitle')}
                  </p>
                </div>
                <span className="text-[10px] font-semibold bg-[#F1F5F9] text-[#1E3A8A] border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                  {t('auth.enterpriseBadge')}
                </span>
              </div>

              {error && (
                <div className="p-2 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1 text-[11px]">
                    {t('auth.emailLabel')}
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 text-[#64748B] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[38px] sm:h-[40px] pl-9 pr-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 font-medium transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-bold mb-1 text-[11px]">
                    {t('auth.passwordLabel')}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={t('auth.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[38px] sm:h-[40px] pl-9 pr-9 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 font-medium transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer flex items-center"
                      title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[38px] sm:h-[40px] mt-1.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-50 cursor-pointer text-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{t('auth.verifying')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('auth.signInBtn')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-0.5 flex items-center justify-between text-[9.5px] sm:text-[10px] text-[#64748B]">
                <span>{t('auth.sessionSecure')}</span>
                <span>{t('auth.securityStandard')}</span>
              </div>

              {/* Official Notice Callout */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[9.5px] sm:text-[10px] text-[#92400E] flex items-start gap-2 shadow-2xs text-left">
                <Info className="w-3.5 h-3.5 text-[#D97706] mt-0.5 shrink-0" />
                <span className="leading-snug">
                  <strong className="text-[#92400E]">{t('auth.demoNoticeTitle')}</strong> {t('auth.demoNoticeText')}
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
        <div className="footer-content w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 relative z-10">
          {/* Government Department Hierarchy with National Emblem */}
          <div className="footer-government flex items-center gap-2.5 sm:gap-3 text-left shrink-0">
            <NationalEmblem className="h-8 sm:h-9 w-auto shrink-0" />
            <div className="h-7 w-[1.5px] bg-slate-300 hidden sm:block shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-[#0F172A] text-[11.5px] sm:text-[12px]">{t('footer.ministry')}</span>
              <span className="text-[10px] sm:text-[10.5px] text-[#475569] font-medium">{t('footer.department')}</span>
              <span className="text-[9.5px] sm:text-[10px] text-[#64748B]">{t('footer.gov')}</span>
            </div>
          </div>

          {/* Legal & Accessibility Links + Browser Compatibility */}
          <div className="flex flex-col items-center gap-0.5 text-center">
            <nav className="footer-links flex items-center gap-3 sm:gap-4 text-[11px] sm:text-[11.5px] text-[#334155] font-medium" aria-label="Legal and Accessibility Links">
              <a href="/privacy-policy" onClick={(e) => handleLegalNav(e, '/privacy-policy')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">{t('footer.privacy')}</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="/accessibility" onClick={(e) => handleLegalNav(e, '/accessibility')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">{t('footer.accessibility')}</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="/terms-of-use" onClick={(e) => handleLegalNav(e, '/terms-of-use')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">{t('footer.terms')}</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="/help-support" onClick={(e) => handleLegalNav(e, '/help-support')} className="hover:text-[#1E3A8A] transition-colors cursor-pointer">{t('footer.help')}</a>
            </nav>
            <span className="text-[9px] sm:text-[9.5px] text-[#64748B] font-normal">
              {t('footer.bestViewed')}
            </span>
          </div>

          {/* Dynamic Copyright & Institutional Badges */}
          <div className="footer-meta flex items-center gap-3 shrink-0">
            <div className="text-right leading-tight hidden lg:block">
              <span className="font-semibold text-[#0F172A] text-[10.5px] sm:text-[11px]">{t('footer.copyright', { year: new Date().getFullYear() })}</span>
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
                  {t('footer.digitalIndia')}
                </span>
                <span className="text-[8.5px] sm:text-[9px] text-[#64748B] font-medium tracking-wide">
                  {t('footer.powerToEmpower')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
