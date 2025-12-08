// Pattern comprehension types for the AI pipeline

export interface PatternMetadata {
  name: string;
  designer: string | null;
  finishedSize: {
    width: number;
    height: number;
    unit: 'inches' | 'cm';
  } | null;
  difficulty: 'beginner' | 'confident-beginner' | 'intermediate' | 'advanced';
  difficultyExplanation: string;
  techniquesSummary: string[];
  estimatedTime: string | null;
}

export interface PatternMaterial {
  item: string;
  quantity: string;
  purpose: string;
  usedInSteps: number[];
  substitutionNotes?: string;
}

export interface Measurement {
  value: number;
  unit: 'inches' | 'cm';
  original: string;
  context: string;
}

export interface CommonMistake {
  mistake: string;
  consequence: string;
  prevention: string;
}

export interface StepDiagram {
  type: 'strip-arrangement' | 'hst' | 'cutting' | 'pressing' | 'assembly' | 'custom';
  svgCode: string;
  caption: string;
  altText: string;
}

export interface ComprehendedStep {
  number: number;
  originalTitle: string;
  originalInstruction: string;
  clarifiedTitle: string;
  clarifiedInstruction: string;
  whyThisMatters: string;
  whatYouCreate: string;
  quantityToMake: number | null;
  unitName: string | null;
  beforeState: string;
  afterState: string;
  techniques: string[];
  toolsNeeded: string[];
  commonMistakes: CommonMistake[];
  proTips: string[];
  warnings: string[];
  measurements: Measurement[];
  estimatedTime: string;
  isGoodStoppingPoint: boolean;
  stoppingPointReason: string | null;
  diagram: StepDiagram;
  diagramType?: string;
  diagramParams?: Record<string, unknown>;
}

export interface AssemblyUnit {
  name: string;
  quantity: number;
  diagram?: string;
}

export interface AssemblyFlow {
  from: string;
  to: string;
  action: string;
}

export interface PatternAssembly {
  units: AssemblyUnit[];
  overviewDiagram: string;
  flow: AssemblyFlow[];
}

export interface ComprehendedPattern {
  id: string;
  uploadedAt: string;
  processingTime: number;
  metadata: PatternMetadata;
  materials: PatternMaterial[];
  steps: ComprehendedStep[];
  assembly: PatternAssembly;
  originalText: string;
}

// Pipeline progress tracking
export interface PipelineProgress {
  stage: 'extraction' | 'overview' | 'materials' | 'steps' | 'diagrams' | 'complete';
  progress: number;  // 0-100
  message: string;
  currentStep?: number;
  totalSteps?: number;
}
