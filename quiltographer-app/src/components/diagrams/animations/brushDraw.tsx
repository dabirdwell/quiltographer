/**
 * Brush Draw Animation
 * 
 * Lines appear as if being drawn by a brush or pen.
 * Uses SVG stroke-dasharray/dashoffset technique.
 */

import React from 'react';
import { timing, easing } from './timing';

// Keyframes for CSS-based brush draw
export const brushDrawKeyframes = `
@keyframes brushDraw {
  from {
    stroke-dashoffset: var(--path-length, 200);
    opacity: 0.6;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes brushDrawReverse {
  from {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  to {
    stroke-dashoffset: var(--path-length, 200);
    opacity: 0;
  }
}

@keyframes brushDrawWithInk {
  0% {
    stroke-dashoffset: var(--path-length, 200);
    stroke-width: var(--stroke-base, 1.5);
    opacity: 0.5;
  }
  50% {
    stroke-width: calc(var(--stroke-base, 1.5) * 1.3);
    opacity: 0.9;
  }
  100% {
    stroke-dashoffset: 0;
    stroke-width: var(--stroke-base, 1.5);
    opacity: 1;
  }
}
`;

export interface BrushDrawOptions {
  pathLength: number;
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  variant?: 'simple' | 'withInk' | 'reverse';
}

// Style object for brush draw animation on SVG paths
export function brushDrawStyle(options: BrushDrawOptions): React.CSSProperties {
  const {
    pathLength,
    duration = timing.brushDraw,
    delay = 0,
    strokeWidth = 1.5,
    variant = 'simple',
  } = options;

  const animationName = variant === 'reverse'
    ? 'brushDrawReverse'
    : variant === 'withInk'
      ? 'brushDrawWithInk'
      : 'brushDraw';

  return {
    '--path-length': pathLength,
    '--stroke-base': strokeWidth,
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
    animation: `${animationName} ${duration}ms ${easing.easeOut} ${delay}ms forwards`,
  } as React.CSSProperties;
}

// Calculate path length for common shapes
export function calculatePathLength(shape: 'diagonal' | 'horizontal' | 'vertical', size: number): number {
  switch (shape) {
    case 'diagonal':
      return Math.sqrt(2) * size; // Diagonal of square
    case 'horizontal':
    case 'vertical':
      return size;
    default:
      return size;
  }
}

// SVG props for brush draw effect
export interface BrushDrawSVGProps {
  pathLength: number;
  duration?: number;
  delay?: number;
  begin?: string; // SVG animation begin trigger
}

export function brushDrawSVGProps(options: BrushDrawSVGProps) {
  const {
    pathLength,
    duration = timing.brushDraw,
    delay = 0,
    begin = `${delay}ms`,
  } = options;

  return {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
    children: (
      <animate
        attributeName="stroke-dashoffset"
        from={pathLength}
        to={0}
        dur={`${duration}ms`}
        begin={begin}
        fill="freeze"
        calcMode="spline"
        keySplines="0.4 0 0.2 1"
      />
    ),
  };
}

// Hook for managing brush draw state
import { useState, useCallback, useRef, useEffect } from 'react';

export function useBrushDraw(pathLength: number) {
  const [isDrawn, setIsDrawn] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);

  const draw = useCallback((duration: number = timing.brushDraw) => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      if (newProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsDrawn(true);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setProgress(0);
    setIsDrawn(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isDrawn,
    progress,
    dashOffset: pathLength * (1 - progress),
    draw,
    reset,
    style: {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength * (1 - progress),
    },
  };
}

// Reduced motion fallback
export const brushDrawReducedMotion = `
@media (prefers-reduced-motion: reduce) {
  [data-animation="brush-draw"] {
    animation: none !important;
    stroke-dashoffset: 0 !important;
    opacity: 1 !important;
  }
}
`;
