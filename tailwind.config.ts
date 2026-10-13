import type { Config } from "tailwindcss";

function withOpacity(cssVar: string): any {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue !== undefined ? `rgb(var(${cssVar}) / ${opacityValue})` : `rgb(var(${cssVar}))`;
}

const config: Config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B2E42",
        "ink-soft": "#123F59",
        paper: "#FAFBFC",
        "paper-dim": "#EEF3F9",
        indigo: {
          DEFAULT: "#1F82C5",
          light: "#3D9FDE",
          dark: "#15619B",
        },
        signal: {
          DEFAULT: "#EA9322",
          light: "#F2AC52",
          dark: "#C97614",
        },
        slate: {
          DEFAULT: "#59677A",
          light: "#8895A6",
        },
        line: "#DEE4EA",
        "line-dark": "#1E4560",
        accent: {
          blue: "#1F82C5",
          purple: "#15619B",
          teal: "#0B2E42",
          amber: "#EA9322",
          rose: "#C97614",
          green: "#3D9FDE",
        },
        navy: {
          DEFAULT: withOpacity("--color-navy-rgb"),
          light: withOpacity("--color-navy-light-rgb"),
          dark: withOpacity("--color-navy-dark-rgb"),
        },
        brandblue: {
          DEFAULT: withOpacity("--color-brandblue-rgb"),
          dark: withOpacity("--color-brandblue-dark-rgb"),
        },
        brandorange: {
          DEFAULT: withOpacity("--color-brandorange-rgb"),
          dark: withOpacity("--color-brandorange-dark-rgb"),
        },
        bglight: "#F4F8FC",
        inkgray: "#5B6B82",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(10, 31, 61, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        content: "1280px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        draw: {
          "0%": { strokeDashoffset: "1400" },
          "100%": { strokeDashoffset: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        draw: "draw 2.2s ease-out forwards",
        "fade-up": "fade-up 0.7s ease-out forwards",
        blink: "blink 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
