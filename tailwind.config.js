/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'poke-red': '#cc0000',
        'poke-yellow': '#ffcb05',
        'poke-dark': '#1a1a2e',
        'poke-card': '#16213e',
        'poke-card-light': '#1c2a4a',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}
