/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        medieval: ['var(--font-medieval)', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        sakura: { 50: '#ffe6f1', 300: '#ff7eb3', 500: '#ff4fa0' },
        cube: { 800: '#1f2937', 900: '#0b1220' },
        slatey: { 200: '#e5e7eb', 400: '#94a3b8' },
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
      boxShadow: { glow: '0 0 12px rgba(255,126,179,0.35)' },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addUtilities }) {
      addUtilities({ '.pixelated': { imageRendering: 'pixelated' } });
    },
  ],
};
