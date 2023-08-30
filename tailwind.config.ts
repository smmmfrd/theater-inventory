import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        transHero: "rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["coffee"],
  },
} satisfies Config;
