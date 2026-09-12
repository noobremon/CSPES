import React from 'react';
import indiaMapImg from '../../assets/india-monuments-map.png';

export const IndiaMapGraphic: React.FC<{ className?: string }> = ({ className = "w-auto h-auto" }) => {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 select-none my-auto ${className}`}
      aria-label="Government of India National Material Master Identity"
    >
      {/* Significantly Enlarged Crisp Map of India spanning full height with minimal gap to borders */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-56 shrink-0 flex items-center justify-center -my-3 sm:-my-4">
        <img
          src={indiaMapImg}
          alt="Map of India with National Monuments"
          className="w-full h-full object-contain block select-none pointer-events-none drop-shadow-xs"
          loading="eager"
        />
      </div>

      {/* Blue Standardized Materials Stronger Bharat Typography */}
      <div className="flex flex-col text-left leading-tight shrink-0 space-y-0.5">
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






