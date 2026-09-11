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
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden selection:bg-[#1E3A8A] selection:text-white">
      {/* Background Decorative Ambient Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Top Bar: Official Government Header */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 z-10">
        <div className="flex items-center gap-3.5">
          <NationalEmblem className="w-9 h-12 text-[#1E293B] shrink-0" />
          <div className="text-left">
            <h2 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
              Government of India
            </h2>
            <p className="text-[11px] text-[#64748B] font-medium">
              One Nation. One Standard. Shared Progress.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#475569] font-medium">
          <span className="hover:text-[#1E3A8A] transition-colors">Digital India</span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-[#1E3A8A] transition-colors">Atmanirbhar Bharat</span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-[#1E3A8A] transition-colors">Viksit Bharat</span>
          {/* Indian Tricolor Flag Badge */}
          <div className="w-6 h-4 rounded-xs overflow-hidden flex flex-col shadow-2xs border border-slate-200 ml-1">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#000080]" />
            </div>
            <div className="flex-1 bg-[#128807]" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10">
        
        {/* Left Column: Branding, Roles & Mission */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Platform Title */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#0F172A] text-white rounded-2xl shadow-md shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                National Unified Material Master Framework
              </h1>
              <div className="text-xs sm:text-sm font-bold text-[#2563EB]">
                “One Nation – One Common Material Code”
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-2xl font-medium">
            A unified, intelligent and governed platform for cross-CPSE material standardization, enabling efficient procurement, better resource utilization and a stronger, self-reliant India.
          </p>

          {/* Role Selection Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Select Your Role to Continue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {demoAccounts.map((demo) => {
                const isSelected = email === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleDemoFill(demo.email, demo.password)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/40'
                        : 'bg-white/90 backdrop-blur-xs border-[#E2E8F0] hover:border-blue-300 hover:bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#2563EB]'}`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#0F172A]">
                          {demo.title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 space-y-0.5 bg-slate-50/80 p-2 rounded-xl border border-slate-100 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-[#334155] font-semibold truncate">
                        <Mail className="w-3 h-3 text-[#64748B] shrink-0" />
                        <span className="truncate">{demo.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Lock className="w-3 h-3 text-[#64748B] shrink-0" />
                        <span>{demo.password}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#64748B] mt-2 leading-tight">
                      {demo.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Pillars of the Platform */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#334155] font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Standardize</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[#334155] font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Optimize</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[#334155] font-semibold">
              <Leaf className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Sustain</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[#334155] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Govern</span>
            </div>
          </div>

        </div>

        {/* Right Column: Portal Authentication Card */}
        <div className="lg:col-span-5 relative">
          <div className="bg-white/95 backdrop-blur-md border border-[#CBD5E1] p-7 sm:p-8 rounded-3xl shadow-xl space-y-6">
            
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                    Portal Authentication
                  </h2>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your registered enterprise credentials to access the National Unified Material Master Platform.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-blue-200 px-2 py-1 rounded-md font-semibold shrink-0">
                Enterprise Portal
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0F172A] font-bold mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. national_admin@sih.demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0F172A] font-bold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] hover:border-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Session: Secure JWT Bearer</span>
              <span>Security Standard: ADR-007</span>
            </div>

            {/* Official Notice Callout */}
            <div className="p-3.5 rounded-2xl bg-[#FFF7E6] border border-[#F3D19C] text-[11px] text-[#78350F] flex items-start gap-2.5 shadow-2xs text-left">
              <Info className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                <strong className="text-[#92400E]">ENTERPRISE DEMONSTRATION CREDENTIALS — ACCESS ENVIRONMENT.</strong> Select any persona above to load credentials or click <strong>Sign In to Platform</strong> with the pre-filled Admin account.
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Footer with India Gate Illustration */}
      <div className="w-full max-w-7xl mx-auto pt-6 border-t border-[#CBD5E1] flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="text-xs text-[#64748B] text-center md:text-left">
          Ministry of Heavy Industries &nbsp;|&nbsp; Department of Public Enterprises &nbsp;|&nbsp; Government of India
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <IndiaGateIllustration className="w-36 h-20 text-blue-300 opacity-60" />
          </div>
          <span className="text-xs font-semibold text-[#1E3A8A]">
            Together for a Stronger, Unified India
          </span>
        </div>
      </div>
    </div>
  );
};
