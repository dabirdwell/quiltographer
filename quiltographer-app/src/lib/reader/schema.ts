// Pattern Reader Schema
// Simplified version of UniversalPattern for Pattern Reader UI
// Full schema in /packages/core/patterns/universal-schema.ts

export interface ReaderPattern {
  id: string;
  name: string;
  description?: string;
  difficulty: 1 | 2 | 3 | 4 | 5 | number;
  estimatedTime: number; // hours
  finishedSize: { width: number; height: number; unit: 'inches' | 'cm' };

  materials: MaterialRequirement[];
  cuttingInstructions: CuttingInstruction[];
  steps: ConstructionStep[];

  summary?: string; // AI-generated
  source: {
    fileName?: string;
    parsedAt: Date | string;
    pages?: number;
    designer?: string;
  };
}

export interface MaterialRequirement {
  id: string;
  name: string;
  type: 'fabric' | 'notion' | 'tool' | 'thread' | string;
  amount?: string;
  quantity?: string;
  notes?: string;
}

export interface CuttingInstruction {
  id: string;
  fabric: string;
  pieces: {
    shape: 'square' | 'rectangle' | 'triangle' | 'strip' | 'custom';
    quantity: number;
    dimensions: string;
    notes?: string;
  }[];
  tips?: string[];
}

export interface ConstructionStep {
  id: string;
  number: number;
  title?: string;
  section?: string;
  instruction: string;
  clarifiedInstruction?: string;
  techniques: string[];
  warnings: Warning[];
  tips: Tip[];
  imageUrl?: string;
  estimatedTime?: number;
}

export interface Warning {
  type: 'critical' | 'important' | 'tip';
  message: string;
}

export interface Tip {
  text: string;
  source?: 'ai' | 'pattern' | 'community';
}

export function createEmptyPattern(): ReaderPattern {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Pattern',
    difficulty: 3,
    estimatedTime: 0,
    finishedSize: { width: 0, height: 0, unit: 'inches' },
    materials: [],
    cuttingInstructions: [],
    steps: [],
    source: { parsedAt: new Date() },
  };
}
