'use client';

import React from 'react';

interface StarBlockProps {
  size: number;
  colors: {
    star: string;
    corner: string;
    background: string;
  };
  strokeWidth?: number;
}

export const StarBlock: React.FC<StarBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const u = size / 4; // Ohio Star uses a 4x4 grid

  // Corner squares (4 corners)
  const corners = [
    { x: 0, y: 0 },
    { x: 3 * u, y: 0 },
    { x: 0, y: 3 * u },
    { x: 3 * u, y: 3 * u },
  ];

  // Center square
  const center = { x: u, y: u, w: 2 * u, h: 2 * u };

  // HST (half-square triangle) units for star points
  // Top row center: star point up-right and up-left
  // Left column center: star point left
  // Right column center: star point right
  // Bottom row center: star point down
  const starPoints = [
    // Top-center: two triangles forming star point upward
    `M ${u} 0 L ${2 * u} 0 L ${2 * u} ${u} Z`, // background triangle
    `M ${u} 0 L ${u} ${u} L ${2 * u} ${u} Z`,   // star triangle (points left-down)
    `M ${2 * u} 0 L ${3 * u} 0 L ${2 * u} ${u} Z`, // star triangle (points right-down)
    `M ${2 * u} ${u} L ${3 * u} 0 L ${3 * u} ${u} Z`, // background triangle

    // Left-center
    `M 0 ${u} L ${u} ${u} L ${u} ${2 * u} Z`,   // star triangle
    `M 0 ${u} L 0 ${2 * u} L ${u} ${2 * u} Z`,   // background triangle
    `M 0 ${2 * u} L ${u} ${2 * u} L ${u} ${3 * u} Z`, // background triangle
    `M 0 ${2 * u} L 0 ${3 * u} L ${u} ${3 * u} Z`, // star triangle

    // Right-center
    `M ${3 * u} ${u} L ${4 * u} ${u} L ${3 * u} ${2 * u} Z`, // background triangle
    `M ${4 * u} ${u} L ${4 * u} ${2 * u} L ${3 * u} ${2 * u} Z`, // star triangle
    `M ${3 * u} ${2 * u} L ${4 * u} ${2 * u} L ${4 * u} ${3 * u} Z`, // star triangle
    `M ${3 * u} ${2 * u} L ${3 * u} ${3 * u} L ${4 * u} ${3 * u} Z`, // background triangle

    // Bottom-center
    `M ${u} ${3 * u} L ${2 * u} ${3 * u} L ${u} ${4 * u} Z`,   // background triangle
    `M ${2 * u} ${3 * u} L ${u} ${4 * u} L ${2 * u} ${4 * u} Z`, // star triangle
    `M ${2 * u} ${3 * u} L ${3 * u} ${3 * u} L ${3 * u} ${4 * u} Z`, // background triangle
    `M ${2 * u} ${3 * u} L ${2 * u} ${4 * u} L ${3 * u} ${4 * u} Z`, // star triangle
  ];

  // Categorize: even indices are background, odd are star
  const starFills = [
    colors.background, colors.star, colors.star, colors.background, // top
    colors.star, colors.background, colors.background, colors.star, // left
    colors.background, colors.star, colors.star, colors.background, // right
    colors.background, colors.star, colors.background, colors.star, // bottom
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corner squares */}
      {corners.map((c, i) => (
        <rect
          key={`corner-${i}`}
          x={c.x} y={c.y}
          width={u} height={u}
          fill={colors.corner}
          stroke="#000" strokeWidth={strokeWidth}
        />
      ))}

      {/* Center square */}
      <rect
        x={center.x} y={center.y}
        width={center.w} height={center.h}
        fill={colors.star}
        stroke="#000" strokeWidth={strokeWidth}
      />

      {/* Star point triangles */}
      {starPoints.map((d, i) => (
        <path
          key={`tri-${i}`}
          d={d}
          fill={starFills[i]}
          stroke="#000" strokeWidth={strokeWidth}
        />
      ))}
    </svg>
  );
};
