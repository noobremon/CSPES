import React from 'react';
import { IndianFlagAnimated } from './IndianFlagAnimated';

export const IndiaMapGraphic: React.FC<{ className?: string }> = ({ className = "w-auto h-auto" }) => {
  return (
    <div
      className={`flex items-center gap-3.5 bg-white/90 backdrop-blur-xs p-2.5 px-3 rounded-2xl border border-[#CBD5E1] shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
      aria-label="Government of India National Material Master Identity"
    >
      {/* Visual Composition: Background India Map + Foreground Animated National Flag */}
      <div className="relative w-22 h-14 flex items-center justify-center shrink-0">
        
        {/* Subtle Background Vector Map of India */}
        <div className="absolute -left-1.5 -top-1.5 w-14 h-17 opacity-30 pointer-events-none">
          <svg
            viewBox="0 0 100 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-hidden="true"
          >
            {/* Outer boundary of India */}
            <path
              d="M48 4 
                 C52 4 55 7 57 11 
                 C60 12 63 15 62 18 
                 C65 19 68 22 66 25 
                 C69 25 72 27 75 29 
                 C82 29 88 32 93 30 
                 C95 32 94 36 91 38 
                 C86 40 82 42 84 45 
                 C79 46 76 50 73 50 
                 C71 54 67 58 66 63 
                 C63 68 60 75 58 82 
                 C56 90 52 98 50 106 
                 C49 111 48 116 47 118 
                 C46 116 45 111 44 106 
                 C42 98 38 90 36 82 
                 C33 75 30 68 27 63 
                 C24 58 20 54 18 50 
                 C15 50 12 46 8 45 
                 C9 42 12 40 14 38 
                 C18 36 21 37 24 35 
                 C26 31 30 28 33 25 
                 C35 22 37 19 39 18 
                 C40 15 42 12 44 11 
                 C45 7 46 4 48 4 Z"
              fill="#BFDBFE"
              stroke="#60A5FA"
              strokeWidth="1.2"
            />
            {/* Inner shade */}
            <path
              d="M48 8 
                 C51 8 54 11 55 14 
                 C58 15 60 18 59 21 
                 C62 23 65 25 63 28 
                 C66 28 69 30 72 31 
                 C77 31 82 33 86 32 
                 C88 33 87 36 84 38 
                 C80 40 77 41 78 44 
                 C75 45 72 48 70 48 
                 C68 51 65 55 64 59 
                 C61 64 58 70 56 76 
                 C54 83 51 90 49 97 
                 C48 102 48 107 47 110 
                 C46 107 46 102 45 97 
                 C43 90 40 83 38 76 
                 C36 70 33 64 30 59 
                 C28 55 25 51 23 48 
                 C21 48 18 45 15 44 
                 C16 41 19 40 21 38 
                 C24 36 27 37 29 35 
                 C31 32 34 29 37 27 
                 C38 24 40 22 41 21 
                 C42 18 44 15 46 14 
                 C46 11 47 8 48 8 Z"
              fill="#DBEAFE"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Foreground: Subtle Animated Indian National Flag */}
        <div className="relative z-10 -ml-1">
          <IndianFlagAnimated width={48} height={32} />
        </div>
      </div>

      {/* Identity Typography and Tricolor Accent Bar */}
      <div className="flex flex-col text-left leading-tight shrink-0">
        <span className="text-[11px] font-extrabold text-[#0F172A] tracking-tight">
          Standardized
        </span>
        <span className="text-[11px] font-extrabold text-[#0F172A] tracking-tight">
          Materials
        </span>
        <span className="text-[11px] font-extrabold text-[#1D4ED8] tracking-tight">
          Stronger Bharat
        </span>
        {/* Official Tricolor Underline Bar */}
        <div className="flex items-center w-12 h-1 rounded-full overflow-hidden mt-1 shadow-2xs">
          <div className="flex-1 h-full bg-[#FF671F]" />
          <div className="w-1.5 h-full bg-white border-y border-slate-200" />
          <div className="flex-1 h-full bg-[#046A38]" />
        </div>
      </div>
    </div>
  );
};

