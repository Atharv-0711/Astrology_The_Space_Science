import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          950: "#08080f",
          900: "#10111d",
          800: "#171928",
          gold: "#f7d774",
        },
      },
    },
  },
  plugins: [],
};

export default config;
