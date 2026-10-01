/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#14131a',   // page background
        surface: '#1e1c26', // cards and inputs
        ink: '#ece8f1',     // main text
        coral: { DEFAULT: '#ff6b4a', dark: '#e5532f' },
        sand: '#2c2a37',    // tags, avatar backgrounds, toggles
        // keeps error and delete colours readable on dark
        red: { 50: '#3b1a1f', 300: '#7f2a35', 500: '#f87171', 600: '#f87171' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};