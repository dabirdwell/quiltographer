'use client';

import React from 'react';
import { quiltographerTheme } from '../japanese/theme';

interface FanSegmentProps {
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * FanSegment - Individual segment of a fan interface
 * 
 * This is the building block for both:
 * - v1: Linear fan-inspired navigation
 * - v2: Full radial gestural fan
 * 
 * The same component works in both contexts, enabling
 * seamless upgrade from Pattern Reader to full Quiltographer.
 */
export function FanSegment({
  children,
  isActive = false,
  isCompleted = false,
  onClick,
  className = '',
  size = 'md',
}: FanSegmentProps) {
  const sizeStyles = {
    sm: { padding: '0.5rem 0.75rem', fontSize: quiltographerTheme.typography.fontSize.sm },
    md: { padding: '0.75rem 1rem', fontSize: quiltographerTheme.typography.fontSize.base },
    lg: { padding: '1rem 1.25rem', fontSize: quiltographerTheme.typography.fontSize.lg },
  };

  const getBackgroundColor = () => {
    if (isActive) return quiltographerTheme.colors.persimmon;
    if (isCompleted) return quiltographerTheme.colors.sage;
    return quiltographerTheme.colors.washi;
  };

  const getTextColor = () => {
    if (isActive || isCompleted) return quiltographerTheme.colors.rice;
    return quiltographerTheme.colors.inkBlack;
  };

  return (
    <button
      onClick={onClick}
      className={`fan-segment ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${className}`}
      style={{
        ...sizeStyles[size],
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        border: 'none',
        borderRadius: quiltographerTheme.radius.md,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${quiltographerTheme.timing.quick} ${quiltographerTheme.timing.easeOut}`,
        boxShadow: isActive ? quiltographerTheme.shadows.lifted : quiltographerTheme.shadows.subtle,
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        fontFamily: quiltographerTheme.typography.fontFamily.body,
        fontWeight: isActive ? 600 : 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minWidth: '44px', // Touch-friendly minimum
        minHeight: '44px',
      }}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* Completion indicator */}
      {isCompleted && !isActive && (
        <span style={{ fontSize: '0.875em' }}>✓</span>
      )}
      {children}
    </button>
  );
}

export default FanSegment;
