'use client';

import React from 'react';
import { quiltographerTheme } from './theme';

interface WashiSurfaceProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'rice';
  className?: string;
  elevated?: boolean;
  style?: React.CSSProperties;
}

/**
 * WashiSurface - Paper-textured background component
 * 
 * Provides the signature washi paper aesthetic with subtle fiber texture.
 * Use as a container for content that needs the Japanese paper feel.
 */
export function WashiSurface({
  children,
  variant = 'light',
  className = '',
  elevated = false,
  style = {},
}: WashiSurfaceProps) {
  const bgColor = {
    light: quiltographerTheme.colors.washi,
    dark: quiltographerTheme.colors.washiDark,
    rice: quiltographerTheme.colors.rice,
  }[variant];

  return (
    <div
      className={`washi-surface ${className}`}
      style={{
        backgroundColor: bgColor,
        backgroundImage: quiltographerTheme.textures.washiFiber,
        boxShadow: elevated ? quiltographerTheme.shadows.soft : 'none',
        position: 'relative',
        ...style,
      }}
    >
      {/* Subtle paper grain overlay */}
      <div 
        className="washi-grain"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: quiltographerTheme.textures.paperGrain,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />
      {/* Content */}
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

export default WashiSurface;
