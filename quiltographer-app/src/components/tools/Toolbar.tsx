'use client';

import React from 'react';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Triangle,
  Palette,
  Grid3x3,
  Download,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ className }) => {
  const tools = [
    { icon: MousePointer2, label: 'Select', active: true },
    { icon: Square, label: 'Rectangle' },
    { icon: Circle, label: 'Circle' },
    { icon: Triangle, label: 'Triangle' },
    { icon: Palette, label: 'Color' },
    { icon: Grid3x3, label: 'Grid' },
  ];

  return (
    <div className={cn("bg-gray-100 rounded-lg p-2 flex gap-1 border border-gray-200", className)}>
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <button
            key={index}
            className={cn(
              "p-2 rounded hover:bg-gray-200 transition-colors",
              tool.active && "bg-indigo text-white"
            )}
            title={tool.label}
          >
            <Icon size={20} />
          </button>
        );
      })}
      
      <div className="mx-2 w-px bg-gray-300" />
      
      <button className="p-2 rounded hover:bg-gray-200 transition-colors" title="Save">
        <Save size={20} />
      </button>
      <button className="p-2 rounded hover:bg-gray-200 transition-colors" title="Export">
        <Download size={20} />
      </button>
    </div>
  );
};
