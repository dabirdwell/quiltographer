// Example: Log Cabin Block Pattern Component
// Save this as: /src/components/patterns/LogCabinBlock.tsx

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
  // Log Cabin is built from center outward in strips
  const unit = size / 13; // Traditional 13x13 grid
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Center square */}
      <rect
        x={unit * 6}
        y={unit * 6}
        width={unit}
        height={unit}
        fill={colors.center}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      
      {/* First round - light */}
      <rect
        x={unit * 7}
        y={unit * 6}
        width={unit}
        height={unit}
        fill={colors.light[0]}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      <rect
        x={unit * 6}
        y={unit * 7}
        width={unit * 2}
        height={unit}
        fill={colors.light[0]}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      
      {/* First round - dark */}
      <rect
        x={unit * 5}
        y={unit * 6}
        width={unit}
        height={unit * 2}
        fill={colors.dark[0]}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      <rect
        x={unit * 5}
        y={unit * 5}
        width={unit * 3}
        height={unit}
        fill={colors.dark[0]}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      
      {/* Continue building outward... */}
      {/* This is a simplified version - full pattern would have all strips */}
    </svg>
  );
};

// Example usage:
// <LogCabinBlock 
//   size={200} 
//   colors={{
//     center: '#e76f51',
//     light: ['#faf8f3', '#f4f3ee'],
//     dark: ['#264653', '#2a9d8f']
//   }}
// />
