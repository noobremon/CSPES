import React from 'react';

/**
 * HeroTricolorBackground:
 * Renders a subtle, flowing Indian Tricolor silk wave background animation
 * with top saffron ribbon drift, bottom green ribbon drift, and ambient luminous glows.
 * GPU-accelerated and fully responsive with reduced-motion support.
 */
export const HeroTricolorBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Subtle Pearl White/Slate Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] via-[#F8FAFC] to-[#FFFFFF]" />

      {/* 2. Ambient Radial Glow Bleeds */}
      {/* Saffron Top-Left Glow */}
      <div
        className="tricolor-glow-pulse absolute -top-20 -left-16 w-96 h-56 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 122, 41, 0.22) 0%, rgba(254, 215, 170, 0.12) 50%, transparent 75%)',
        }}
      />

      {/* Green Bottom-Right Glow */}
      <div
        className="tricolor-glow-pulse absolute -bottom-20 -right-16 w-96 h-56 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(5, 120, 63, 0.18) 0%, rgba(187, 247, 208, 0.10) 50%, transparent 75%)',
          animationDelay: '-5s',
        }}
      />

      {/* 3. Top Saffron Flowing Silk Wave Ribbons */}
      <div className="absolute top-0 left-0 right-0 h-28 overflow-hidden pointer-events-none">
        {/* Saffron Ribbon 1 (Primary Wave) */}
        <div className="tricolor-saffron-primary absolute -top-4 -left-10 w-[120%] h-32 opacity-90">
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full preserve-3d"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="saffronFlow1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF671F" stopOpacity="0.26" />
                <stop offset="35%" stopColor="#FF9933" stopOpacity="0.18" />
                <stop offset="70%" stopColor="#FDBA74" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M-20,0 L1460,0 L1460,25 C1220,80 980,15 740,55 C500,95 260,18 -20,45 Z"
              fill="url(#saffronFlow1)"
            />
          </svg>
        </div>

        {/* Saffron Ribbon 2 (Secondary Overlay with Soft Wave Phase) */}
        <div className="tricolor-saffron-secondary absolute -top-6 -left-6 w-[115%] h-28 opacity-80">
          <svg
            viewBox="0 0 1440 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="saffronFlow2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7A29" stopOpacity="0.20" />
                <stop offset="45%" stopColor="#FDBA74" stopOpacity="0.12" />
                <stop offset="85%" stopColor="#FEF3C7" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M-20,0 L1460,0 L1460,15 C1160,50 890,8 620,38 C350,68 140,12 -20,28 Z"
              fill="url(#saffronFlow2)"
            />
          </svg>
        </div>
      </div>

      {/* 4. Bottom Green Flowing Silk Wave Ribbons */}
      <div className="absolute bottom-0 left-0 right-0 h-28 overflow-hidden pointer-events-none">
        {/* Green Ribbon 1 (Primary Wave) */}
        <div className="tricolor-green-primary absolute -bottom-4 -right-10 w-[120%] h-32 opacity-90">
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="greenFlow1" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#046A38" stopOpacity="0.22" />
                <stop offset="35%" stopColor="#10B981" stopOpacity="0.15" />
                <stop offset="70%" stopColor="#86EFAC" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M-20,180 L1460,180 L1460,115 C1240,65 1000,145 760,110 C520,75 260,155 -20,128 Z"
              fill="url(#greenFlow1)"
            />
          </svg>
        </div>

        {/* Green Ribbon 2 (Secondary Overlay with Soft Wave Phase) */}
        <div className="tricolor-green-secondary absolute -bottom-6 -right-6 w-[115%] h-28 opacity-80">
          <svg
            viewBox="0 0 1440 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="greenFlow2" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#05783F" stopOpacity="0.16" />
                <stop offset="45%" stopColor="#4ADE80" stopOpacity="0.10" />
                <stop offset="85%" stopColor="#DCFCE7" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M-20,160 L1460,160 L1460,135 C1180,95 940,160 700,125 C460,95 180,165 -20,140 Z"
              fill="url(#greenFlow2)"
            />
          </svg>
        </div>
      </div>

      {/* 5. Center Linear High-Contrast Mask for Clear Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/40 pointer-events-none" />
    </div>
  );
};
