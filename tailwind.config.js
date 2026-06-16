/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:         '#0f0f13',
        surface:    '#17171f',
        surface2:   '#1e1e28',
        border:     '#2a2a38',
        bordersoft: '#222230',
        accent:     '#8b5cf6',
        'accent-dim': '#6d28d9',
        tmuted:     '#7878a0',
        tdim:       '#4a4a6a',
      },
    },
  },
  plugins: [],
}
