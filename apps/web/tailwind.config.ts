import type { Config } from "tailwindcss";

export default {
  content: [],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-base": "#010102",
        "bg-surface": "#0f1011",
        foreground: "#ededed",
        "foreground-muted": "#71717a",
        "border-hairline": "#27272a",
        "indicator-active": "#10b981",
        "indicator-stale": "#f59e0b",
        "indicator-slashed": "#f43f5e",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#f43f5e",
      },
    },
  },
  plugins: [],
} satisfies Config;
