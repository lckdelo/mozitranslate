/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff', // lightest blue - almost white
          100: '#e0f2fe', // very light blue
          200: '#bae6fd', // light blue
          300: '#7dd3fc', // moderately light blue
          400: '#38bdf8', // medium blue
          500: '#0ea5e9', // standard blue
          600: '#0284c7', // slightly darker blue
          700: '#0369a1', // darker blue
          800: '#075985', // very dark blue
          900: '#0c4a6e', // darkest blue
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f7ff',
          200: '#bae8ff',
          300: '#7dd4fc',
          400: '#38b6ff',
          500: '#0c9ee9',
          600: '#0284c7',
          700: '#036baa',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        'soft-blue': '0 4px 14px 0 rgba(59, 130, 246, 0.1)',
        'medium-blue': '0 8px 24px 0 rgba(59, 130, 246, 0.2)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
