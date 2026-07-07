/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        inkNight: '#121221',
        marqueeRed: '#E07A5F',
        ticketGold: '#F2CC8F',
        paperCream: '#e6e3d0',
        electricTeal: '#2EC4B6',
        deepPlum: '#1e1e2e',
        stubCharcoal: '#2B2130',
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        body: ['"Work Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        marquee: '0 0 0 2px #FFC94A, 0 0 34px rgba(230, 57, 70, 0.28)',
        ticket: '8px 8px 0 rgba(43, 33, 48, 0.35)',
      },
    },
  },
  plugins: [],
};
