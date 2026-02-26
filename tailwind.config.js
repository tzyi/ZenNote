/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark theme colors (primary)
        'bg-dark': '#1a1a1a',
        'bg-card': '#2a2a2a',
        'bg-surface': '#333333',
        'text-primary': '#ffffff',
        'text-secondary': '#aaaaaa',
        'text-muted': '#666666',
        'accent-green': '#4caf50',
        'accent-blue': '#2196f3',
        'border-dark': '#3a3a3a',
        // Light theme colors
        'bg-light': '#f5f5f5',
        'bg-card-light': '#ffffff',
        'bg-surface-light': '#eeeeee',
        'text-dark': '#1a1a1a',
        'text-secondary-light': '#666666',
        'border-light': '#e0e0e0',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
