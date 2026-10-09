export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAF8',
        ink: { DEFAULT: '#141414', 2: '#55554F', 3: '#8C8C86' },
        line: { DEFAULT: '#E8E8E3', strong: '#D4D4CE' },
        neg: '#A9A9A3',
        accent: { DEFAULT: '#1D4ED8', hover: '#1E40AF', soft: '#EEF2FD' },
        target: { DEFAULT: '#3F6B4E', soft: '#EDF2EE' },
        consider: { DEFAULT: '#946C22', soft: '#F6F0E2' },
        reach: { DEFAULT: '#9A4A3C', soft: '#F6EAE7' },
      },
      fontFamily: {
        display: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
};
