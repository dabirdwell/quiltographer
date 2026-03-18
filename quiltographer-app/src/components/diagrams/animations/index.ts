/**
 * Quiltographer Diagram Animations
 * 
 * Central export for all animation utilities.
 * Import this to get access to all animation tools.
 */

// Core timing
export * from './timing';

// Animation types
export * from './inkBleed';
export * from './brushDraw';
export * from './attention';
export * from './transitions';

// Import keyframes for aggregation
import { inkBleedKeyframes, inkBleedReducedMotion } from './inkBleed';
import { brushDrawKeyframes, brushDrawReducedMotion } from './brushDraw';
import { attentionKeyframes, attentionReducedMotion } from './attention';
import { transitionKeyframes, transitionReducedMotion } from './transitions';

// All keyframes combined for single injection
export const allKeyframes = `
/* Quiltographer Diagram Animation Keyframes */
/* Generated - do not edit directly */

/* Fade in (basic utility) */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Ink Bleed Animations */
${inkBleedKeyframes}

/* Brush Draw Animations */
${brushDrawKeyframes}

/* Attention Animations */
${attentionKeyframes}

/* Transition Animations */
${transitionKeyframes}

/* Reduced Motion Preferences */
${inkBleedReducedMotion}
${brushDrawReducedMotion}
${attentionReducedMotion}
${transitionReducedMotion}
`;

// Style tag ID for deduplication
const STYLE_TAG_ID = 'quiltographer-diagram-animations';

/**
 * Inject animation keyframes into document head.
 * Safe to call multiple times - will only inject once.
 */
export function injectAnimationStyles(): void {
  if (typeof document === 'undefined') return;
  
  // Check if already injected
  if (document.getElementById(STYLE_TAG_ID)) return;
  
  const styleTag = document.createElement('style');
  styleTag.id = STYLE_TAG_ID;
  styleTag.textContent = allKeyframes;
  document.head.appendChild(styleTag);
}

/**
 * React hook to inject animation styles on mount.
 * Use in your root diagram component or layout.
 */
import { useEffect } from 'react';

export function useAnimationStyles(): void {
  useEffect(() => {
    injectAnimationStyles();
  }, []);
}

/**
 * Check if user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook to track reduced motion preference.
 */
import { useState } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

/**
 * Utility to conditionally apply animation based on reduced motion.
 */
export function motionSafe<T>(
  animatedValue: T,
  fallbackValue: T,
  reducedMotion: boolean
): T {
  return reducedMotion ? fallbackValue : animatedValue;
}
