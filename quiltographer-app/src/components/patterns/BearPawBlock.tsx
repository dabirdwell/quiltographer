'use client';

import React from 'react';

interface BearPawBlockProps {
  size: number;
  colors: {
    paw: string;
    center: string;
    background: string;
  };
  strokeWidth?: number;
}

export const BearPawBlock: React.FC<BearPawBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const u = size / 8; // 8x8 grid for bear paw detail

  // Helper for HST (half-square triangle) — diagonal split
  const hst = (x: number, y: number, s: number, color1: string, color2: string, dir: 'tl' | 'tr' | 'bl' | 'br') => {
    const paths: Record<string, [string, string]> = {
      tl: [`M ${x} ${y} L ${x+s} ${y} L ${x} ${y+s} Z`, `M ${x+s} ${y} L ${x+s} ${y+s} L ${x} ${y+s} Z`],
      tr: [`M ${x} ${y} L ${x+s} ${y} L ${x+s} ${y+s} Z`, `M ${x} ${y} L ${x+s} ${y+s} L ${x} ${y+s} Z`],
      bl: [`M ${x} ${y} L ${x} ${y+s} L ${x+s} ${y+s} Z`, `M ${x} ${y} L ${x+s} ${y} L ${x+s} ${y+s} Z`],
      br: [`M ${x+s} ${y} L ${x+s} ${y+s} L ${x} ${y+s} Z`, `M ${x} ${y} L ${x+s} ${y} L ${x} ${y+s} Z`],
    };
    const [p1, p2] = paths[dir];
    return (
      <>
        <path d={p1} fill={color1} stroke="#000" strokeWidth={strokeWidth} />
        <path d={p2} fill={color2} stroke="#000" strokeWidth={strokeWidth} />
      </>
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width={size} height={size} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Center cross — vertical and horizontal bars */}
      <rect x={3*u} y={0} width={2*u} height={size} fill={colors.center} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={0} y={3*u} width={size} height={2*u} fill={colors.center} stroke="#000" strokeWidth={strokeWidth} />

      {/* Center square */}
      <rect x={3*u} y={3*u} width={2*u} height={2*u} fill={colors.center} stroke="#000" strokeWidth={strokeWidth} />

      {/* Top-left paw: 3x3 grid of small squares, corners are HSTs */}
      <rect x={0} y={0} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      {hst(u, 0, u, colors.paw, colors.background, 'tl')}
      <rect x={2*u} y={0} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      {hst(0, u, u, colors.paw, colors.background, 'tl')}
      <rect x={u} y={u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={2*u} y={u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={0} y={2*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={u} y={2*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={2*u} y={2*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Top-right paw */}
      <rect x={5*u} y={0} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      {hst(6*u, 0, u, colors.paw, colors.background, 'tr')}
      <rect x={7*u} y={0} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={5*u} y={u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={6*u} y={u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      {hst(7*u, u, u, colors.paw, colors.background, 'tr')}
      <rect x={5*u} y={2*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={6*u} y={2*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={7*u} y={2*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Bottom-left paw */}
      <rect x={0} y={5*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={u} y={5*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={2*u} y={5*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      {hst(0, 6*u, u, colors.paw, colors.background, 'bl')}
      <rect x={u} y={6*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={2*u} y={6*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={0} y={7*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      {hst(u, 7*u, u, colors.paw, colors.background, 'bl')}
      <rect x={2*u} y={7*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Bottom-right paw */}
      <rect x={5*u} y={5*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={6*u} y={5*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={7*u} y={5*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={5*u} y={6*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={6*u} y={6*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
      {hst(7*u, 6*u, u, colors.paw, colors.background, 'br')}
      <rect x={5*u} y={7*u} width={u} height={u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      {hst(6*u, 7*u, u, colors.paw, colors.background, 'br')}
      <rect x={7*u} y={7*u} width={u} height={u} fill={colors.paw} stroke="#000" strokeWidth={strokeWidth} />
    </svg>
  );
};
