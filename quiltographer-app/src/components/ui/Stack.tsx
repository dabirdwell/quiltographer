import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Stack — Flex layout primitive.
 *
 * Replaces: style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.breathe }}
 * With:     <Stack gap="breathe">
 */

type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'breathe' | 'rest' | 'meditate';

interface StackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  gap?: StackGap;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav';
  className?: string;
  style?: React.CSSProperties;
}

const gapClasses: Record<StackGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  breathe: 'gap-breathe',
  rest: 'gap-rest',
  meditate: 'gap-meditate',
};

const alignClasses: Record<string, string> = {
  start: 'items-start', center: 'items-center', end: 'items-end',
  stretch: 'items-stretch', baseline: 'items-baseline',
};

const justifyClasses: Record<string, string> = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around',
};

export function Stack({
  children,
  direction = 'vertical',
  gap = 'md',
  align,
  justify,
  wrap = false,
  as: Tag = 'div',
  className,
  style,
}: StackProps) {
  const classes = twMerge(
    'flex',
    direction === 'vertical' ? 'flex-col' : 'flex-row',
    gapClasses[gap],
    align && alignClasses[align],
    justify && justifyClasses[justify],
    wrap && 'flex-wrap',
    className,
  );

  return <Tag className={classes} style={style}>{children}</Tag>;
}

export default Stack;
