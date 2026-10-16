/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — Charcoal + Safety Orange
        primary: '#E8610A',
        'primary-dark': '#C4510A',
        'primary-light': '#F08040',
        accent: '#F5A623',
        'accent-dark': '#D4891A',
        background: '#F7F7F7',
        surface: '#FFFFFF',
        ink: '#1A1A1A',
        muted: '#6A6A6A',
        divider: '#E0E0E0',
        deep: '#111214',
        // Dark mode surfaces
        'dark-bg': '#0F1014',
        'dark-surface': '#181A1E',
        'dark-border': '#2A2C32',
        'dark-ink': '#F1F2F4',
        'dark-muted': '#8B8E96',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'primary-glow': '0 4px 24px rgba(232,97,10,0.30)',
        'card': '0 2px 16px rgba(0,0,0,0.07)',
        'card-dark': '0 2px 16px rgba(0,0,0,0.40)',
      },
    },
  },
  plugins: [],
}
