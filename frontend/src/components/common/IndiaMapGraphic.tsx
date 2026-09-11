import React from 'react';
import indiaMapImg from '../../assets/india-monuments-map.png';

export const IndiaMapGraphic: React.FC<{ className?: string }> = ({ className = "w-auto h-auto" }) => {
  return (
    <div
      className={`flex items-center gap-4 select-none ${className}`}
      aria-label="Government of India National Material Master Identity"
    >
      {/* Crisp Map of India with National Monuments */}
      <div className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0 flex items-center justify-center">
        <img
          src={indiaMapImg}
          alt="Map of India with National Monuments"
          className="w-full h-full object-contain block drop-shadow-sm select-none pointer-events-none"
          loading="eager"
        />
      </div>

      {/* Blue Standardized Materials Stronger Bharat Typography */}
      <div className="flex flex-col text-left leading-snug shrink-0 space-y-0.5">
        <span className="text-sm sm:text-base font-extrabold text-[#1E3A8A] tracking-tight">
          Standardized
        </span>
        <span className="text-sm sm:text-base font-extrabold text-[#1E3A8A] tracking-tight">
          Materials
        </span>
        <span className="text-sm sm:text-base font-extrabold text-[#1D4ED8] tracking-tight">
          Stronger Bharat
        </span>
      </div>
    </div>
  );
};





