/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F3EA",
        ink: "#2B241C",
        clay: "#C87B4A",
        clayDark: "#A85F35",
        moss: "#5B6B4E",
        gold: "#D9A441",
        line: "#E4DCC8",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
