/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Fjord One", "serif"],
      },
      colors: {
        primary: {
          50: "rgb(var(--color-primary-50) / <alpha-value>)",
          100: "rgb(var(--color-primary-100) / <alpha-value>)",
          200: "rgb(var(--color-primary-200) / <alpha-value>)",
          300: "rgb(var(--color-primary-300) / <alpha-value>)",
          400: "rgb(var(--color-primary-400) / <alpha-value>)",
          500: "rgb(var(--color-primary-500) / <alpha-value>)",
          600: "rgb(var(--color-primary-600) / <alpha-value>)",
          700: "rgb(var(--color-primary-700) / <alpha-value>)",
          800: "rgb(var(--color-primary-800) / <alpha-value>)",
          900: "rgb(var(--color-primary-900) / <alpha-value>)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
          DEFAULT: "var(--color-primary)",
        },
        secondary: {
          50: "rgb(var(--color-secondary-50) / <alpha-value>)",
          100: "rgb(var(--color-secondary-100) / <alpha-value>)",
          200: "rgb(var(--color-secondary-200) / <alpha-value>)",
          300: "rgb(var(--color-secondary-300) / <alpha-value>)",
          400: "rgb(var(--color-secondary-400) / <alpha-value>)",
          500: "rgb(var(--color-secondary-500) / <alpha-value>)",
          600: "rgb(var(--color-secondary-600) / <alpha-value>)",
          700: "rgb(var(--color-secondary-700) / <alpha-value>)",
          800: "rgb(var(--color-secondary-800) / <alpha-value>)",
          900: "rgb(var(--color-secondary-900) / <alpha-value>)",
          light: "var(--color-secondary-light)",
          dark: "var(--color-secondary-dark)",
          DEFAULT: "var(--color-secondary)",
        },
        accent: "var(--color-primary)", // Alias pour $accent-color
      },
      backgroundSize: {
        "200-100": "200% 100%",
      },
      backgroundPosition: {
        left: "0 0",
        "right-slide": "-100% 0",
      },
      textShadow: {
        light: "1px 1px 5px rgba(102, 102, 102, 0.6)",
        dark: "0 0 10px rgba(0, 0, 0, 1)",
      },
      height: {
        30: "7.5rem",
      },
    },
  },
  plugins: [
    // Plugin pour text-shadow
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-light": {
          textShadow: "1px 1px 5px rgba(102, 102, 102, 0.6)",
        },
        ".text-shadow-dark": {
          textShadow: "0 0 10px rgba(0, 0, 0, 1)",
        },
        ".text-shadow-none": {
          textShadow: "none",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
