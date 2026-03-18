'use client';

import React from 'react';
import { breathGlowStyle } from '../animations';

/**
 * InkStamp - Hanko-style signature stamp for diagrams
 * 
 * Inspired by Japanese hanko (personal seals).
 * Identifies the technique and adds authentic craft feel.
 */

interface InkStampProps {
  label: string;
  x?: number;
  y?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  glowOnHover?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 36, height: 16, fontSize: 9, rx: 2 },
  md: { width: 44, height: 20, fontSize: 11, rx: 2 },
  lg: { width: 56, height: 24, fontSize: 13, rx: 3 },
};

export function InkStamp({
  label,
  x = 0,
  y = 0,
  size = 'md',
  color = '#8b4513',
  glowOnHover = true,
  className = '',
}: InkStampProps) {
  const dimensions = sizeMap[size];
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <g 
      transform={`translate(${x}, ${y})`}
      className={`ink-stamp ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'default',
        ...(isHovered && glowOnHover ? breathGlowStyle({ color: 'persimmon' }) : {}),
      }}
    >
      {/* Outer border - slightly rough like a real stamp */}
      <rect 
        x={-dimensions.width / 2} 
        y={-dimensions.height / 2} 
        width={dimensions.width} 
        height={dimensions.height} 
        fill="none" 
        stroke={color} 
        strokeWidth="1" 
        rx={dimensions.rx}
        opacity="0.6"
        style={{
          transition: 'opacity 200ms ease-out',
          ...(isHovered ? { opacity: 0.9 } : {}),
        }}
      />
      
      {/* Inner border for depth */}
      <rect 
        x={-dimensions.width / 2 + 2} 
        y={-dimensions.height / 2 + 2} 
        width={dimensions.width - 4} 
        height={dimensions.height - 4} 
        fill="none" 
        stroke={color} 
        strokeWidth="0.5" 
        rx={dimensions.rx - 1}
        opacity="0.3"
      />
      
      {/* Label text */}
      <text 
        x="0" 
        y={dimensions.fontSize * 0.35}
        textAnchor="middle" 
        fontSize={dimensions.fontSize} 
        fill={color} 
        fontFamily="Georgia, 'Noto Serif JP', serif" 
        fontWeight="600"
        style={{
          transition: 'fill 200ms ease-out',
          ...(isHovered ? { fill: '#e76f51' } : {}),
        }}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * InkStampHTML - Non-SVG version for use outside SVG contexts
 */
interface InkStampHTMLProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function InkStampHTML({
  label,
  size = 'md',
  color = '#8b4513',
  className = '',
  style = {},
}: InkStampHTMLProps) {
  const dimensions = sizeMap[size];

  return (
    <div
      className={`ink-stamp-html ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimensions.width,
        height: dimensions.height,
        border: `1px solid ${color}`,
        borderRadius: dimensions.rx,
        opacity: 0.7,
        fontFamily: 'Georgia, "Noto Serif JP", serif',
        fontSize: dimensions.fontSize,
        fontWeight: 600,
        color: color,
        transition: 'all 200ms ease-out',
        ...style,
      }}
    >
      {label}
    </div>
  );
}

export default InkStamp;
