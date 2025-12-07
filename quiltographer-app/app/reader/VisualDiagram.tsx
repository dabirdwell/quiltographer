'use client';

import React from 'react';
import { quiltographerTheme } from '@/components/japanese';

interface VisualDiagramProps {
  techniques: string[];
  instruction: string;
  step: number;
}

const theme = quiltographerTheme;

// Derive diagram colors from theme - muted and soft
const colors = {
  light: theme.colors.washi,           // Soft cream fabric
  dark: theme.colors.bamboo,           // Warm brown
  medium: theme.colors.washiDark,      // Subtle tan
  accent: theme.colors.persimmon,      // Soft accent (muted)
  gray: theme.colors.inkGray,          // Muted gray for text
  line: theme.colors.bamboo,           // Warm line color
};

export function VisualDiagram({ techniques, instruction, step }: VisualDiagramProps) {
  const getDiagramType = (): string | null => {
    const lowerInstruction = instruction.toLowerCase();
    const techString = techniques.join(' ').toLowerCase();

    if (lowerInstruction.includes('cut') || techString.includes('cutting')) {
      return 'cutting';
    }
    if (techString.includes('rst') || lowerInstruction.includes('right sides together')) {
      return 'rst';
    }
    if (techString.includes('hst') || lowerInstruction.includes('half square triangle')) {
      return 'hst';
    }
    if (lowerInstruction.includes('sew') || lowerInstruction.includes('seam')) {
      return 'sewing';
    }
    if (lowerInstruction.includes('press')) {
      return 'pressing';
    }
    if (techString.includes('chain')) {
      return 'chain';
    }

    return null;
  };

  const renderDiagram = (type: string) => {
    switch (type) {
      case 'cutting':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            <rect x="40" y="20" width="120" height="80"
              fill={colors.light} stroke={colors.dark} strokeWidth="1.5" />
            <line x1="40" y1="60" x2="160" y2="60"
              stroke={colors.accent} strokeWidth="1.5" strokeDasharray="5,3" />
            <path d="M 170 55 L 175 60 L 170 65 M 175 60 L 165 60"
              stroke={colors.gray} strokeWidth="1.5" fill="none" />
            <text x="100" y="40" textAnchor="middle" fontSize="11" fill={colors.dark}>2½"</text>
            <text x="100" y="110" textAnchor="middle" fontSize="9" fill={colors.gray}>
              Cut along dashed line
            </text>
          </svg>
        );

      case 'rst':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            <rect x="30" y="30" width="60" height="60"
              fill={colors.dark} stroke={colors.line} strokeWidth="1.5" />
            <text x="60" y="65" textAnchor="middle" fontSize="9" fill={colors.light}>
              RIGHT
            </text>
            <rect x="110" y="30" width="60" height="60"
              fill={colors.light} stroke={colors.line} strokeWidth="1.5" />
            <text x="140" y="65" textAnchor="middle" fontSize="9" fill={colors.dark}>
              RIGHT
            </text>
            <path d="M 90 60 L 110 60 M 105 55 L 110 60 L 105 65"
              stroke={colors.accent} strokeWidth="1.5" fill="none" />
            <text x="100" y="105" textAnchor="middle" fontSize="9" fill={colors.gray}>
              Place right sides facing
            </text>
          </svg>
        );

      case 'hst':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Original square */}
            <rect x="20" y="30" width="60" height="60"
              fill={colors.light} stroke={colors.line} strokeWidth="1.5" />
            <line x1="20" y1="30" x2="80" y2="90"
              stroke={colors.dark} strokeWidth="1.5" strokeDasharray="3,2" />
            <path d="M 20 30 L 80 30 L 80 90 Z"
              fill={colors.dark} opacity="0.7" />

            {/* Arrow */}
            <path d="M 90 60 L 110 60 M 105 55 L 110 60 L 105 65"
              stroke={colors.accent} strokeWidth="1.5" fill="none" />

            {/* Result HST units */}
            <g transform="translate(120, 20)">
              <path d="M 0 20 L 30 20 L 30 50 Z"
                fill={colors.dark} stroke={colors.line} strokeWidth="1.5" />
              <path d="M 0 20 L 0 50 L 30 50 Z"
                fill={colors.light} stroke={colors.line} strokeWidth="1.5" />
            </g>
            <g transform="translate(160, 20)">
              <path d="M 0 20 L 30 20 L 30 50 Z"
                fill={colors.dark} stroke={colors.line} strokeWidth="1.5" />
              <path d="M 0 20 L 0 50 L 30 50 Z"
                fill={colors.light} stroke={colors.line} strokeWidth="1.5" />
            </g>

            <text x="100" y="105" textAnchor="middle" fontSize="9" fill={colors.gray}>
              Half Square Triangle (2 units)
            </text>
          </svg>
        );

      case 'sewing':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            <rect x="40" y="30" width="50" height="70"
              fill={colors.light} stroke={colors.line} strokeWidth="1.5" />
            <rect x="90" y="30" width="50" height="70"
              fill={colors.medium} stroke={colors.line} strokeWidth="1.5" />
            <line x1="90" y1="30" x2="90" y2="100"
              stroke={colors.accent} strokeWidth="1" strokeDasharray="3,2" />
            <text x="95" y="20" textAnchor="middle" fontSize="10" fill={colors.dark}>¼"</text>
            <path d="M 87 15 L 90 15 L 90 25 M 93 15 L 90 15"
              stroke={colors.dark} strokeWidth="1" />
            <text x="90" y="115" textAnchor="middle" fontSize="9" fill={colors.gray}>
              Sew along dashed line
            </text>
          </svg>
        );

      case 'pressing':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            <rect x="40" y="40" width="120" height="50"
              fill={colors.light} stroke={colors.line} strokeWidth="1.5" />
            <line x1="100" y1="40" x2="100" y2="90"
              stroke={colors.gray} strokeWidth="1" />
            <rect x="100" y="40" width="60" height="50"
              fill={colors.dark} stroke={colors.line} strokeWidth="1.5" />

            {/* Iron icon */}
            <path d="M 75 25 L 85 25 L 85 35 L 80 40 L 75 35 Z"
              fill={colors.gray} stroke={colors.line} strokeWidth="1" />

            {/* Arrow */}
            <path d="M 105 65 L 125 65 M 120 60 L 125 65 L 120 70"
              stroke={colors.accent} strokeWidth="1.5" fill="none" />

            <text x="100" y="105" textAnchor="middle" fontSize="9" fill={colors.gray}>
              Press to dark side
            </text>
          </svg>
        );

      case 'chain':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Chain of pieces */}
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={30 + i * 55} y="40" width="25" height="25"
                  fill={colors.light} stroke={colors.line} strokeWidth="1" />
                <rect x={30 + i * 55} y="65" width="25" height="25"
                  fill={colors.medium} stroke={colors.line} strokeWidth="1" />
                {i < 2 && (
                  <line x1={55 + i * 55} y1="65" x2={85 + i * 55} y2="65"
                    stroke={colors.accent} strokeWidth="1" strokeDasharray="2,1" />
                )}
              </g>
            ))}

            <text x="100" y="105" textAnchor="middle" fontSize="9" fill={colors.gray}>
              Chain Piecing
            </text>
          </svg>
        );

      default:
        return null;
    }
  };

  const diagramType = getDiagramType();

  if (!diagramType) return null;

  return (
    <div style={{
      marginTop: theme.spacing.breathe,
      marginBottom: theme.spacing.breathe,
      padding: theme.spacing.breathe,
      backgroundColor: theme.colors.washi,
      borderRadius: theme.radius.md,
      border: theme.borders.hairline,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.sage,
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Visual Guide
        </span>
      </div>

      <div style={{
        maxWidth: '280px',
        margin: '0 auto',
      }}>
        {renderDiagram(diagramType)}
      </div>
    </div>
  );
}

export default VisualDiagram;
