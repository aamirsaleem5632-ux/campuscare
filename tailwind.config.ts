import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff", 100: "#d9eaff", 200: "#bcd9ff", 500: "#2f6fed",
          600: "#2158d6", 700: "#1d47ad", 900: "#14285f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
