/**
 * Quiltographer Theme System
 * 
 * Two aesthetic modes:
 * - Daylight: Warm washi paper, sumi ink, natural craft
 * - Lagoon: Deep teals, moonlight on water, night studio
 */

export const themes = {
  daylight: {
    name: 'Daylight Studio',
    colors: {
      // Background
      paper: '#fdf8f0',
      paperGradient: 'linear-gradient(135deg, #fdf8f0 0%, #f9f3e8 100%)',
      
      // Grid
      gridLine: 'rgba(139, 69, 19, 0.04)',
      
      // Text
      ink: '#264653',
      inkLight: '#666666',
      inkFaint: '#999999',
      
      // Accents
      coral: '#e76f51',
      sage: '#84a98c',
      rust: '#8b4513',
      
      // Fabric defaults
      fabricLight: '#f5f0e6',
      fabricDark: '#264653',
      
      // UI
      buttonActive: '#264653',
      buttonInactive: 'transparent',
      border: 'rgba(139, 69, 19, 0.12)',
    },
    shadows: {
      soft: '0 1px 3px rgba(26, 26, 26, 0.08)',
      medium: '0 2px 6px rgba(26, 26, 26, 0.12)',
    },
  },
  
  lagoon: {
    name: 'Night Lagoon',
    colors: {
      // Background - deep water
      paper: '#0d1b2a',
      paperGradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
      
      // Grid - moonlight ripples
      gridLine: 'rgba(157, 178, 191, 0.06)',
      
      // Text - moonlit
      ink: '#e0e6ed',
      inkLight: '#9db2bf',
      inkFaint: '#5c7a8a',
      
      // Accents - bioluminescence and coral
      coral: '#f4a261',
      sage: '#52796f',
      rust: '#9db2bf',
      
      // Fabric defaults - night fabrics
      fabricLight: '#415a77',
      fabricDark: '#1b263b',
      
      // UI
      buttonActive: '#52796f',
      buttonInactive: 'transparent',
      border: 'rgba(157, 178, 191, 0.15)',
    },
    shadows: {
      soft: '0 1px 3px rgba(0, 0, 0, 0.3)',
      medium: '0 2px 8px rgba(0, 0, 0, 0.4)',
    },
  },
};

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.daylight;

/**
 * CSS custom properties for theme injection
 */
export function getThemeCSSVariables(themeName: ThemeName): Record<string, string> {
  const theme = themes[themeName];
  return {
    '--q-paper': theme.colors.paper,
    '--q-paper-gradient': theme.colors.paperGradient,
    '--q-grid': theme.colors.gridLine,
    '--q-ink': theme.colors.ink,
    '--q-ink-light': theme.colors.inkLight,
    '--q-ink-faint': theme.colors.inkFaint,
    '--q-coral': theme.colors.coral,
    '--q-sage': theme.colors.sage,
    '--q-rust': theme.colors.rust,
    '--q-fabric-light': theme.colors.fabricLight,
    '--q-fabric-dark': theme.colors.fabricDark,
    '--q-button-active': theme.colors.buttonActive,
    '--q-border': theme.colors.border,
    '--q-shadow-soft': theme.shadows.soft,
    '--q-shadow-medium': theme.shadows.medium,
  };
}

/**
 * Apply theme to document root
 */
export function applyTheme(themeName: ThemeName): void {
  const vars = getThemeCSSVariables(themeName);
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
