import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, icon, className = '' }) => {
  return (
    <div className={`rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-2xs ${className}`}>
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4 border-b border-[#F1F5F9] pb-3">
          {icon && <div className="text-gov-navy shrink-0">{icon}</div>}
          <div>
            {title && <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">{title}</h3>}
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

