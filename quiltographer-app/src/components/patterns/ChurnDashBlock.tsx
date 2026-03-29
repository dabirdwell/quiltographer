'use client';

import React from 'react';

interface ChurnDashBlockProps {
  size: number;
  colors: {
    dash: string;
    center: string;
    background: string;
  };
  strokeWidth?: number;
}

export const ChurnDashBlock: React.FC<ChurnDashBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const u = size / 4;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background fill */}
      <rect width={size} height={size} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Center square */}
      <rect x={u} y={u} width={2*u} height={2*u} fill={colors.center} stroke="#000" strokeWidth={strokeWidth} />

      {/* Corner HST blocks — each corner has a triangle pair */}
      {/* Top-left corner */}
      <path d={`M 0 0 L ${u} 0 L 0 ${u} Z`} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M ${u} 0 L ${u} ${u} L 0 ${u} Z`} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Top-right corner */}
      <path d={`M ${3*u} 0 L ${4*u} 0 L ${4*u} ${u} Z`} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M ${3*u} 0 L ${3*u} ${u} L ${4*u} ${u} Z`} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Bottom-left corner */}
      <path d={`M 0 ${3*u} L 0 ${4*u} L ${u} ${4*u} Z`} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M 0 ${3*u} L ${u} ${3*u} L ${u} ${4*u} Z`} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Bottom-right corner */}
      <path d={`M ${4*u} ${3*u} L ${4*u} ${4*u} L ${3*u} ${4*u} Z`} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M ${3*u} ${3*u} L ${4*u} ${3*u} L ${3*u} ${4*u} Z`} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Side rectangles ("dash" bars) */}
      {/* Top bar */}
      <rect x={u} y={0} width={2*u} height={u} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
      {/* Bottom bar */}
      <rect x={u} y={3*u} width={2*u} height={u} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
      {/* Left bar */}
      <rect x={0} y={u} width={u} height={2*u} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
      {/* Right bar */}
      <rect x={3*u} y={u} width={u} height={2*u} fill={colors.dash} stroke="#000" strokeWidth={strokeWidth} />
    </svg>
  );
};
