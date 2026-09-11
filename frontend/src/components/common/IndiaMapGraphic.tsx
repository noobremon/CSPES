import React from 'react';
import indiaMapImg from '../../assets/india-monuments-map.png';

export const IndiaMapGraphic: React.FC<{ className?: string }> = ({ className = "w-auto h-auto" }) => {
  return (
    <div
      className={`flex items-center gap-4 bg-white/95 backdrop-blur-md p-3 px-4.5 rounded-2xl border border-[#CBD5E1] shadow-xs hover:shadow-md transition-all select-none ${className}`}
      aria-label="Government of India National Material Master Identity"
    >
      {/* Enlarged Crisp Map of India with Recognizable Monuments */}
      <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 flex items-center justify-center">
        <img
          src={indiaMapImg}
          alt="Map of India with National Monuments"
          className="w-full h-full object-contain block drop-shadow-xs select-none pointer-events-none"
          loading="eager"
        />
      </div>

      {/* Blue Standardized Materials Stronger Bharat Label */}
      <div className="flex flex-col text-left leading-snug shrink-0 space-y-0.5">
        <span className="text-xs sm:text-sm font-extrabold text-[#1D4ED8] tracking-tight">
          Standardized
        </span>
        <span className="text-xs sm:text-sm font-extrabold text-[#1D4ED8] tracking-tight">
          Materials
        </span>
        <span className="text-xs sm:text-sm font-extrabold text-[#1D4ED8] tracking-tight">
          Stronger Bharat
        </span>
      </div>
    </div>
  );
};




