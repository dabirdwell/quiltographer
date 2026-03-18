/**
 * Quiltographer Animation Timing
 * 
 * Central timing definitions for all diagram animations.
 * Inspired by natural movement and traditional craft rhythms.
 */

// Timing durations (in milliseconds)
export const timing = {
  // Instant feedback
  instant: 100,
  
  // Quick responses
  quick: 200,
  
  // Natural breathing pace
  breathe: 300,
  
  // Deliberate unfolding
  unfold: 400,
  
  // Meditative, contemplative
  meditate: 600,
  
  // Entry animations
  inkBleed: 500,
  brushDraw: 400,
  foldReveal: 450,
  
  // Attention cycles (for infinite animations)
  gentlePulse: 2000,
  breathGlow: 3000,
  inkDotPulse: 1500,
  sashikoThread: 12000, // Very slow, contemplative
  
  // Phase transitions
  phaseExit: 200,
  phasePause: 100,
  phaseEnter: 350,
  staggerDelay: 75,
} as const;

// Easing functions
export const easing = {
  // Standard eases
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
  
  // Organic spring (slight overshoot)
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  // Gentle spring (minimal overshoot)
  gentleSpring: 'cubic-bezier(0.25, 1.25, 0.5, 1)',
  
  // Silk-like smoothness
  silk: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  
  // Paper fold (starts slow, accelerates)
  paperFold: 'cubic-bezier(0.6, 0, 0.4, 1)',
  
  // Ink spread (fast start, slow settle)
  inkSpread: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
} as const;

// CSS custom properties for use in stylesheets
export const cssVariables = `
  --timing-instant: ${timing.instant}ms;
  --timing-quick: ${timing.quick}ms;
  --timing-breathe: ${timing.breathe}ms;
  --timing-unfold: ${timing.unfold}ms;
  --timing-meditate: ${timing.meditate}ms;
  
  --ease-out: ${easing.easeOut};
  --ease-in: ${easing.easeIn};
  --ease-in-out: ${easing.easeInOut};
  --ease-spring: ${easing.spring};
  --ease-silk: ${easing.silk};
  --ease-ink: ${easing.inkSpread};
`;

// Helper to create transition string
export function createTransition(
  properties: string | string[],
  duration: keyof typeof timing | number = 'breathe',
  ease: keyof typeof easing = 'easeOut',
  delay: number = 0
): string {
  const props = Array.isArray(properties) ? properties : [properties];
  const dur = typeof duration === 'number' ? duration : timing[duration];
  const easeFn = easing[ease];
  
  return props
    .map(prop => `${prop} ${dur}ms ${easeFn}${delay ? ` ${delay}ms` : ''}`)
    .join(', ');
}

// Helper for staggered delays
export function staggerDelay(index: number, baseDelay: number = timing.staggerDelay): number {
  return index * baseDelay;
}

export type TimingKey = keyof typeof timing;
export type EasingKey = keyof typeof easing;
