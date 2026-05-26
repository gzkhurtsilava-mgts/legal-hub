/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Тёмная тема через CSS-класс (переключается JS'ом)
  darkMode: "class",
  theme: {
    extend: {
      // Цвета МТС — берём из @mts-ds/base токенов
      // Здесь базовые значения, полные токены подключаются через @mts-ds/base
      colors: {
        brand: {
          red: "#FF0032",       // МТС-красный
          "red-dark": "#CC0028",
        },
        surface: {
          primary: "var(--color-background-primary)",
          secondary: "var(--color-background-secondary)",
        },
      },
      fontFamily: {
        // МТС Compact — основной шрифт из дизайн-системы
        sans: ["MTS Compact", "MTS Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
