import React from 'react';

export const IndiaMapGraphic: React.FC<{ className?: string }> = ({ className = "w-44 h-24" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0 w-20 h-24">
        {/* Stylized Vector Silhouette Map of India */}
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <path
            d="M48 6 
               C52 6 56 10 54 14 
               C58 14 62 18 60 22 
               C64 24 68 28 66 32 
               C72 32 80 34 88 32 
               C94 34 96 40 92 44 
               C86 46 82 48 84 52 
               C80 54 78 60 74 60 
               C72 64 68 68 66 74 
               C62 80 58 88 56 96 
               C54 104 50 112 48 116 
               C46 112 42 104 40 96 
               C36 86 32 78 28 72 
               C24 66 20 62 16 62 
               C12 60 8 54 12 48 
               C16 44 22 46 26 42 
               C28 36 34 32 38 28 
               C40 22 42 16 44 10 
               Z"
            fill="url(#indiaMapGrad)"
            stroke="#93C5FD"
            strokeWidth="1.2"
          />
          {/* Ashoka Chakra Center Node */}
          <circle cx="50" cy="56" r="3.5" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="50" cy="56" r="1" fill="#FFFFFF" />

          {/* Connected Network Nodes representing CPSEs */}
          <circle cx="34" cy="48" r="2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="68" cy="48" r="2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="52" cy="80" r="2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.8" />
          <line x1="50" y1="56" x2="34" y2="48" stroke="#93C5FD" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
          <line x1="50" y1="56" x2="68" y2="48" stroke="#93C5FD" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
          <line x1="50" y1="56" x2="52" y2="80" stroke="#93C5FD" strokeWidth="0.8" strokeDasharray="1.5 1.5" />

          <defs>
            <linearGradient id="indiaMapGrad" x1="50" y1="6" x2="50" y2="116" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#EFF6FF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.85" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <span className="text-[11px] font-extrabold text-[#1E3A8A] leading-tight tracking-tight">
          Standard Materials
        </span>
        <span className="text-[11px] font-extrabold text-[#1E3A8A] leading-tight tracking-tight">
          Stronger India
        </span>
      </div>
    </div>
  );
};
