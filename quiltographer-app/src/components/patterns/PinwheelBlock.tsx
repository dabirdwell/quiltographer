'use client';

import React from 'react';

interface PinwheelBlockProps {
  size: number;
  colors: {
    blade: string;
    background: string;
  };
  strokeWidth?: number;
}

export const PinwheelBlock: React.FC<PinwheelBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const half = size / 2;

  // Four quadrants, each split diagonally into blade + background
  // The blade triangles rotate around the center creating the pinwheel effect
  const quadrants = [
    // Top-left: blade on bottom-left triangle
    { blade: `M 0 0 L ${half} 0 L 0 ${half} Z`, bg: `M ${half} 0 L 0 ${half} L ${half} ${half} Z` },
    // Top-right: blade on bottom-right triangle
    { blade: `M ${half} 0 L ${size} 0 L ${half} ${half} Z`, bg: `M ${size} 0 L ${size} ${half} L ${half} ${half} Z` },
    // Bottom-right: blade on top-right triangle
    { blade: `M ${size} ${half} L ${size} ${size} L ${half} ${size} Z`, bg: `M ${half} ${half} L ${size} ${half} L ${half} ${size} Z` },
    // Bottom-left: blade on top-left triangle
    { blade: `M 0 ${half} L ${half} ${half} L 0 ${size} Z`, bg: `M ${half} ${half} L ${half} ${size} L 0 ${size} Z` },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {quadrants.map((q, i) => (
        <g key={i}>
          <path d={q.bg} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
          <path d={q.blade} fill={colors.blade} stroke="#000" strokeWidth={strokeWidth} />
        </g>
      ))}
    </svg>
  );
};
