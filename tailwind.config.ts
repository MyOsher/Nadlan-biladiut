import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Heebo", "Assistant", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd6ff",
          300: "#8ebcff",
          400: "#5996ff",
          500: "#3370f5",
          600: "#2152d8",
          700: "#1d43b0",
          800: "#1d3a8c",
          900: "#1d356f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
