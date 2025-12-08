import { VisualizationProvider, DiagramOptions, DiagramTemplate } from './interface';
import { ProviderResult } from '../types';
import { StepDiagram, ComprehendedStep } from '@/types/comprehension';

// Japanese-inspired color palette matching quiltographerTheme
const COLORS = {
  indigo: '#264653',
  persimmon: '#e76f51',
  sage: '#84a98c',
  clay: '#e9c46a',
  washi: '#fdf4e3',
  rice: '#fefdfb',
  inkGray: '#6b7280',
  sumi: '#1a1a1a',
};

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// SVG templates for common quilting diagrams
const TEMPLATES: Record<string, DiagramTemplate> = {

  'strip-arrangement': {
    type: 'strip-arrangement',
    generate: (params) => {
      const strips = (params.strips as Array<{ color: string; label: string }>) || [
        { color: COLORS.rice, label: 'background' },
        { color: COLORS.clay, label: 'light' },
        { color: COLORS.persimmon, label: 'medium' },
        { color: COLORS.indigo, label: 'dark' },
      ];
      const showSeams = params.showSeams !== false;
      const stripHeight = 30;
      const stripWidth = 280;
      const gap = showSeams ? 2 : 0;

      return `<svg viewBox="0 0 320 ${strips.length * (stripHeight + gap) + 40}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .strip-label { font-family: system-ui, sans-serif; font-size: 12px; fill: ${COLORS.inkGray}; }
          .strip-label-light { fill: white; }
        </style>
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        ${strips.map((strip, i) => {
          const y = 20 + i * (stripHeight + gap);
          const light = isLightColor(strip.color);
          return `
            <rect x="20" y="${y}" width="${stripWidth}" height="${stripHeight}"
                  fill="${strip.color}" stroke="${COLORS.indigo}" stroke-width="1" rx="2"/>
            <text x="160" y="${y + 19}" text-anchor="middle"
                  class="strip-label ${light ? '' : 'strip-label-light'}">
              ${strip.label}
            </text>
          `;
        }).join('')}
        ${showSeams ? `
          <text x="160" y="${strips.length * (stripHeight + gap) + 32}"
                text-anchor="middle" class="strip-label" style="font-style: italic;">
            Sew strips in this order
          </text>
        ` : ''}
      </svg>`;
    }
  },

  'hst': {
    type: 'hst',
    generate: (params) => {
      const color1 = (params.color1 as string) || COLORS.rice;
      const color2 = (params.color2 as string) || COLORS.indigo;
      const label1 = (params.label1 as string) || '';
      const label2 = (params.label2 as string) || '';
      const size = (params.size as number) || 100;

      return `<svg viewBox="0 0 ${size + 40} ${size + 60}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .hst-label { font-family: system-ui, sans-serif; font-size: 11px; fill: ${COLORS.inkGray}; }
        </style>
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>

        <!-- Square outline -->
        <rect x="20" y="20" width="${size}" height="${size}"
              fill="none" stroke="${COLORS.indigo}" stroke-width="1"/>

        <!-- Triangle 1 (top-left) -->
        <polygon points="20,20 ${20 + size},20 20,${20 + size}"
                 fill="${color1}" stroke="${COLORS.indigo}" stroke-width="1"/>

        <!-- Triangle 2 (bottom-right) -->
        <polygon points="${20 + size},20 ${20 + size},${20 + size} 20,${20 + size}"
                 fill="${color2}" stroke="${COLORS.indigo}" stroke-width="1"/>

        <!-- Diagonal seam line -->
        <line x1="20" y1="${20 + size}" x2="${20 + size}" y2="20"
              stroke="${COLORS.sumi}" stroke-width="2" stroke-dasharray="4,2"/>

        <!-- Labels -->
        ${label1 ? `<text x="45" y="55" class="hst-label">${label1}</text>` : ''}
        ${label2 ? `<text x="${size - 15}" y="${size}" class="hst-label">${label2}</text>` : ''}

        <text x="${20 + size / 2}" y="${size + 50}" text-anchor="middle" class="hst-label">
          Half Square Triangle
        </text>
      </svg>`;
    }
  },

  'cutting': {
    type: 'cutting',
    generate: (params) => {
      const shape = (params.shape as string) || 'square';
      const width = (params.width as string) || '5"';
      const height = (params.height as string) || width;
      const quantity = (params.quantity as number) || 1;

      let shapesSvg = '';

      if (shape === 'strip') {
        shapesSvg = `
          <rect x="40" y="60" width="240" height="30" fill="${COLORS.clay}"
                stroke="${COLORS.indigo}" stroke-width="1"/>
          <line x1="40" y1="75" x2="280" y2="75" stroke="${COLORS.indigo}"
                stroke-width="1" stroke-dasharray="5,5"/>
          <text x="160" y="80" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.indigo};">
            ${width}
          </text>
        `;
      } else if (shape === 'square') {
        shapesSvg = `
          <rect x="110" y="40" width="80" height="80" fill="${COLORS.sage}"
                stroke="${COLORS.indigo}" stroke-width="1"/>
          <text x="150" y="85" text-anchor="middle" style="font-size: 14px; fill: white;">
            ${width}
          </text>
        `;
      } else if (shape === 'triangle') {
        shapesSvg = `
          <polygon points="150,40 200,120 100,120" fill="${COLORS.persimmon}"
                   stroke="${COLORS.indigo}" stroke-width="1"/>
          <text x="150" y="100" text-anchor="middle" style="font-size: 12px; fill: white;">
            ${width}
          </text>
        `;
      } else if (shape === 'rectangle') {
        shapesSvg = `
          <rect x="90" y="50" width="120" height="60" fill="${COLORS.clay}"
                stroke="${COLORS.indigo}" stroke-width="1"/>
          <text x="150" y="85" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.indigo};">
            ${width} × ${height}
          </text>
        `;
      }

      return `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        ${shapesSvg}
        <text x="160" y="145" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.inkGray};">
          Cut ${quantity > 1 ? `(${quantity})` : ''} ${shape}${quantity > 1 ? 's' : ''} at ${width}${height !== width ? ` × ${height}` : ''}
        </text>
      </svg>`;
    }
  },

  'pressing': {
    type: 'pressing',
    generate: (params) => {
      const direction = (params.direction as string) || 'toward-dark';

      let arrowPath = '';
      let label = '';

      if (direction === 'open') {
        arrowPath = 'M120,80 L100,60 M120,80 L100,100 M180,80 L200,60 M180,80 L200,100';
        label = 'Press seams open';
      } else if (direction === 'left') {
        arrowPath = 'M180,80 L120,80 M130,70 L120,80 L130,90';
        label = 'Press seams to the left';
      } else if (direction === 'right') {
        arrowPath = 'M120,80 L180,80 M170,70 L180,80 L170,90';
        label = 'Press seams to the right';
      } else {
        arrowPath = 'M120,80 L180,80 M170,70 L180,80 L170,90';
        label = 'Press toward darker fabric';
      }

      return `<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>

        <!-- Fabric pieces -->
        <rect x="50" y="50" width="100" height="60" fill="${COLORS.rice}"
              stroke="${COLORS.indigo}" stroke-width="1"/>
        <rect x="150" y="50" width="100" height="60" fill="${COLORS.indigo}"
              stroke="${COLORS.indigo}" stroke-width="1"/>

        <!-- Seam line -->
        <line x1="150" y1="50" x2="150" y2="110" stroke="${COLORS.sumi}" stroke-width="2"/>

        <!-- Arrow -->
        <path d="${arrowPath}" stroke="${COLORS.persimmon}" stroke-width="3" fill="none"
              stroke-linecap="round" stroke-linejoin="round"/>

        <text x="150" y="130" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.inkGray};">
          ${label}
        </text>
      </svg>`;
    }
  },

  'assembly': {
    type: 'assembly',
    generate: (params) => {
      const units = (params.units as Array<{ label: string; color: string }>) || [
        { label: 'A', color: COLORS.sage },
        { label: 'B', color: COLORS.persimmon },
        { label: 'A', color: COLORS.sage },
      ];
      const layout = (params.layout as string) || 'row';
      const gridCols = (params.gridCols as number) || 3;
      const unitSize = 50;
      const gap = 10;

      let unitsSvg = '';
      units.forEach((unit, i) => {
        const col = layout === 'grid' ? i % gridCols : (layout === 'row' ? i : 0);
        const row = layout === 'grid' ? Math.floor(i / gridCols) : (layout === 'column' ? i : 0);
        const x = 30 + col * (unitSize + gap);
        const y = 30 + row * (unitSize + gap);

        unitsSvg += `
          <rect x="${x}" y="${y}" width="${unitSize}" height="${unitSize}"
                fill="${unit.color}" stroke="${COLORS.indigo}" stroke-width="1" rx="4"/>
          <text x="${x + unitSize / 2}" y="${y + unitSize / 2 + 4}"
                text-anchor="middle" style="font-size: 14px; font-weight: 600; fill: ${isLightColor(unit.color) ? COLORS.indigo : 'white'};">
            ${unit.label}
          </text>
        `;
      });

      const cols = layout === 'grid' ? gridCols : (layout === 'row' ? units.length : 1);
      const rows = layout === 'grid' ? Math.ceil(units.length / gridCols) : (layout === 'column' ? units.length : 1);
      const width = 60 + cols * (unitSize + gap);
      const height = 70 + rows * (unitSize + gap);

      return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        ${unitsSvg}
        <text x="${width / 2}" y="${height - 10}" text-anchor="middle" style="font-size: 11px; fill: ${COLORS.inkGray};">
          Assemble units as shown
        </text>
      </svg>`;
    }
  },

  'custom': {
    type: 'custom',
    generate: (params) => {
      const title = (params.title as string) || 'Step Visualization';
      const description = (params.description as string) || '';

      return `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        <text x="150" y="50" text-anchor="middle" style="font-size: 14px; fill: ${COLORS.indigo}; font-weight: 500;">
          ${title}
        </text>
        ${description ? `
          <text x="150" y="75" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.inkGray};">
            ${description}
          </text>
        ` : ''}
      </svg>`;
    }
  },
};

export class TemplateVisualizationProvider implements VisualizationProvider {
  name = 'templates';

  async generateDiagram(
    step: ComprehendedStep,
    options: DiagramOptions = {}
  ): Promise<ProviderResult<StepDiagram>> {
    const startTime = Date.now();

    // Use diagramType and diagramParams from step comprehension
    const diagramType = step.diagramType || this.inferDiagramType(step);
    const diagramParams = step.diagramParams || this.inferDiagramParams(step, diagramType);

    const template = TEMPLATES[diagramType] || TEMPLATES['custom'];

    try {
      const svgCode = template.generate(diagramParams);

      return {
        success: true,
        data: {
          type: diagramType as StepDiagram['type'],
          svgCode,
          caption: this.generateCaption(step, diagramType),
          altText: `Diagram showing ${step.whatYouCreate || step.clarifiedTitle}`,
        },
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime,
      };
    }
  }

  private inferDiagramType(step: ComprehendedStep): string {
    const text = (step.clarifiedInstruction + ' ' + step.techniques.join(' ')).toLowerCase();

    if (text.includes('strip') && (text.includes('arrange') || text.includes('sew'))) {
      return 'strip-arrangement';
    }
    if (text.includes('half square') || text.includes('hst')) {
      return 'hst';
    }
    if (text.includes('cut') && !text.includes('rotary cutter')) {
      return 'cutting';
    }
    if (text.includes('press')) {
      return 'pressing';
    }
    if (text.includes('assemble') || text.includes('join') || text.includes('sew together')) {
      return 'assembly';
    }
    return 'custom';
  }

  private inferDiagramParams(step: ComprehendedStep, diagramType: string): Record<string, unknown> {
    // Extract info from measurements and instruction
    const instruction = step.clarifiedInstruction.toLowerCase();

    switch (diagramType) {
      case 'strip-arrangement':
        return {
          strips: [
            { color: COLORS.rice, label: 'background' },
            { color: COLORS.clay, label: 'light' },
            { color: COLORS.persimmon, label: 'medium' },
            { color: COLORS.indigo, label: 'dark' },
            { color: COLORS.rice, label: 'background' },
          ],
          showSeams: true,
        };

      case 'hst':
        return {
          color1: COLORS.rice,
          color2: COLORS.indigo,
          label1: 'light',
          label2: 'dark',
        };

      case 'cutting':
        // Try to extract shape from instruction
        let shape = 'square';
        if (instruction.includes('strip')) shape = 'strip';
        else if (instruction.includes('rectangle')) shape = 'rectangle';
        else if (instruction.includes('triangle')) shape = 'triangle';

        // Try to extract measurement
        const measurementMatch = step.measurements?.[0];
        const width = measurementMatch?.original || '5"';

        return { shape, width, quantity: step.quantityToMake || 1 };

      case 'pressing':
        let direction = 'toward-dark';
        if (instruction.includes('open')) direction = 'open';
        else if (instruction.includes('left')) direction = 'left';
        else if (instruction.includes('right')) direction = 'right';
        return { direction };

      case 'assembly':
        return {
          units: [
            { label: 'A', color: COLORS.sage },
            { label: 'B', color: COLORS.persimmon },
            { label: 'A', color: COLORS.sage },
          ],
          layout: 'row',
        };

      default:
        return {
          title: step.clarifiedTitle,
          description: step.whatYouCreate,
        };
    }
  }

  private generateCaption(step: ComprehendedStep, diagramType: string): string {
    switch (diagramType) {
      case 'strip-arrangement':
        return 'Arrange and sew strips in this order';
      case 'hst':
        return 'Half Square Triangle unit';
      case 'cutting':
        return `Cut pieces as shown`;
      case 'pressing':
        return 'Press seams in the direction shown';
      case 'assembly':
        return 'Assemble units as shown';
      default:
        return step.clarifiedTitle;
    }
  }

  async isAvailable(): Promise<boolean> {
    return true; // Templates are always available
  }
}

// Export templates for direct use
export { TEMPLATES, COLORS };
