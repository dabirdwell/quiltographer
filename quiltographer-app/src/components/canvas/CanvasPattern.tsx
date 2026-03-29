import React from 'react';
import { PatternInstance } from '@/store/canvas-store';
import { LogCabinBlock } from '@/components/patterns/LogCabinBlock';
import { FlyingGeeseBlock } from '@/components/patterns/FlyingGeeseBlock';
import { NinePatchBlock } from '@/components/patterns/NinePatchBlock';
import { SashikoCrossBlock } from '@/components/patterns/SashikoCrossBlock';
import { StarBlock } from '@/components/patterns/StarBlock';
import { PinwheelBlock } from '@/components/patterns/PinwheelBlock';
import { BowTieBlock } from '@/components/patterns/BowTieBlock';
import { ChurnDashBlock } from '@/components/patterns/ChurnDashBlock';
import { BearPawBlock } from '@/components/patterns/BearPawBlock';
import { DrunkardPathBlock } from '@/components/patterns/DrunkardPathBlock';
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
        return <FlyingGeeseBlock size={100} colors={pattern.colors as any} />;
      case 'nine-patch':
        return <NinePatchBlock size={100} colors={pattern.colors as any} />;
      case 'sashiko-cross':
        return <SashikoCrossBlock size={100} colors={pattern.colors as any} />;
      case 'star':
        return <StarBlock size={100} colors={pattern.colors as any} />;
      case 'pinwheel':
        return <PinwheelBlock size={100} colors={pattern.colors as any} />;
      case 'bow-tie':
        return <BowTieBlock size={100} colors={pattern.colors as any} />;
      case 'churn-dash':
        return <ChurnDashBlock size={100} colors={pattern.colors as any} />;
      case 'bear-paw':
        return <BearPawBlock size={100} colors={pattern.colors as any} />;
      case 'drunkard-path':
        return <DrunkardPathBlock size={100} colors={pattern.colors as any} />;
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