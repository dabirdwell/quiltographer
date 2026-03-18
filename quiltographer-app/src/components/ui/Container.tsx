import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Container — Centered max-width wrapper.
 *
 * Replaces: style={{ maxWidth: '800px', margin: '0 auto' }}
 * With:     <Container size="md">
 */

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';

interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  padding?: boolean;
  className?: string;
  as?: 'div' | 'main' | 'section';
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-lg',     // 512px — upload forms
  md: 'max-w-3xl',    // 768px — step content
  lg: 'max-w-5xl',    // 1024px — reading layout
  xl: 'max-w-7xl',    // 1280px — full width
};

export function Container({
  children,
  size = 'lg',
  padding = true,
  className,
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag
      className={twMerge(
        'mx-auto w-full',
        sizeClasses[size],
        padding && 'px-4 sm:px-breathe',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default Container;
