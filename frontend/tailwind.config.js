/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#123B63',
          950: '#0F2F4F',
        },
        gov: {
          // Page & Surfaces
          page: '#F8FAFC',
          card: '#FFFFFF',
          surface: '#F1F5F9',
          surfaceLight: '#F8FAFC',
          blueSurface: '#EFF6FF',
          
          // Borders
          border: '#E2E8F0',
          borderStrong: '#CBD5E1',
          borderSubtle: '#CBD5E1',

          // Typography
          textPrimary: '#0F172A',
          textSecondary: '#475569',
          textMuted: '#64748B',
          textDisabled: '#94A3B8',

          // Primary Authority
          navy: '#123B63',
          'navy-dark': '#0F2F4F',
          darknavy: '#0F2F4F',

          // Interaction Blue
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',

          // Semantic Colors
          green: '#15803D',
          greenLight: '#ECFDF3',
          greenSurface: '#F0FDF4',
          greenBorder: '#BBF7D0',
          greenDark: '#166534',

          amber: '#D97706',
          amberLight: '#FFF7E6',
          amberBorder: '#F3D19C',
          amberHeading: '#92400E',
          amberBody: '#78350F',
          saffron: '#D97706',
          saffronLight: '#FFF7E6',
          saffronBorder: '#F3D19C',
          saffronHeading: '#92400E',
          saffronBody: '#78350F',
          'notice-bg': '#FFF7E6',
          'notice-border': '#F3D19C',

          red: '#B91C1C',
          redLight: '#FEF2F2',
          redBorder: '#FECACA',
          redDark: '#991B1B',

          teal: '#0F766E',
          tealLight: '#F0FDFA',
          tealBorder: '#99F6E4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

