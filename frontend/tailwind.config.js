/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        inkNight: '#1B1030',
        marqueeRed: '#E63946',
        ticketGold: '#FFC94A',
        paperCream: '#F7F1E3',
        electricTeal: '#2EC4B6',
        deepPlum: '#4A1942',
        stubCharcoal: '#2B2130',
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Anton"', 'sans-serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        marquee: '0 0 0 2px #FFC94A, 0 0 34px rgba(230, 57, 70, 0.28)',
        ticket: '8px 8px 0 rgba(43, 33, 48, 0.35)',
      },
    },
  },
  plugins: [],
};
