'use client';

import React from 'react';

/**
 * CornerMarks - Registration marks for diagram corners
 * 
 * Inspired by printing registration marks and Japanese craftsmanship.
 * Provides visual anchoring and professional aesthetic.
 */

interface CornerMarksProps {
  color?: string;
  opacity?: number;
  size?: number;
  inset?: number;
}

export function CornerMarks({
  color = '#8b4513',
  opacity = 0.3,
  size = 16,
  inset = 8,
}: CornerMarksProps) {
  const markStyle: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
  };

  return (
    <>
      {/* Top left */}
      <svg 
        style={{ ...markStyle, top: inset, left: inset }} 
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path 
          d="M0 6 L0 0 L6 0" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5" 
          opacity={opacity}
        />
      </svg>
      
      {/* Top right */}
      <svg 
        style={{ ...markStyle, top: inset, right: inset }} 
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path 
          d="M10 0 L16 0 L16 6" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5" 
          opacity={opacity}
        />
      </svg>
      
      {/* Bottom left */}
      <svg 
        style={{ ...markStyle, bottom: inset, left: inset }} 
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path 
          d="M0 10 L0 16 L6 16" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5" 
          opacity={opacity}
        />
      </svg>
      
      {/* Bottom right */}
      <svg 
        style={{ ...markStyle, bottom: inset, right: inset }} 
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path 
          d="M10 16 L16 16 L16 10" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5" 
          opacity={opacity}
        />
      </svg>
    </>
  );
}

export default CornerMarks;
