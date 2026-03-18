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
        // Primary palette — traditional Japanese aesthetics
        persimmon: '#e76f51',
        indigo: '#264653',
        sage: '#84a98c',
        clay: '#e9c46a',
        sumi: '#1a1a1a',
        silk: '#dc2626',
        bamboo: '#8b4513',
        // Surfaces
        washi: '#fdf4e3',
        'washi-dark': '#f9f0dc',
        rice: '#fefdfb',
        // Ink
        'ink-black': '#2d2d2d',
        'ink-gray': '#6b7280',
        'ink-light': '#9ca3af',
      },
      fontFamily: {
        display: ['"Noto Serif JP"', 'Georgia', 'serif'],
        body: ['"Noto Sans JP"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        breathe: '1.5rem',
        rest: '2.5rem',
        meditate: '4rem',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
        soft: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lifted: '0 8px 16px rgba(0, 0, 0, 0.1)',
        floating: '0 12px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      transitionDuration: {
        instant: '100ms',
        quick: '200ms',
        breathe: '300ms',
        unfold: '400ms',
        meditate: '600ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.6, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
