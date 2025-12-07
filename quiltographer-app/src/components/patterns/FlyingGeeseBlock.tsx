'use client';

import React from 'react';

interface FlyingGeeseBlockProps {
  size: number;
  colors: {
    goose: string;
    background: string;
  };
  strokeWidth?: number;
}

export const FlyingGeeseBlock: React.FC<FlyingGeeseBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const width = size;
  const height = size / 2; // Flying geese are typically 2:1 ratio
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background triangles */}
      <path
        d={`M 0 0 L ${width/2} 0 L 0 ${height} Z`}
        fill={colors.background}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      <path
        d={`M ${width/2} 0 L ${width} 0 L ${width} ${height} Z`}
        fill={colors.background}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      
      {/* Flying goose triangle */}
      <path
        d={`M 0 ${height} L ${width/2} 0 L ${width} ${height} Z`}
        fill={colors.goose}
        stroke="#000"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
