import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        green: "var(--green)", "green-dark": "var(--green-dark)", "green-deep": "var(--green-deep)",
        lime: "var(--lime)", neon: "var(--neon)", "neon-soft": "var(--neon-soft)", navy: "var(--navy)", "navy-2": "var(--navy-2)",
        background: "var(--bg)", surface: "var(--surface)", foreground: "var(--text)", muted: "var(--muted)",
      },
      borderRadius: { card: "1.25rem", panel: "1.5rem" },
      fontFamily: { sans: ["IBM Plex Sans Arabic", "Arial", "sans-serif"] },
      transitionTimingFunction: { premium: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    },
  },
  plugins: [],
};

export default config;
