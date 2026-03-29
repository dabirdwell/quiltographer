'use client';

import React from 'react';

interface NinePatchBlockProps {
  size: number;
  colors: {
    corner: string;
    center: string;
    edge: string;
  };
  strokeWidth?: number;
}

export const NinePatchBlock: React.FC<NinePatchBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const unit = size / 3;

  // 3x3 grid: corners and center are one color, edges another
  const grid = [
    [colors.corner, colors.edge,   colors.corner],
    [colors.edge,   colors.center, colors.edge],
    [colors.corner, colors.edge,   colors.corner],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {grid.map((row, r) =>
        row.map((fill, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * unit}
            y={r * unit}
            width={unit}
            height={unit}
            fill={fill}
            stroke="#000"
            strokeWidth={strokeWidth}
          />
        ))
      )}
    </svg>
  );
};
