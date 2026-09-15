import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { FileCheck, UserCheck, ShieldAlert, BookOpen, Globe2, Scale, AlertOctagon, HelpCircle } from 'lucide-react';

export const TermsOfUsePage: React.FC = () => {
  return (
    <LegalPageLayout
      title="Terms of Use"
      subtitle="Operational rules, authorized usage guidelines, and governance conditions for the National Unified Material Master Framework."
      categoryBadge="Platform Terms & Governance"
      lastUpdated="September 2026"
    >
      {/* 1. Acceptance of Terms */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <FileCheck className="w-5 h-5 text-[#1E3A8A]" />
          <h2>1. Acceptance of Terms</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          By accessing and authenticating into the <strong>National Unified Material Master Framework</strong> platform, 
          you agree to be bound by these Terms of Use and all applicable administrative directives governing Central Public Sector 
          Enterprise (CPSE) data sharing, standardization, and procurement governance.
        </p>
      </section>

      {/* 2. Authorized Enterprise Scope */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <UserCheck className="w-5 h-5 text-[#1E3A8A]" />
          <h2>2. Authorized Enterprise Scope</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          Access to this platform is strictly restricted to designated representatives of participating CPSEs, 
          domain review committees, statutory auditors, and national framework administrators. Users must only 
          perform actions aligned with their assigned role:
        </p>
        <ul className="list-disc pl-5 text-xs sm:text-[13px] text-[#475569] space-y-1.5 leading-relaxed">
          <li><strong>National Master Admin:</strong> System oversight, cross-CPSE matrix monitoring, and macro intelligence analytics.</li>
          <li><strong>CPSE Material Manager:</strong> Material catalog ingestion, local-to-national cross-walk mapping, and duplicate reconciliation for their designated CPSE.</li>
          <li><strong>Domain Reviewer:</strong> Reviewing candidate material codifications, verifying technical specifications, and submitting formal APPROVE / REJECT / MODIFY resolutions.</li>
          <li><strong>National Auditor:</strong> Independent inspection of governance logs and audit trails.</li>
        </ul>
      </section>

      {/* 3. Account Responsibilities & Demo Credentials */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <ShieldAlert className="w-5 h-5 text-[#1E3A8A]" />
          <h2>3. Account Responsibilities & Demonstration Access</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          Users are responsible for safeguarding their session tokens and maintaining strict confidentiality of authorized credentials. 
          Sharing credentials or attempting to circumvent role-based access control boundaries is strictly prohibited.
        </p>
        <div className="p-3.5 bg-[#EFF6FF] border border-blue-200 rounded-xl text-xs text-[#1E3A8A] leading-relaxed">
          <strong>Demonstration Accounts Notice:</strong> Pre-populated demo accounts are supplied for platform evaluation. 
          Modifications made in demonstration environments are processed within the prototype workflow and do not affect gazetted statutory procurement databases.
        </div>
      </section>

      {/* 4. Prohibited Misuse */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <AlertOctagon className="w-5 h-5 text-[#B91C1C]" />
          <h2>4. Prohibited Conduct</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The following activities are strictly prohibited:
        </p>
        <ul className="list-disc pl-5 text-xs sm:text-[13px] text-[#475569] space-y-1.5 leading-relaxed">
          <li>Attempting unauthorized access to another CPSE&apos;s proprietary catalog data without explicit governance permission.</li>
          <li>Injecting corrupted, malicious, or fabricated material master specifications into the ingestion pipeline.</li>
          <li>Tampering with, altering, or circumventing cryptographic JWT tokens or immutable audit log records.</li>
          <li>Automated scraping or extraction of bulk material master data outside of official API integration channels.</li>
        </ul>
      </section>

      {/* 5. Intellectual Property & Codification Standards */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <BookOpen className="w-5 h-5 text-[#1E3A8A]" />
          <h2>5. Intellectual Property & Codification Schemas</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The National Common Material Code (CNMC) hierarchical taxonomy, vector embedding deduplication models, 
          system architecture, and interface designs are proprietary to the participating national framework authorities. 
          Individual CPSE item master definitions remain the property of the respective originating enterprise.
        </p>
      </section>

      {/* 6. External Links */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <Globe2 className="w-5 h-5 text-[#1E3A8A]" />
          <h2>6. External Institutional Links</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The platform includes links to official Government of India initiatives (Digital India, Atmanirbhar Bharat, Viksit Bharat) 
          for informational reference. These third-party governmental destinations maintain their own independent terms and privacy practices.
        </p>
      </section>

      {/* 7. Service Availability & Changes */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <Scale className="w-5 h-5 text-[#1E3A8A]" />
          <h2>7. Service Availability & Amendments</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The administration reserves the right to modify, update, or temporarily suspend portal services for system maintenance, 
          security upgrades, or policy alignment. Continued usage of the portal following updates signifies acceptance of revised terms.
        </p>
      </section>

      {/* 8. Administrative Guidance */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <HelpCircle className="w-5 h-5 text-[#1E3A8A]" />
          <h2>8. Administrative Inquiries</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          For questions concerning these Terms of Use, please reach out to the designated portal technical administrator through established institutional support channels.
        </p>
      </section>
    </LegalPageLayout>
  );
};
