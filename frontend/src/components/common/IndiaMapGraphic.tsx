import React from 'react';
import indiaMapImg from '../../assets/india-monuments-map.png';

export const IndiaMapGraphic: React.FC<{ className?: string }> = ({ className = "w-auto h-auto" }) => {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 select-none my-auto pr-1 sm:pr-2 ${className}`}
      aria-label="Government of India National Material Master Identity"
    >
      {/* Prominently Sized Crisp Map of India with clean padding from all borders */}
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-44 shrink-0 flex items-center justify-center py-1">
        <img
          src={indiaMapImg}
          alt="Map of India with National Monuments"
          className="w-full h-full object-contain block select-none pointer-events-none drop-shadow-xs"
          loading="eager"
        />
      </div>

      {/* Blue Standardized Materials Stronger Bharat Typography */}
      <div className="flex flex-col text-left leading-tight shrink-0 space-y-0.5 whitespace-nowrap">
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






