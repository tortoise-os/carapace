import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
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
        // Brand colors - primary theme
        "brand-teal": "hsl(var(--brand-teal))",
        "brand-cyan": "hsl(var(--brand-cyan))",
        "brand-deep-teal": "hsl(var(--brand-deep-teal))",
        "brand-turquoise": "hsl(var(--brand-turquoise))",
        "brand-seafoam": "hsl(var(--brand-seafoam))",
        "brand-aqua": "hsl(var(--brand-aqua))",
        // Accent colors - different families
        "accent-blue": "hsl(var(--accent-blue))",
        "accent-indigo": "hsl(var(--accent-indigo))",
        "accent-purple": "hsl(var(--accent-purple))",
        "accent-violet": "hsl(var(--accent-violet))",
        "accent-orange": "hsl(var(--accent-orange))",
        "accent-amber": "hsl(var(--accent-amber))",
        "accent-rose": "hsl(var(--accent-rose))",
        "accent-emerald": "hsl(var(--accent-emerald))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        ripple: {
          "0%, 100%": {
            transform: "translate(-50%, -50%) scale(1)",
          },
          "50%": {
            transform: "translate(-50%, -50%) scale(0.9)",
          },
        },
        orbit: {
          "0%": {
            transform: "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        ripple: "ripple var(--duration,2s) ease calc(var(--i, 0) * 0.2s) infinite",
        orbit: "orbit calc(var(--duration)*1s) linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
