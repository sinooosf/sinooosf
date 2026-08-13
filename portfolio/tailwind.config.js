/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',       // page background
        panel: '#121212',     // slightly raised panels
        blood: '#d81c2f',     // primary red accent
        'blood-dim': '#8c1420',
        bone: '#f5f1ea',      // off-white text
        smoke: '#8a8a8a',     // muted gray text
        line: '#2a2a2a',      // hairline dividers
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Arial Black"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(216,28,47,0.45)' },
          '50%': { boxShadow: '0 0 0 8px rgba(216,28,47,0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
