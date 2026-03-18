/**
 * Phase Transitions
 * 
 * Animations for transitioning between diagram phases.
 * Silk slide, paper fold, fabric movements.
 */

import { timing, easing, staggerDelay } from './timing';

// Keyframes for transitions
export const transitionKeyframes = `
@keyframes silkSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes silkSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

@keyframes silkSlideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes silkSlideDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(15px);
  }
}

@keyframes paperFoldIn {
  from {
    opacity: 0;
    transform: perspective(500px) rotateX(-15deg) scale(0.95);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: perspective(500px) rotateX(0deg) scale(1);
  }
}

@keyframes paperFoldOut {
  from {
    opacity: 1;
    transform: perspective(500px) rotateX(0deg) scale(1);
  }
  to {
    opacity: 0;
    transform: perspective(500px) rotateX(15deg) scale(0.95);
    transform-origin: bottom center;
  }
}

@keyframes fabricSettle {
  0% {
    transform: rotate(var(--initial-rotation, 3deg));
  }
  60% {
    transform: rotate(calc(var(--initial-rotation, 3deg) * -0.3));
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes stampPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeToMemory {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.25;
    filter: grayscale(0.3);
  }
}

@keyframes threadPull {
  0% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(8px);
  }
  70% {
    transform: translateX(-3px);
  }
  100% {
    transform: translateX(0);
  }
}
`;

export type TransitionDirection = 'in' | 'out';
export type SlideDirection = 'left' | 'right' | 'up' | 'down';

export interface TransitionOptions {
  duration?: number;
  delay?: number;
  direction?: TransitionDirection;
}

// Silk slide - smooth gliding
export function silkSlideStyle(
  slideDirection: SlideDirection = 'left',
  options: TransitionOptions = {}
): React.CSSProperties {
  const { duration = timing.breathe, delay = 0, direction = 'in' } = options;
  
  const animations: Record<SlideDirection, Record<TransitionDirection, string>> = {
    left: { in: 'silkSlideIn', out: 'silkSlideOut' },
    right: { in: 'silkSlideOut', out: 'silkSlideIn' }, // Reversed
    up: { in: 'silkSlideUp', out: 'silkSlideDown' },
    down: { in: 'silkSlideDown', out: 'silkSlideUp' },
  };
  
  return {
    animation: `${animations[slideDirection][direction]} ${duration}ms ${easing.silk} ${delay}ms forwards`,
  };
}

// Paper fold - 3D perspective transform
export function paperFoldStyle(options: TransitionOptions = {}): React.CSSProperties {
  const { duration = timing.unfold, delay = 0, direction = 'in' } = options;
  
  const animationName = direction === 'in' ? 'paperFoldIn' : 'paperFoldOut';
  
  return {
    animation: `${animationName} ${duration}ms ${easing.paperFold} ${delay}ms forwards`,
    transformStyle: 'preserve-3d',
  };
}

// Fabric settle - slight rotation settling to flat
export function fabricSettleStyle(initialRotation: number = 3, options: TransitionOptions = {}): React.CSSProperties {
  const { duration = timing.meditate, delay = 0 } = options;
  
  return {
    '--initial-rotation': `${initialRotation}deg`,
    animation: `fabricSettle ${duration}ms ${easing.gentleSpring} ${delay}ms forwards`,
  } as React.CSSProperties;
}

// Stamp press - click feedback
export function stampPressStyle(options: TransitionOptions = {}): React.CSSProperties {
  const { duration = timing.quick, delay = 0 } = options;
  
  return {
    animation: `stampPress ${duration}ms ${easing.easeOut} ${delay}ms`,
  };
}

// Fade to memory - ghost of previous state
export function fadeToMemoryStyle(options: TransitionOptions = {}): React.CSSProperties {
  const { duration = timing.breathe, delay = 0 } = options;
  
  return {
    animation: `fadeToMemory ${duration}ms ${easing.easeOut} ${delay}ms forwards`,
  };
}

// Thread pull - spring-like movement
export function threadPullStyle(options: TransitionOptions = {}): React.CSSProperties {
  const { duration = timing.unfold, delay = 0 } = options;
  
  return {
    animation: `threadPull ${duration}ms ${easing.spring} ${delay}ms`,
  };
}

// Staggered group animation
export interface StaggeredGroupOptions {
  itemCount: number;
  baseDelay?: number;
  stagger?: number;
  direction?: TransitionDirection;
}

export function createStaggeredStyles(
  animationType: 'silkSlide' | 'paperFold' | 'fadeIn',
  options: StaggeredGroupOptions
): React.CSSProperties[] {
  const { itemCount, baseDelay = 0, stagger = timing.staggerDelay, direction = 'in' } = options;
  
  const styles: React.CSSProperties[] = [];
  
  for (let i = 0; i < itemCount; i++) {
    const delay = baseDelay + staggerDelay(i, stagger);
    
    switch (animationType) {
      case 'silkSlide':
        styles.push(silkSlideStyle('up', { delay, direction }));
        break;
      case 'paperFold':
        styles.push(paperFoldStyle({ delay, direction }));
        break;
      case 'fadeIn':
        styles.push({
          opacity: 0,
          animation: `fadeIn ${timing.breathe}ms ${easing.easeOut} ${delay}ms forwards`,
        });
        break;
    }
  }
  
  return styles;
}

// Phase transition orchestrator
export interface PhaseTransitionConfig {
  exitDuration?: number;
  pauseDuration?: number;
  enterDuration?: number;
  onExitComplete?: () => void;
  onEnterStart?: () => void;
  onEnterComplete?: () => void;
}

export function createPhaseTransition(config: PhaseTransitionConfig = {}) {
  const {
    exitDuration = timing.phaseExit,
    pauseDuration = timing.phasePause,
    enterDuration = timing.phaseEnter,
    onExitComplete,
    onEnterStart,
    onEnterComplete,
  } = config;

  return {
    totalDuration: exitDuration + pauseDuration + enterDuration,
    
    execute: async () => {
      // Exit phase
      await new Promise(resolve => setTimeout(resolve, exitDuration));
      onExitComplete?.();
      
      // Pause
      await new Promise(resolve => setTimeout(resolve, pauseDuration));
      onEnterStart?.();
      
      // Enter phase
      await new Promise(resolve => setTimeout(resolve, enterDuration));
      onEnterComplete?.();
    },
    
    timings: {
      exitStart: 0,
      exitEnd: exitDuration,
      enterStart: exitDuration + pauseDuration,
      enterEnd: exitDuration + pauseDuration + enterDuration,
    },
  };
}

// Reduced motion fallback
export const transitionReducedMotion = `
@media (prefers-reduced-motion: reduce) {
  [data-animation="silk-slide"],
  [data-animation="paper-fold"],
  [data-animation="fabric-settle"],
  [data-animation="thread-pull"],
  [data-animation="fade-memory"] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;
