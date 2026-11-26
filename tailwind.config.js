/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: "#0b0f17",
        "surface-card": "#111724",
        "surface-elevated": "#172033",
        "surface-border": "#1e293b",
        primary: "#38bdf8",
        "primary-glow": "rgba(56, 189, 248, 0.25)",
        accent: "#00f0ff",
        emerald: "#10b981",
        "emerald-glow": "rgba(16, 185, 129, 0.25)",
        amber: "#f59e0b",
        rose: "#f43f5e"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Space Grotesk", "sans-serif"]
      }
    },
  },
  plugins: [],
}
