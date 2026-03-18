import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Button — Action primitive for the Quiltographer design system.
 *
 * Four variants matching the patterns found in the codebase:
 * - primary: Filled background (indigo). "Explain this" button.
 * - outline: Border + transparent. "Simplify", "What tools?" buttons.
 * - ghost: Minimal, subtle border. "← New Pattern" button.
 * - pill: Small, rounded-full. Technique tags.
 *
 * Replaces ~15 lines of inline styles per button instance.
 */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'pill';
type ButtonColor = 'indigo' | 'persimmon' | 'sage' | 'clay' | 'silk';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: 'sm' | 'md';
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  onClick?: () => void;
  className?: string;
  title?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
}

const colorMap = {
  indigo:    { bg: 'bg-indigo',    border: 'border-indigo',    text: 'text-indigo',    activeBg: 'bg-indigo',    activeText: 'text-rice' },
  persimmon: { bg: 'bg-persimmon', border: 'border-persimmon', text: 'text-persimmon', activeBg: 'bg-persimmon', activeText: 'text-rice' },
  sage:      { bg: 'bg-sage',      border: 'border-sage',      text: 'text-sage',      activeBg: 'bg-sage',      activeText: 'text-rice' },
  clay:      { bg: 'bg-clay',      border: 'border-clay',      text: 'text-clay',      activeBg: 'bg-clay',      activeText: 'text-rice' },
  silk:      { bg: 'bg-silk',      border: 'border-silk',      text: 'text-silk',      activeBg: 'bg-silk',      activeText: 'text-rice' },
};

export function Button({
  children,
  variant = 'primary',
  color = 'indigo',
  size = 'md',
  active = false,
  loading = false,
  disabled = false,
  icon,
  onClick,
  className,
  title,
  ...ariaProps
}: ButtonProps) {
  const c = colorMap[color];
  const isDisabled = disabled || loading;

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1 text-sm'
    : 'px-4 py-2 text-sm';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: twMerge(
      active ? `${c.activeBg} ${c.activeText}` : `${c.bg} text-rice`,
      'border-none',
    ),
    outline: twMerge(
      'border',
      active
        ? `${c.activeBg} ${c.activeText} ${c.border}`
        : `bg-transparent ${c.text} ${c.border}`,
    ),
    ghost: twMerge(
      'bg-transparent border border-black/10',
      c.text,
    ),
    pill: twMerge(
      'rounded-full border-none',
      active
        ? `${c.activeBg} ${c.activeText}`
        : `bg-washi-dark ${c.text}`,
    ),
  };

  const classes = twMerge(
    'inline-flex items-center gap-2',
    'font-body font-medium',
    'cursor-pointer transition-all duration-quick',
    sizeClasses,
    variant !== 'pill' ? 'rounded-md' : '',
    variantClasses[variant],
    isDisabled && 'opacity-60 cursor-default',
    className,
  );

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      {...ariaProps}
    >
      {loading ? '⟳' : icon}{icon || loading ? ' ' : ''}{children}
    </button>
  );
}

export default Button;
