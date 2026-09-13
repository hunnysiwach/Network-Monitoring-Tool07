/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#0a0f1d',
          card: '#111827',
          sidebar: '#0d1322',
          border: '#1f293d',
          accent: '#06b6d4',
          emerald: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
