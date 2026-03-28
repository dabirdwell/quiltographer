'use client';

import React, { useMemo, useState } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import type { ReaderPattern } from '@/lib/reader/schema';

const theme = quiltographerTheme;

interface DifficultyEstimatorProps {
  pattern: ReaderPattern;
}

interface DifficultyFactor {
  label: string;
  value: string;
  score: number;    // contribution to final score (0-10 normalized)
  maxScore: number;  // max possible contribution
  explanation: string;
}

interface DifficultyResult {
  score: number; // 1-10
  label: string;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  color: string;
  description: string;
  factors: DifficultyFactor[];
}

// ── Technique detection lists ──────────────────────────────────────

const CURVED_KEYWORDS = [
  'curved', 'curve', 'drunkard', 'cathedral', 'apple core',
  'clamshell', 'orange peel', 'double wedding ring', 'winding ways',
  'mariner\'s compass', 'new york beauty',
];

const POINT_KEYWORDS = [
  'y-seam', 'y seam', 'set-in', 'set in seam', 'inset',
  'star point', 'lone star', 'eight-pointed', '8-pointed',
  'kaleidoscope', 'mariner', 'compass', 'hexagon',
];

const ADVANCED_TECHNIQUE_KEYWORDS = [
  'paper piecing', 'foundation piecing', 'fpp',
  'applique', 'appliqué', 'reverse applique',
  'bias', 'mitered', 'mitre',
  'english paper', 'epp',
  'free motion', 'fmq',
  'trapunto', 'broderie perse',
];

// ── Dimension parsing ──────────────────────────────────────────────

function parseSmallestDimension(dimensions: string): number | null {
  // Match patterns like "3.5 x 3.5", "2½ x 4½", "3 x 6 inches", "2.5"
  const nums: number[] = [];

  // Handle fractions like 2½ or 3-1/2
  const fractionRegex = /(\d+)\s*[½⅓⅔¼¾⅛⅜⅝⅞]/g;
  let match;
  while ((match = fractionRegex.exec(dimensions)) !== null) {
    const whole = parseInt(match[1], 10);
    // Approximate the unicode fraction as 0.5
    nums.push(whole + 0.5);
  }

  // Handle decimal numbers
  const decimalRegex = /(\d+\.?\d*)/g;
  while ((match = decimalRegex.exec(dimensions)) !== null) {
    nums.push(parseFloat(match[1]));
  }

  if (nums.length === 0) return null;

  // For a piece, the smallest dimension is the constraining factor
  return Math.min(...nums.filter(n => n > 0));
}

function getSmallestPieceSize(pattern: ReaderPattern): number | null {
  let smallest: number | null = null;

  for (const ci of pattern.cuttingInstructions) {
    for (const piece of ci.pieces) {
      const dim = parseSmallestDimension(piece.dimensions);
      if (dim !== null && (smallest === null || dim < smallest)) {
        smallest = dim;
      }
    }
  }

  return smallest;
}

// ── Scoring algorithm ──────────────────────────────────────────────

function analyzeDifficulty(pattern: ReaderPattern): DifficultyResult {
  const { materials, cuttingInstructions, steps, finishedSize } = pattern;

  const allTechniques = steps.flatMap(s => s.techniques).map(t => t.toLowerCase());
  const allInstructions = steps.map(s =>
    `${s.instruction} ${s.title || ''} ${s.clarifiedInstruction || ''}`
  ).join(' ').toLowerCase();
  const searchText = `${allTechniques.join(' ')} ${allInstructions}`;

  // ── Factor 1: Unique colors/fabrics (max 1.5 pts) ──
  const fabricSet = new Set<string>();
  materials.filter(m => m.type === 'fabric').forEach(m => fabricSet.add(m.name.toLowerCase()));
  cuttingInstructions.forEach(ci => fabricSet.add(ci.fabric.toLowerCase()));
  const uniqueFabrics = fabricSet.size;

  let fabricScore: number;
  if (uniqueFabrics <= 2) fabricScore = 0.2;
  else if (uniqueFabrics <= 4) fabricScore = 0.5;
  else if (uniqueFabrics <= 6) fabricScore = 0.8;
  else if (uniqueFabrics <= 9) fabricScore = 1.1;
  else fabricScore = 1.5;

  // ── Factor 2: Total piece count (max 2.0 pts) ──
  let totalPieceCount = 0;
  cuttingInstructions.forEach(ci => {
    ci.pieces.forEach(p => { totalPieceCount += p.quantity; });
  });

  let pieceScore: number;
  if (totalPieceCount <= 20) pieceScore = 0.2;
  else if (totalPieceCount <= 50) pieceScore = 0.5;
  else if (totalPieceCount <= 100) pieceScore = 0.9;
  else if (totalPieceCount <= 200) pieceScore = 1.3;
  else if (totalPieceCount <= 400) pieceScore = 1.7;
  else pieceScore = 2.0;

  // ── Factor 3: Smallest piece size (max 1.5 pts) ──
  const smallestPiece = getSmallestPieceSize(pattern);

  let smallPieceScore: number;
  let smallPieceLabel: string;
  if (smallestPiece === null) {
    smallPieceScore = 0.3; // Unknown, assume moderate
    smallPieceLabel = 'Unknown';
  } else if (smallestPiece >= 5) {
    smallPieceScore = 0.1;
    smallPieceLabel = `${smallestPiece}" (large)`;
  } else if (smallestPiece >= 3.5) {
    smallPieceScore = 0.3;
    smallPieceLabel = `${smallestPiece}" (medium)`;
  } else if (smallestPiece >= 2.5) {
    smallPieceScore = 0.6;
    smallPieceLabel = `${smallestPiece}" (small)`;
  } else if (smallestPiece >= 1.5) {
    smallPieceScore = 1.0;
    smallPieceLabel = `${smallestPiece}" (very small)`;
  } else {
    smallPieceScore = 1.5;
    smallPieceLabel = `${smallestPiece}" (tiny)`;
  }

  // ── Factor 4: Curved seams vs straight (max 1.5 pts) ──
  const curvedCount = CURVED_KEYWORDS.filter(kw => searchText.includes(kw)).length;
  const hasCurved = curvedCount > 0;

  let curvedScore: number;
  if (curvedCount === 0) curvedScore = 0;
  else if (curvedCount <= 2) curvedScore = 0.8;
  else curvedScore = 1.5;

  // ── Factor 5: Points / intersections (max 1.5 pts) ──
  const pointMatches = POINT_KEYWORDS.filter(kw => searchText.includes(kw)).length;
  const hasAdvancedTechniques = ADVANCED_TECHNIQUE_KEYWORDS.filter(kw => searchText.includes(kw)).length;
  const hasTriangles = cuttingInstructions.some(ci =>
    ci.pieces.some(p => p.shape === 'triangle')
  );

  let pointScore: number;
  if (pointMatches === 0 && !hasTriangles) pointScore = 0;
  else if (pointMatches === 0 && hasTriangles) pointScore = 0.3;
  else if (pointMatches <= 2) pointScore = 0.8;
  else pointScore = 1.5;

  // ── Factor 6: Pieces per square foot (max 2.0 pts) ──
  let piecesPerSqFt = 0;
  let sqFtLabel = 'N/A';
  if (finishedSize.width > 0 && finishedSize.height > 0) {
    const widthInches = finishedSize.unit === 'cm'
      ? finishedSize.width / 2.54
      : finishedSize.width;
    const heightInches = finishedSize.unit === 'cm'
      ? finishedSize.height / 2.54
      : finishedSize.height;
    const sqFt = (widthInches * heightInches) / 144;
    if (sqFt > 0 && totalPieceCount > 0) {
      piecesPerSqFt = totalPieceCount / sqFt;
      sqFtLabel = `${Math.round(piecesPerSqFt)}/sq ft`;
    }
  }

  let densityScore: number;
  if (piecesPerSqFt === 0) densityScore = 0.3; // Unknown
  else if (piecesPerSqFt <= 10) densityScore = 0.2;
  else if (piecesPerSqFt <= 25) densityScore = 0.5;
  else if (piecesPerSqFt <= 50) densityScore = 0.9;
  else if (piecesPerSqFt <= 100) densityScore = 1.4;
  else densityScore = 2.0;

  // ── Bonus: Advanced techniques (max 0.5 pts) ──
  const techniqueBonus = Math.min(0.5, hasAdvancedTechniques * 0.2);

  // ── Aggregate ──
  const rawScore = fabricScore + pieceScore + smallPieceScore +
    curvedScore + pointScore + densityScore + techniqueBonus;

  // Map raw score (0 ~ 10.5 theoretical max) to 1-10
  const score = Math.max(1, Math.min(10, Math.round(rawScore)));

  // Determine tier
  let tier: DifficultyResult['tier'];
  let label: string;
  let color: string;
  let description: string;

  if (score <= 3) {
    tier = 'beginner';
    label = 'Beginner';
    color = theme.colors.sage;
    description = score === 1
      ? 'Perfect first project — simple shapes, few pieces'
      : score === 2
        ? 'Great for new quilters learning the basics'
        : 'Comfortable for quilters with a few projects under their belt';
  } else if (score <= 6) {
    tier = 'intermediate';
    label = 'Intermediate';
    color = theme.colors.clay;
    description = score === 4
      ? 'Some experience helpful — moderate complexity'
      : score === 5
        ? 'Solid skills needed — multiple techniques involved'
        : 'Challenging for intermediate quilters — precision matters';
  } else if (score <= 8) {
    tier = 'advanced';
    label = 'Advanced';
    color = theme.colors.persimmon;
    description = score === 7
      ? 'Experienced quilters — demands accuracy and patience'
      : 'Complex construction with advanced techniques';
  } else {
    tier = 'expert';
    label = 'Expert';
    color = '#c0392b';
    description = score === 9
      ? 'Master-level quilting — intricate precision work'
      : 'The pinnacle of quilting complexity';
  }

  // Build factor explanations
  const factors: DifficultyFactor[] = [
    {
      label: 'Unique Fabrics',
      value: String(uniqueFabrics),
      score: fabricScore,
      maxScore: 1.5,
      explanation: uniqueFabrics <= 3
        ? 'Few fabrics keep things manageable'
        : uniqueFabrics <= 6
          ? 'Moderate fabric variety requires organization'
          : 'Many fabrics increase complexity significantly',
    },
    {
      label: 'Total Pieces',
      value: String(totalPieceCount),
      score: pieceScore,
      maxScore: 2.0,
      explanation: totalPieceCount <= 50
        ? 'Low piece count — straightforward assembly'
        : totalPieceCount <= 150
          ? 'Moderate piece count requires patience'
          : 'High piece count demands careful organization',
    },
    {
      label: 'Smallest Piece',
      value: smallPieceLabel,
      score: smallPieceScore,
      maxScore: 1.5,
      explanation: smallestPiece === null
        ? 'Piece sizes could not be determined'
        : smallestPiece >= 3.5
          ? 'Larger pieces are easier to handle and sew'
          : smallestPiece >= 2
            ? 'Smaller pieces require more precise cutting and sewing'
            : 'Tiny pieces demand expert-level precision',
    },
    {
      label: 'Curved Seams',
      value: hasCurved ? `Yes (${curvedCount} type${curvedCount > 1 ? 's' : ''})` : 'None — straight only',
      score: curvedScore,
      maxScore: 1.5,
      explanation: hasCurved
        ? 'Curved seams are significantly harder than straight seams'
        : 'All straight seams — the most forgiving type',
    },
    {
      label: 'Complex Points',
      value: pointMatches > 0
        ? `${pointMatches} detected`
        : hasTriangles
          ? 'Triangle points'
          : 'None detected',
      score: pointScore,
      maxScore: 1.5,
      explanation: pointMatches > 0
        ? 'Set-in seams and multi-piece intersections require precision'
        : hasTriangles
          ? 'Triangle points need careful alignment'
          : 'No complex intersections — seams are straightforward',
    },
    {
      label: 'Piece Density',
      value: sqFtLabel,
      score: densityScore,
      maxScore: 2.0,
      explanation: piecesPerSqFt <= 25
        ? 'Lower density — pieces are generously sized'
        : piecesPerSqFt <= 50
          ? 'Moderate density — standard quilting complexity'
          : 'High density — many pieces packed into the quilt area',
    },
  ];

  return { score, label, tier, color, description, factors };
}

// ── Radial Gauge SVG ───────────────────────────────────────────────

function DifficultyGauge({ score, color }: { score: number; color: string }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = 65;
  const strokeWidth = 14;

  // Arc from 180° to 0° (left to right semicircle)
  const startAngle = Math.PI;  // 180°
  const endAngle = 0;          // 0°
  const sweepAngle = startAngle - endAngle; // π

  // Fill proportion (score 1-10 mapped to 0-1)
  const proportion = (score - 1) / 9;

  // Calculate the arc endpoint for the filled portion
  const fillAngle = startAngle - proportion * sweepAngle;

  // Arc path helper
  const arcPoint = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  });

  // Background arc (full semicircle)
  const bgStart = arcPoint(startAngle, radius);
  const bgEnd = arcPoint(endAngle, radius);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  // Filled arc
  const fillStart = arcPoint(startAngle, radius);
  const fillEnd = arcPoint(fillAngle, radius);
  const largeArc = proportion > 0.5 ? 1 : 0;
  const fillPath = proportion > 0
    ? `M ${fillStart.x} ${fillStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`
    : '';

  // Needle position
  const needleAngle = fillAngle;
  const needleInner = arcPoint(needleAngle, radius - 25);
  const needleOuter = arcPoint(needleAngle, radius + 4);

  // Tick marks
  const ticks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Color gradient stops for the background segments
  const segmentColors = [
    '#84a98c', '#84a98c', '#84a98c',  // 1-3 sage/beginner
    '#e9c46a', '#e9c46a', '#e9c46a',  // 4-6 clay/intermediate
    '#e76f51', '#e76f51',              // 7-8 persimmon/advanced
    '#c0392b', '#c0392b',             // 9-10 red/expert
  ];

  return (
    <svg viewBox={`0 0 ${size} ${size / 2 + 40}`} width="100%" style={{ maxWidth: '220px' }}>
      {/* Background track */}
      <path
        d={bgPath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Colored segment indicators behind the gauge */}
      {ticks.map((tick, i) => {
        const tickPropStart = (tick - 1) / 9;
        const tickPropEnd = (tick - 0.2) / 9;
        const aStart = startAngle - tickPropStart * sweepAngle;
        const aEnd = startAngle - tickPropEnd * sweepAngle;
        const pStart = arcPoint(aStart, radius);
        const pEnd = arcPoint(aEnd, radius);
        const segColor = tick <= score
          ? segmentColors[i]
          : 'rgba(255, 255, 255, 0.05)';
        return (
          <path
            key={tick}
            d={`M ${pStart.x} ${pStart.y} A ${radius} ${radius} 0 0 1 ${pEnd.x} ${pEnd.y}`}
            fill="none"
            stroke={segColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={tick <= score ? 0.9 : 0.4}
          />
        );
      })}

      {/* Tick labels */}
      {[1, 3, 5, 7, 10].map(tick => {
        const tickProp = (tick - 0.5) / 9;
        const tickAngle = startAngle - tickProp * sweepAngle;
        const labelPos = arcPoint(tickAngle, radius + 18);
        return (
          <text
            key={tick}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(245, 230, 211, 0.4)"
            fontSize="9"
            fontFamily={theme.typography.fontFamily.body}
          >
            {tick}
          </text>
        );
      })}

      {/* Needle */}
      <line
        x1={needleInner.x}
        y1={needleInner.y}
        x2={needleOuter.x}
        y2={needleOuter.y}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill={color} />
      <circle cx={cx} cy={cy} r={2} fill="#2a2420" />

      {/* Score number */}
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="22"
        fontWeight="700"
        fontFamily={theme.typography.fontFamily.display}
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 36}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(245, 230, 211, 0.5)"
        fontSize="9"
        fontFamily={theme.typography.fontFamily.body}
      >
        out of 10
      </text>
    </svg>
  );
}

// ── Factor Bar ─────────────────────────────────────────────────────

function FactorBar({ factor, tierColor }: { factor: DifficultyFactor; tierColor: string }) {
  const proportion = factor.maxScore > 0 ? factor.score / factor.maxScore : 0;

  // Color based on contribution level
  let barColor: string;
  if (proportion <= 0.33) barColor = theme.colors.sage;
  else if (proportion <= 0.66) barColor = theme.colors.clay;
  else barColor = theme.colors.persimmon;

  return (
    <div style={{
      padding: '8px 10px',
      borderRadius: theme.radius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
      }}>
        <span style={{
          fontSize: theme.typography.fontSize.sm,
          color: 'rgba(245, 230, 211, 0.7)',
          fontFamily: theme.typography.fontFamily.body,
        }}>
          {factor.label}
        </span>
        <span style={{
          fontSize: theme.typography.fontSize.sm,
          color: '#f5e6d3',
          fontWeight: 600,
          fontFamily: theme.typography.fontFamily.body,
        }}>
          {factor.value}
        </span>
      </div>
      {/* Mini progress bar */}
      <div style={{
        height: '4px',
        borderRadius: '2px',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.max(5, proportion * 100)}%`,
          borderRadius: '2px',
          backgroundColor: barColor,
          transition: `width ${theme.timing.unfold} ${theme.timing.easeOut}`,
        }} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function DifficultyEstimator({ pattern }: DifficultyEstimatorProps) {
  const result = useMemo(() => analyzeDifficulty(pattern), [pattern]);
  const [showBreakdown, setShowBreakdown] = useState(false);

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
          color: result.color,
          fontWeight: 700,
          letterSpacing: '0.03em',
          padding: '2px 10px',
          borderRadius: theme.radius.full,
          backgroundColor: `${result.color}18`,
          border: `1px solid ${result.color}30`,
        }}>
          {result.label}
        </span>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Radial gauge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          <DifficultyGauge score={result.score} color={result.color} />
        </div>

        {/* Description */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1rem',
          color: 'rgba(245, 230, 211, 0.6)',
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.normal,
        }}>
          {result.description}
        </div>

        {/* Tier bar — colored segmented bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            gap: '3px',
            marginBottom: '6px',
          }}>
            {Array.from({ length: 10 }, (_, i) => {
              const level = i + 1;
              const isActive = level <= result.score;
              let segColor: string;
              if (level <= 3) segColor = theme.colors.sage;
              else if (level <= 6) segColor = theme.colors.clay;
              else if (level <= 8) segColor = theme.colors.persimmon;
              else segColor = '#c0392b';

              return (
                <div key={level} style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: isActive ? segColor : 'rgba(255, 255, 255, 0.06)',
                  transition: `background-color ${theme.timing.unfold} ${theme.timing.easeOut}`,
                  boxShadow: isActive ? `0 0 6px ${segColor}30` : 'none',
                }} />
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: 'rgba(245, 230, 211, 0.35)',
            fontFamily: theme.typography.fontFamily.body,
            padding: '0 2px',
          }}>
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
            <span>Expert</span>
          </div>
        </div>

        {/* "Why this rating" toggle */}
        <button
          onClick={() => setShowBreakdown(prev => !prev)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: theme.radius.md,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: showBreakdown
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(255, 255, 255, 0.02)',
            color: 'rgba(245, 230, 211, 0.7)',
            fontSize: theme.typography.fontSize.sm,
            fontFamily: theme.typography.fontFamily.body,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: `background-color ${theme.timing.quick} ${theme.timing.easeOut}`,
          }}
        >
          <span>Why this rating?</span>
          <span style={{
            transition: `transform ${theme.timing.quick} ${theme.timing.easeOut}`,
            transform: showBreakdown ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.75rem',
          }}>
            ▾
          </span>
        </button>

        {/* Factor breakdown */}
        {showBreakdown && (
          <div style={{
            display: 'grid',
            gap: '6px',
            marginTop: '10px',
          }}>
            {result.factors.map(factor => (
              <div key={factor.label}>
                <FactorBar factor={factor} tierColor={result.color} />
                <div style={{
                  padding: '2px 10px 4px',
                  fontSize: '0.7rem',
                  color: 'rgba(245, 230, 211, 0.4)',
                  fontFamily: theme.typography.fontFamily.body,
                  lineHeight: '1.3',
                }}>
                  {factor.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DifficultyEstimator;
