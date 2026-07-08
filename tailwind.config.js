/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#5a2ea6',
          card: '#1e1e1e',
          input: '#2a2a2a',
          cyan: '#00f2ff',
        },
      },
    },
  },
  plugins: [],
}
