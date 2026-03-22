'use client';

import React, { useMemo } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import type { ReaderPattern } from '@/lib/reader/schema';

const theme = quiltographerTheme;

interface DifficultyEstimatorProps {
  pattern: ReaderPattern;
}

interface DifficultyBreakdown {
  score: number; // 1-5
  uniqueBlocks: number;
  avgPiecesPerBlock: number;
  hasCurvedSeams: boolean;
  fabricTypeCount: number;
  totalPieceCount: number;
  factors: { label: string; value: string; weight: number }[];
}

const CURVED_TECHNIQUES = [
  'curved', 'curve', 'drunkard', 'cathedral', 'apple core',
  'clamshell', 'orange peel', 'double wedding ring', 'winding ways',
];

const ADVANCED_TECHNIQUES = [
  'y-seam', 'set-in', 'inset', 'paper piecing', 'foundation piecing',
  'applique', 'appliqué', 'bias', 'mitered', 'matching points',
];

function analyzeDifficulty(pattern: ReaderPattern): DifficultyBreakdown {
  const { materials, cuttingInstructions, steps } = pattern;

  // 1. Unique blocks — count distinct fabric groups in cutting instructions
  const uniqueBlocks = cuttingInstructions.length;

  // 2. Total piece count and avg pieces per block
  let totalPieceCount = 0;
  cuttingInstructions.forEach(ci => {
    ci.pieces.forEach(p => {
      totalPieceCount += p.quantity;
    });
  });
  const avgPiecesPerBlock = uniqueBlocks > 0
    ? Math.round((totalPieceCount / uniqueBlocks) * 10) / 10
    : 0;

  // 3. Curved seams detection
  const allTechniques = steps.flatMap(s => s.techniques).map(t => t.toLowerCase());
  const allInstructions = steps.map(s => s.instruction.toLowerCase()).join(' ');
  const hasCurvedSeams = CURVED_TECHNIQUES.some(
    ct => allTechniques.some(t => t.includes(ct)) || allInstructions.includes(ct)
  );

  // 4. Advanced techniques detection
  const hasAdvancedTechniques = ADVANCED_TECHNIQUES.some(
    at => allTechniques.some(t => t.includes(at)) || allInstructions.includes(at)
  );

  // 5. Fabric type count
  const fabricTypeCount = materials.filter(m => m.type === 'fabric').length;

  // 6. Shapes with triangles (harder to sew)
  const hasTriangles = cuttingInstructions.some(ci =>
    ci.pieces.some(p => p.shape === 'triangle')
  );
  const hasCustomShapes = cuttingInstructions.some(ci =>
    ci.pieces.some(p => p.shape === 'custom')
  );

  // Calculate weighted score
  let rawScore = 0;

  // Piece count scoring (0-1.5 points)
  if (totalPieceCount <= 20) rawScore += 0.2;
  else if (totalPieceCount <= 50) rawScore += 0.5;
  else if (totalPieceCount <= 100) rawScore += 0.8;
  else if (totalPieceCount <= 200) rawScore += 1.1;
  else rawScore += 1.5;

  // Fabric variety scoring (0-1 point)
  if (fabricTypeCount <= 3) rawScore += 0.2;
  else if (fabricTypeCount <= 5) rawScore += 0.5;
  else if (fabricTypeCount <= 7) rawScore += 0.7;
  else rawScore += 1.0;

  // Technique complexity (0-1.5 points)
  if (hasCurvedSeams) rawScore += 1.0;
  if (hasAdvancedTechniques) rawScore += 0.8;
  if (hasTriangles) rawScore += 0.3;
  if (hasCustomShapes) rawScore += 0.4;

  // Step count complexity (0-1 point)
  const stepCount = steps.length;
  if (stepCount <= 5) rawScore += 0.1;
  else if (stepCount <= 8) rawScore += 0.3;
  else if (stepCount <= 12) rawScore += 0.6;
  else rawScore += 1.0;

  // Warnings as complexity indicator (0-0.5 points)
  const criticalWarnings = steps.flatMap(s => s.warnings).filter(w => w.type === 'critical').length;
  if (criticalWarnings >= 3) rawScore += 0.5;
  else if (criticalWarnings >= 1) rawScore += 0.2;

  // Normalize to 1-5 scale
  const score = Math.max(1, Math.min(5, Math.round(rawScore)));

  const factors: DifficultyBreakdown['factors'] = [
    {
      label: 'Total Pieces',
      value: String(totalPieceCount),
      weight: totalPieceCount > 100 ? 3 : totalPieceCount > 50 ? 2 : 1,
    },
    {
      label: 'Fabric Types',
      value: String(fabricTypeCount),
      weight: fabricTypeCount > 6 ? 3 : fabricTypeCount > 4 ? 2 : 1,
    },
    {
      label: 'Seam Types',
      value: hasCurvedSeams ? 'Curved' : 'Straight',
      weight: hasCurvedSeams ? 3 : 1,
    },
    {
      label: 'Techniques',
      value: hasAdvancedTechniques ? 'Advanced' : 'Standard',
      weight: hasAdvancedTechniques ? 3 : 1,
    },
    {
      label: 'Construction Steps',
      value: String(stepCount),
      weight: stepCount > 10 ? 3 : stepCount > 6 ? 2 : 1,
    },
  ];

  return {
    score,
    uniqueBlocks,
    avgPiecesPerBlock,
    hasCurvedSeams,
    fabricTypeCount,
    totalPieceCount,
    factors,
  };
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string; description: string }> = {
  1: { label: 'Beginner', color: theme.colors.sage, description: 'Great first project' },
  2: { label: 'Easy', color: '#7cb87c', description: 'Comfortable for new quilters' },
  3: { label: 'Intermediate', color: theme.colors.clay, description: 'Some experience helpful' },
  4: { label: 'Advanced', color: theme.colors.persimmon, description: 'Experienced quilters' },
  5: { label: 'Expert', color: '#c0392b', description: 'Challenging techniques' },
};

export function DifficultyEstimator({ pattern }: DifficultyEstimatorProps) {
  const breakdown = useMemo(() => analyzeDifficulty(pattern), [pattern]);
  const diffInfo = DIFFICULTY_LABELS[breakdown.score] || DIFFICULTY_LABELS[3];

  return (
    <div style={{
      backgroundColor: '#2a2420',
      backgroundImage: theme.textures.washiFiber,
      borderRadius: theme.radius.lg,
      border: '1px solid rgba(231, 111, 81, 0.15)',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
      }}>
        <span style={{
          fontWeight: 600,
          color: '#f5e6d3',
          fontFamily: theme.typography.fontFamily.display,
          fontSize: theme.typography.fontSize.lg,
        }}>
          Difficulty Estimate
        </span>
        <span style={{
          fontSize: theme.typography.fontSize.sm,
          color: diffInfo.color,
          fontWeight: 700,
          letterSpacing: '0.03em',
        }}>
          {diffInfo.label}
        </span>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Visual meter — 5 segments */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '0.75rem',
        }}>
          {[1, 2, 3, 4, 5].map(level => {
            const isActive = level <= breakdown.score;
            const segColor = isActive ? diffInfo.color : 'rgba(255, 255, 255, 0.08)';
            return (
              <div key={level} style={{
                flex: 1,
                height: '10px',
                borderRadius: '5px',
                backgroundColor: segColor,
                transition: `background-color ${theme.timing.unfold} ${theme.timing.easeOut}`,
                boxShadow: isActive ? `0 0 8px ${segColor}40` : 'none',
              }} />
            );
          })}
        </div>

        {/* Score label */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1rem',
          color: 'rgba(245, 230, 211, 0.6)',
          fontSize: theme.typography.fontSize.sm,
        }}>
          {diffInfo.description}
        </div>

        {/* Factor breakdown */}
        <div style={{
          display: 'grid',
          gap: '8px',
        }}>
          {breakdown.factors.map(factor => (
            <div key={factor.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              borderRadius: theme.radius.sm,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            }}>
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                color: 'rgba(245, 230, 211, 0.7)',
                fontFamily: theme.typography.fontFamily.body,
              }}>
                {factor.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: '#f5e6d3',
                  fontWeight: 600,
                  fontFamily: theme.typography.fontFamily.body,
                }}>
                  {factor.value}
                </span>
                {/* Mini difficulty dots */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3].map(dot => (
                    <div key={dot} style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: dot <= factor.weight
                        ? factor.weight >= 3 ? theme.colors.persimmon
                          : factor.weight >= 2 ? theme.colors.clay
                          : theme.colors.sage
                        : 'rgba(255, 255, 255, 0.1)',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DifficultyEstimator;
