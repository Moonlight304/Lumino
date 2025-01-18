import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF3333',
        secondary: '#BDBDBD',
        background: '#0A0A0A',
        third: '#616161',
      }
    },
  },
  plugins: [daisyui],
}