'use client';

import React from 'react';

/**
 * FabricPatterns - SVG pattern definitions for fabric textures
 * 
 * Provides subtle fabric weave textures that make flat colors
 * feel like real fabric. Include in SVG <defs> section.
 */

interface FabricPatternsProps {
  lightColor?: string;
  darkColor?: string;
  accentColor?: string;
  prefix?: string; // For unique IDs when multiple diagrams on page
}

export function FabricPatterns({
  lightColor = '#f5f0e6',
  darkColor = '#264653',
  accentColor = '#e9c46a',
  prefix = '',
}: FabricPatternsProps) {
  const id = (name: string) => prefix ? `${prefix}-${name}` : name;

  return (
    <>
      {/* Light fabric with subtle weave */}
      <pattern 
        id={id('fabricLight')} 
        patternUnits="userSpaceOnUse" 
        width="6" 
        height="6"
      >
        <rect width="6" height="6" fill={lightColor}/>
        <path 
          d="M0 3 L6 3 M3 0 L3 6" 
          stroke="rgba(0,0,0,0.04)" 
          strokeWidth="0.5"
        />
      </pattern>
      
      {/* Dark fabric with subtle weave */}
      <pattern 
        id={id('fabricDark')} 
        patternUnits="userSpaceOnUse" 
        width="6" 
        height="6"
      >
        <rect width="6" height="6" fill={darkColor}/>
        <path 
          d="M0 3 L6 3 M3 0 L3 6" 
          stroke="rgba(255,255,255,0.06)" 
          strokeWidth="0.5"
        />
      </pattern>

      {/* Accent fabric */}
      <pattern 
        id={id('fabricAccent')} 
        patternUnits="userSpaceOnUse" 
        width="6" 
        height="6"
      >
        <rect width="6" height="6" fill={accentColor}/>
        <path 
          d="M0 3 L6 3 M3 0 L3 6" 
          stroke="rgba(0,0,0,0.05)" 
          strokeWidth="0.5"
        />
      </pattern>

      {/* Sashiko-inspired stitch pattern */}
      <pattern 
        id={id('sashikoStitch')} 
        patternUnits="userSpaceOnUse" 
        width="10" 
        height="3" 
        patternTransform="rotate(45)"
      >
        <line 
          x1="0" 
          y1="1.5" 
          x2="6" 
          y2="1.5" 
          stroke="#e76f51" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </pattern>

      {/* Running stitch for seam lines */}
      <pattern 
        id={id('runningStitch')} 
        patternUnits="userSpaceOnUse" 
        width="8" 
        height="2"
      >
        <line 
          x1="0" 
          y1="1" 
          x2="5" 
          y2="1" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </pattern>

      {/* Seam allowance marker pattern */}
      <pattern 
        id={id('seamAllowance')} 
        patternUnits="userSpaceOnUse" 
        width="4" 
        height="4"
      >
        <circle 
          cx="2" 
          cy="2" 
          r="0.5" 
          fill="rgba(231, 111, 81, 0.4)"
        />
      </pattern>

      {/* Grain line indicator */}
      <pattern 
        id={id('grainLine')} 
        patternUnits="userSpaceOnUse" 
        width="20" 
        height="4"
      >
        <line 
          x1="0" 
          y1="2" 
          x2="15" 
          y2="2" 
          stroke="#666" 
          strokeWidth="0.75" 
          strokeLinecap="round"
        />
        <polygon 
          points="15,0 20,2 15,4" 
          fill="#666"
        />
      </pattern>
    </>
  );
}

/**
 * Create a dynamic fabric pattern with any color
 */
export function createFabricPatternDef(
  id: string,
  color: string,
  weaveOpacity: number = 0.05
): React.ReactNode {
  const isLight = isLightColor(color);
  const weaveColor = isLight ? 'rgba(0,0,0,' : 'rgba(255,255,255,';
  
  return (
    <pattern 
      id={id} 
      patternUnits="userSpaceOnUse" 
      width="6" 
      height="6"
    >
      <rect width="6" height="6" fill={color}/>
      <path 
        d="M0 3 L6 3 M3 0 L3 6" 
        stroke={`${weaveColor}${weaveOpacity})`}
        strokeWidth="0.5"
      />
    </pattern>
  );
}

// Helper to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // Luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }
  // Default to light for unknown formats
  return true;
}

/**
 * SVG filters for fabric effects
 */
export function FabricFilters({ prefix = '' }: { prefix?: string }) {
  const id = (name: string) => prefix ? `${prefix}-${name}` : name;

  return (
    <>
      {/* Soft shadow for depth */}
      <filter id={id('inkShadow')} x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow 
          dx="1" 
          dy="1" 
          stdDeviation="1.5" 
          floodColor="#1a1a1a" 
          floodOpacity="0.12"
        />
      </filter>

      {/* Lifted shadow for hover states */}
      <filter id={id('liftedShadow')} x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow 
          dx="2" 
          dy="3" 
          stdDeviation="3" 
          floodColor="#1a1a1a" 
          floodOpacity="0.15"
        />
      </filter>

      {/* Paper texture overlay */}
      <filter id={id('paperTexture')}>
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.9" 
          numOctaves="4" 
          result="noise"
        />
        <feComposite 
          in="SourceGraphic" 
          in2="noise" 
          operator="arithmetic" 
          k1="0" 
          k2="1" 
          k3="0.08" 
          k4="0"
        />
      </filter>

      {/* Ink spread effect for text */}
      <filter id={id('inkSpread')} x="-5%" y="-5%" width="110%" height="110%">
        <feMorphology operator="dilate" radius="0.3"/>
        <feGaussianBlur stdDeviation="0.2"/>
      </filter>
    </>
  );
}

export default FabricPatterns;
