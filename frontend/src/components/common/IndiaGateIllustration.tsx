import React from 'react';

export const IndiaGateIllustration: React.FC<{ className?: string }> = ({ className = "w-48 h-36" }) => {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="India Gate Monument Line Art"
    >
      <g stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
        {/* Top Dome / Cupola / Canopy */}
        <path d="M92 18 C92 14 108 14 108 18 L108 24 L92 24 Z" fill="#DBEAFE" fillOpacity="0.4" />
        <line x1="100" y1="10" x2="100" y2="14" />
        <circle cx="100" cy="10" r="1.5" fill="#93C5FD" />
        <rect x="88" y="24" width="24" height="4" rx="1" />

        {/* Top Cornice & Attic */}
        <rect x="65" y="28" width="70" height="8" rx="1" fill="#EFF6FF" fillOpacity="0.5" />
        <line x1="68" y1="32" x2="132" y2="32" strokeDasharray="2 2" />
        
        {/* Upper Inscription Panel (INDIA) */}
        <rect x="70" y="36" width="60" height="14" fill="#DBEAFE" fillOpacity="0.3" />
        <text
          x="100"
          y="46"
          textAnchor="middle"
          fontSize="6"
          fontWeight="bold"
          letterSpacing="2"
          fill="#3B82F6"
          stroke="none"
        >
          INDIA
        </text>

        {/* Mid Moulding */}
        <rect x="62" y="50" width="76" height="6" rx="1" />
        
        {/* Main Pylons & Arch Structure */}
        <rect x="66" y="56" width="68" height="74" fill="#EFF6FF" fillOpacity="0.2" />

        {/* Outer Left Pillar / Buttress */}
        <line x1="66" y1="56" x2="66" y2="130" strokeWidth="1.5" />
        <line x1="74" y1="56" x2="74" y2="130" />
        <line x1="78" y1="56" x2="78" y2="130" />

        {/* Outer Right Pillar / Buttress */}
        <line x1="134" y1="56" x2="134" y2="130" strokeWidth="1.5" />
        <line x1="126" y1="56" x2="126" y2="130" />
        <line x1="122" y1="56" x2="122" y2="130" />

        {/* Central Grand Arch */}
        <path
          d="M82 130 L82 92 C82 82 118 82 118 92 L118 130"
          fill="#FFFFFF"
          fillOpacity="0.6"
          strokeWidth="1.5"
        />
        {/* Inner Arch Accent Ring */}
        <path
          d="M86 130 L86 94 C86 86 114 86 114 94 L114 130"
          strokeDasharray="2 1.5"
        />

        {/* Side Smaller Niches */}
        <path d="M70 102 L70 88 C70 85 74 85 74 88 L74 102 Z" fill="#DBEAFE" fillOpacity="0.3" />
        <path d="M126 102 L126 88 C126 85 130 85 130 88 L130 102 Z" fill="#DBEAFE" fillOpacity="0.3" />

        {/* Amar Jawan Jyoti Base Hint */}
        <line x1="95" y1="128" x2="105" y2="128" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="100" cy="125" r="1.5" fill="#F59E0B" stroke="none" />

        {/* Base Steps / Plinth */}
        <rect x="56" y="130" width="88" height="6" rx="1" fill="#DBEAFE" fillOpacity="0.4" />
        <rect x="50" y="136" width="100" height="5" rx="1" />
        <line x1="40" y1="141" x2="160" y2="141" strokeWidth="1.5" />

        {/* Subtle ground shrubbery line art */}
        <path d="M30 144 C34 141 38 141 42 144 C46 142 50 143 54 144" stroke="#93C5FD" strokeWidth="1" />
        <path d="M146 144 C150 142 154 141 158 144 C162 142 166 143 170 144" stroke="#93C5FD" strokeWidth="1" />
      </g>
    </svg>
  );
};
