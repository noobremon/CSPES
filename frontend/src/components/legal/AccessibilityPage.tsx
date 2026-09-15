import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { CheckCircle2, Keyboard, Eye, Monitor, AlertCircle, HelpCircle, Layers } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  return (
    <LegalPageLayout
      title="Accessibility Statement"
      subtitle="Commitment to accessible, barrier-free digital governance for all authorized enterprise stakeholders."
      categoryBadge="Digital Inclusivity & Accessibility"
      lastUpdated="September 2026"
    >
      {/* 1. Accessibility Commitment */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
          <h2>1. Accessibility Commitment</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The <strong>National Unified Material Master Framework</strong> is designed to ensure that digital procurement 
          and standardization tools are accessible to all authorized personnel, including individuals with diverse visual, 
          motor, and cognitive abilities across participating Central Public Sector Enterprises (CPSEs).
        </p>
      </section>

      {/* 2. Keyboard Navigation & Focus Visibility */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <Keyboard className="w-5 h-5 text-[#1E3A8A]" />
          <h2>2. Keyboard Navigation & Focus Management</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          All interactive interfaces across the platform are engineered for full keyboard operability:
        </p>
        <ul className="list-disc pl-5 text-xs sm:text-[13px] text-[#475569] space-y-1.5 leading-relaxed">
          <li><strong>Sequential Navigation:</strong> Users can navigate through form fields, buttons, role cards, and navigation links using standard <code>Tab</code> and <code>Shift + Tab</code> sequences.</li>
          <li><strong>High-Visibility Focus Indicators:</strong> Interactive elements utilize distinct, high-contrast outline focus rings (<code>focus:ring-2 focus:ring-[#2563EB]</code>) ensuring clear visual tracking.</li>
          <li><strong>Modal Keyboard Controls:</strong> Dialogs and review modals support dismissing via the <code>Escape</code> key and cycle focus within the modal perimeter.</li>
        </ul>
      </section>

      {/* 3. Form Labels & Input Accessibility */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <Layers className="w-5 h-5 text-[#1E3A8A]" />
          <h2>3. Form Labels & Visual Indicators</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          To facilitate unambiguous interaction, all inputs feature explicit textual labels and visual indicator icons:
        </p>
        <ul className="list-disc pl-5 text-xs sm:text-[13px] text-[#475569] space-y-1.5 leading-relaxed">
          <li>Persistent label titles above all inputs (e.g., <em>Email Address</em>, <em>Password</em>).</li>
          <li>Password visibility toggle with dynamic <code>title</code> and screen-reader accessible attributes.</li>
          <li>Descriptive error alerts containing SVG warning icons and contextual corrective instructions.</li>
        </ul>
      </section>

      {/* 4. Contrast & Visual Design */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <Eye className="w-5 h-5 text-[#1E3A8A]" />
          <h2>4. Color Contrast & Legibility</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The user interface adheres to strict contrast guidelines:
        </p>
        <ul className="list-disc pl-5 text-xs sm:text-[13px] text-[#475569] space-y-1.5 leading-relaxed">
          <li>Primary text utilizes high-contrast slate (<code>#0F172A</code>, <code>#1E293B</code>) against solid light surfaces (<code>#FFFFFF</code>, <code>#F8FAFC</code>).</li>
          <li>Information is never conveyed through color alone; text labels, badges, and icon indicators accompany all status designations.</li>
          <li>Standard typography utilizes clean, modern sans-serif fonts optimized for digital legibility.</li>
        </ul>
      </section>

      {/* 5. Responsive Behavior */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <Monitor className="w-5 h-5 text-[#1E3A8A]" />
          <h2>5. Multi-Device & Display Adaptability</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          The portal layout adapts dynamically across display resolutions (from standard 1366×768 laptops to 4K desktop monitors, tablets, and smartphones) 
          preventing horizontal overflow, text clipping, or inaccessible touch targets.
        </p>
      </section>

      {/* 6. Formal Verification Status */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <AlertCircle className="w-5 h-5 text-[#D97706]" />
          <h2>6. Compliance & Continuous Improvements</h2>
        </div>
        <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] leading-relaxed">
          <strong>Verification Disclosure:</strong> While this portal is engineered to conform with standard digital accessibility 
          principles (including WCAG 2.1 AA recommendations and GIGW design standards), formal statutory third-party certification 
          is pending as part of ongoing platform refinement.
        </div>
      </section>

      {/* 7. Reporting Accessibility Barriers */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          <HelpCircle className="w-5 h-5 text-[#1E3A8A]" />
          <h2>7. Reporting Accessibility Feedback</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
          If you encounter any accessibility barrier or difficulty navigating any component of this platform, 
          please notify the designated portal technical team through established enterprise administrative channels. 
          Feedback helps us continually enhance inclusivity for all users.
        </p>
      </section>
    </LegalPageLayout>
  );
};
