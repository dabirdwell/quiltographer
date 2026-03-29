'use client';

import React from 'react';

interface DrunkardPathBlockProps {
  size: number;
  colors: {
    curve: string;
    background: string;
  };
  strokeWidth?: number;
}

export const DrunkardPathBlock: React.FC<DrunkardPathBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const half = size / 2;
  const r = half; // Quarter-circle radius spans the full half

  // Four quadrants, each with a quarter-circle curve piece
  // Traditional Drunkard's Path: alternating curved and background pieces
  // in a 2x2 arrangement that creates a winding path

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top-left quadrant: curve piece (quarter circle from top-left corner) */}
      <rect x={0} y={0} width={half} height={half} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <path
        d={`M 0 0 L ${half} 0 A ${r} ${r} 0 0 0 0 ${half} Z`}
        fill={colors.curve}
        stroke="#000"
        strokeWidth={strokeWidth}
      />

      {/* Top-right quadrant: background with curve from bottom-right */}
      <rect x={half} y={0} width={half} height={half} fill={colors.curve} stroke="#000" strokeWidth={strokeWidth} />
      <path
        d={`M ${size} 0 L ${size} ${half} A ${r} ${r} 0 0 0 ${half} 0 Z`}
        fill={colors.background}
        stroke="#000"
        strokeWidth={strokeWidth}
      />

      {/* Bottom-left quadrant: background with curve from top-right */}
      <rect x={0} y={half} width={half} height={half} fill={colors.curve} stroke="#000" strokeWidth={strokeWidth} />
      <path
        d={`M 0 ${half} L 0 ${size} A ${r} ${r} 0 0 0 ${half} ${size} Z`}
        fill={colors.background}
        stroke="#000"
        strokeWidth={strokeWidth}
      />

      {/* Bottom-right quadrant: curve piece (quarter circle from bottom-right corner) */}
      <rect x={half} y={half} width={half} height={half} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      <path
        d={`M ${size} ${size} L ${half} ${size} A ${r} ${r} 0 0 0 ${size} ${half} Z`}
        fill={colors.curve}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
