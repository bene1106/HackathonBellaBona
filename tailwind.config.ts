import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1020",
        paper: "#F5F3EE",
        accept: "#2FD672",
        decline: "#FF4B4B",
        bone: "#FAF8F4",
        card: "#FFFFFF",
        mute: "#5A6172",
        line: "#E7E2D8",
        deep: "#147A46",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
