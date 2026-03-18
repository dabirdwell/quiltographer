import React from 'react';
import { twMerge } from 'tailwind-merge';
import { quiltographerTheme } from '../japanese/theme';

/**
 * Surface — Container with washi paper texture and elevation.
 *
 * Evolves WashiSurface into a general-purpose container primitive.
 * Keeps the Japanese paper aesthetic while adding layout control.
 *
 * Replaces patterns like:
 *   <WashiSurface variant="rice" elevated>
 *     <div style={{ padding: '1rem 1.5rem' }}>...
 *
 * With:
 *   <Surface variant="rice" elevated padding="md">
 */

type SurfaceVariant = 'washi' | 'washi-dark' | 'rice' | 'transparent';
type SurfacePadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface SurfaceProps {
  children: React.ReactNode;
  variant?: SurfaceVariant;
  elevated?: boolean;
  padding?: SurfacePadding;
  rounded?: boolean;
  border?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'section' | 'article' | 'aside';
}

const bgColors: Record<SurfaceVariant, string> = {
  washi: quiltographerTheme.colors.washi,
  'washi-dark': quiltographerTheme.colors.washiDark,
  rice: quiltographerTheme.colors.rice,
  transparent: 'transparent',
};

const paddingClasses: Record<SurfacePadding, string> = {
  none: '', sm: 'p-3', md: 'p-4 sm:p-6', lg: 'p-6 sm:p-8', xl: 'p-8 sm:p-12',
};

export function Surface({
  children,
  variant = 'washi',
  elevated = false,
  padding = 'none',
  rounded = false,
  border = false,
  className,
  style,
  as: Tag = 'div',
}: SurfaceProps) {
  const classes = twMerge(
    'relative',
    paddingClasses[padding],
    elevated && 'shadow-soft',
    rounded && 'rounded-lg',
    border && 'border border-black/10',
    className,
  );

  return (
    <Tag
      className={classes}
      style={{
        backgroundColor: bgColors[variant],
        backgroundImage: variant !== 'transparent' ? quiltographerTheme.textures.washiFiber : undefined,
        ...style,
      }}
    >
      {/* Paper grain overlay */}
      {variant !== 'transparent' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: quiltographerTheme.textures.paperGrain,
            opacity: 0.5,
          }}
          aria-hidden
        />
      )}
      <div className="relative">{children}</div>
    </Tag>
  );
}

export default Surface;
