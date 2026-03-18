import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * ProgressBar — Animated progress indicator.
 *
 * Replaces the inline progress bar in the processing view.
 */

interface ProgressBarProps {
  value: number;          // 0-100
  color?: 'indigo' | 'persimmon' | 'sage';
  size?: 'sm' | 'md';
  className?: string;
}

const colorClasses = {
  indigo: 'bg-indigo',
  persimmon: 'bg-persimmon',
  sage: 'bg-sage',
};

export function ProgressBar({
  value,
  color = 'indigo',
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={twMerge(
        'w-full bg-washi rounded-full overflow-hidden',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={twMerge(
          'h-full rounded-full transition-all duration-breathe ease-out',
          colorClasses[color],
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default ProgressBar;
