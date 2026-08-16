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
        },
        gold: {
          DEFAULT: "#F5A623",
          deep: "#DE8A11",
        },
        ink: "#17213C",
        muted: "#70758A",
        surface: "#F8F9FC",
        line: "#E4E6F0",
        crit: "#C4321F",
        urgent: "#A66700",
        ok: "#1E7F4F",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
