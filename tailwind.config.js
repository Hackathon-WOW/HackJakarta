/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary : {
          green: {
            dark: "#18392B",
            medium: "#0F5132",
            light: "#F0F9F4"
          },
          orange: {
            dark: "#EE9412",
            medium: "#F7CA52",
            light: "#FEFAEC"
          }
        },
        secondary: {
          success: "#4AB262",
          error: "#7B0218"
        },
        accent : {
          black: "#151515",
          darkGrey: "#4F4F4F",
          lightGrey: "#888888",
          white : "#F4F4F4",
          superWhite: "#FFFFFF"
        }
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}