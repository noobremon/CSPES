import React from 'react';

/**
 * IndiaMonumentsSkyline:
 * A high-fidelity vector silhouette rendering iconic Indian landmarks:
 * India Gate, Rashtrapati Bhavan, Qutub Minar, Lotus Temple, and the Ashoka Chakra with soaring birds.
 */
export const IndiaMonumentsSkyline: React.FC<{ className?: string; opacity?: number }> = ({ 
  className = "w-full h-full",
  opacity = 0.08
}) => {
  return (
    <svg
      viewBox="0 0 1200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
    >
      <g fill="#1E3A8A" opacity={opacity}>
        {/* Ashoka Chakra in Sky */}
        <circle cx="1060" cy="110" r="80" stroke="#1E3A8A" strokeWidth="2.5" fill="none" opacity="0.6" />
        <circle cx="1060" cy="110" r="16" stroke="#1E3A8A" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="1060" cy="110" r="5" fill="#1E3A8A" opacity="0.8" />
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
          <line
            key={deg}
            x1="1060"
            y1="110"
            x2={1060 + 78 * Math.cos((deg * Math.PI) / 180)}
            y2={110 + 78 * Math.sin((deg * Math.PI) / 180)}
            stroke="#1E3A8A"
            strokeWidth="1.2"
            opacity="0.5"
          />
        ))}

        {/* Flying Birds in Sky */}
        <path d="M820 105 Q830 95 840 105 Q850 95 860 105 Q850 102 840 110 Q830 102 820 105 Z" opacity="0.7" />
        <path d="M855 125 Q863 117 870 125 Q878 117 885 125 Q878 122 870 128 Q863 122 855 125 Z" opacity="0.6" />
        <path d="M800 135 Q806 128 812 135 Q818 128 824 135 Q818 133 812 138 Q806 133 800 135 Z" opacity="0.5" />

        {/* 1. India Gate (Left Landmark) */}
        <rect x="730" y="125" width="80" height="115" rx="2" />
        <rect x="720" y="118" width="100" height="8" rx="1" />
        <rect x="740" y="108" width="60" height="10" rx="1" />
        <path d="M755 108 L760 98 L780 98 L785 108 Z" />
        <path d="M750 240 L750 170 C750 152 790 152 790 170 L790 240 Z" fill="#FFFFFF" fillOpacity="0.9" />

        {/* 2. Rashtrapati Bhavan Dome & Colonnade (Center-Left) */}
        <rect x="830" y="175" width="130" height="65" rx="1" />
        <rect x="870" y="150" width="50" height="25" rx="1" />
        {/* Main Central Dome */}
        <path d="M875 150 C875 120 915 120 915 150 Z" />
        <rect x="892" y="114" width="6" height="8" />
        <line x1="895" y1="110" x2="895" y2="114" stroke="#1E3A8A" strokeWidth="2" />
        {/* Flanking Small Domes / Chhatris */}
        <path d="M840 175 C840 160 855 160 855 175 Z" />
        <path d="M935 175 C935 160 950 160 950 175 Z" />
        {/* Pillars / Archway details */}
        <rect x="880" y="188" width="30" height="52" rx="1" fill="#FFFFFF" fillOpacity="0.8" />

        {/* 3. Qutub Minar (Tall Tower) */}
        <path d="M972 240 L978 110 L986 110 L992 240 Z" />
        <rect x="975" y="130" width="14" height="3" />
        <rect x="974" y="155" width="16" height="3" />
        <rect x="973" y="185" width="18" height="4" />
        <rect x="971" y="215" width="22" height="4" />
        {/* Minar Cupola Finial */}
        <path d="M979 110 L982 98 L985 110 Z" />

        {/* 4. Lotus Temple (Right Landmark) */}
        <path d="M1000 240 C1015 165 1045 165 1060 240 Z" />
        <path d="M1030 240 C1045 150 1075 150 1090 240 Z" />
        <path d="M1060 240 C1075 165 1105 165 1120 240 Z" />
        <path d="M1015 240 C1045 185 1075 185 1105 240 Z" fill="#FFFFFF" fillOpacity="0.4" />

        {/* Ground Baseline / Horizon */}
        <line x1="0" y1="239" x2="1200" y2="239" stroke="#1E3A8A" strokeWidth="1.5" opacity="0.3" />
      </g>
    </svg>
  );
};
