/**
 * Ink Bleed Animation
 * 
 * Elements appear as if ink is spreading on washi paper.
 * The signature entry animation for Quiltographer diagrams.
 */

import { timing, easing } from './timing';

// Keyframes as CSS string (for injection into style tags)
export const inkBleedKeyframes = `
@keyframes inkBleed {
  0% {
    clip-path: circle(0% at var(--ink-origin-x, 50%) var(--ink-origin-y, 50%));
    opacity: 0.3;
    filter: blur(2px);
  }
  40% {
    opacity: 0.8;
    filter: blur(1px);
  }
  100% {
    clip-path: circle(150% at var(--ink-origin-x, 50%) var(--ink-origin-y, 50%));
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes inkBleedReverse {
  0% {
    clip-path: circle(150% at var(--ink-origin-x, 50%) var(--ink-origin-y, 50%));
    opacity: 1;
  }
  100% {
    clip-path: circle(0% at var(--ink-origin-x, 50%) var(--ink-origin-y, 50%));
    opacity: 0;
  }
}

@keyframes inkBleedSubtle {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0.5;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

@keyframes inkBleedIn {
  0% {
    opacity: 0;
    filter: blur(3px);
    transform: scale(0.95);
  }
  30% {
    opacity: 0.7;
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
}

@keyframes inkDrop {
  0% {
    r: 0;
    opacity: 0.8;
  }
  40% {
    r: 15;
    opacity: 0.5;
  }
  100% {
    r: 40;
    opacity: 0;
  }
}

@keyframes inkSplash {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
`;

// Style object for ink bleed animation
export interface InkBleedOptions {
  duration?: number;
  delay?: number;
  originX?: string;
  originY?: string;
  variant?: 'circle' | 'subtle' | 'reverse';
}

export function inkBleedStyle(options: InkBleedOptions = {}): React.CSSProperties {
  const {
    duration = timing.inkBleed,
    delay = 0,
    originX = '50%',
    originY = '50%',
    variant = 'circle',
  } = options;

  const animationName = variant === 'reverse' 
    ? 'inkBleedReverse' 
    : variant === 'subtle' 
      ? 'inkBleedSubtle' 
      : 'inkBleed';

  return {
    '--ink-origin-x': originX,
    '--ink-origin-y': originY,
    animation: `${animationName} ${duration}ms ${easing.inkSpread} ${delay}ms forwards`,
  } as React.CSSProperties;
}

// Hook for managing ink bleed state
import { useState, useCallback, useEffect } from 'react';

export function useInkBleed(initialVisible: boolean = false) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  const reveal = useCallback((delay: number = 0) => {
    if (delay > 0) {
      setTimeout(() => {
        setIsAnimating(true);
        setIsVisible(true);
      }, delay);
    } else {
      setIsAnimating(true);
      setIsVisible(true);
    }
  }, []);

  const hide = useCallback((delay: number = 0) => {
    if (delay > 0) {
      setTimeout(() => {
        setIsAnimating(true);
        setIsVisible(false);
      }, delay);
    } else {
      setIsAnimating(true);
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), timing.inkBleed);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, isVisible]);

  return {
    isVisible,
    isAnimating,
    reveal,
    hide,
    style: isVisible 
      ? inkBleedStyle({ variant: 'circle' })
      : inkBleedStyle({ variant: 'reverse' }),
  };
}

// SVG-specific ink bleed using mask
export function createInkBleedMask(id: string, progress: number = 1): string {
  const radius = progress * 150; // 0-150% coverage
  return `
    <mask id="${id}">
      <circle cx="50%" cy="50%" r="${radius}%" fill="white">
        <animate 
          attributeName="r" 
          from="0%" 
          to="150%" 
          dur="${timing.inkBleed}ms" 
          fill="freeze"
          calcMode="spline"
          keySplines="0.1 0.8 0.3 1"
        />
      </circle>
    </mask>
  `;
}

// Reduced motion fallback
export const inkBleedReducedMotion = `
@media (prefers-reduced-motion: reduce) {
  [data-animation="ink-bleed"] {
    animation: none !important;
    clip-path: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}
`;
