import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-50": "#0a0a0a",
        "dark-100": '#111111',
        "dark-200": "#222222",
      },
    },
  },
  plugins: [],
} satisfies Config;
