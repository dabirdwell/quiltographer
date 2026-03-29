'use client';

import React, {
  ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { quiltographerTheme as theme } from '../japanese/theme';
import { FanSegment } from './FanSegment';
import {
  useAnimationStyles,
  useReducedMotion,
  timing,
  easing,
} from '../diagrams/animations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FanRadialProps<T> {
  edge: 'right' | 'bottom' | 'left' | 'top';
  items: T[];
  renderItem: (item: T, isActive: boolean) => ReactNode;
  onSelect: (item: T) => void;
  segmentCount?: number;
  theme?: 'traditional' | 'modern';
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const SEGMENT_ARC_DEG = 14;

function edgeBaseRotation(edge: FanRadialProps<unknown>['edge']): number {
  switch (edge) {
    case 'right':  return -90;
    case 'left':   return 90;
    case 'top':    return 180;
    case 'bottom': return 0;
  }
}

function edgePositionStyle(
  edge: FanRadialProps<unknown>['edge'],
): React.CSSProperties {
  const base: React.CSSProperties = { position: 'fixed', zIndex: 50 };
  switch (edge) {
    case 'right':
      return { ...base, top: '50%', right: 0, transform: 'translateY(-50%)' };
    case 'left':
      return { ...base, top: '50%', left: 0, transform: 'translateY(-50%)' };
    case 'top':
      return { ...base, top: 0, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom':
      return { ...base, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
  }
}

function triggerPositionStyle(
  edge: FanRadialProps<unknown>['edge'],
): React.CSSProperties {
  const base: React.CSSProperties = { position: 'fixed', zIndex: 49 };
  switch (edge) {
    case 'right':
      return { ...base, top: '50%', right: 12, transform: 'translateY(-50%)' };
    case 'left':
      return { ...base, top: '50%', left: 12, transform: 'translateY(-50%)' };
    case 'top':
      return { ...base, top: 12, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom':
      return { ...base, bottom: 12, left: '50%', transform: 'translateX(-50%)' };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FanRadial<T>({
  edge,
  items,
  renderItem,
  onSelect,
  segmentCount = 5,
}: FanRadialProps<T>) {
  useAnimationStyles();
  const reducedMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [unfolded, setUnfolded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const momentumRef = useRef(0);
  const rafRef = useRef(0);
  const scrollAccRef = useRef(0);

  const visibleCount = Math.min(segmentCount, items.length);
  const halfVisible = Math.floor(visibleCount / 2);

  // -----------------------------------------------------------------------
  // Open / close with unfold state
  // -----------------------------------------------------------------------

  const open = useCallback(() => {
    setIsOpen(true);
    // Trigger unfold after a frame so transition activates
    requestAnimationFrame(() => setUnfolded(true));
  }, []);

  const close = useCallback(() => {
    setUnfolded(false);
    momentumRef.current = 0;
    scrollAccRef.current = 0;
    // Wait for fold animation to finish before removing from DOM
    const delay = reducedMotion ? 0 : timing.breathe + visibleCount * 50;
    setTimeout(() => setIsOpen(false), delay);
  }, [reducedMotion, visibleCount]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((prev) =>
        Math.max(0, Math.min(items.length - 1, prev + direction)),
      );
    },
    [items.length],
  );

  const selectCurrent = useCallback(() => {
    if (items[activeIndex]) {
      onSelect(items[activeIndex]);
    }
  }, [activeIndex, items, onSelect]);

  // -----------------------------------------------------------------------
  // Edge swipe detection
  // -----------------------------------------------------------------------

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    }
    function onTouchEnd(e: TouchEvent) {
      if (!touchStartRef.current || isOpen) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const thresh = 60;
      const { x: sx, y: sy } = touchStartRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ez = 40;

      if (edge === 'right'  && sx > w - ez && dx < -thresh && Math.abs(dy) < Math.abs(dx)) open();
      if (edge === 'left'   && sx < ez     && dx > thresh  && Math.abs(dy) < Math.abs(dx)) open();
      if (edge === 'top'    && sy < ez     && dy > thresh  && Math.abs(dx) < Math.abs(dy)) open();
      if (edge === 'bottom' && sy > h - ez && dy < -thresh && Math.abs(dx) < Math.abs(dy)) open();
      touchStartRef.current = null;
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [edge, isOpen, open]);

  // -----------------------------------------------------------------------
  // Pointer drag + momentum within open fan
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (!el) return;

    let lastY = 0;
    let velocity = 0;

    function onDown(e: PointerEvent) {
      momentumRef.current = 0;
      cancelAnimationFrame(rafRef.current);
      lastY = e.clientY;
      velocity = 0;
      el!.setPointerCapture(e.pointerId);
    }

    function onMove(e: PointerEvent) {
      if (!el!.hasPointerCapture(e.pointerId)) return;
      const dy = e.clientY - lastY;
      velocity = dy;
      lastY = e.clientY;
      scrollAccRef.current += dy;
      const step = 40;
      if (Math.abs(scrollAccRef.current) >= step) {
        const steps = Math.trunc(scrollAccRef.current / step);
        setActiveIndex((p) => Math.max(0, Math.min(items.length - 1, p - steps)));
        scrollAccRef.current -= steps * step;
      }
    }

    function onUp(e: PointerEvent) {
      if (el!.hasPointerCapture(e.pointerId)) {
        el!.releasePointerCapture(e.pointerId);
      }
      momentumRef.current = velocity;
      scrollAccRef.current = 0;
      function coast() {
        if (Math.abs(momentumRef.current) < 0.5) return;
        momentumRef.current *= 0.92;
        scrollAccRef.current += momentumRef.current;
        const step = 40;
        if (Math.abs(scrollAccRef.current) >= step) {
          const steps = Math.trunc(scrollAccRef.current / step);
          setActiveIndex((p) => Math.max(0, Math.min(items.length - 1, p - steps)));
          scrollAccRef.current -= steps * step;
        }
        rafRef.current = requestAnimationFrame(coast);
      }
      rafRef.current = requestAnimationFrame(coast);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      scrollAccRef.current += e.deltaY;
      const step = 60;
      if (Math.abs(scrollAccRef.current) >= step) {
        const steps = Math.trunc(scrollAccRef.current / step);
        setActiveIndex((p) => Math.max(0, Math.min(items.length - 1, p + steps)));
        scrollAccRef.current -= steps * step;
      }
    }

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [isOpen, items.length]);

  // -----------------------------------------------------------------------
  // Keyboard
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          navigate(-1);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          navigate(1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          selectCurrent();
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, navigate, selectCurrent, close]);

  // -----------------------------------------------------------------------
  // Click outside to close
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    const timer = setTimeout(
      () => window.addEventListener('mousedown', handleClick),
      100,
    );
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, close]);

  // -----------------------------------------------------------------------
  // Visible segments + boundary detection
  // -----------------------------------------------------------------------

  const visibleSegments: { index: number; offset: number }[] = [];
  for (let off = -halfVisible; off <= halfVisible; off++) {
    const idx = activeIndex + off;
    if (idx >= 0 && idx < items.length) {
      visibleSegments.push({ index: idx, offset: off });
    }
  }

  const atStart = activeIndex === 0;
  const atEnd = activeIndex === items.length - 1;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const baseRotation = edgeBaseRotation(edge);
  const fanRadius = 180;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close pattern fan' : 'Open pattern fan'}
        aria-expanded={isOpen}
        style={{
          ...triggerPositionStyle(edge),
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          border: 'none',
          backgroundColor: isOpen ? theme.colors.persimmon : theme.colors.indigo,
          color: theme.colors.rice,
          cursor: 'pointer',
          transition: `all ${timing.quick}ms ${easing.easeOut}`,
          boxShadow: theme.shadows.lifted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transition: `transform ${timing.quick}ms ${easing.spring}`,
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          ✦
        </span>
      </button>

      {/* Fan overlay */}
      {isOpen && (
        <div
          ref={containerRef}
          role="listbox"
          aria-label="Pattern selection fan"
          tabIndex={0}
          style={{
            ...edgePositionStyle(edge),
            touchAction: 'none',
            outline: 'none',
          }}
        >
          {/* Decorative handle at list boundaries */}
          {(atStart || atEnd) && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                width: 6,
                height: 40,
                borderRadius: 3,
                backgroundColor: theme.colors.bamboo,
                opacity: 0.5,
                ...(edge === 'right'
                  ? { right: 4, top: '50%', transform: 'translateY(-50%)' }
                  : edge === 'left'
                    ? { left: 4, top: '50%', transform: 'translateY(-50%)' }
                    : { top: 4, left: '50%', transform: 'translateX(-50%)' }),
              }}
            />
          )}

          {/* Radial arc of segments */}
          <div
            style={{
              position: 'relative',
              width: fanRadius * 2,
              height: fanRadius * 2,
            }}
          >
            {visibleSegments.map(({ index, offset }, visualIdx) => {
              const isCenter = offset === 0;
              const angleDeg = baseRotation + offset * SEGMENT_ARC_DEG;
              const angleRad = (angleDeg * Math.PI) / 180;

              const cx = fanRadius + Math.cos(angleRad) * fanRadius;
              const cy = fanRadius + Math.sin(angleRad) * fanRadius;

              // Rubber-band: shrink edge segments at list boundaries
              const rubberBand =
                (atStart && offset < 0) || (atEnd && offset > 0) ? 0.85 : 1;
              const segmentScale = isCenter ? 1.1 : 0.9 * rubberBand;
              const segmentOpacity = isCenter ? 1 : 1 - Math.abs(offset) * 0.12;

              // Staggered unfold delay (center segment first, edges later)
              const staggerMs = Math.abs(offset) * 50;

              // Unfold: segments start collapsed at center, fan out to position
              const collapsed = !unfolded;
              const collapsedScale = 0.3;
              const finalScale = segmentScale;
              const currentScale = collapsed ? collapsedScale : finalScale;
              const currentOpacity = collapsed ? 0 : segmentOpacity;

              return (
                <div
                  key={index}
                  role="option"
                  aria-selected={isCenter}
                  style={{
                    position: 'absolute',
                    left: cx,
                    top: cy,
                    transform: `translate(-50%, -50%) scale(${currentScale}) rotate(${angleDeg + 90}deg)`,
                    opacity: currentOpacity,
                    transition: reducedMotion
                      ? `all ${timing.instant}ms ${easing.easeOut}`
                      : `transform ${timing.breathe}ms ${easing.spring} ${staggerMs}ms, opacity ${timing.quick}ms ${easing.easeOut} ${staggerMs}ms`,
                    zIndex: isCenter ? 10 : 5 - Math.abs(offset),
                    willChange: 'transform, opacity',
                  }}
                >
                  <FanSegment
                    isActive={isCenter}
                    onClick={() => {
                      if (isCenter) {
                        onSelect(items[index]);
                      } else {
                        setActiveIndex(index);
                      }
                    }}
                    size={isCenter ? 'lg' : 'md'}
                  >
                    {renderItem(items[index], isCenter)}
                  </FanSegment>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default FanRadial;
