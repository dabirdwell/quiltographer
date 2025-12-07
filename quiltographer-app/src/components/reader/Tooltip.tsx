'use client';

import React, { useState, useRef, useEffect } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import { GlossaryTerm } from '@/lib/reader/glossary';

const theme = quiltographerTheme;

export type TooltipType = 'term' | 'warning' | 'tip' | 'checkpoint' | 'tool';

export interface TooltipProps {
  term: string;
  definition: string;
  visualHint?: string;
  commonMistake?: string;
  tip?: string;
  warning?: string;
  relatedTerms?: string[];
  type: TooltipType;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Tooltip({
  term,
  definition,
  visualHint,
  commonMistake,
  tip,
  warning,
  relatedTerms,
  type,
  children,
  disabled = false,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'above' | 'below'>('below');
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Position tooltip based on available space
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setPosition(spaceBelow < 200 && spaceAbove > spaceBelow ? 'above' : 'below');
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  if (disabled) {
    return <>{children}</>;
  }

  // Style based on tooltip type
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          borderColor: theme.colors.persimmon,
          iconBg: `${theme.colors.persimmon}20`,
          icon: '⚠️',
        };
      case 'tip':
        return {
          borderColor: theme.colors.sage,
          iconBg: `${theme.colors.sage}20`,
          icon: '💡',
        };
      case 'checkpoint':
        return {
          borderColor: theme.colors.indigo,
          iconBg: `${theme.colors.indigo}20`,
          icon: '✓',
        };
      case 'tool':
        return {
          borderColor: theme.colors.bamboo,
          iconBg: `${theme.colors.bamboo}20`,
          icon: '🔧',
        };
      default: // term
        return {
          borderColor: theme.colors.clay,
          iconBg: `${theme.colors.clay}20`,
          icon: '📖',
        };
    }
  };

  const typeStyles = getTypeStyles();

  // Underline style for highlighted terms
  const underlineStyle = {
    term: `2px dotted ${theme.colors.clay}80`,
    warning: `2px solid ${theme.colors.persimmon}80`,
    tip: `2px dotted ${theme.colors.sage}80`,
    checkpoint: `2px solid ${theme.colors.indigo}80`,
    tool: `2px dotted ${theme.colors.bamboo}80`,
  };

  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <span
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'help',
          borderBottom: underlineStyle[type],
          paddingBottom: '1px',
          transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
        }}
        role="button"
        aria-expanded={isOpen}
        aria-describedby={`tooltip-${term.replace(/\s+/g, '-')}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {children}
      </span>

      {isOpen && (
        <div
          ref={tooltipRef}
          id={`tooltip-${term.replace(/\s+/g, '-')}`}
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            [position === 'below' ? 'top' : 'bottom']: '100%',
            marginTop: position === 'below' ? '8px' : 0,
            marginBottom: position === 'above' ? '8px' : 0,
            width: 'min(320px, 90vw)',
            zIndex: 1000,

            // Washi paper styling
            backgroundColor: theme.colors.washi,
            backgroundImage: theme.textures.washiFiber,
            border: `2px solid ${typeStyles.borderColor}`,
            borderRadius: theme.radius.lg,
            boxShadow: theme.shadows.floating,
            padding: theme.spacing.breathe,

            // Animation
            animation: `tooltipFadeIn ${theme.timing.breathe} ${theme.timing.easeOut}`,
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              [position === 'below' ? 'top' : 'bottom']: '-6px',
              width: '12px',
              height: '12px',
              backgroundColor: theme.colors.washi,
              border: `2px solid ${typeStyles.borderColor}`,
              borderRight: position === 'below' ? 'none' : undefined,
              borderBottom: position === 'below' ? 'none' : undefined,
              borderLeft: position === 'above' ? 'none' : undefined,
              borderTop: position === 'above' ? 'none' : undefined,
            }}
          />

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: theme.borders.hairline,
          }}>
            <span style={{
              fontSize: '1.1rem',
              backgroundColor: typeStyles.iconBg,
              padding: '4px 8px',
              borderRadius: theme.radius.sm,
            }}>
              {typeStyles.icon}
            </span>
            <span style={{
              fontWeight: 600,
              color: theme.colors.indigo,
              fontFamily: theme.typography.fontFamily.display,
              fontSize: theme.typography.fontSize.base,
            }}>
              {term}
            </span>
          </div>

          {/* Definition */}
          <p style={{
            margin: '0 0 0.75rem 0',
            color: theme.colors.inkBlack,
            fontSize: theme.typography.fontSize.sm,
            lineHeight: theme.typography.lineHeight.relaxed,
            fontFamily: theme.typography.fontFamily.body,
          }}>
            {definition}
          </p>

          {/* Visual Hint */}
          {visualHint && (
            <div style={{
              margin: '0 0 0.75rem 0',
              padding: '0.5rem 0.75rem',
              backgroundColor: `${theme.colors.sage}15`,
              borderRadius: theme.radius.sm,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.inkBlack,
              fontStyle: 'italic',
            }}>
              <span style={{ opacity: 0.7 }}>Imagine:</span> {visualHint}
            </div>
          )}

          {/* Common Mistake */}
          {commonMistake && (
            <div style={{
              margin: '0 0 0.75rem 0',
              padding: '0.5rem 0.75rem',
              backgroundColor: `${theme.colors.persimmon}12`,
              borderLeft: `3px solid ${theme.colors.persimmon}`,
              borderRadius: `0 ${theme.radius.sm} ${theme.radius.sm} 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.inkBlack,
            }}>
              <span style={{ fontWeight: 500, color: theme.colors.persimmon }}>Watch out:</span> {commonMistake}
            </div>
          )}

          {/* Warning */}
          {warning && (
            <div style={{
              margin: '0 0 0.75rem 0',
              padding: '0.5rem 0.75rem',
              backgroundColor: `${theme.colors.persimmon}12`,
              borderLeft: `3px solid ${theme.colors.persimmon}`,
              borderRadius: `0 ${theme.radius.sm} ${theme.radius.sm} 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.inkBlack,
            }}>
              <span style={{ fontWeight: 500, color: theme.colors.persimmon }}>⚠️</span> {warning}
            </div>
          )}

          {/* Tip */}
          {tip && (
            <div style={{
              margin: '0 0 0.75rem 0',
              padding: '0.5rem 0.75rem',
              backgroundColor: `${theme.colors.sage}15`,
              borderLeft: `3px solid ${theme.colors.sage}`,
              borderRadius: `0 ${theme.radius.sm} ${theme.radius.sm} 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.inkBlack,
            }}>
              <span style={{ fontWeight: 500, color: theme.colors.sage }}>💡 Tip:</span> {tip}
            </div>
          )}

          {/* Related Terms */}
          {relatedTerms && relatedTerms.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: theme.borders.hairline,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.inkGray,
            }}>
              <span>Related: </span>
              {relatedTerms.map((t, i) => (
                <span key={t}>
                  <span style={{
                    color: theme.colors.indigo,
                    cursor: 'pointer',
                  }}>
                    {t}
                  </span>
                  {i < relatedTerms.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}

          {/* Close hint */}
          <div style={{
            marginTop: '0.75rem',
            textAlign: 'center',
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.inkGray,
            opacity: 0.6,
          }}>
            Tap outside to close
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(${position === 'below' ? '-8px' : '8px'});
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </span>
  );
}

// Helper component to render text with auto-highlighted terms
export interface HighlightedTextProps {
  text: string;
  glossary: Record<string, GlossaryTerm>;
  disabled?: boolean;
}

export function HighlightedText({ text, glossary, disabled = false }: HighlightedTextProps) {
  if (disabled) {
    return <>{text}</>;
  }

  // Build regex from glossary terms
  const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
  const pattern = terms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  // Split text and create elements
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Find canonical term
    const matchedText = match[1];
    const canonicalTerm = terms.find(t => t.toLowerCase() === matchedText.toLowerCase());

    if (canonicalTerm && glossary[canonicalTerm]) {
      const termInfo = glossary[canonicalTerm];
      parts.push(
        <Tooltip
          key={`${match.index}-${matchedText}`}
          term={canonicalTerm}
          definition={termInfo.definition}
          visualHint={termInfo.visualHint}
          commonMistake={termInfo.commonMistake}
          tip={termInfo.tip}
          warning={termInfo.warning}
          relatedTerms={termInfo.relatedTerms}
          type={termInfo.type === 'tool' ? 'tool' : 'term'}
        >
          {matchedText}
        </Tooltip>
      );
    } else {
      parts.push(matchedText);
    }

    lastIndex = match.index + matchedText.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

export default Tooltip;
