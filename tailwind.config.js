/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        eb: {
          bg:        "#0F0D0B",
          surface:   "#1A1612",
          card:      "#221E19",
          border:    "#2E2822",
          terra:     "#C4622D",
          gold:      "#B8922A",
          green:     "#2C6E49",
          red:       "#C4362D",
          muted:     "#8C7B6B",
          cream:     "#FAF8F4",
          purple:    "#7C4D8C",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card:   "0 2px 16px rgba(0,0,0,0.5)",
        glow:   "0 0 24px rgba(196,98,45,0.25)",
        "gold-glow": "0 0 24px rgba(184,146,42,0.25)",
      },
      animation: {
        "skeleton": "skeleton 1.5s ease-in-out infinite",
        "fade-in":  "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        skeleton: {
          "0%, 100%": { opacity: 1 },
          "50%":       { opacity: 0.4 },
        },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
