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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 selection:bg-brand-500 selection:text-white">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Top Info Column */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  Government Enterprise Portal
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl mt-1">
                National Unified Material Master
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Smart India Hackathon (SIH) 2026 • “One Nation – One Common Material Code”.
            Enterprise role-based access control protecting Layer 1 CPSE catalog data, Layer 2 normalized intelligence, and Layer 3 governed master records.
          </p>

          {/* Demonstration Quick Fill Cards */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700">
                SIH Prototype Demo Personas
              </span>
              <span className="text-[10px] text-slate-500">Click any persona to load credentials</span>
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
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-600 shadow-xs ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                        {demo.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] font-mono">
                      <div className="flex items-center gap-1 text-slate-700 truncate font-semibold">
                        <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{demo.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <KeyRound className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{demo.password}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">{demo.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Official Notice Box */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                <strong>SIH 2026 DEMONSTRATION CREDENTIALS — NON-PRODUCTION ENVIRONMENT.</strong> Select any persona above to load credentials or click <strong>Sign In to Platform</strong> with the pre-filled Admin account.
              </span>
            </div>
          </div>
        </div>

        {/* Right / Login Form Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Portal Authentication</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter registered enterprise credentials to access the platform</p>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md font-semibold">
              Pre-filled: Admin
            </span>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. national_admin@sih.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Enter demonstration password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-gov-navy hover:bg-gov-navy-dark text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Session: Secure JWT Bearer</span>
            <span>Security Standard: ADR-007</span>
          </div>
        </div>
      </div>
    </div>
  );
};
