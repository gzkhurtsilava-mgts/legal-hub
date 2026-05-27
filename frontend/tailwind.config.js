/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#008ae0",          // МГТС-синий (основной)
          "blue-dark": "#0070b8",
        },
        surface: {
          primary: "var(--color-background-primary)",
          secondary: "var(--color-background-secondary)",
        },
      },
      fontFamily: {
        // Имя должно совпадать с font-family в @font-face в globals.css
        sans: ["MTS Compact", "MTS Sans", "system-ui", "sans-serif"],
        wide: ["MTS Wide", "system-ui", "sans-serif"],
        text: ["MTS Text", "system-ui", "serif"],
      },
    },
  },
  plugins: [],
};