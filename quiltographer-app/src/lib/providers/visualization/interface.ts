import { ProviderResult } from '../types';
import { StepDiagram, ComprehendedStep } from '@/types/comprehension';

export interface DiagramOptions {
  style?: 'minimal' | 'detailed';
  colorPalette?: string[];
}

// Interface for visualization providers
export interface VisualizationProvider {
  name: string;

  // Generate diagram for a step
  generateDiagram(
    step: ComprehendedStep,
    options?: DiagramOptions
  ): Promise<ProviderResult<StepDiagram>>;

  // Check if provider is available
  isAvailable(): Promise<boolean>;
}

// Template-based visualization (preferred for consistency)
export interface DiagramTemplate {
  type: string;
  generate: (params: Record<string, unknown>) => string;  // Returns SVG
}

// Parameters for different diagram types
export interface StripArrangementParams {
  strips: Array<{ color: string; label: string }>;
  direction?: 'horizontal' | 'vertical';
  showSeams?: boolean;
}

export interface HSTParams {
  color1: string;
  color2: string;
  label1?: string;
  label2?: string;
  size?: number;
}

export interface CuttingParams {
  shape: 'strip' | 'square' | 'triangle' | 'rectangle';
  width: string;
  height?: string;
  quantity?: number;
  fromFabric?: string;
}

export interface PressingParams {
  direction: 'left' | 'right' | 'open' | 'toward-dark';
}

export interface AssemblyParams {
  units: Array<{ label: string; color: string }>;
  layout: 'row' | 'column' | 'grid';
  gridCols?: number;
}
