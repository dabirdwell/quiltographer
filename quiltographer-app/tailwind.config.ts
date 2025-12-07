import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Japanese-inspired colors with direct hex values
        sumi: "#1a1a1a",
        washi: "#faf8f3",
        indigo: "#264653",
        persimmon: "#e76f51",
        sage: "#84a98c",
        clay: "#e9c46a",
      },
    },
  },
  plugins: [],
} satisfies Config;
