// Quiltographer Japanese Design System
// Foundation for both Pattern Reader and full Quiltographer

export const quiltographerTheme = {
  colors: {
    // Primary palette - inspired by traditional Japanese aesthetics
    persimmon: '#e76f51',    // Warm accent, selections
    indigo: '#264653',       // Primary text, headers
    sage: '#84a98c',         // Success, completion
    clay: '#e9c46a',         // Warnings, highlights
    sumi: '#1a1a1a',         // Deep black, contrast
    
    // Paper and surface colors
    washi: '#fdf4e3',        // Primary background
    washiDark: '#f9f0dc',    // Subtle depth
    rice: '#fefdfb',         // Brightest surface
    
    // Functional colors
    inkBlack: '#2d2d2d',     // Body text
    inkGray: '#6b7280',      // Secondary text
    silk: '#dc2626',         // Active/selected states
    bamboo: '#8b4513',       // Wood accents, handles
    
    // State colors
    active: '#e76f51',
    inactive: '#d1d5db',
    hover: '#fed7aa',
    focus: '#fbbf24',
  },
  
  textures: {
    // Washi paper effect - subtle fiber visibility
    washiFiber: `repeating-linear-gradient(
      87deg,
      transparent,
      transparent 3px,
      rgba(139, 69, 19, 0.03) 3px,
      rgba(139, 69, 19, 0.03) 4px
    )`,
    
    // Subtle grain for surfaces
    paperGrain: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
  },
  
  typography: {
    fontFamily: {
      display: '"Noto Serif JP", "Georgia", serif',
      body: '"Noto Sans JP", "Helvetica Neue", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.6',
      relaxed: '1.75',
      loose: '2',
    },
  },
  
  spacing: {
    breathe: '1.5rem',
    rest: '2.5rem',
    meditate: '4rem',
  },
  
  timing: {
    instant: '100ms',
    quick: '200ms',
    breathe: '300ms',
    unfold: '400ms',
    meditate: '600ms',
    
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  shadows: {
    subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
    soft: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lifted: '0 8px 16px rgba(0, 0, 0, 0.1)',
    floating: '0 12px 24px rgba(0, 0, 0, 0.12)',
  },
  
  borders: {
    hairline: '1px solid rgba(0, 0, 0, 0.06)',
    subtle: '1px solid rgba(0, 0, 0, 0.1)',
    defined: '2px solid rgba(0, 0, 0, 0.15)',
  },
  
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const;

export type ThemeColors = typeof quiltographerTheme.colors;
export type ThemeTiming = typeof quiltographerTheme.timing;
