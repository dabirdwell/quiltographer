'use client';

import React from 'react';

interface LogCabinBlockProps {
  size: number;
  colors: {
    center: string;
    light: string[];
    dark: string[];
  };
  strokeWidth?: number;
}

export const LogCabinBlock: React.FC<LogCabinBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const unit = size / 13; // Traditional 13x13 grid for log cabin
  
  // Helper to create strip rectangles
  const createStrip = (x: number, y: number, width: number, height: number, fill: string) => (
    <rect
      x={x * unit}
      y={y * unit}
      width={width * unit}
      height={height * unit}
      fill={fill}
      stroke="#000"
      strokeWidth={strokeWidth}
    />
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Center square - traditionally red */}
      {createStrip(6, 6, 1, 1, colors.center)}
      
      {/* First round */}
      {/* Light strips */}
      {createStrip(7, 6, 1, 1, colors.light[0])}
      {createStrip(6, 7, 2, 1, colors.light[0])}
      
      {/* Dark strips */}
      {createStrip(5, 6, 1, 2, colors.dark[0])}
      {createStrip(5, 5, 3, 1, colors.dark[0])}
      
      {/* Second round */}
      {/* Light strips */}
      {createStrip(8, 5, 1, 3, colors.light[1] || colors.light[0])}
      {createStrip(5, 8, 4, 1, colors.light[1] || colors.light[0])}
      
      {/* Dark strips */}
      {createStrip(4, 5, 1, 4, colors.dark[1] || colors.dark[0])}
      {createStrip(4, 4, 5, 1, colors.dark[1] || colors.dark[0])}
      
      {/* Third round - completes the traditional block */}
      {/* Light strips */}
      {createStrip(9, 4, 1, 5, colors.light[2] || colors.light[1] || colors.light[0])}
      {createStrip(4, 9, 6, 1, colors.light[2] || colors.light[1] || colors.light[0])}
      
      {/* Dark strips */}
      {createStrip(3, 4, 1, 6, colors.dark[2] || colors.dark[1] || colors.dark[0])}
      {createStrip(3, 3, 7, 1, colors.dark[2] || colors.dark[1] || colors.dark[0])}
    </svg>
  );
};
