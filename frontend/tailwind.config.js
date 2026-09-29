/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          ink: '#09090B',
          surface: '#141318',
          ivory: '#F7F3EC',
          stone: '#A8A29E',
          ember: '#FF5A36',
          mint: '#78DCCA',
        },
        admin: {
          canvas: '#F7F7F8',
          surface: '#FFFFFF',
          black: '#111111',
          text: '#171717',
          secondary: '#6B7280',
          subtle: '#9CA3AF',
          border: '#E5E7EB',
          hover: '#F3F4F6',
          success: '#3F7652',
          successSoft: '#EDF6F0',
          warning: '#9A6700',
          warningSoft: '#FFF7E6',
          error: '#B54747',
          errorSoft: '#FCEEEE',
          info: '#356A9A',
          infoSoft: '#EDF4FA',
        },
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
