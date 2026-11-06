import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF7F0",
        terracotta: { DEFAULT: "#B95743", dark: "#9E4634", light: "#F3DCD5" },
        forest: { DEFAULT: "#254638", light: "#E4ECE6" },
        beige: { DEFAULT: "#EDE2D3", dark: "#DCCDB8" },
        brown: { DEFAULT: "#33251F", soft: "#6B5A50" },
        sage: { DEFAULT: "#A5B59B", light: "#DDE5D7" },
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', "Georgia", "serif"],
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 14px rgba(51,37,31,0.07)",
        lift: "0 10px 30px rgba(51,37,31,0.12)",
      },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },
    },
  },
  plugins: [],
};

export default config;
