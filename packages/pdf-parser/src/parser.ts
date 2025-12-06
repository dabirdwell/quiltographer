// PDF Parser for Quilt Patterns
// Converts PDF patterns into Universal Pattern Schema

import * as pdf from 'pdf-parse';
import { 
  UniversalPattern, 
  ConstructionStep, 
  CuttingInstruction,
  FabricRequirement,
  ParsedSection,
  parseImperialMeasurement,
  expandAbbreviation,
  QUILT_ABBREVIATIONS
} from '../../core/patterns/universal-schema';

// Section identification patterns
const SECTION_PATTERNS = {
  materials: /(?:materials?|supplies|you\s+will\s+need|fabric\s+requirements?)/i,
  cutting: /(?:cutting\s+instructions?|cutting|cut\s+the\s+following)/i,
  construction: /(?:instructions?|assembly|piecing|construction|directions?)/i,
  finishing: /(?:finishing|binding|quilting)/i
};

// Common measurement patterns
const MEASUREMENT_REGEX = /(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']\s*x\s*(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']?/g;
const SINGLE_MEASUREMENT_REGEX = /(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']/g;
const STRIP_REGEX = /(?:cut\s+)?(\d+)\s+strips?\s+(?:each\s+)?(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']\s*(?:wide|x\s*WOF)?/gi;

export interface ParserOptions {
  expandAbbreviations?: boolean;
  addClarifications?: boolean;
  generateDiagrams?: boolean;
}

export class QuiltPatternParser {
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      expandAbbreviations: true,
      addClarifications: true,
      generateDiagrams: true,
      ...options
    };
  }

  /**
   * Main parsing function
   */
  async parsePattern(pdfBuffer: Buffer): Promise<UniversalPattern> {
    // Extract text from PDF
    const pdfData = await pdf(pdfBuffer);
    const rawText = pdfData.text;
    
    // Identify sections
    const sections = this.identifySections(rawText);
    
    // Parse each section
    const metadata = this.parseMetadata(rawText, sections);
    const materials = this.parseMaterials(sections.materials);
    const cutting = this.parseCutting(sections.cutting);
    const steps = this.parseConstructionSteps(sections.construction);
    
    // Build the pattern
    return this.buildPattern({
      metadata,
      materials,
      cutting,
      steps,
      rawText,
      pdfInfo: pdfData.info
    });
  }

  /**
   * Identify major sections in the PDF text
   */
  private identifySections(text: string): Record<string, ParsedSection> {
    const lines = text.split('\n');
    const sections: Record<string, ParsedSection> = {};
    
    let currentSection: ParsedSection | null = null;
    let sectionContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line starts a new section
      let sectionFound = false;
      for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(line)) {
          // Save previous section
          if (currentSection) {
            currentSection.content = sectionContent.join('\n');
            sections[currentSection.type] = currentSection;
          }
          
          // Start new section
          currentSection = {
            type: type as any,
            title: line,
            content: ''
          };
          sectionContent = [];
          sectionFound = true;
          break;
        }
      }
      
      // If not a new section, add to current section content
      if (!sectionFound && currentSection) {
        sectionContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection) {
      currentSection.content = sectionContent.join('\n');
      sections[currentSection.type] = currentSection;
    }
    
    return sections;
  }

  /**
   * Parse pattern metadata (name, size, difficulty)
   */
  private parseMetadata(rawText: string, sections: Record<string, ParsedSection>): any {
    // Look for pattern name (usually first non-empty line or after "Pattern:")
    const nameMatch = rawText.match(/(?:pattern\s*:?\s*)?([A-Z][^\\n]{3,50})/);
    const name = nameMatch ? nameMatch[1].trim() : 'Untitled Pattern';
    
    // Look for finished size
    const sizeMatch = rawText.match(/finished\s+size\s*:?\s*(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']?\s*x\s*(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']?/i);
    
    // Estimate difficulty based on content
    const difficulty = this.estimateDifficulty(rawText);
    
    return {
      name,
      difficulty,
      size: sizeMatch ? {
        finished: {
          width: parseImperialMeasurement(sizeMatch[1]) || 0,
          height: parseImperialMeasurement(sizeMatch[2]) || 0,
          unit: 'inches' as const
        }
      } : undefined,
      estimatedTime: this.estimateTime(rawText),
      category: this.detectCategory(rawText)
    };
  }

  /**
   * Parse materials/fabric requirements
   */
  private parseMaterials(section?: ParsedSection): { fabrics: FabricRequirement[] } {
    if (!section) return { fabrics: [], notions: [], tools: [] };
    
    const fabrics: FabricRequirement[] = [];
    const lines = section.content.split('\n');
    
    for (const line of lines) {
      // Match patterns like "Background: 2 1/2 yards"
      const fabricMatch = line.match(/([^:]+):\s*(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*(yards?|meters?|fat\s+quarters?|FQ)/i);
      
      if (fabricMatch) {
        fabrics.push({
          id: `fabric-${fabrics.length + 1}`,
          name: fabricMatch[1].trim(),
          amount: parseImperialMeasurement(fabricMatch[2]) || 0,
          unit: this.normalizeUnit(fabricMatch[3])
        });
      }
    }
    
    return { fabrics, notions: [], tools: [] };
  }

  /**
   * Parse cutting instructions
   */
  private parseCutting(section?: ParsedSection): CuttingInstruction[] {
    if (!section) return [];
    
    const instructions: CuttingInstruction[] = [];
    const lines = section.content.split('\n');
    
    let currentFabric = '';
    
    for (const line of lines) {
      // Check if this line specifies a fabric
      const fabricLine = line.match(/from\s+(.+?):/i) || line.match(/^(.+?):/);
      if (fabricLine) {
        currentFabric = fabricLine[1].trim();
        continue;
      }
      
      // Parse cutting instructions
      const cuts = this.parseCuttingLine(line, currentFabric);
      if (cuts) {
        instructions.push(cuts);
      }
    }
    
    return instructions;
  }

  /**
   * Parse a single cutting instruction line
   */
  private parseCuttingLine(line: string, fabric: string): CuttingInstruction | null {
    // Match patterns like "Cut 4 squares 2½" x 2½""
    const squareMatch = line.match(/cut\s+(\d+)\s+squares?\s+(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']?(?:\s*x\s*\1)?/i);
    if (squareMatch) {
      return {
        id: `cut-${Date.now()}`,
        fabric,
        pieces: [{
          shape: 'square',
          quantity: parseInt(squareMatch[1]),
          dimensions: {
            width: parseImperialMeasurement(squareMatch[2]) || 0,
            height: parseImperialMeasurement(squareMatch[2]) || 0,
            unit: 'inches'
          }
        }]
      };
    }
    
    // Match rectangles
    const rectMatch = line.match(/cut\s+(\d+)\s+(?:rectangles?|pieces?)\s+(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']?\s*x\s*(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""'']?/i);
    if (rectMatch) {
      return {
        id: `cut-${Date.now()}`,
        fabric,
        pieces: [{
          shape: 'rectangle',
          quantity: parseInt(rectMatch[1]),
          dimensions: {
            width: parseImperialMeasurement(rectMatch[2]) || 0,
            height: parseImperialMeasurement(rectMatch[3]) || 0,
            unit: 'inches'
          }
        }]
      };
    }
    
    // Match strips
    const stripMatch = line.match(STRIP_REGEX);
    if (stripMatch) {
      return {
        id: `cut-${Date.now()}`,
        fabric,
        pieces: [{
          shape: 'strip',
          quantity: parseInt(stripMatch[1]),
          dimensions: {
            width: parseImperialMeasurement(stripMatch[2]) || 0,
            height: 42, // WOF
            unit: 'inches'
          }
        }]
      };
    }
    
    return null;
  }
  /**
   * Parse construction steps
   */
  private parseConstructionSteps(section?: ParsedSection): ConstructionStep[] {
    if (!section) return [];
    
    const steps: ConstructionStep[] = [];
    const content = section.content;
    
    // Try to identify numbered steps
    const numberedSteps = content.match(/(?:step\s+)?(\d+)[\.\)]\s*([^\n]+(?:\n(?!\s*(?:step\s+)?\d+[\.\)]).*)*)/gi);
    
    if (numberedSteps) {
      numberedSteps.forEach((stepText, index) => {
        const stepMatch = stepText.match(/(?:step\s+)?(\d+)[\.\)]\s*(.*)/si);
        if (stepMatch) {
          const stepNumber = parseInt(stepMatch[1]);
          const instruction = stepMatch[2].trim();
          
          steps.push(this.createConstructionStep(
            stepNumber, 
            instruction,
            `step-${stepNumber}`
          ));
        }
      });
    } else {
      // No numbered steps, try to parse paragraphs as steps
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
      paragraphs.forEach((para, index) => {
        if (para.length > 20) { // Skip very short paragraphs
          steps.push(this.createConstructionStep(
            index + 1,
            para.trim(),
            `step-${index + 1}`
          ));
        }
      });
    }
    
    return steps;
  }

  /**
   * Create a construction step with clarifications
   */
  private createConstructionStep(
    number: number, 
    instruction: string,
    id: string
  ): ConstructionStep {
    // Expand abbreviations if requested
    const clarified = this.options.expandAbbreviations 
      ? expandAbbreviation(instruction)
      : instruction;
    
    // Identify techniques mentioned
    const techniques = this.identifyTechniques(instruction);
    
    // Generate warnings for common issues
    const warnings = this.generateWarnings(instruction);
    
    // Extract piece references
    const pieces = this.extractPieces(instruction);
    
    return {
      id,
      number,
      instruction,
      clarifiedInstruction: clarified !== instruction ? clarified : undefined,
      diagrams: [], // TODO: Generate diagrams
      pieces,
      techniques,
      warnings,
      estimatedTime: this.estimateStepTime(instruction)
    };
  }

  /**
   * Identify quilting techniques mentioned in instruction
   */
  private identifyTechniques(instruction: string): string[] {
    const techniques: string[] = [];
    const lower = instruction.toLowerCase();
    
    if (lower.includes('chain piec')) techniques.push('chain-piecing');
    if (lower.includes('nest') && lower.includes('seam')) techniques.push('nesting-seams');
    if (lower.includes('half square triangle') || lower.includes('hst')) techniques.push('half-square-triangle');
    if (lower.includes('y-seam')) techniques.push('y-seams');
    if (lower.includes('paper piec')) techniques.push('paper-piecing');
    if (lower.includes('appliq')) techniques.push('applique');
    
    return techniques;
  }

  /**
   * Generate warnings based on instruction content
   */
  private generateWarnings(instruction: string): any[] {
    const warnings: any[] = [];
    const lower = instruction.toLowerCase();
    
    if (lower.includes('bias') && lower.includes('stretch')) {
      warnings.push({
        type: 'important',
        message: 'Be careful not to stretch bias edges',
        icon: 'alert'
      });
    }
    
    if (lower.includes('match') && (lower.includes('point') || lower.includes('seam'))) {
      warnings.push({
        type: 'critical',
        message: 'Take time to match points precisely for professional results',
        icon: 'star'
      });
    }
    
    if (lower.includes('¼') || lower.includes('1/4') || lower.includes('quarter inch')) {
      warnings.push({
        type: 'important',
        message: 'Maintain consistent ¼" seam allowance throughout',
        icon: 'ruler'
      });
    }
    
    return warnings;
  }

  /**
   * Extract piece references from instruction
   */
  private extractPieces(instruction: string): any[] {
    const pieces: any[] = [];
    
    // Look for square/rectangle references
    const pieceMatches = instruction.matchAll(/(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""''](?:\s*x\s*(\d+(?:\s*\d+\/\d+|\.\d+|½)?)\s*[""''])?\s*(squares?|rectangles?|strips?|pieces?)/gi);
    
    for (const match of pieceMatches) {
      pieces.push({
        id: `piece-${pieces.length + 1}`,
        description: match[0],
        quantity: 1 // Would need context to determine actual quantity
      });
    }
    
    return pieces;
  }

  /**
   * Build the final UniversalPattern object
   */
  private buildPattern(data: any): UniversalPattern {
    const now = new Date();
    
    return {
      id: `pattern-${now.getTime()}`,
      version: '1.0.0',
      created: now,
      updated: now,
      
      source: {
        type: 'pdf',
        originalRef: data.pdfInfo?.Title || 'Unknown PDF',
        creator: data.pdfInfo?.Author ? {
          name: data.pdfInfo.Author
        } : undefined
      },
      
      metadata: {
        ...data.metadata,
        tags: this.generateTags(data),
        images: [], // TODO: Extract images from PDF
      },
      
      materials: data.materials,
      
      construction: {
        cuttingInstructions: data.cutting,
        steps: data.steps,
        techniques: this.buildTechniqueLibrary(data.steps),
        tips: this.extractGeneralTips(data.rawText)
      },
      
      visuals: {
        // TODO: Generate block definitions from pattern
      },
      
      sharing: {
        license: 'personal',
        attribution: data.pdfInfo?.Author ? {
          required: true,
          text: `Pattern by ${data.pdfInfo.Author}`
        } : undefined
      }
    };
  }

  // Helper methods
  
  private normalizeUnit(unit: string): 'yards' | 'meters' | 'fat quarters' | 'strips' {
    const lower = unit.toLowerCase();
    if (lower.includes('yard')) return 'yards';
    if (lower.includes('meter')) return 'meters';
    if (lower.includes('fat') || lower === 'fq') return 'fat quarters';
    return 'yards'; // default
  }

  private estimateDifficulty(text: string): 1 | 2 | 3 | 4 | 5 {
    const lower = text.toLowerCase();
    let score = 1;
    
    // Increase difficulty for complex techniques
    if (lower.includes('paper piec')) score += 2;
    if (lower.includes('y-seam')) score += 2;
    if (lower.includes('curve')) score += 1;
    if (lower.includes('appliq')) score += 1;
    if (lower.includes('advanced')) score += 2;
    if (lower.includes('beginner')) score = 1;
    
    return Math.min(score, 5) as 1 | 2 | 3 | 4 | 5;
  }

  private estimateTime(text: string): number {
    // Very rough estimate based on pattern complexity
    const steps = (text.match(/step\s+\d+/gi) || []).length;
    const blocks = (text.match(/blocks?/gi) || []).length;
    
    return Math.max(2, steps * 0.5 + blocks * 0.5);
  }

  private estimateStepTime(instruction: string): number {
    // Rough estimate in minutes
    const lower = instruction.toLowerCase();
    
    if (lower.includes('press') && !lower.includes('sew')) return 2;
    if (lower.includes('cut')) return 10;
    if (lower.includes('sew') && lower.includes('row')) return 15;
    if (lower.includes('attach') || lower.includes('join')) return 10;
    
    return 5; // default
  }

  private detectCategory(text: string): any {
    const lower = text.toLowerCase();
    
    if (lower.includes('paper piec')) return 'paper-pieced';
    if (lower.includes('appliq')) return 'applique';
    if (lower.includes('modern')) return 'modern';
    if (lower.includes('traditional')) return 'traditional-pieced';
    if (lower.includes('art')) return 'art-quilt';
    
    // Size-based categories
    if (lower.includes('baby')) return 'baby';
    if (lower.includes('lap')) return 'lap';
    if (lower.includes('queen')) return 'queen';
    if (lower.includes('king')) return 'king';
    
    return 'traditional-pieced'; // default
  }

  private generateTags(data: any): string[] {
    const tags: string[] = [];
    
    // Add difficulty-based tags
    if (data.metadata.difficulty <= 2) tags.push('beginner-friendly');
    if (data.metadata.difficulty >= 4) tags.push('advanced');
    
    // Add technique tags
    data.steps.forEach((step: ConstructionStep) => {
      step.techniques.forEach(tech => {
        if (!tags.includes(tech)) tags.push(tech);
      });
    });
    
    // Add size tags
    if (data.metadata.size?.finished) {
      const area = data.metadata.size.finished.width * data.metadata.size.finished.height;
      if (area < 2000) tags.push('small-project');
      if (area > 5000) tags.push('large-project');
    }
    
    return tags;
  }

  private buildTechniqueLibrary(steps: ConstructionStep[]): any[] {
    // Extract unique techniques from all steps
    const techniqueSet = new Set<string>();
    steps.forEach(step => {
      step.techniques.forEach(tech => techniqueSet.add(tech));
    });
    
    // Return basic technique definitions
    // In real implementation, would look up from technique database
    return Array.from(techniqueSet).map(tech => ({
      id: tech,
      name: tech.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      difficulty: 1,
      description: `Technique: ${tech}`,
      steps: [],
      commonIn: ['traditional-pieced']
    }));
  }

  private extractGeneralTips(text: string): any[] {
    const tips: any[] = [];
    
    // Look for tip patterns
    const tipMatches = text.match(/(?:tip|hint|note)s?:?\s*([^\n]+)/gi);
    
    if (tipMatches) {
      tipMatches.forEach(tip => {
        tips.push({
          text: tip.replace(/^(?:tip|hint|note)s?:?\s*/i, ''),
          type: 'beginner'
        });
      });
    }
    
    return tips;
  }
}

// Export main parsing function
export async function parseQuiltPattern(
  pdfBuffer: Buffer, 
  options?: ParserOptions
): Promise<UniversalPattern> {
  const parser = new QuiltPatternParser(options);
  return parser.parsePattern(pdfBuffer);
}