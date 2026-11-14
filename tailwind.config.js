/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vine: { 50: '#f1f6f0', 100: '#dfeadc', 200: '#bfd5ba', 300: '#94b98d', 400: '#679a60', 500: '#477d42', 600: '#356433', 700: '#2b502a', 800: '#234023', 900: '#1a301b' },
        coffee: { 100: '#f0e4d8', 200: '#e0c9b1', 300: '#c9a583', 500: '#8b5e3c', 600: '#744a2e', 700: '#5c3a24' },
        cream: { DEFAULT: '#faf6ee', dark: '#f3ecdf' },
        sage: { 50: '#f3f6f0', 100: '#e9efe4', 200: '#d5dfcd', 300: '#b9c9ae' },
        ink: '#1f2a1f',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: { card: '0 6px 24px -8px rgba(31,42,31,0.18)' },
    },
  },
  plugins: [],
}
