import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F4F1EA",
        sand: "#EDE7DB",
        surface: "#FBFAF6",
        ink: "#1A1A17",
        muted: "#6E675C",
        faint: "#9B9389",
        line: "#E2DCD0",
        accent: {
          DEFAULT: "#9B5B3F",
          soft: "#F0E6DE",
          dark: "#7E4730",
        },
        sale: "#A23B2D",
        success: "#3E6B4F",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
      maxWidth: {
        site: "1280px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,26,23,0.04), 0 8px 30px rgba(26,26,23,0.06)",
        lift: "0 10px 40px rgba(26,26,23,0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) both",
        fadeIn: "fadeIn 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
