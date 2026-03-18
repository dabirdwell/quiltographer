'use client';

import React, { useCallback } from 'react';
import { CornerMarks } from './CornerMarks';
import { useAnimationStyles, useReducedMotion, useRipple } from '../animations';
import { quiltographerTheme } from '../../japanese/theme';

/**
 * DiagramContainer - Standard wrapper for all technique diagrams
 * 
 * Provides:
 * - Washi paper background
 * - Corner registration marks
 * - Click-to-advance interaction
 * - Keyboard navigation
 * - Accessibility features
 * - Animation style injection
 */

interface DiagramContainerProps {
  children: React.ReactNode;
  
  // Interaction
  onAdvance?: () => void;
  onRetreat?: () => void;
  
  // Display
  title?: string;
  instruction?: string;
  
  // Customization
  className?: string;
  style?: React.CSSProperties;
  showCornerMarks?: boolean;
  showRipple?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  currentPhase?: number;
  totalPhases?: number;
}

export function DiagramContainer({
  children,
  onAdvance,
  onRetreat,
  title,
  instruction,
  className = '',
  style = {},
  showCornerMarks = true,
  showRipple = true,
  ariaLabel,
  currentPhase,
  totalPhases,
}: DiagramContainerProps) {
  // Inject animation styles on mount
  useAnimationStyles();
  
  // Check reduced motion preference
  const reducedMotion = useReducedMotion();
  
  // Ripple effect
  const { ripples, addRipple } = useRipple();

  // Click handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (showRipple && !reducedMotion) {
      addRipple(e);
    }
    onAdvance?.();
  }, [onAdvance, addRipple, showRipple, reducedMotion]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'Enter':
      case ' ':
        e.preventDefault();
        onAdvance?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onRetreat?.();
        break;
    }
  }, [onAdvance, onRetreat]);

  // Accessibility label
  const accessibleLabel = ariaLabel || 
    (currentPhase !== undefined && totalPhases !== undefined
      ? `${title || 'Diagram'}, step ${currentPhase + 1} of ${totalPhases}. ${instruction || ''}`
      : title || 'Interactive technique diagram');

  return (
    <div
      className={`diagram-container ${className}`}
      style={{
        position: 'relative',
        padding: '1.25rem',
        background: `
          linear-gradient(90deg, rgba(139, 69, 19, 0.04) 1px, transparent 1px),
          linear-gradient(rgba(139, 69, 19, 0.04) 1px, transparent 1px),
          linear-gradient(135deg, ${quiltographerTheme.colors.washi} 0%, ${quiltographerTheme.colors.washiDark} 100%)
        `,
        backgroundSize: '24px 24px, 24px 24px, 100% 100%',
        borderRadius: '12px',
        border: '1px solid rgba(139, 69, 19, 0.12)',
        fontFamily: quiltographerTheme.typography.fontFamily.body,
        overflow: 'hidden',
        cursor: onAdvance ? 'pointer' : 'default',
        outline: 'none',
        ...style,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label={accessibleLabel}
      aria-roledescription="interactive diagram"
    >
      {/* Paper grain texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: quiltographerTheme.textures.paperGrain,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      {/* Corner registration marks */}
      {showCornerMarks && <CornerMarks />}

      {/* Instruction banner */}
      {instruction && (
        <div 
          style={{
            textAlign: 'center',
            marginBottom: '0.75rem',
            padding: '0.5rem',
            background: 'rgba(38, 70, 83, 0.05)',
            borderRadius: '6px',
            fontSize: '13px',
            color: quiltographerTheme.colors.indigo,
            fontWeight: 500,
            position: 'relative',
          }}
          aria-live="polite"
        >
          {instruction}
        </div>
      )}

      {/* Main content */}
      <div style={{ position: 'relative' }}>
        {children}
      </div>

      {/* Click ripples */}
      {showRipple && ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
            borderRadius: '50%',
            backgroundColor: 'rgba(231, 111, 81, 0.3)',
            animation: 'focusRipple 400ms ease-out forwards',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      ))}

      {/* Screen reader hint */}
      <div 
        className="sr-only"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {onAdvance && 'Click or press Enter to advance to next step. Press left arrow to go back.'}
      </div>
    </div>
  );
}

/**
 * PhaseIndicator - Dots showing current phase
 */
interface PhaseIndicatorProps {
  current: number;
  total: number;
  onSelect?: (phase: number) => void;
  labels?: string[];
}

export function PhaseIndicator({
  current,
  total,
  onSelect,
  labels = [],
}: PhaseIndicatorProps) {
  // Stop propagation to prevent container's onClick from firing
  const handleClick = (e: React.MouseEvent, phase: number) => {
    e.stopPropagation();
    onSelect?.(phase);
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '0.75rem',
      }}
      role="tablist"
      aria-label="Diagram phases"
      onClick={(e) => e.stopPropagation()} // Stop any clicks in this area from bubbling
    >
      {/* Previous button */}
      <button
        onClick={(e) => handleClick(e, current - 1)}
        disabled={current <= 0}
        style={{
          padding: '6px 12px',
          fontSize: '14px',
          background: 'transparent',
          color: current <= 0 ? '#ccc' : '#666',
          border: '1px solid rgba(0,0,0,0.15)',
          borderRadius: '6px',
          cursor: current <= 0 ? 'default' : 'pointer',
          transition: 'all 200ms ease-out',
        }}
        aria-label="Previous step"
      >
        ←
      </button>
      
      {/* Phase dots */}
      <div style={{ display: 'flex', gap: '6px', padding: '0 8px' }}>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={(e) => handleClick(e, i)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: current === i 
                ? quiltographerTheme.colors.indigo 
                : 'rgba(0,0,0,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 200ms ease-out',
              transform: current === i ? 'scale(1.2)' : 'scale(1)',
            }}
            role="tab"
            aria-selected={current === i}
            aria-label={labels[i] || `Step ${i + 1}`}
            title={labels[i] || `Step ${i + 1}`}
          />
        ))}
      </div>
      
      {/* Next button */}
      <button
        onClick={(e) => handleClick(e, current + 1)}
        disabled={current >= total - 1}
        style={{
          padding: '6px 12px',
          fontSize: '14px',
          background: 'transparent',
          color: current >= total - 1 ? '#ccc' : '#666',
          border: '1px solid rgba(0,0,0,0.15)',
          borderRadius: '6px',
          cursor: current >= total - 1 ? 'default' : 'pointer',
          transition: 'all 200ms ease-out',
        }}
        aria-label="Next step"
      >
        →
      </button>
    </div>
  );
}

/**
 * PhaseLabel - Text label showing current phase
 */
interface PhaseLabelProps {
  label: string;
  current: number;
  total: number;
}

export function PhaseLabel({ label, current, total }: PhaseLabelProps) {
  return (
    <div 
      style={{
        textAlign: 'center',
        marginTop: '0.5rem',
        fontSize: '11px',
        color: '#888',
      }}
      aria-live="polite"
    >
      {label} ({current + 1} of {total})
    </div>
  );
}

export default DiagramContainer;
