import React from 'react';
import tricolorBg from '../../assets/tricolor-hero-bg.png';

/**
 * HeroTricolorBackground:
 * Renders the full Indian Tricolor silk wave background image across the hero card.
 */
export const HeroTricolorBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base White Layer */}
      <div className="absolute inset-0 bg-white" />

      {/* 2. Full Background Image */}
      <img
        src={tricolorBg}
        alt=""
        className="w-full h-full object-cover object-center block opacity-95"
        loading="eager"
      />

      {/* 3. Subtle Luminous Center Highlight for Crisp Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/20 pointer-events-none" />
    </div>
  );
};

