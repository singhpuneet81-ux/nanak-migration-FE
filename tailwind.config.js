/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#101C55",
          deep: "#0B1440",
          mid: "#16245F",
          soft: "#22378C",
        },
        gold: {
          DEFAULT: "#F5A623",
          deep: "#DE8A11",
          soft: "#F7A91B",
        },
        ink: "#17213C",
        muted: "#70758A",
        lavender: "#F4F1FF",
        surface: "#F8F9FC",
        line: "#E4E6F0",
        crit: "#C4321F",
        urgent: "#A66700",
        ok: "#1E7F4F",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,24,64,.05), 0 8px 24px rgba(17,24,64,.07)",
        card: "0 10px 40px rgba(16,28,85,.10)",
      },
    },
  },
  plugins: [],
};
