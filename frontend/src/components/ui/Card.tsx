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
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs ${className}`}>
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4 border-b border-slate-100 pb-3">
          {icon && <div className="text-brand-600">{icon}</div>}
          <div>
            {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
