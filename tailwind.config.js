/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ Activa el modo oscuro manual con la clase 'dark'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados de PlayZone
        primary: {
          DEFAULT: '#003791',
          light: '#0070D1',
          dark: '#002255',
        },
        secondary: {
          DEFAULT: '#E8F1FB',
          light: '#F0F6FC',
          dark: '#151E32',
        },
        dark: {
          bg: '#0B1120',
          card: '#151E32',
          border: '#1E293B',
        }
      },
    },
  },
  plugins: [],
}