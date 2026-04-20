import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
  ],

  theme: {
    extend: {
      colors: {
        // ─── Brand ───
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },

        // ─── Text (Ink) ───
        ink: {
          DEFAULT: "#0f172a",
          secondary: "#475569",
          tertiary: "#94a3b8",
          inverse: "#ffffff",
        },

        // ─── Surfaces ───
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
        },

        // ─── Border ───
        border: "#e2e8f0",

        // 🔥🔥🔥 ده المهم (اللي كان ناقص) 🔥🔥🔥
        feedback: {
          success: "#16a34a",
          "success-bg": "#dcfce7",

          error: "#dc2626",
          "error-bg": "#fee2e2",

          warning: "#f59e0b",
          "warning-bg": "#fef3c7",

          info: "#3b82f6",
          "info-bg": "#dbeafe",
        },
      },

      // ─── Fonts ───
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      // ─── Animations ───
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },

  plugins: [],
};

export default config;