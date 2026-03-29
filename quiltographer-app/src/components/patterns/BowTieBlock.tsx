'use client';

import React from 'react';

interface BowTieBlockProps {
  size: number;
  colors: {
    bowtie: string;
    center: string;
    background: string;
  };
  strokeWidth?: number;
}

export const BowTieBlock: React.FC<BowTieBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const u = size / 4;
  const mid = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background squares in corners */}
      <rect x={0}     y={0}     width={2*u} height={2*u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={2*u}   y={0}     width={2*u} height={2*u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={0}     y={2*u}   width={2*u} height={2*u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <rect x={2*u}   y={2*u}   width={2*u} height={2*u} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />

      {/* Center square */}
      <rect x={u} y={u} width={2*u} height={2*u} fill={colors.center} stroke="#000" strokeWidth={strokeWidth} />

      {/* Bow-tie triangles pointing inward from corners */}
      {/* Top-left */}
      <path d={`M 0 0 L ${mid} 0 L ${u} ${u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M 0 0 L 0 ${mid} L ${u} ${u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />

      {/* Top-right */}
      <path d={`M ${mid} 0 L ${size} 0 L ${3*u} ${u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M ${size} 0 L ${size} ${mid} L ${3*u} ${u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />

      {/* Bottom-left */}
      <path d={`M 0 ${mid} L 0 ${size} L ${u} ${3*u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M 0 ${size} L ${mid} ${size} L ${u} ${3*u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />

      {/* Bottom-right */}
      <path d={`M ${size} ${mid} L ${size} ${size} L ${3*u} ${3*u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />
      <path d={`M ${mid} ${size} L ${size} ${size} L ${3*u} ${3*u} Z`} fill={colors.bowtie} stroke="#000" strokeWidth={strokeWidth} />
    </svg>
  );
};
