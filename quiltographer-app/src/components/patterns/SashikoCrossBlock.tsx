'use client';

import React from 'react';

interface SashikoCrossBlockProps {
  size: number;
  colors: {
    thread: string;
    background: string;
  };
  strokeWidth?: number;
}

export const SashikoCrossBlock: React.FC<SashikoCrossBlockProps> = ({
  size,
  colors,
  strokeWidth = 0.5
}) => {
  const unit = size / 8;
  const dash = `${unit * 0.6},${unit * 0.4}`;

  // Jūji-tsunagi (cross-linked) sashiko: grid of interlocking crosses
  const crosses: React.ReactNode[] = [];

  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      const cx = col * 2 * unit;
      const cy = row * 2 * unit;
      const arm = unit * 0.8;

      // Vertical bar
      crosses.push(
        <line
          key={`v-${row}-${col}`}
          x1={cx} y1={cy - arm}
          x2={cx} y2={cy + arm}
          stroke={colors.thread}
          strokeWidth={unit * 0.18}
          strokeDasharray={dash}
          strokeLinecap="round"
        />
      );
      // Horizontal bar
      crosses.push(
        <line
          key={`h-${row}-${col}`}
          x1={cx - arm} y1={cy}
          x2={cx + arm} y2={cy}
          stroke={colors.thread}
          strokeWidth={unit * 0.18}
          strokeDasharray={dash}
          strokeLinecap="round"
        />
      );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} fill={colors.background} stroke="#000" strokeWidth={strokeWidth} />
      {crosses}
    </svg>
  );
};
