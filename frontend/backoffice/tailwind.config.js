/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist utile si vous générez des classes dynamiquement (ex: `bg-${color}-${shade}`)
  safelist: [
    // Autorise bg/text/border + hover variants pour les couleurs et nuances listées
    {
      pattern:
        /^(bg|text|border|hover:bg|hover:text)-(red|green|blue|yellow|orange|purple)-(light|dark)$/,
    },
    {
      pattern:
        /^(bg|text|border|hover:bg|hover:text)-(red|green|blue|yellow|orange|purple)$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          hover: "var(--color-danger-hover)",
        },
        success: "var(--color-success)",
      },
    },
  },
  plugins: [],
};
