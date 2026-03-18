import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Badge — Small labels for techniques, counts, and status.
 *
 * Replaces technique pills and step counter styling.
 */

type BadgeVariant = 'default' | 'active' | 'success' | 'warning';
type BadgeColor = 'indigo' | 'persimmon' | 'sage' | 'clay';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
  onClick?: () => void;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  color = 'indigo',
  onClick,
  className,
}: BadgeProps) {
  const Tag = onClick ? 'button' : 'span';
  const isActive = variant === 'active';

  const colorStyles = {
    indigo:    { active: 'bg-indigo text-rice',    default: 'bg-washi-dark text-indigo' },
    persimmon: { active: 'bg-persimmon text-rice',  default: 'bg-washi-dark text-persimmon' },
    sage:      { active: 'bg-sage text-rice',       default: 'bg-sage/10 text-sage' },
    clay:      { active: 'bg-clay text-rice',       default: 'bg-washi-dark text-clay' },
  };

  const classes = twMerge(
    'inline-flex items-center px-3 py-1',
    'rounded-full text-sm font-body',
    'transition-all duration-quick',
    isActive ? colorStyles[color].active : colorStyles[color].default,
    onClick && 'cursor-pointer border-none hover:opacity-80',
    className,
  );

  return (
    <Tag className={classes} onClick={onClick}>
      {children}
    </Tag>
  );
}

export default Badge;
