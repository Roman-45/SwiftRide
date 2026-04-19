/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F1',
        surface: '#FFFFFF',
        'surface-2': '#FBFAF7',
        line: '#E6E1D8',
        'line-2': '#D9D3C5',
        ink: '#171512',
        'ink-2': '#403B32',
        'ink-3': '#6B645A',
        'ink-4': '#9A9386',
        accent: '#E0531A',
        'accent-hover': '#C7441B',
        'accent-soft': '#FCE8DC',
        'accent-edge': '#F4B598',
        ok: '#1F7A3D',
        warn: '#9A6B0E',
        err: '#A81E1E',
        info: '#1B4C9A',
      },
      fontFamily: {
        serif: ['Fraunces', 'Newsreader', 'Georgia', 'serif'],
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
