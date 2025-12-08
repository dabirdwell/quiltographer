import { ProviderResult } from '../types';
import { ExtractedDocument } from '../extraction/interface';
import { PatternMetadata, PatternMaterial, ComprehendedStep } from '@/types/comprehension';

export interface StepContext {
  patternName: string;
  stepNumber: number;
  totalSteps: number;
  previousSteps: string[];
  nextSteps: string[];
}

export type ComprehendedStepData = Omit<
  ComprehendedStep,
  'number' | 'originalTitle' | 'originalInstruction' | 'diagram'
>;

// Interface all comprehension providers must implement
export interface ComprehensionProvider {
  name: string;

  // Understand the overall pattern
  comprehendOverview(
    document: ExtractedDocument
  ): Promise<ProviderResult<PatternMetadata>>;

  // Comprehend a single step deeply
  comprehendStep(
    step: { title: string; instruction: string },
    context: StepContext
  ): Promise<ProviderResult<ComprehendedStepData>>;

  // Extract materials with purpose
  comprehendMaterials(
    document: ExtractedDocument,
    overview: PatternMetadata
  ): Promise<ProviderResult<PatternMaterial[]>>;

  // Check if provider is available
  isAvailable(): Promise<boolean>;
}
