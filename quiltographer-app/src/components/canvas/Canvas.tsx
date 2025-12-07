'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GridConfig } from '@/types/pattern';
import { useCanvasStore } from '@/store/canvas-store';
import { CanvasPattern } from './CanvasPattern';

interface CanvasProps {
  className?: string;
  width?: number;
  height?: number;
  grid?: GridConfig;
}

export const Canvas: React.FC<CanvasProps> = ({
  className,
  width = 800,
  height = 600,
  grid = {
    size: 800,
    divisions: 16,
    visible: true,
    snap: true,
    color: '#e5e5e5'
  }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const { patterns, selectedPatternId, selectPattern, isDragging, updateDragging, stopDragging } = useCanvasStore();

  const gridSpacing = grid.size / grid.divisions;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;
    
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    updateDragging(svgP.x, svgP.y);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      stopDragging();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      stopDragging();
    }
  };

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        stopDragging();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, stopDragging]);

  // Add keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPatternId) return;
      
      if (e.key === 'r' || e.key === 'R') {
        // Rotate selected pattern by 45 degrees
        const pattern = patterns.find(p => p.id === selectedPatternId);
        if (pattern) {
          const newRotation = (pattern.rotation + 45) % 360;
          useCanvasStore.getState().updatePattern(selectedPatternId, { rotation: newRotation });
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected pattern
        useCanvasStore.getState().deletePattern(selectedPatternId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPatternId, patterns]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-gray-50 rounded-lg border-2 border-gray-200", className)}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="cursor-crosshair"
        style={{ backgroundColor: '#f9f9f9' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >        {/* Grid */}
        {grid.visible && (
          <g className="grid" opacity={0.3}>
            {/* Vertical lines */}
            {Array.from({ length: Math.floor(width / gridSpacing) + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * gridSpacing}
                y1={0}
                x2={i * gridSpacing}
                y2={height}
                stroke={grid.color}
                strokeWidth={i % 4 === 0 ? 2 : 1}
              />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: Math.floor(height / gridSpacing) + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * gridSpacing}
                x2={width}
                y2={i * gridSpacing}
                stroke={grid.color}
                strokeWidth={i % 4 === 0 ? 2 : 1}
              />
            ))}
          </g>
        )}
        
        {/* Pattern elements */}
        <g className="pattern-elements">
          {patterns.map((pattern) => (
            <CanvasPattern
              key={pattern.id}
              pattern={pattern}
              isSelected={pattern.id === selectedPatternId}
              onSelect={() => selectPattern(pattern.id)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};