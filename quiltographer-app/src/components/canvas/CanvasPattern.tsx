import React from 'react';
import { PatternInstance } from '@/store/canvas-store';
import { LogCabinBlock } from '@/components/patterns/LogCabinBlock';
import { useCanvasStore } from '@/store/canvas-store';

interface CanvasPatternProps {
  pattern: PatternInstance;
  isSelected: boolean;
  onSelect: () => void;
}

export const CanvasPattern: React.FC<CanvasPatternProps> = ({
  pattern,
  isSelected,
  onSelect
}) => {
  const { startDragging, updateDragging, stopDragging } = useCanvasStore();

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>) => {
    e.preventDefault();
    onSelect();
    
    // Calculate offset from pattern center
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const offsetX = svgP.x - pattern.x;
    const offsetY = svgP.y - pattern.y;
    
    startDragging(pattern.id, offsetX, offsetY);
  };

  const renderPattern = () => {
    switch (pattern.type) {
      case 'log-cabin':
        return (
          <LogCabinBlock
            size={100}
            colors={pattern.colors as any}
          />
        );
      case 'flying-geese':
        // Placeholder for Flying Geese pattern
        return (
          <rect width="100" height="100" fill="#264653" />
        );
      case 'nine-patch':
        // Placeholder for Nine Patch pattern
        return (
          <rect width="100" height="100" fill="#84a98c" />
        );
      case 'sashiko-cross':
        // Placeholder for Sashiko Cross pattern
        return (
          <rect width="100" height="100" fill="#e76f51" />
        );
      default:
        return null;
    }
  };

  return (
    <g
      transform={`translate(${pattern.x}, ${pattern.y}) rotate(${pattern.rotation}) scale(${pattern.scale})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'move' }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <rect
          x="-55"
          y="-55"
          width="110"
          height="110"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}
      
      {/* Pattern */}
      <g transform="translate(-50, -50)">
        {renderPattern()}
      </g>
    </g>
  );
};