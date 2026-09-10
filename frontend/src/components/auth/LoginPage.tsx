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
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  // By default, pre-populate National Master Admin credentials for instant 1-click evaluation
  const [email, setEmail] = useState('national_admin@sih.demo');
  const [password, setPassword] = useState('DemoAdmin@2026');
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6 selection:bg-gov-navy selection:text-white">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Top Info Column */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gov-navy text-white rounded-xl shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gov-blue bg-gov-blueSurface px-2.5 py-0.5 rounded border border-blue-200">
                  Government Enterprise Portal
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight sm:text-2xl mt-1">
                National Unified Material Master
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#475569] leading-relaxed font-medium">
            Smart India Hackathon (SIH) 2026 • “One Nation – One Common Material Code”.
            Enterprise role-based access control protecting Layer 1 CPSE catalog data, Layer 2 normalized intelligence, and Layer 3 governed master records.
          </p>

          {/* Demonstration Quick Fill Cards */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#0F172A]">
                SIH Prototype Demo Personas
              </span>
              <span className="text-[10px] text-[#64748B]">Click any persona to load credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((demo) => {
                const Icon = demo.icon;
                const isSelected = email === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleDemoFill(demo.email, demo.password)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#2563EB] shadow-2xs ring-1 ring-[#2563EB]'
                        : 'bg-white border-[#E2E8F0] hover:border-slate-300 hover:bg-[#F8FAFC] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                        {demo.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5 bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0] text-[10px] font-mono">
                      <div className="flex items-center gap-1 text-[#475569] truncate font-semibold">
                        <Mail className="w-2.5 h-2.5 text-[#64748B] shrink-0" />
                        <span className="truncate">{demo.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#64748B]">
                        <KeyRound className="w-2.5 h-2.5 text-[#64748B] shrink-0" />
                        <span>{demo.password}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-1.5 leading-tight">{demo.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Official Notice Box */}
            <div className="p-3.5 rounded-xl bg-[#FFF7E6] border border-[#F3D19C] text-[11px] text-[#78350F] flex items-start gap-2.5 shadow-2xs">
              <Info className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                <strong className="text-[#92400E]">SIH 2026 DEMONSTRATION CREDENTIALS — NON-PRODUCTION ENVIRONMENT.</strong> Select any persona above to load credentials or click <strong>Sign In to Platform</strong> with the pre-filled Admin account.
              </span>
            </div>
          </div>
        </div>

        {/* Right / Login Form Card */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] p-8 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Portal Authentication</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Enter registered enterprise credentials to access the platform</p>
            </div>
            <span className="text-[10px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-blue-200 px-2 py-1 rounded-md font-semibold">
              Pre-filled: Admin
            </span>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block text-[#0F172A] font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. national_admin@sih.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#64748B] hover:border-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#0F172A] font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Enter demonstration password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#64748B] hover:border-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-gov-navy hover:bg-gov-navy-dark text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
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

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Session: Secure JWT Bearer</span>
            <span>Security Standard: ADR-007</span>
          </div>
        </div>
      </div>
    </div>
  );
};
