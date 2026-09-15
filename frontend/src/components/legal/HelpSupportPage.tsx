import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { HelpCircle, LogIn, KeyRound, AlertTriangle, Monitor, Sparkles, PhoneCall, ShieldCheck } from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const demoAccounts = [
    {
      role: 'National Master Admin',
      email: 'national_admin@sih.demo',
      password: 'DemoAdmin@2026',
      scope: 'National macro intelligence, cross-CPSE matrix, and governance visibility',
    },
    {
      role: 'CPSE Material Manager (IOCL)',
      email: 'cpse_manager_a@sih.demo',
      password: 'DemoManager@2026',
      scope: 'Ingestion, catalog deduplication, and cross-walk mappings for IOCL',
    },
    {
      role: 'Domain Reviewer',
      email: 'domain_reviewer@sih.demo',
      password: 'DemoReviewer@2026',
      scope: 'Technical specification review, APPROVE / REJECT / MODIFY candidates',
    },
    {
      role: 'National Auditor',
      email: 'auditor@sih.demo',
      password: 'DemoAuditor@2026',
      scope: 'Read-only access to immutable audit trails and governance decision logs',
    },
  ];

  return (
    <LegalPageLayout
      title="Help & Support"
      subtitle="Operational user guides, authentication assistance, demo credentials, and technical support procedures."
      categoryBadge="User Assistance & Technical Support"
      lastUpdated="September 2026"
    >
      {/* 1. Portal Overview */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <HelpCircle className="w-5 h-5 text-[#1E3A8A]" />
          <h2>1. Portal Overview & Workflow Guide</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The <strong>National Unified Material Master Framework</strong> enables public sector enterprises across India 
          to standardize item catalogs under a unified 10-digit National Common Material Code (CNMC). 
          The workflow operates in four progressive stages:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-left space-y-1">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Step 1</span>
            <h3 className="text-xs font-bold text-[#0F172A]">Data Ingestion</h3>
            <p className="text-[11px] text-[#64748B]">CPSEs upload raw material catalogs via CSV/XLSX or automated pipeline.</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-left space-y-1">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Step 2</span>
            <h3 className="text-xs font-bold text-[#0F172A]">Deduplication</h3>
            <p className="text-[11px] text-[#64748B]">Vector search identifies semantic duplicates across organizations.</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-left space-y-1">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Step 3</span>
            <h3 className="text-xs font-bold text-[#0F172A]">Governance Review</h3>
            <p className="text-[11px] text-[#64748B]">Domain experts approve, modify, or reject proposed codifications.</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-left space-y-1">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Step 4</span>
            <h3 className="text-xs font-bold text-[#0F172A]">National Analytics</h3>
            <p className="text-[11px] text-[#64748B]">Macro intelligence reveals joint procurement opportunities.</p>
          </div>
        </div>
      </section>

      {/* 2. Role Selection & Sign-In */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <LogIn className="w-5 h-5 text-[#1E3A8A]" />
          <h2>2. How to Authenticate & Select Your Role</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          On the authentication portal, you can log in by clicking on any of the four role cards to automatically load 
          demonstration credentials into the login form, or by entering your registered enterprise email and password 
          and clicking <strong>Sign In to Platform</strong>.
        </p>
      </section>

      {/* 3. Demonstration Credentials Reference Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <KeyRound className="w-5 h-5 text-[#1E3A8A]" />
          <h2>3. Pre-Configured Demonstration Accounts</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          For evaluation purposes, the following credentials are provided to test each specific RBAC governance tier:
        </p>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-slate-200 text-[#0F172A]">
                <th className="p-2.5 font-bold">Role Title</th>
                <th className="p-2.5 font-bold">Email Address</th>
                <th className="p-2.5 font-bold">Password</th>
                <th className="p-2.5 font-bold">Scope / Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {demoAccounts.map((acc) => (
                <tr key={acc.email} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-semibold text-[#0F172A]">{acc.role}</td>
                  <td className="p-2.5 font-mono text-[11px] text-[#1E3A8A]">{acc.email}</td>
                  <td className="p-2.5 font-mono text-[11px] text-[#64748B]">{acc.password}</td>
                  <td className="p-2.5 text-[#475569] text-[11px]">{acc.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Common Login Issues & Troubleshooting */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <AlertTriangle className="w-5 h-5 text-[#D97706]" />
          <h2>4. Troubleshooting Common Login Issues</h2>
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-left space-y-1">
            <h3 className="text-xs font-bold text-[#0F172A]">Issue: &quot;Please provide both email and password&quot;</h3>
            <p className="text-[11px] text-[#475569]">
              Ensure both fields are populated. You can click any of the 4 role cards on the left to instantly fill verified demo credentials.
            </p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-left space-y-1">
            <h3 className="text-xs font-bold text-[#0F172A]">Issue: &quot;Invalid credentials&quot; or Session Failure</h3>
            <p className="text-[11px] text-[#475569]">
              Confirm that the backend FastAPI server is running on <code>http://localhost:8000</code> and seeded with demo accounts.
            </p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-left space-y-1">
            <h3 className="text-xs font-bold text-[#0F172A]">Password Visibility</h3>
            <p className="text-[11px] text-[#475569]">
              Click the eye icon inside the password field to toggle plain text visibility and verify your entered characters.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Browser & Environment Recommendations */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <Monitor className="w-5 h-5 text-[#1E3A8A]" />
          <h2>5. System & Browser Compatibility</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          For optimal security, responsiveness, and performance, access the portal using the latest version of modern browsers:
        </p>
        <ul className="list-disc pl-5 text-xs sm:text-[13px] text-[#475569] space-y-1 leading-relaxed">
          <li>Google Chrome &bull; Mozilla Firefox &bull; Microsoft Edge &bull; Apple Safari</li>
          <li>JavaScript and LocalStorage must be enabled in browser settings to maintain authentication tokens.</li>
        </ul>
      </section>

      {/* 6. Technical Support Contact Guidance */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <PhoneCall className="w-5 h-5 text-[#1E3A8A]" />
          <h2>6. Technical Support Channels</h2>
        </div>
        <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl text-left space-y-2">
          <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
            If you encounter unexpected errors, need assistance with CPSE data ingestion, or require password resets for production environments, please contact the portal technical administrator through the designated evaluation and project support channel.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1E3A8A]">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Designated Support Channel: Portal System Administration</span>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  );
};
