import React from 'react';

interface IndianFlagAnimatedProps {
  className?: string;
  width?: number; // Flag cloth width in px (default: 54)
  height?: number; // Flag cloth height in px (default: 36, maintaining 3:2 ratio)
}

/**
 * Mathematically accurate Ashoka Chakra with 24 radial spokes,
 * center solid hub, outer concentric ring, and 24 rim decorative teeth.
 */
export const AshokaChakraVector: React.FC<{ size?: number; className?: string }> = ({
  size = 11,
  className = ""
}) => {
  const center = size / 2;
  const radius = (size / 2) - 0.55;
  const innerRadius = 1.0;
  
  // 12 diameter lines passing directly through center = exactly 24 radial spokes
  const angles = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#000080"
        strokeWidth="0.75"
      />
      
      {/* 24 Perimeter Teeth / Accent Dots */}
      {Array.from({ length: 24 }).map((_, i) => {
        const deg = (i * 15 * Math.PI) / 180;
        const dotR = radius - 0.45;
        const x = center + dotR * Math.cos(deg);
        const y = center + dotR * Math.sin(deg);
        return (
          <circle
            key={`chakra-dot-${i}`}
            cx={x}
            cy={y}
            r="0.22"
            fill="#000080"
          />
        );
      })}

      {/* 24 Radial Spokes (12 Diameters) */}
      {angles.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = center + radius * Math.cos(rad);
        const y1 = center + radius * Math.sin(rad);
        const x2 = center - radius * Math.cos(rad);
        const y2 = center - radius * Math.sin(rad);
        return (
          <line
            key={`spoke-${angle}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="0.45"
            strokeLinecap="round"
          />
        );
      })}

      {/* Center Hub Outer Ring */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius + 0.35}
        stroke="#000080"
        strokeWidth="0.3"
        fill="none"
      />

      {/* Central Solid Hub */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="#000080"
      />
    </svg>
  );
};

/**
 * Pure SVG Indian National Flag Graphic (3:2 Aspect Ratio)
 */
export const IndianFlagSVG: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const bandHeight = height / 3;
  const chakraSize = bandHeight * 0.88;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full block select-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Subtle fabric gradient for saffron band */}
        <linearGradient id="saffronBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7A29" />
          <stop offset="100%" stopColor="#FF671F" />
        </linearGradient>

        {/* Subtle fabric gradient for white band */}
        <linearGradient id="whiteBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        {/* Subtle fabric gradient for green band */}
        <linearGradient id="greenBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05783F" />
          <stop offset="100%" stopColor="#046A38" />
        </linearGradient>
      </defs>

      {/* Top Band: India Saffron (Kesari) */}
      <rect
        x="0"
        y="0"
        width={width}
        height={bandHeight}
        fill="url(#saffronBand)"
      />

      {/* Middle Band: Pure White */}
      <rect
        x="0"
        y={bandHeight}
        width={width}
        height={bandHeight}
        fill="url(#whiteBand)"
      />

      {/* Bottom Band: India Green */}
      <rect
        x="0"
        y={bandHeight * 2}
        width={width}
        height={bandHeight}
        fill="url(#greenBand)"
      />

      {/* Center White Band: Ashoka Chakra */}
      <foreignObject
        x={(width - chakraSize) / 2}
        y={bandHeight + (bandHeight - chakraSize) / 2}
        width={chakraSize}
        height={chakraSize}
      >
        <div className="w-full h-full flex items-center justify-center">
          <AshokaChakraVector size={chakraSize} />
        </div>
      </foreignObject>

      {/* Right Edge Fabric Hem Seam */}
      <line
        x1={width - 0.5}
        y1="0"
        x2={width - 0.5}
        y2={height}
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="0.5"
      />
    </svg>
  );
};

/**
 * Animated Indian National Flag with flagpole, progressive wave physics,
 * subtle fabric lighting sheen, and ambient floating motion.
 */
export const IndianFlagAnimated: React.FC<IndianFlagAnimatedProps> = ({
  className = "",
  width = 54,
  height = 36
}) => {
  const sliceCount = 10;
  const poleHeight = height + 10;
  const poleWidth = 2.5;

  return (
    <div
      className={`relative inline-flex items-center select-none ${className}`}
      role="img"
      aria-label="Indian National Flag waving gracefully with Ashoka Chakra"
    >
      {/* Flagpole & Ground Shadow Group */}
      <div className="flag-floating-group relative flex items-center">
        
        {/* Ground Drop Shadow beneath the waving flag */}
        <div
          className="flag-ambient-shadow absolute -bottom-2 left-2 rounded-full bg-slate-400/20 blur-xs pointer-events-none"
          style={{ width: `${width}px`, height: '4px' }}
        />

        {/* Flagpole (Mast) */}
        <div
          className="relative flex flex-col items-center shrink-0 z-20"
          style={{ height: `${poleHeight}px`, width: '8px' }}
        >
          {/* Top Golden Brass Finial Ornament Sphere */}
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#D97706] via-[#F59E0B] to-[#FEF3C7] shadow-xs border border-[#B45309]/30 shrink-0 -mb-0.5 z-10" />

          {/* Chrome / Brushed Silver Pole Mast */}
          <div
            className="flex-1 rounded-full shadow-2xs"
            style={{
              width: `${poleWidth}px`,
              background: 'linear-gradient(to right, #94A3B8 0%, #F1F5F9 50%, #64748B 100%)',
              border: '0.5px solid rgba(100, 116, 139, 0.4)'
            }}
          />

          {/* Top Gold Grommet / Eyelet */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-[#D97706] border border-[#FEF3C7] -right-0.5"
            style={{ top: '6px' }}
          />

          {/* Bottom Gold Grommet / Eyelet */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-[#D97706] border border-[#FEF3C7] -right-0.5"
            style={{ top: `${height + 4}px` }}
          />

          {/* Base Mount Bracket */}
          <div
            className="w-2 h-1 rounded-sm -mt-0.5 shadow-xs"
            style={{
              background: 'linear-gradient(to bottom, #94A3B8, #475569)',
              border: '0.5px solid #334155'
            }}
          />
        </div>

        {/* Waving Fabric Cloth Container */}
        <div
          className="relative rounded-r-xs overflow-hidden shadow-xs border border-black/5 -ml-1 z-10"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          {/* 10 Vertical Micro-Slices for Seamless Cloth Wave Physics */}
          {Array.from({ length: sliceCount }).map((_, i) => {
            const sliceWidthPercent = 100 / sliceCount;
            // Wave amplitude grows progressively from 0px at mast to ~2.6px at fly edge
            const progressiveAmp = (Math.pow(i / (sliceCount - 1), 1.25) * 2.6).toFixed(2);
            const delay = (-0.22 * i).toFixed(2);

            return (
              <div
                key={`flag-slice-${i}`}
                className="flag-wave-slice absolute top-0 bottom-0 overflow-hidden pointer-events-none"
                style={{
                  left: `${i * sliceWidthPercent}%`,
                  width: `${sliceWidthPercent + 0.5}%`, // tiny overlap to prevent sub-pixel gaps
                  // @ts-expect-error CSS variable for keyframe transform
                  '--wave-amp': `${progressiveAmp}px`,
                  animationDelay: `${delay}s`,
                }}
              >
                {/* Embedded SVG Flag slice offset */}
                <div
                  className="absolute top-0"
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    left: `-${(i * width) / sliceCount}px`,
                  }}
                >
                  <IndianFlagSVG width={width} height={height} />
                </div>
              </div>
            );
          })}

          {/* Fabric Light & Shadow Specular Sheen Overlay */}
          <div
            className="flag-sheen-overlay absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 25%, rgba(0,0,0,0.08) 50%, rgba(255,255,255,0.14) 75%, rgba(255,255,255,0) 100%)',
              backgroundSize: '200% 100%',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Soft Fabric Texture Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
