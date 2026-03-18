/**
 * Attention Animations
 * 
 * Subtle animations that guide the eye to important elements.
 * Pulse, glow, and indicator effects.
 */

import { timing, easing } from './timing';

// Keyframes for attention animations
export const attentionKeyframes = `
@keyframes gentlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes breathGlow {
  0%, 100% {
    filter: drop-shadow(0 0 0 rgba(231, 111, 81, 0));
    opacity: 1;
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(231, 111, 81, 0.3));
    opacity: 1;
  }
}

@keyframes breathGlowSage {
  0%, 100% {
    filter: drop-shadow(0 0 0 rgba(132, 169, 140, 0));
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(132, 169, 140, 0.35));
  }
}

@keyframes inkDotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

@keyframes subtleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes focusRipple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes sashikoThread {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -20;
  }
}
`;

// Style generators for each attention type
export type AttentionColor = 'persimmon' | 'sage' | 'indigo' | 'silk';

const colorMap: Record<AttentionColor, string> = {
  persimmon: 'rgba(231, 111, 81, 0.3)',
  sage: 'rgba(132, 169, 140, 0.35)',
  indigo: 'rgba(38, 70, 83, 0.25)',
  silk: 'rgba(220, 38, 38, 0.3)',
};

export interface AttentionOptions {
  color?: AttentionColor;
  delay?: number;
  disabled?: boolean;
}

// Gentle pulse - subtle scale oscillation
export function gentlePulseStyle(options: AttentionOptions = {}): React.CSSProperties {
  const { delay = 0, disabled = false } = options;
  
  if (disabled) return {};
  
  return {
    animation: `gentlePulse ${timing.gentlePulse}ms ${easing.easeInOut} ${delay}ms infinite`,
    transformOrigin: 'center center',
  };
}

// Breath glow - soft shadow expansion/contraction
export function breathGlowStyle(options: AttentionOptions = {}): React.CSSProperties {
  const { color = 'persimmon', delay = 0, disabled = false } = options;
  
  if (disabled) return {};
  
  const animationName = color === 'sage' ? 'breathGlowSage' : 'breathGlow';
  
  return {
    animation: `${animationName} ${timing.breathGlow}ms ${easing.easeInOut} ${delay}ms infinite`,
  };
}

// Ink dot pulse - heartbeat indicator
export function inkDotPulseStyle(options: AttentionOptions = {}): React.CSSProperties {
  const { delay = 0, disabled = false } = options;
  
  if (disabled) return {};
  
  return {
    animation: `inkDotPulse ${timing.inkDotPulse}ms ${easing.easeInOut} ${delay}ms infinite`,
    transformOrigin: 'center center',
  };
}

// Subtle float - gentle up/down movement
export function subtleFloatStyle(options: AttentionOptions = {}): React.CSSProperties {
  const { delay = 0, disabled = false } = options;
  
  if (disabled) return {};
  
  return {
    animation: `subtleFloat 2500ms ${easing.easeInOut} ${delay}ms infinite`,
  };
}

// Sashiko thread - moving stitch effect for lines
export function sashikoThreadStyle(options: AttentionOptions = {}): React.CSSProperties {
  const { delay = 0, disabled = false } = options;
  
  if (disabled) return {};
  
  return {
    strokeDasharray: '6 4',
    animation: `sashikoThread ${timing.sashikoThread}ms linear ${delay}ms infinite`,
  };
}

// Click ripple effect (for feedback)
export interface RippleOptions {
  x: number;
  y: number;
  color?: AttentionColor;
}

export function createRippleStyle(options: RippleOptions): React.CSSProperties {
  const { x, y, color = 'persimmon' } = options;
  
  return {
    position: 'absolute',
    left: x,
    top: y,
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    borderRadius: '50%',
    backgroundColor: colorMap[color],
    animation: `focusRipple 400ms ${easing.easeOut} forwards`,
    pointerEvents: 'none',
  };
}

// Hook for attention state
import { useState, useCallback, useEffect, useRef } from 'react';

export function useAttention(delayBeforeStart: number = 500) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAttention = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setIsActive(true);
    }, delayBeforeStart);
  }, [delayBeforeStart]);

  const stopAttention = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsActive(false);
  }, []);

  const pauseAttention = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeAttention = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isActive: isActive && !isPaused,
    startAttention,
    stopAttention,
    pauseAttention,
    resumeAttention,
  };
}

// Hook for click ripple effect
export function useRipple() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const idRef = useRef(0);

  const addRipple = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = idRef.current++;
    
    setRipples(prev => [...prev, { id, x, y }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 400);
  }, []);

  return { ripples, addRipple };
}

// Reduced motion fallback
export const attentionReducedMotion = `
@media (prefers-reduced-motion: reduce) {
  [data-animation="attention"] {
    animation: none !important;
  }
  
  [data-animation="gentle-pulse"],
  [data-animation="breath-glow"],
  [data-animation="ink-dot-pulse"],
  [data-animation="subtle-float"],
  [data-animation="sashiko-thread"] {
    animation: none !important;
  }
}
`;
