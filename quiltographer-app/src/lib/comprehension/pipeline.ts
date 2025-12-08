import { providerRegistry } from '../providers/registry';
import {
  ComprehendedPattern,
  ComprehendedStep,
  PipelineProgress,
  StepDiagram,
} from '@/types/comprehension';
import { ExtractedDocument } from '../providers/extraction/interface';

// Progress callback type
export type ProgressCallback = (progress: PipelineProgress) => void;

// Pipeline options
export interface PipelineOptions {
  extractionProvider?: string;
  comprehensionProvider?: string;
  visualizationProvider?: string;
  onProgress?: ProgressCallback;
  skipDiagrams?: boolean;
}

// Identify steps from extracted markdown
function identifySteps(markdown: string): Array<{ title: string; instruction: string }> {
  const steps: Array<{ title: string; instruction: string }> = [];

  // Split by common step patterns
  const lines = markdown.split('\n');
  let currentStep: { title: string; instruction: string } | null = null;

  for (const line of lines) {
    // Match step headers: "Step 1:", "1.", "## Step 1", etc.
    const stepMatch = line.match(/^(?:#{1,3}\s*)?(?:Step\s+)?(\d+)[.:)]\s*(.*)$/i) ||
                      line.match(/^#{1,3}\s+(.+)$/);

    if (stepMatch) {
      // Save previous step
      if (currentStep && currentStep.instruction.trim()) {
        steps.push(currentStep);
      }

      // Start new step
      currentStep = {
        title: stepMatch[2]?.trim() || stepMatch[1]?.trim() || `Step ${steps.length + 1}`,
        instruction: '',
      };
    } else if (currentStep) {
      // Add content to current step
      currentStep.instruction += line + '\n';
    }
  }

  // Don't forget the last step
  if (currentStep && currentStep.instruction.trim()) {
    steps.push(currentStep);
  }

  // If no steps found, treat entire content as one step
  if (steps.length === 0 && markdown.trim()) {
    steps.push({
      title: 'Instructions',
      instruction: markdown,
    });
  }

  return steps;
}

// Generate a unique ID
function generateId(): string {
  return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Main comprehension pipeline
export async function comprehendPattern(
  pdfBuffer: Buffer,
  options: PipelineOptions = {}
): Promise<ComprehendedPattern> {
  const startTime = Date.now();
  const { onProgress, skipDiagrams = false } = options;

  // Initialize providers
  await providerRegistry.initialize();

  // Check availability
  const availability = await providerRegistry.checkAvailability();
  if (!availability.ready) {
    throw new Error(`Missing providers: ${availability.missing.join(', ')}`);
  }

  // ========== STAGE 1: EXTRACTION ==========
  onProgress?.({
    stage: 'extraction',
    progress: 5,
    message: 'Extracting document content...',
  });

  const extractionProvider = await providerRegistry.getExtractionProvider(
    options.extractionProvider
  );

  const extraction = await extractionProvider.extract(pdfBuffer);

  if (!extraction.success || !extraction.data) {
    throw new Error(`Extraction failed: ${extraction.error}`);
  }

  console.log(`[Pipeline] Extraction complete in ${extraction.latency}ms`);

  // ========== STAGE 2: OVERVIEW ==========
  onProgress?.({
    stage: 'overview',
    progress: 15,
    message: 'Understanding pattern structure...',
  });

  const comprehensionProvider = await providerRegistry.getComprehensionProvider(
    options.comprehensionProvider
  );

  const overview = await comprehensionProvider.comprehendOverview(extraction.data);

  if (!overview.success || !overview.data) {
    throw new Error(`Overview comprehension failed: ${overview.error}`);
  }

  console.log(`[Pipeline] Overview complete: ${overview.data.name}`);

  // ========== STAGE 3: MATERIALS ==========
  onProgress?.({
    stage: 'materials',
    progress: 25,
    message: 'Analyzing materials...',
  });

  const materials = await comprehensionProvider.comprehendMaterials(
    extraction.data,
    overview.data
  );

  console.log(`[Pipeline] Materials: ${materials.data?.length || 0} items`);

  // ========== STAGE 4: STEPS ==========
  onProgress?.({
    stage: 'steps',
    progress: 30,
    message: 'Identifying steps...',
  });

  const rawSteps = identifySteps(extraction.data.markdown);
  const totalSteps = rawSteps.length;

  console.log(`[Pipeline] Found ${totalSteps} steps to comprehend`);

  const comprehendedSteps: ComprehendedStep[] = [];

  for (let i = 0; i < rawSteps.length; i++) {
    onProgress?.({
      stage: 'steps',
      progress: 30 + (i / totalSteps) * 40,
      message: `Comprehending step ${i + 1} of ${totalSteps}...`,
      currentStep: i + 1,
      totalSteps,
    });

    const stepResult = await comprehensionProvider.comprehendStep(
      rawSteps[i],
      {
        patternName: overview.data.name,
        stepNumber: i + 1,
        totalSteps,
        previousSteps: rawSteps.slice(0, i).map(s => s.title),
        nextSteps: rawSteps.slice(i + 1).map(s => s.title),
      }
    );

    if (stepResult.success && stepResult.data) {
      comprehendedSteps.push({
        number: i + 1,
        originalTitle: rawSteps[i].title,
        originalInstruction: rawSteps[i].instruction.trim(),
        ...stepResult.data,
        diagram: {
          type: 'custom',
          svgCode: '',
          caption: '',
          altText: rawSteps[i].title,
        },
      });
    } else {
      // Fallback for failed step comprehension
      comprehendedSteps.push({
        number: i + 1,
        originalTitle: rawSteps[i].title,
        originalInstruction: rawSteps[i].instruction.trim(),
        clarifiedTitle: rawSteps[i].title,
        clarifiedInstruction: rawSteps[i].instruction.trim(),
        whyThisMatters: '',
        whatYouCreate: '',
        quantityToMake: null,
        unitName: null,
        beforeState: '',
        afterState: '',
        techniques: [],
        toolsNeeded: [],
        commonMistakes: [],
        proTips: [],
        warnings: [],
        measurements: [],
        estimatedTime: '',
        isGoodStoppingPoint: false,
        stoppingPointReason: null,
        diagram: {
          type: 'custom',
          svgCode: '',
          caption: '',
          altText: rawSteps[i].title,
        },
      });
    }
  }

  // ========== STAGE 5: DIAGRAMS ==========
  if (!skipDiagrams) {
    onProgress?.({
      stage: 'diagrams',
      progress: 75,
      message: 'Generating visual diagrams...',
    });

    const visualizationProvider = await providerRegistry.getVisualizationProvider(
      options.visualizationProvider
    );

    for (let i = 0; i < comprehendedSteps.length; i++) {
      onProgress?.({
        stage: 'diagrams',
        progress: 75 + (i / comprehendedSteps.length) * 20,
        message: `Creating diagram ${i + 1} of ${comprehendedSteps.length}...`,
      });

      const diagramResult = await visualizationProvider.generateDiagram(comprehendedSteps[i]);

      if (diagramResult.success && diagramResult.data) {
        comprehendedSteps[i].diagram = diagramResult.data;
      }
    }
  }

  // ========== COMPLETE ==========
  const processingTime = Date.now() - startTime;

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'Pattern comprehension complete!',
  });

  console.log(`[Pipeline] Complete in ${processingTime}ms`);

  return {
    id: generateId(),
    uploadedAt: new Date().toISOString(),
    processingTime,
    metadata: overview.data,
    materials: materials.data || [],
    steps: comprehendedSteps,
    assembly: {
      units: [],
      overviewDiagram: '',
      flow: [],
    },
    originalText: extraction.data.text,
  };
}

// Simplified function for just extracting text
export async function extractPatternText(pdfBuffer: Buffer): Promise<ExtractedDocument> {
  await providerRegistry.initialize();
  const provider = await providerRegistry.getExtractionProvider();
  const result = await provider.extract(pdfBuffer);

  if (!result.success || !result.data) {
    throw new Error(`Extraction failed: ${result.error}`);
  }

  return result.data;
}
