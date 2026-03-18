import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Text — Typography primitive for the Quiltographer design system.
 *
 * Replaces manual theme lookups like:
 *   style={{ fontSize: theme.typography.fontSize.lg, fontFamily: theme.typography.fontFamily.body, color: theme.colors.inkBlack }}
 *
 * With:
 *   <Text>Your content</Text>
 *   <Text variant="heading" size="2xl">Step Title</Text>
 *   <Text variant="label">STEP 3 OF 8</Text>
 */

type TextVariant = 'body' | 'heading' | 'label' | 'caption';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type TextColor = 'default' | 'muted' | 'faint' | 'indigo' | 'persimmon' | 'sage' | 'clay' | 'silk' | 'inherit';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  size?: TextSize;
  color?: TextColor;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  leading?: 'tight' | 'normal' | 'relaxed' | 'loose';
  align?: 'left' | 'center' | 'right';
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'label';
  className?: string;
  style?: React.CSSProperties;
}

const variantDefaults: Record<TextVariant, { font: string; size: string; color: string; leading: string; weight: string }> = {
  body: {
    font: 'font-body',
    size: 'text-base',
    color: 'text-ink-black',
    leading: 'leading-relaxed',
    weight: 'font-normal',
  },
  heading: {
    font: 'font-display',
    size: 'text-2xl',
    color: 'text-indigo',
    leading: 'leading-tight',
    weight: 'font-medium',
  },
  label: {
    font: 'font-body',
    size: 'text-sm',
    color: 'text-ink-gray',
    leading: 'leading-normal',
    weight: 'font-normal',
  },
  caption: {
    font: 'font-body',
    size: 'text-xs',
    color: 'text-ink-light',
    leading: 'leading-normal',
    weight: 'font-normal',
  },
};

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs', sm: 'text-sm', base: 'text-base', lg: 'text-lg',
  xl: 'text-xl', '2xl': 'text-2xl', '3xl': 'text-3xl', '4xl': 'text-4xl',
};

const colorClasses: Record<TextColor, string> = {
  default: 'text-ink-black',
  muted: 'text-ink-gray',
  faint: 'text-ink-light',
  indigo: 'text-indigo',
  persimmon: 'text-persimmon',
  sage: 'text-sage',
  clay: 'text-clay',
  silk: 'text-silk',
  inherit: 'text-inherit',
};

const weightClasses: Record<string, string> = {
  normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold',
};

const leadingClasses: Record<string, string> = {
  tight: 'leading-tight', normal: 'leading-normal', relaxed: 'leading-relaxed', loose: 'leading-loose',
};

const alignClasses: Record<string, string> = {
  left: 'text-left', center: 'text-center', right: 'text-right',
};

const defaultTags: Record<TextVariant, TextProps['as']> = {
  heading: 'h2', body: 'p', label: 'span', caption: 'span',
};

export function Text({
  children,
  variant = 'body',
  size,
  color,
  weight,
  leading,
  align,
  as,
  className,
  style,
}: TextProps) {
  const defaults = variantDefaults[variant];
  const Tag = as || defaultTags[variant] || 'span';

  const classes = twMerge(
    defaults.font,
    size ? sizeClasses[size] : defaults.size,
    color ? colorClasses[color] : defaults.color,
    weight ? weightClasses[weight] : defaults.weight,
    leading ? leadingClasses[leading] : defaults.leading,
    align && alignClasses[align],
    variant === 'label' && 'uppercase tracking-wider',
    'm-0',
    className,
  );

  return <Tag className={classes} style={style}>{children}</Tag>;
}

export default Text;
