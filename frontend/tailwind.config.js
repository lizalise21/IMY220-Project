const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // All colours come from CSS variables in index.css (dark + light themes)
      colors: {
        bg: v('c-bg'),
        surface: v('c-surface'),
        sand: v('c-sand'),
        ink: v('c-ink'),
        accent: { DEFAULT: v('c-accent'), dark: v('c-accent-dark') },
        'on-accent': v('c-on-accent'),
        danger: v('c-danger'),
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};