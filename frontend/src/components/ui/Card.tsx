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
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm ${className}`}>
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4 border-b border-slate-800/80 pb-3">
          {icon && <div className="text-brand-500">{icon}</div>}
          <div>
            {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
