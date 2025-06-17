/** @type {import('tailwindcss').Config} */
export default {
   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
   theme: {
      extend: {
         fontFamily: {
            suit: ["'SUIT Variable'", "sans-serif"],
            pretendard: ["'Pretendard Variable'", "sans-serif"],
            hakgyoansim: ["'Hakgyoansim Allimjang'", "sans-serif"],
         },
         keyframes: {
            "fade-in-out": {
               "0%": { opacity: "0" },
               "10%": { opacity: "1" },
               "90%": { opacity: "1" },
               "100%": { opacity: "0" },
            },
         },
         animation: {
            "fade-in-out": "fade-in-out 3s ease-in-out forwards",
         },
      },
   },
   plugins: [],
};
