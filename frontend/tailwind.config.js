/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          darkest: '#050811',
          darker: '#080d1a',
          dark: '#0b1329',
          card: 'rgba(10, 15, 36, 0.85)',
          border: 'rgba(0, 240, 255, 0.2)',
          cyan: '#00f0ff',
          blue: '#0072ff',
          emerald: '#00ff9d',
          crimson: '#ff0055',
          slate: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.35)',
        'neon-cyan-lg': '0 0 25px rgba(0, 240, 255, 0.55)',
        'neon-blue': '0 0 15px rgba(0, 114, 255, 0.4)',
        'neon-emerald': '0 0 15px rgba(0, 255, 157, 0.4)',
        'neon-crimson': '0 0 15px rgba(255, 0, 85, 0.4)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'cyber-grid': "radial-gradient(circle, rgba(0, 240, 255, 0.08) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
