import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F2',
        ink: '#14171F',
        muted: '#6B7280',
        line: '#E5E7EB',
        indigo: {
          DEFAULT: '#2A3B8F',
          dark: '#1E2C6D',
          light: '#EEF0FA',
        },
        emerald: { DEFAULT: '#1F9D6D', light: '#E6F5EF' },
        amber: { DEFAULT: '#E8A33D', light: '#FCF1DF' },
        rose: { DEFAULT: '#D64545', light: '#FBEAEA' },
      },
      fontFamily: {
        display: ['General Sans', 'sans-serif'],
        body: ['General Sans', 'sans-serif'],
        mono: ['Spline Sans Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,23,31,0.04), 0 8px 24px rgba(20,23,31,0.06)',
      },
    },
  },
  plugins: [],
}
