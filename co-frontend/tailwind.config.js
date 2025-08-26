/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff'
        },
        background: '#0f172a',
        card: '#1e293b',
        border: '#334155'
      }
    },
  },
  plugins: [],
}
