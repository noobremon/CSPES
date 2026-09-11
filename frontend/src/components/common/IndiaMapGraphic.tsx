import React from 'react';
import indiaMapImg from '../../assets/india-monuments-map.png';

export const IndiaMapGraphic: React.FC<{ className?: string }> = ({ className = "w-auto h-auto" }) => {
  return (
    <div
      className={`flex items-center gap-3 bg-white/95 backdrop-blur-xs p-2 px-3 rounded-2xl border border-[#CBD5E1] shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
      aria-label="Government of India National Material Master Identity"
    >
      {/* Illustrated Vector Map of India with Monuments */}
      <div className="relative w-14 h-16 shrink-0 flex items-center justify-center">
        <img
          src={indiaMapImg}
          alt="Map of India with National Monuments"
          className="w-full h-full object-contain block drop-shadow-2xs select-none pointer-events-none"
          loading="eager"
        />
      </div>

      {/* Label Text Only */}
      <div className="flex flex-col text-left leading-tight shrink-0">
        <span className="text-[11px] font-extrabold text-[#0E7490] tracking-tight">
          Standardized
        </span>
        <span className="text-[11px] font-extrabold text-[#0E7490] tracking-tight">
          Materials
        </span>
        <span className="text-[11px] font-extrabold text-[#0E7490] tracking-tight">
          Stronger Bharat
        </span>
      </div>
    </div>
  );
};



