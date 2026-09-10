import React from 'react';

export const NationalEmblem: React.FC<{ className?: string }> = ({ className = "w-10 h-14" }) => {
  return (
    <svg
      viewBox="0 0 100 135"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="State Emblem of India"
    >
      {/* Ashoka Lion Capital Vector Representation */}
      <g fill="#1E293B">
        {/* Top Lions Crown / Heads */}
        <path d="M50 8 C47 8 44 10 42 12 C39 9 34 9 32 12 C30 15 31 19 33 22 C30 23 27 26 27 29 C27 33 30 36 34 37 C34 40 36 44 39 46 C37 48 36 52 38 55 C40 58 45 60 50 60 C55 60 60 58 62 55 C64 52 63 48 61 46 C64 44 66 40 66 37 C70 36 73 33 73 29 C73 26 70 23 67 22 C69 19 70 15 68 12 C66 9 61 9 58 12 C56 10 53 8 50 8 Z" />
        
        {/* Mane Details */}
        <path d="M42 22 C40 24 40 28 42 30 C44 28 45 25 44 22 Z" fill="#475569" />
        <path d="M58 22 C60 24 60 28 58 30 C56 28 55 25 56 22 Z" fill="#475569" />
        <path d="M50 18 C48 20 48 24 50 26 C52 24 52 20 50 18 Z" fill="#475569" />
        <circle cx="45" cy="27" r="1.5" fill="#0F172A" />
        <circle cx="55" cy="27" r="1.5" fill="#0F172A" />
        <path d="M47 34 C49 36 51 36 53 34" stroke="#0F172A" strokeWidth="1" fill="none" />

        {/* Abacus Base / Platform */}
        <rect x="22" y="62" width="56" height="12" rx="2" fill="#334155" />
        
        {/* Ashoka Chakra in Central Abacus */}
        <circle cx="50" cy="68" r="4.5" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="50" cy="68" r="1.2" fill="#FFFFFF" />
        {/* Chakra Spokes */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="68"
            x2={50 + 4 * Math.cos((deg * Math.PI) / 180)}
            y2={68 + 4 * Math.sin((deg * Math.PI) / 180)}
            stroke="#FFFFFF"
            strokeWidth="0.6"
          />
        ))}

        {/* Abacus Motifs (Bull & Horse flanking Chakra) */}
        <path d="M28 66 C30 65 33 66 34 68 C33 70 30 71 28 70 Z" fill="#E2E8F0" />
        <path d="M72 66 C70 65 67 66 66 68 C67 70 70 71 72 70 Z" fill="#E2E8F0" />

        {/* Lotus Base / Bell-shaped Pod */}
        <path d="M26 76 C32 78 40 80 50 80 C60 80 68 78 74 76 C76 86 66 94 50 94 C34 94 24 86 26 76 Z" fill="#1E293B" />
        <path d="M32 78 C36 84 42 88 50 88 C58 88 64 84 68 78" stroke="#475569" strokeWidth="1.2" fill="none" />

        {/* Plinth Base */}
        <rect x="18" y="96" width="64" height="6" rx="1.5" fill="#334155" />
        <rect x="14" y="104" width="72" height="4" rx="1" fill="#1E293B" />

        {/* Satyameva Jayate Inscription */}
        <text
          x="50"
          y="122"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fontFamily="'Noto Sans Devanagari', sans-serif"
          fill="#334155"
          letterSpacing="0.5"
        >
          सत्यमेव जयते
        </text>
      </g>
    </svg>
  );
};
