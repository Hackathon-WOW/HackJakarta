/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // editorial finance + Indonesian warmth
        paper: { DEFAULT: "#F6F1E7", soft: "#FBF8F1", dim: "#EFE6D4" },
        ink: { DEFAULT: "#15241C", soft: "#2B3D33", muted: "#5E6E64" },
        emerald: {
          50: "#EEF6F0",
          100: "#D7EADD",
          400: "#4FAE7B",
          500: "#2E8B5C",
          600: "#1A6B45",
          700: "#0F5132",
          800: "#18392B",
          900: "#13281E",
          950: "#0B1A13",
        },
        amber: {
          100: "#FCEBC4",
          300: "#F7CA52",
          400: "#F7B23B",
          500: "#EE9412",
          600: "#D97C0A",
          700: "#B5630A",
        },
        sand: { DEFAULT: "#E7DECB", soft: "#F0E9DA", dark: "#D8CCB0" },
        leaf: "#4AB262",
        wine: "#9B2C3A",

        // shadcn-compatible tokens (mapped to brand) for generic components
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21,36,28,0.04), 0 8px 24px -12px rgba(21,36,28,0.18)",
        lift: "0 2px 4px rgba(21,36,28,0.05), 0 24px 48px -20px rgba(21,36,28,0.30)",
        glow: "0 0 0 1px rgba(238,148,18,0.25), 0 18px 40px -16px rgba(238,148,18,0.45)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "float-slow": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.6s infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
