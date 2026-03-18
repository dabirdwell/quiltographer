import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * FontSizeControl — Accessibility text size selector.
 *
 * Three sizes: normal, large, xlarge.
 * Used in the step reader for on-the-fly font adjustment.
 */

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

interface FontSizeControlProps {
  value: FontSizeOption;
  onChange: (size: FontSizeOption) => void;
  className?: string;
}

const options: { size: FontSizeOption; label: string; fontSize: string }[] = [
  { size: 'normal', label: 'A', fontSize: 'text-xs' },
  { size: 'large',  label: 'A', fontSize: 'text-base' },
  { size: 'xlarge', label: 'A', fontSize: 'text-xl' },
];

/** Maps FontSizeOption to Tailwind text class for content */
export const fontSizeClasses: Record<FontSizeOption, string> = {
  normal: 'text-lg',
  large: 'text-2xl',
  xlarge: 'text-3xl',
};

export function FontSizeControl({ value, onChange, className }: FontSizeControlProps) {
  return (
    <div className={twMerge('flex gap-1', className)}>
      {options.map(({ size, label, fontSize }) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={twMerge(
            'w-8 h-8 rounded-sm border font-semibold transition-all duration-quick',
            fontSize,
            value === size
              ? 'border-2 border-persimmon bg-orange-50'
              : 'border-black/10 bg-rice hover:bg-washi-dark',
          )}
          aria-label={`${size} text size`}
          aria-pressed={value === size}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default FontSizeControl;
