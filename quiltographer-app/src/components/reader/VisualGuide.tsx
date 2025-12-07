'use client';

import React from 'react';
import { quiltographerTheme } from '../japanese/theme';

interface VisualGuideProps {
  type: 'seam' | 'cut' | 'press' | 'rotate' | 'technique';
  technique?: string;
  description?: string;
}

/**
 * VisualGuide - SVG diagrams for common quilting operations
 * 
 * Provides clear visual representations of quilting techniques
 * to supplement text instructions.
 */
export function VisualGuide({ type, technique, description }: VisualGuideProps) {
  const renderDiagram = () => {
    switch (type) {
      case 'seam':
        return <SeamDiagram />;
      case 'cut':
        return <CutDiagram />;
      case 'press':
        return <PressDiagram />;
      case 'rotate':
        return <RotateDiagram />;
      case 'technique':
        return <TechniqueDiagram technique={technique} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: quiltographerTheme.colors.rice,
      borderRadius: quiltographerTheme.radius.md,
      padding: '1rem',
      border: quiltographerTheme.borders.subtle,
      marginTop: '1rem',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {renderDiagram()}
        {description && (
          <p style={{
            fontSize: quiltographerTheme.typography.fontSize.sm,
            color: quiltographerTheme.colors.inkGray,
            fontStyle: 'italic',
            textAlign: 'center',
            margin: 0,
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// Quarter-inch seam allowance diagram
function SeamDiagram() {
  return (
    <svg width="200" height="100" viewBox="0 0 200 100">
      <rect x="10" y="20" width="80" height="60" fill={quiltographerTheme.colors.sage} opacity="0.5" />
      <rect x="110" y="20" width="80" height="60" fill={quiltographerTheme.colors.persimmon} opacity="0.5" />
      <line x1="90" y1="20" x2="110" y2="20" stroke={quiltographerTheme.colors.indigo} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="90" y1="80" x2="110" y2="80" stroke={quiltographerTheme.colors.indigo} strokeWidth="2" strokeDasharray="5,5" />
      <text x="100" y="95" textAnchor="middle" fontSize="12" fill={quiltographerTheme.colors.inkGray}>
        ¼" seam
      </text>
    </svg>
  );
}

// Cutting line diagram
function CutDiagram() {
  return (
    <svg width="200" height="100" viewBox="0 0 200 100">
      <rect x="20" y="20" width="160" height="60" fill={quiltographerTheme.colors.clay} opacity="0.3" />
      <line x1="20" y1="50" x2="180" y2="50" stroke={quiltographerTheme.colors.sumi} strokeWidth="2" strokeDasharray="10,5" />
      <path d="M 10 50 L 20 45 L 20 55 Z" fill={quiltographerTheme.colors.sumi} />
      <text x="100" y="95" textAnchor="middle" fontSize="12" fill={quiltographerTheme.colors.inkGray}>
        Cut along dashed line
      </text>
    </svg>
  );
}

// Pressing direction diagram
function PressDiagram() {
  return (
    <svg width="200" height="100" viewBox="0 0 200 100">
      <rect x="50" y="20" width="100" height="40" fill={quiltographerTheme.colors.indigo} opacity="0.3" />
      <rect x="50" y="60" width="100" height="20" fill={quiltographerTheme.colors.sumi} opacity="0.5" />
      <path d="M 100 40 L 90 30 L 90 35 L 80 35 L 80 45 L 90 45 L 90 50 Z" fill={quiltographerTheme.colors.persimmon} />
      <text x="100" y="95" textAnchor="middle" fontSize="12" fill={quiltographerTheme.colors.inkGray}>
        Press toward dark fabric
      </text>
    </svg>
  );
}

// Rotation diagram
function RotateDiagram() {
  return (
    <svg width="200" height="100" viewBox="0 0 200 100">
      <g transform="translate(100, 50)">
        <rect x="-30" y="-30" width="60" height="60" fill={quiltographerTheme.colors.sage} opacity="0.5" />
        <path d="M 30 0 A 30 30 0 0 1 0 30" 
          stroke={quiltographerTheme.colors.persimmon} 
          strokeWidth="3" 
          fill="none" 
          markerEnd="url(#arrowhead)" />
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={quiltographerTheme.colors.persimmon} />
          </marker>
        </defs>
        <text x="0" y="-40" textAnchor="middle" fontSize="12" fill={quiltographerTheme.colors.inkGray}>
          90° clockwise
        </text>
      </g>
    </svg>
  );
}

// Technique-specific diagrams
function TechniqueDiagram({ technique }: { technique?: string }) {
  if (technique === 'RST' || technique === 'Right Sides Together') {
    return (
      <svg width="200" height="100" viewBox="0 0 200 100">
        <rect x="40" y="30" width="60" height="40" fill={quiltographerTheme.colors.persimmon} />
        <text x="70" y="55" textAnchor="middle" fontSize="10" fill="white">Front</text>
        
        <rect x="100" y="30" width="60" height="40" fill={quiltographerTheme.colors.persimmon} opacity="0.3" />
        <text x="130" y="55" textAnchor="middle" fontSize="10" fill={quiltographerTheme.colors.sumi}>Back</text>
        
        <path d="M 85 20 Q 100 10 115 20" stroke={quiltographerTheme.colors.indigo} strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
        <text x="100" y="85" textAnchor="middle" fontSize="12" fill={quiltographerTheme.colors.inkGray}>
          Right sides facing
        </text>
      </svg>
    );
  }
  
  if (technique === 'HST' || technique === 'Half Square Triangle') {
    return (
      <svg width="200" height="100" viewBox="0 0 200 100">
        <rect x="30" y="20" width="60" height="60" fill={quiltographerTheme.colors.sage} opacity="0.5" />
        <line x1="30" y1="20" x2="90" y2="80" stroke={quiltographerTheme.colors.sumi} strokeWidth="2" strokeDasharray="5,3" />
        
        <g transform="translate(110, 0)">
          <polygon points="0,20 60,20 60,80" fill={quiltographerTheme.colors.sage} opacity="0.5" />
          <polygon points="0,20 0,80 60,80" fill={quiltographerTheme.colors.persimmon} opacity="0.5" />
        </g>
        
        <text x="100" y="95" textAnchor="middle" fontSize="12" fill={quiltographerTheme.colors.inkGray}>
          Cut diagonally → Two HSTs
        </text>
      </svg>
    );
  }
  
  return null;
}

export default VisualGuide;
