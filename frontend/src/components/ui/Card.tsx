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
    <div className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-shadow ${className}`}>
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-3.5 border-b border-[#F1F5F9] pb-3">
          {icon && <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">{icon}</div>}
          <div className="text-left">
            {title && <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-[#64748B] font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
