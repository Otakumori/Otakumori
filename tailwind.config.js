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
        anime: ['var(--font-anime)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      colors: {
        sakura: { 50: '#ffe6f1', 300: '#ff7eb3', 500: '#ff4fa0' },
        cube: { 800: '#1f2937', 900: '#0b1220' },
        slatey: { 200: '#e5e7eb', 400: '#94a3b8' },
        glass: {
          bg: 'var(--glass-bg)',
          'bg-hover': 'var(--glass-bg-hover)',
          border: 'var(--glass-border)',
          'border-hover': 'var(--glass-border-hover)',
        },
        // Standardized color system
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          disabled: 'var(--color-primary-disabled)',
          focus: 'var(--color-primary-focus)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          pink: 'var(--color-primary)', // Legacy alias
          purple: 'var(--color-accent)', // Legacy alias
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          link: 'var(--color-text-link)',
          'link-hover': 'var(--color-text-link-hover)',
        },
        bg: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          glass: 'var(--color-bg-glass)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          hover: 'var(--color-border-hover)',
          active: 'var(--color-border-active)',
        },
      },
      spacing: {
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        24: '6rem',
        32: '8rem',
        48: '12rem',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 12px rgba(255,126,179,0.35)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'petal-float': 'petal-float 3s ease-in-out infinite',
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'petal-float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.8' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)', opacity: '1' },
        },
        'glass-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-pink)' },
          '50%': { boxShadow: '0 0 30px var(--glow-pink-strong)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addUtilities }) {
      addUtilities({ '.pixelated': { imageRendering: 'pixelated' } });
    },
  ],
};
