'use client';

import React from 'react';
import { quiltographerTheme } from './theme';

interface KumihimoProgressProps {
  current: number;
  total: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * KumihimoProgress - Braided cord progress indicator
 * 
 * Inspired by traditional Japanese kumihimo (braided cord).
 * Shows progress through pattern steps with an elegant braided visual.
 * The cord "shortens" as you approach the end, like unwinding thread.
 */
export function KumihimoProgress({
  current,
  total,
  orientation = 'horizontal',
  className = '',
}: KumihimoProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const isVertical = orientation === 'vertical';
  
  // Calculate cord segments remaining (visual metaphor)
  const segmentsBefore = current;
  const segmentsAfter = total - current;
  
  return (
    <div
      className={`kumihimo-progress ${className}`}
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        gap: '0.5rem',
        width: isVertical ? 'auto' : '100%',
        height: isVertical ? '100%' : 'auto',
      }}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}`}
    >
      {/* Cord before (completed) */}
      <div
        className="kumihimo-cord kumihimo-before"
        style={{
          flex: segmentsBefore,
          minWidth: isVertical ? 'auto' : '8px',
          minHeight: isVertical ? '8px' : 'auto',
          height: isVertical ? 'auto' : '4px',
          width: isVertical ? '4px' : 'auto',
          background: `repeating-linear-gradient(
            ${isVertical ? '0deg' : '90deg'},
            ${quiltographerTheme.colors.sage} 0px,
            ${quiltographerTheme.colors.sage} 4px,
            ${quiltographerTheme.colors.indigo} 4px,
            ${quiltographerTheme.colors.indigo} 8px
          )`,
          borderRadius: quiltographerTheme.radius.full,
          transition: `all ${quiltographerTheme.timing.breathe} ${quiltographerTheme.timing.easeOut}`,
          opacity: segmentsBefore > 0 ? 1 : 0.3,
        }}
      />
      
      {/* Current position marker */}
      <div
        className="kumihimo-marker"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: quiltographerTheme.radius.full,
          backgroundColor: quiltographerTheme.colors.persimmon,
          boxShadow: quiltographerTheme.shadows.soft,
          border: `2px solid ${quiltographerTheme.colors.rice}`,
          flexShrink: 0,
          transition: `transform ${quiltographerTheme.timing.quick} ${quiltographerTheme.timing.spring}`,
        }}
      />
      
      {/* Cord after (remaining) */}
      <div
        className="kumihimo-cord kumihimo-after"
        style={{
          flex: segmentsAfter,
          minWidth: isVertical ? 'auto' : '8px',
          minHeight: isVertical ? '8px' : 'auto',
          height: isVertical ? 'auto' : '4px',
          width: isVertical ? '4px' : 'auto',
          background: `repeating-linear-gradient(
            ${isVertical ? '0deg' : '90deg'},
            ${quiltographerTheme.colors.inactive} 0px,
            ${quiltographerTheme.colors.inactive} 4px,
            ${quiltographerTheme.colors.washiDark} 4px,
            ${quiltographerTheme.colors.washiDark} 8px
          )`,
          borderRadius: quiltographerTheme.radius.full,
          transition: `all ${quiltographerTheme.timing.breathe} ${quiltographerTheme.timing.easeOut}`,
          opacity: segmentsAfter > 0 ? 1 : 0.3,
        }}
      />
    </div>
  );
}

export default KumihimoProgress;
