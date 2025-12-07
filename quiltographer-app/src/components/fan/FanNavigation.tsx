'use client';

import React, { useRef, useEffect } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import { FanSegment } from './FanSegment';
import { KumihimoProgress } from '../japanese/KumihimoProgress';

interface FanNavigationItem {
  id: string;
  label: string;
  shortLabel?: string; // For compact display
}

interface FanNavigationProps {
  items: FanNavigationItem[];
  currentIndex: number;
  completedIndices?: number[];
  onSelect: (index: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
  showProgress?: boolean;
  /** Number of items visible at once (for scroll behavior) */
  visibleCount?: number;
}

/**
 * FanNavigation - Fan-inspired step navigation
 * 
 * v1 Implementation: Linear horizontal layout with fan aesthetics
 * 
 * This component is designed to evolve:
 * - v1: Linear strip with scroll, fan styling
 * - v1.1: Edge-anchored with swipe gestures  
 * - v2: Full radial fan with gestural control
 * 
 * Uses FanSegment for individual items, enabling seamless
 * upgrade path to full fan interface.
 */
export function FanNavigation({
  items,
  currentIndex,
  completedIndices = [],
  onSelect,
  onPrevious,
  onNext,
  className = '',
  showProgress = true,
  visibleCount = 5,
}: FanNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to keep current item visible
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const activeElement = container.querySelector('.fan-segment.active');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  return (
    <nav
      className={`fan-navigation ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: quiltographerTheme.spacing.breathe,
        backgroundColor: quiltographerTheme.colors.washiDark,
        borderRadius: quiltographerTheme.radius.lg,
        boxShadow: quiltographerTheme.shadows.soft,
      }}
      aria-label="Pattern steps navigation"
    >
      {/* Progress indicator */}
      {showProgress && (
        <div style={{ padding: '0 0.5rem' }}>
          <KumihimoProgress
            current={currentIndex + 1}
            total={items.length}
            orientation="horizontal"
          />
          <p
            style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: quiltographerTheme.typography.fontSize.sm,
              color: quiltographerTheme.colors.inkGray,
              fontFamily: quiltographerTheme.typography.fontFamily.body,
            }}
          >
            Step {currentIndex + 1} of {items.length}
          </p>
        </div>
      )}

      {/* Navigation controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {/* Previous button */}
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: quiltographerTheme.radius.full,
            border: 'none',
            backgroundColor: hasPrevious 
              ? quiltographerTheme.colors.washi 
              : quiltographerTheme.colors.inactive,
            color: hasPrevious 
              ? quiltographerTheme.colors.indigo 
              : quiltographerTheme.colors.inkGray,
            cursor: hasPrevious ? 'pointer' : 'not-allowed',
            transition: `all ${quiltographerTheme.timing.quick} ${quiltographerTheme.timing.easeOut}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
          aria-label="Previous step"
        >
          ←
        </button>

        {/* Scrollable segment container */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            flex: 1,
            padding: '0.25rem',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          {items.map((item, index) => (
            <FanSegment
              key={item.id}
              isActive={index === currentIndex}
              isCompleted={completedIndices.includes(index)}
              onClick={() => onSelect(index)}
              size="sm"
            >
              {item.shortLabel || item.label}
            </FanSegment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: quiltographerTheme.radius.full,
            border: 'none',
            backgroundColor: hasNext 
              ? quiltographerTheme.colors.persimmon 
              : quiltographerTheme.colors.inactive,
            color: hasNext 
              ? quiltographerTheme.colors.rice 
              : quiltographerTheme.colors.inkGray,
            cursor: hasNext ? 'pointer' : 'not-allowed',
            transition: `all ${quiltographerTheme.timing.quick} ${quiltographerTheme.timing.easeOut}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
            boxShadow: hasNext ? quiltographerTheme.shadows.soft : 'none',
          }}
          aria-label="Next step"
        >
          →
        </button>
      </div>
    </nav>
  );
}

export default FanNavigation;
