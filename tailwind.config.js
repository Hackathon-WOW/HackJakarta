/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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
      }
    },
  },
  plugins: [],
};
