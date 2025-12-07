'use client';

import React, { useState, useEffect } from 'react';
import { PatternRenderer } from '@/lib/patterns/renderer';
import { featherMeander } from '@/lib/patterns/patterns/featherMeander';
import { PatternDefinition } from '@/lib/patterns/schema';

interface EdgeToEdgeDesignerProps {
  width?: number;
  height?: number;
}

export function EdgeToEdgeDesigner({ 
  width = 800, 
  height = 600 
}: EdgeToEdgeDesignerProps) {
  const [pattern, setPattern] = useState<PatternDefinition>(featherMeander);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showPath, setShowPath] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(pattern.variants[0]?.id);
  const [svgContent, setSvgContent] = useState('');
  
  // Get current variant and density
  const currentVariant = pattern.variants.find(v => v.id === selectedVariant);
  const density = currentVariant?.stitchDensity || pattern.longarmProperties?.density.default || 10;
  
  // Calculate estimates based on current settings
  // Scale affects the QUILT SIZE, not pattern size
  const renderer = new PatternRenderer(pattern);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const timeEstimate = renderer.calculateTimeEstimate(scaledWidth, scaledHeight);
  const threadEstimate = renderer.calculateThreadUsage(scaledWidth, scaledHeight, density);
  
  // Time increases with density
  const densityMultiplier = density / (pattern.longarmProperties?.density.default || 10);
  const adjustedTime = timeEstimate * densityMultiplier;  
  useEffect(() => {
    const renderer = new PatternRenderer(pattern);
    const svg = renderer.renderToSVG({
      width,
      height,
      scale,
      showGrid,
      showPath,
      variantId: selectedVariant,
      backgroundColor: '#fafafa'
    });
    setSvgContent(svg);
  }, [pattern, scale, showGrid, showPath, selectedVariant, width, height]);
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  const formatThread = (meters: number): string => {
    return `${Math.round(meters)}m (${Math.round(meters * 1.094)} yards)`;
  };
  
  return (
    <div className="edge-to-edge-designer">
      <div className="flex gap-6">
        {/* Canvas */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-medium">Edge-to-Edge Pattern Preview</h3>
              <p className="text-sm text-gray-600 mt-1">
                {pattern.name} - Quilt size: {Math.round(scaledWidth / 25.4)}" × {Math.round(scaledHeight / 25.4)}"
              </p>
            </div>            
            <div className="p-4">
              <div 
                className="border-2 border-gray-300 rounded overflow-hidden bg-white"
                style={{ 
                  width: `${width}px`, 
                  height: `${height}px`,
                  maxWidth: '100%'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="w-80">
          {/* Pattern Info */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h4 className="font-medium mb-3">Pattern Details</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Category:</dt>
                <dd className="font-medium">{pattern.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Continuous:</dt>
                <dd className="font-medium">
                  {pattern.longarmProperties?.stitchPath.continuous ? 'Yes' : 'No'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Difficulty:</dt>
                <dd className="font-medium">Beginner</dd>
              </div>
            </dl>
          </div>          
          {/* Estimates - Updates with changes */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-3">Quilting Estimates</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-blue-700">Time:</dt>
                <dd className="font-medium text-blue-900">{formatTime(adjustedTime)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-700">Thread:</dt>
                <dd className="font-medium text-blue-900">{formatThread(threadEstimate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-700">Cost:</dt>
                <dd className="font-medium text-blue-900">
                  ${(threadEstimate * 0.02).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-blue-200">
                <dt className="text-blue-600">Density:</dt>
                <dd className="text-blue-800">{density} stitches/inch</dd>
              </div>
              <div className="flex justify-between text-xs">
                <dt className="text-blue-600">Coverage:</dt>
                <dd className="text-blue-800">{Math.round(scaledWidth * scaledHeight / 645.16)} sq inches</dd>
              </div>
            </dl>
          </div>          
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h4 className="font-medium mb-4">Pattern Controls</h4>
            
            {/* Scale */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Quilt Size: {scale}x ({Math.round(scaledWidth / 25.4)}" × {Math.round(scaledHeight / 25.4)}")
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Small</span>
                <span>Standard</span>
                <span>Large</span>
              </div>
            </div>
            
            {/* Variant */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Pattern Density
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {pattern.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} 
                    {variant.stitchDensity && ` (${variant.stitchDensity} stitches/inch)`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Higher density = more pattern repeats per area
              </p>
            </div>
            
            {/* View Options */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Grid</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPath}
                  onChange={(e) => setShowPath(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Stitch Path</span>
              </label>
            </div>
            
            {/* Export */}
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Export to Machine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}