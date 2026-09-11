import React from 'react';
import tricolorBg from '../../assets/tricolor-hero-bg.png';

/**
 * HeroTricolorBackground:
 * Renders the full Indian Tricolor silk wave background image across the hero card
 * using object-fill so the full saffron and green waves are completely visible without cropping.
 */
export const HeroTricolorBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl ${className}`}
      aria-hidden="true"
    >
      {/* Full Background Image - Stretched to 100% Width & 100% Height */}
      <img
        src={tricolorBg}
        alt=""
        className="w-full h-full object-fill block select-none pointer-events-none"
        loading="eager"
      />
    </div>
  );
};


