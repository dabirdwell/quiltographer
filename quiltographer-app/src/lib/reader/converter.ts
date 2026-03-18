// Convert ComprehendedPattern from the AI pipeline to ReaderPattern for UI
import type { ComprehendedPattern, ComprehendedStep } from '@/types/comprehension';
import type { ReaderPattern, ConstructionStep, MaterialRequirement, Warning, Tip } from './schema';

export function comprehendedToReaderPattern(
  comprehended: ComprehendedPattern,
  fileName?: string
): ReaderPattern {
  // Convert difficulty string to number
  const difficultyMap: Record<string, number> = {
    'beginner': 1,
    'confident-beginner': 2,
    'intermediate': 3,
    'advanced': 4,
  };

  // Convert materials
  const materials: MaterialRequirement[] = comprehended.materials.map((m, i) => ({
    id: `mat-${i}`,
    name: m.item,
    type: guessMaterialType(m.item),
    quantity: m.quantity,
    notes: m.substitutionNotes || m.purpose,
  }));

  // Convert steps
  const steps: ConstructionStep[] = comprehended.steps.map(convertStep);

  return {
    id: comprehended.id,
    name: comprehended.metadata.name,
    description: comprehended.metadata.difficultyExplanation,
    difficulty: difficultyMap[comprehended.metadata.difficulty] || 3,
    estimatedTime: parseEstimatedTime(comprehended.metadata.estimatedTime),
    finishedSize: comprehended.metadata.finishedSize || { width: 0, height: 0, unit: 'inches' },
    materials,
    cuttingInstructions: [], // Could be extracted from steps
    steps,
    summary: `${comprehended.metadata.name} by ${comprehended.metadata.designer || 'Unknown Designer'}. ` +
             `Techniques: ${comprehended.metadata.techniquesSummary.join(', ')}.`,
    source: {
      fileName,
      parsedAt: new Date(comprehended.uploadedAt),
      designer: comprehended.metadata.designer || undefined,
    },
  };
}

function convertStep(step: ComprehendedStep): ConstructionStep {
  const warnings: Warning[] = [
    ...step.warnings.map(w => ({ type: 'critical' as const, message: w })),
    ...step.commonMistakes.map(m => ({ 
      type: 'important' as const, 
      message: `${m.mistake} → ${m.prevention}` 
    })),
  ];

  const tips: Tip[] = step.proTips.map(t => ({
    text: t,
    source: 'ai' as const,
  }));

  return {
    id: `step-${step.number}`,
    number: step.number,
    title: step.clarifiedTitle || step.originalTitle,
    section: step.whatYouCreate || undefined,
    instruction: step.clarifiedInstruction || step.originalInstruction,
    clarifiedInstruction: step.clarifiedInstruction,
    techniques: step.techniques,
    warnings,
    tips,
    estimatedTime: parseEstimatedTime(step.estimatedTime),
    // Store rich data for enhanced display
    _comprehended: step,
  } as ConstructionStep & { _comprehended?: ComprehendedStep };
}

function guessMaterialType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('fabric') || lower.includes('cotton') || lower.includes('kona')) return 'fabric';
  if (lower.includes('thread')) return 'thread';
  if (lower.includes('batting') || lower.includes('backing') || lower.includes('binding')) return 'fabric';
  if (lower.includes('ruler') || lower.includes('template') || lower.includes('scissors') || 
      lower.includes('cutter') || lower.includes('mat') || lower.includes('machine') ||
      lower.includes('iron') || lower.includes('pins')) return 'tool';
  return 'notion';
}

function parseEstimatedTime(timeStr: string | null): number {
  if (!timeStr) return 0;
  // Parse strings like "30 minutes", "2 hours", etc.
  const minuteMatch = timeStr.match(/(\d+)\s*min/i);
  const hourMatch = timeStr.match(/(\d+)\s*hour/i);
  
  let minutes = 0;
  if (minuteMatch) minutes += parseInt(minuteMatch[1], 10);
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
  
  return minutes / 60; // Return hours
}
