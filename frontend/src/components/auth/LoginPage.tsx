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
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setError(null);
  };

  const demoAccounts = [
    {
      role: 'NATIONAL_MASTER_ADMIN',
      title: 'National Master Admin',
      email: 'national_admin@sih.demo',
      icon: ShieldCheck,
      desc: 'National macro intelligence, cross-CPSE matrix, and governance visibility',
    },
    {
      role: 'CPSE_MATERIAL_MANAGER',
      title: 'CPSE Material Manager (IOCL)',
      email: 'cpse_manager_a@sih.demo',
      icon: Building2,
      desc: 'Ingestion, catalog deduplication, and cross-walk mappings for IOCL',
    },
    {
      role: 'DOMAIN_REVIEWER',
      title: 'Domain Reviewer',
      email: 'domain_reviewer@sih.demo',
      icon: UserCheck,
      desc: 'Technical specification review, APPROVE / REJECT / MODIFY candidates',
    },
    {
      role: 'AUDITOR',
      title: 'National Auditor',
      email: 'auditor@sih.demo',
      icon: FileCheck2,
      desc: 'Read-only access to immutable audit trails and governance decision logs',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left / Top Info Column */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-600/20 text-brand-400 rounded-xl border border-brand-500/30 shadow-inner">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                Phase 10 • Secure Multi-Tenant Access
              </span>
              <h1 className="text-xl font-extrabold text-white tracking-tight sm:text-2xl mt-1">
                National Unified Material Master
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Smart India Hackathon (SIH) 2026 • “One Nation – One Common Material Code”.
            Enterprise role-based access control protecting Layer 1 CPSE catalog data, Layer 2 normalized intelligence, and Layer 3 governed master records.
          </p>

          {/* Demonstration Quick Fill Cards */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                SIH Prototype Demo Personas
              </span>
              <span className="text-[10px] text-slate-500">Click persona to load email</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((demo) => {
                const Icon = demo.icon;
                const isSelected = email === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleDemoFill(demo.email)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-brand-500/60 shadow-md ring-1 ring-brand-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-brand-400" />
                        {demo.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">{demo.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span>
                <strong>SIH MVP DEMONSTRATION CREDENTIALS — DEVELOPMENT/DEMO ENVIRONMENT ONLY.</strong> Click a persona to populate the corporate email, then enter your assigned password.
              </span>
            </div>
          </div>
        </div>

        {/* Right / Login Form Card */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 p-7 rounded-2xl shadow-2xl backdrop-blur-md">
          <h2 className="text-lg font-bold text-white tracking-tight">Portal Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your registered enterprise credentials to access the platform</p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Corporate / Government Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. cpse_manager_a@sih.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Enter demonstration password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Session: JWT / HttpOnly Cookie</span>
            <span>Security Standard: ADR-007</span>
          </div>
        </div>
      </div>
    </div>
  );
};
