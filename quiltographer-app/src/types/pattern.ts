// Core types for the Quiltographer pattern system

export interface Vector2D {
  x: number;
  y: number;
}

export interface PatternElement {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'polygon';
  position: Vector2D;
  rotation: number;
  scale: Vector2D;
  style: PatternStyle;
  data: any; // SVG path data or shape properties
}

export interface PatternStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface Pattern {
  id: string;
  name: string;
  category: 'traditional' | 'modern' | 'japanese' | 'custom';
  difficulty: 1 | 2 | 3 | 4 | 5;
  elements: PatternElement[];
  size: number;
  metadata?: {
    author?: string;
    created?: Date;
    description?: string;
    tags?: string[];
  };
}

export interface GridConfig {
  size: number;
  divisions: number;
  visible: boolean;
  snap: boolean;
  color: string;
}
