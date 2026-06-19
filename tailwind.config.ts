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
        pearl: "#F6F5F2",
        mist: "#EEEDEA",
        surface: "#FFFFFF",
        ink: "#111318",
        slate: "#2A2D35",
        muted: "#6B7280",
        faint: "#9CA3AF",
        line: "#E4E5E9",
        accent: {
          DEFAULT: "#E84D7A",
          soft: "#FDF2F6",
          dark: "#C93562",
          glow: "rgba(232, 77, 122, 0.18)",
        },
        chrome: "#C8CDD6",
        sale: "#E84D7A",
        success: "#059669",
        // Legacy aliases mapped to new palette (for gradual migration)
        paper: "#F6F5F2",
        sand: "#EEEDEA",
        navy: {
          DEFAULT: "#111318",
          light: "#2A2D35",
        },
        gold: {
          DEFAULT: "#C8CDD6",
          soft: "#EEEDEA",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.14em",
        tight2: "-0.03em",
      },
      maxWidth: {
        site: "1320px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,19,24,0.04), 0 12px 40px rgba(17,19,24,0.06)",
        lift: "0 24px 64px rgba(17,19,24,0.12)",
        glow: "0 0 48px rgba(232, 77, 122, 0.2)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      borderRadius: {
        xl2: "1rem",
        card: "0.75rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(0.96)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
        fadeIn: "fadeIn 0.4s ease both",
        shimmer: "shimmer 3s linear infinite",
        pulseSoft: "pulseSoft 2.5s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-overlay":
          "linear-gradient(105deg, rgba(17,19,24,0.88) 0%, rgba(17,19,24,0.55) 45%, rgba(17,19,24,0.25) 100%)",
        "section-fade": "linear-gradient(180deg, #F6F5F2 0%, #EEEDEA 100%)",
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
