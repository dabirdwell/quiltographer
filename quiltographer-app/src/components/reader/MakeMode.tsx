'use client';

import React, { useState, useEffect } from 'react';
import { quiltographerTheme } from '@/components/japanese';

const theme = quiltographerTheme;

/**
 * Living animations - the UI breathes
 */
const livingAnimations = `
  /* Breathing pulse - for elements that need gentle attention */
  @keyframes breathe {
    0%, 100% { 
      transform: scale(1); 
      opacity: 0.85;
    }
    50% { 
      transform: scale(1.03); 
      opacity: 1;
    }
  }

  /* Arrow pulse - directional guidance */
  @keyframes arrowPulse {
    0%, 100% { 
      transform: translateX(0); 
      opacity: 0.7;
    }
    50% { 
      transform: translateX(4px); 
      opacity: 1;
    }
  }

  @keyframes arrowPulseLeft {
    0%, 100% { 
      transform: translateX(0); 
      opacity: 0.7;
    }
    50% { 
      transform: translateX(-4px); 
      opacity: 1;
    }
  }

  /* Ink dissolve - step transitions */
  @keyframes inkDissolve {
    0% { 
      opacity: 1; 
      filter: blur(0px);
      transform: scale(1);
    }
    100% { 
      opacity: 0; 
      filter: blur(8px);
      transform: scale(0.98);
    }
  }

  @keyframes inkEmerge {
    0% { 
      opacity: 0; 
      filter: blur(8px);
      transform: scale(1.02);
    }
    100% { 
      opacity: 1; 
      filter: blur(0px);
      transform: scale(1);
    }
  }

  /* Gentle float - for the crane and ambient elements */
  @keyframes gentleFloat {
    0%, 100% { 
      transform: translateY(0) rotate(0deg); 
    }
    25% { 
      transform: translateY(-3px) rotate(0.5deg); 
    }
    75% { 
      transform: translateY(2px) rotate(-0.5deg); 
    }
  }

  /* Paper unfold - for reveals */
  @keyframes paperUnfold {
    0% { 
      transform: scaleY(0) rotateX(-90deg);
      transform-origin: top;
      opacity: 0;
    }
    100% { 
      transform: scaleY(1) rotateX(0deg);
      transform-origin: top;
      opacity: 1;
    }
  }

  /* Kumihimo weave - progress indicator */
  @keyframes weaveShimmer {
    0% { 
      background-position: 0% 50%;
    }
    100% { 
      background-position: 200% 50%;
    }
  }

  /* Heartbeat - for important moments */
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    10% { transform: scale(1.05); }
    20% { transform: scale(1); }
    30% { transform: scale(1.03); }
    40%, 100% { transform: scale(1); }
  }

  /* Settle - after motion, things come to rest */
  @keyframes settle {
    0% { 
      transform: translateY(-10px);
      opacity: 0;
    }
    60% {
      transform: translateY(2px);
    }
    100% { 
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

interface MakeModeProps {
  step: {
    number: number;
    title: string;
    instruction: string;
    techniques?: string[];
    note?: string;
    warning?: string;
  };
  totalSteps: number;
  patternName: string;
  onPrevious: () => void;
  onNext: () => void;
  onOpenDrawer: () => void;
  onStepChange?: (stepNumber: number) => void;
  fontSize?: 'normal' | 'large' | 'xlarge';
}

/**
 * The Press Direction Arrow - breathes to draw attention
 */
function LivingArrow({ 
  direction, 
  label 
}: { 
  direction: 'left' | 'right' | 'both' | 'open';
  label?: string;
}) {
  const arrowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    backgroundColor: `${theme.colors.sage}15`,
    borderRadius: theme.radius.lg,
    marginTop: '1.5rem',
  };

  const arrowChar = {
    left: '←',
    right: '→',
    both: '↔',
    open: '⟷',
  };

  return (
    <div style={arrowStyle}>
      {(direction === 'left' || direction === 'both') && (
        <span 
          style={{ 
            fontSize: '1.5rem',
            color: theme.colors.sage,
            animation: 'arrowPulseLeft 2s ease-in-out infinite',
          }}
        >
          ←
        </span>
      )}
      <span style={{ 
        color: theme.colors.inkGray,
        fontSize: theme.typography.fontSize.sm,
        fontStyle: 'italic',
      }}>
        {label || 'PRESS'}
      </span>
      {(direction === 'right' || direction === 'both' || direction === 'open') && (
        <span 
          style={{ 
            fontSize: '1.5rem',
            color: theme.colors.sage,
            animation: 'arrowPulse 2s ease-in-out infinite',
          }}
        >
          →
        </span>
      )}
    </div>
  );
}

/**
 * The Folded Crane - dreams of flight
 */
function FoldedCrane({ onTap }: { onTap: () => void }) {
  const [showHaiku, setShowHaiku] = useState(false);

  const handleTap = () => {
    setShowHaiku(true);
    onTap();
    setTimeout(() => setShowHaiku(false), 4000);
  };

  return (
    <div 
      onClick={handleTap}
      style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        cursor: 'pointer',
        animation: 'gentleFloat 6s ease-in-out infinite',
      }}
    >
      {/* Simple origami crane SVG */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        style={{
          opacity: 0.4,
          transition: 'opacity 0.3s ease',
        }}
      >
        <path 
          d="M12 2L2 12l4 4 6-6 6 6 4-4L12 2z" 
          fill={theme.colors.bamboo}
          opacity="0.6"
        />
        <path 
          d="M12 8l-4 4h8l-4-4z" 
          fill={theme.colors.washi}
        />
      </svg>

      {/* Haiku popup */}
      {showHaiku && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '0.5rem',
            padding: '1rem',
            backgroundColor: theme.colors.rice,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadows.lifted,
            width: '180px',
            animation: 'settle 0.4s ease-out',
            fontFamily: theme.typography.fontFamily.display,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.inkGray,
            lineHeight: 1.8,
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          The crane dreams of flight.
          <br />
          Some tools are still folded,
          <br />
          waiting for spring.
        </div>
      )}
    </div>
  );
}

/**
 * Navigation dots with Kumihimo styling
 */
function KumihimoNav({ 
  current, 
  total, 
  onSelect 
}: { 
  current: number; 
  total: number;
  onSelect: (step: number) => void;
}) {
  // Show at most 7 dots, centered on current
  const maxDots = 7;
  let start = Math.max(1, current - Math.floor(maxDots / 2));
  let end = Math.min(total, start + maxDots - 1);
  if (end - start + 1 < maxDots) {
    start = Math.max(1, end - maxDots + 1);
  }

  const dots = [];
  for (let i = start; i <= end; i++) {
    dots.push(i);
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    }}>
      {start > 1 && (
        <span style={{ color: theme.colors.inkLight, fontSize: '0.75rem' }}>...</span>
      )}
      {dots.map(num => (
        <button
          key={num}
          onClick={() => onSelect(num)}
          style={{
            width: num === current ? '12px' : '8px',
            height: num === current ? '12px' : '8px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: num === current 
              ? theme.colors.persimmon 
              : num < current 
                ? theme.colors.sage 
                : theme.colors.inactive,
            cursor: 'pointer',
            transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
            animation: num === current ? 'breathe 3s ease-in-out infinite' : 'none',
          }}
          aria-label={`Go to step ${num}`}
        />
      ))}
      {end < total && (
        <span style={{ color: theme.colors.inkLight, fontSize: '0.75rem' }}>...</span>
      )}
    </div>
  );
}

/**
 * MakeMode - The focused, single-step experience
 * 
 * 60% empty space. One instruction. One action. Everything else tucked away.
 */
export function MakeMode({
  step,
  totalSteps,
  patternName,
  onPrevious,
  onNext,
  onOpenDrawer,
  onStepChange,
  fontSize = 'normal',
}: MakeModeProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'in' | 'out'>('in');

  const fontSizes = {
    normal: theme.typography.fontSize.lg,
    large: theme.typography.fontSize.xl,
    xlarge: theme.typography.fontSize['2xl'],
  };

  // Detect press direction from instruction
  const detectPressDirection = (instruction: string): 'left' | 'right' | 'both' | 'open' | null => {
    const lower = instruction.toLowerCase();
    if (lower.includes('press') || lower.includes('iron')) {
      if (lower.includes('open') || lower.includes('apart')) return 'open';
      if (lower.includes('left')) return 'left';
      if (lower.includes('right')) return 'right';
      if (lower.includes('toward')) return 'right'; // Default direction
      return 'both';
    }
    return null;
  };

  const pressDirection = detectPressDirection(step.instruction);

  const handleNavigate = (direction: 'prev' | 'next') => {
    setTransitionDirection('out');
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (direction === 'prev') onPrevious();
      else onNext();
      
      setTransitionDirection('in');
      setTimeout(() => setIsTransitioning(false), 300);
    }, 200);
  };

  return (
    <>
      <style>{livingAnimations}</style>
      
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.washi,
        backgroundImage: theme.textures.washiFiber,
        position: 'relative',
      }}>
        {/* Minimal Header */}
        <header style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: theme.borders.hairline,
        }}>
          <span style={{
            color: theme.colors.inkGray,
            fontSize: theme.typography.fontSize.sm,
            fontFamily: theme.typography.fontFamily.body,
          }}>
            {patternName}
          </span>
          <span style={{
            color: theme.colors.indigo,
            fontSize: theme.typography.fontSize.base,
            fontWeight: 500,
            fontFamily: theme.typography.fontFamily.display,
          }}>
            {step.number} / {totalSteps}
          </span>
        </header>

        {/* Main Content - The Focus */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          position: 'relative',
          animation: isTransitioning 
            ? transitionDirection === 'out' 
              ? 'inkDissolve 0.2s ease-out forwards' 
              : 'inkEmerge 0.3s ease-out forwards'
            : 'none',
        }}>
          {/* Step Title */}
          <h2 style={{
            color: theme.colors.inkLight,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '1.5rem',
            fontFamily: theme.typography.fontFamily.body,
          }}>
            {step.title}
          </h2>

          {/* The Instruction - Center of attention */}
          <p style={{
            color: theme.colors.inkBlack,
            fontSize: fontSizes[fontSize],
            lineHeight: 1.7,
            textAlign: 'center',
            maxWidth: '600px',
            fontFamily: theme.typography.fontFamily.body,
            margin: 0,
          }}>
            {step.instruction}
          </p>

          {/* Living Arrow for press direction */}
          {pressDirection && (
            <LivingArrow direction={pressDirection} />
          )}

          {/* Warning - gentle pulse */}
          {step.warning && (
            <div style={{
              marginTop: '2rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: `${theme.colors.persimmon}10`,
              borderLeft: `3px solid ${theme.colors.persimmon}`,
              borderRadius: theme.radius.sm,
              color: theme.colors.inkGray,
              fontSize: theme.typography.fontSize.sm,
              animation: 'breathe 4s ease-in-out infinite',
            }}>
              ⚠️ {step.warning}
            </div>
          )}

          {/* Note - subtle */}
          {step.note && !step.warning && (
            <div style={{
              marginTop: '2rem',
              color: theme.colors.inkLight,
              fontSize: theme.typography.fontSize.sm,
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: '500px',
            }}>
              💡 {step.note}
            </div>
          )}

          {/* The Folded Crane */}
          <FoldedCrane onTap={() => {}} />
        </main>

        {/* Bottom Navigation */}
        <footer style={{
          padding: '1rem 1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {/* Kumihimo dots */}
          <KumihimoNav 
            current={step.number} 
            total={totalSteps}
            onSelect={(num) => onStepChange?.(num)}
          />

          {/* Navigation row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '400px',
          }}>
            {/* Previous */}
            <button
              onClick={() => handleNavigate('prev')}
              disabled={step.number <= 1}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: step.number <= 1 ? theme.colors.inactive : theme.colors.indigo,
                fontSize: '1.5rem',
                cursor: step.number <= 1 ? 'default' : 'pointer',
                opacity: step.number <= 1 ? 0.3 : 1,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
              aria-label="Previous step"
            >
              ←
            </button>

            {/* Fan drawer trigger */}
            <button
              onClick={onOpenDrawer}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: theme.colors.rice,
                border: theme.borders.hairline,
                borderRadius: theme.radius.md,
                color: theme.colors.bamboo,
                fontSize: theme.typography.fontSize.sm,
                cursor: 'pointer',
                boxShadow: theme.shadows.subtle,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              ☰
            </button>

            {/* Next */}
            <button
              onClick={() => handleNavigate('next')}
              disabled={step.number >= totalSteps}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: step.number >= totalSteps ? theme.colors.inactive : theme.colors.indigo,
                fontSize: '1.5rem',
                cursor: step.number >= totalSteps ? 'default' : 'pointer',
                opacity: step.number >= totalSteps ? 0.3 : 1,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                animation: step.number < totalSteps ? 'arrowPulse 2.5s ease-in-out infinite' : 'none',
              }}
              aria-label="Next step"
            >
              →
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}

export default MakeMode;
