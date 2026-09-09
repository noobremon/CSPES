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
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#bae0ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#12355b',
          950: '#0a1d33',
        },
        gov: {
          navy: '#12355B',
          darknavy: '#0B2238',
          blue: '#2563EB',
          saffron: '#E58E26',
          saffronLight: '#FFF9ED',
          saffronBorder: '#F2D49B',
          green: '#16803C',
          greenLight: '#F0FDF4',
          greenBorder: '#BBF7D0',
          red: '#C53030',
          redLight: '#FEF2F2',
          redBorder: '#FECACA',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
