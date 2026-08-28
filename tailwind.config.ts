import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Gamification Tier Accents
        dan: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
          dark: "#065f46",
          glow: "rgba(16, 185, 129, 0.4)",
        },
        linh: {
          DEFAULT: "#3b82f6",
          light: "#dbeafe",
          dark: "#1e40af",
          glow: "rgba(59, 130, 246, 0.4)",
        },
        quan: {
          DEFAULT: "#a855f7",
          light: "#f3e8ff",
          dark: "#6b21a8",
          glow: "rgba(168, 85, 247, 0.4)",
        },
        vua: {
          DEFAULT: "#eab308",
          light: "#fef9c3",
          dark: "#854d0e",
          glow: "rgba(234, 179, 8, 0.5)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
        display: ['var(--font-quicksand)', 'sans-serif'],
      },
      boxShadow: {
        'glow-dan': '0 0 15px -3px rgba(16, 185, 129, 0.45), 0 0 6px -2px rgba(16, 185, 129, 0.3)',
        'glow-linh': '0 0 15px -3px rgba(59, 130, 246, 0.45), 0 0 6px -2px rgba(59, 130, 246, 0.3)',
        'glow-quan': '0 0 18px -2px rgba(168, 85, 247, 0.5), 0 0 8px -2px rgba(168, 85, 247, 0.35)',
        'glow-vua': '0 0 25px 0px rgba(234, 179, 8, 0.65), 0 0 10px 0px rgba(245, 158, 11, 0.45)',
        'clay-card': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05), inset 0 -4px 0 0 rgba(0, 0, 0, 0.1)',
        'clay-btn': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "bounce-slight": "bounceSlight 2s infinite ease-in-out",
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pop": "pop 0.3s ease-out",
      },
      keyframes: {
        bounceSlight: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        pop: {
          "0%": { transform: "scale(0.9)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};

export default config;
