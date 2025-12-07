import { PatternDefinition, RepeatStructure } from './schema';

export interface RenderOptions {
  width: number;
  height: number;
  scale?: number;
  showGrid?: boolean;
  showPath?: boolean;
  variantId?: string;
  backgroundColor?: string;
}

export class PatternRenderer {
  private pattern: PatternDefinition;
  
  constructor(pattern: PatternDefinition) {
    this.pattern = pattern;
  }
  
  /**
   * Render pattern to SVG string
   */
  renderToSVG(options: RenderOptions): string {
    const { width, height, scale = 1, showGrid = false, showPath = false } = options;
    const variant = this.getVariant(options.variantId);
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${options.backgroundColor ? `<rect width="${width}" height="${height}" fill="${options.backgroundColor}"/>` : ''}
        ${showGrid ? this.renderGrid(width, height) : ''}
        ${this.renderRepeatingPattern(width, height, scale, variant)}
        ${showPath ? this.renderStitchPath(width, height, scale, variant) : ''}
      </svg>
    `;
    
    return svg.trim();
  }
  
  /**
   * Render repeating pattern based on repeat structure
   */
  private renderRepeatingPattern(width: number, height: number, scale: number, variant?: any): string {
    const { geometry, repeat } = this.pattern;
    
    let patterns = '';
    
    switch (repeat.type) {
      case 'continuous':
        patterns = this.renderContinuousRepeat(width, height, scale, variant);
        break;
      default:
        patterns = this.renderContinuousRepeat(width, height, scale, variant);
    }
    
    return patterns;
  }  
  /**
   * Continuous repeat for edge-to-edge patterns
   * Density changes the spacing between patterns, not the pattern size
   */
  private renderContinuousRepeat(
    canvasWidth: number,
    canvasHeight: number,
    scale: number,
    variant?: any
  ): string {
    const { repeat } = this.pattern;
    
    // Get density - higher number means MORE patterns per inch
    const density = variant?.stitchDensity || this.pattern.longarmProperties?.density.default || 10;
    
    // Base pattern size remains constant
    const basePatternSize = 80; // Pattern is always 80 units
    
    // Density affects spacing - more stitches/inch = tighter spacing
    // At 10 st/in (medium), spacing = pattern size
    // At 6 st/in (loose), spacing = pattern size * 1.67 (fewer patterns)
    // At 16 st/in (micro), spacing = pattern size * 0.625 (more patterns)
    const spacingMultiplier = 10 / density;
    const effectiveSpacing = basePatternSize * spacingMultiplier;
    
    let elements = '';
    let rowIndex = 0;
    
    // Start before canvas edge to ensure full coverage
    const startX = -basePatternSize;
    const startY = -basePatternSize;
    const endX = canvasWidth + basePatternSize;
    const endY = canvasHeight + basePatternSize;
    
    for (let y = startY; y < endY; y += effectiveSpacing) {
      // Offset every other row for interlocking pattern
      const rowOffset = rowIndex % 2 === 0 ? 0 : effectiveSpacing / 2;
      
      for (let x = startX + rowOffset; x < endX; x += effectiveSpacing) {
        // Alternate rotation for visual interest
        const rotation = rowIndex % 2 === 0 ? 0 : 180;
        elements += this.renderSinglePattern(x, y, 1, rotation, variant);
      }
      rowIndex++;
    }
    
    return `<g class="pattern-repeat continuous">${elements}</g>`;
  }  
  /**
   * Render a single pattern instance
   */
  private renderSinglePattern(x: number, y: number, scale: number, rotation: number = 0, variant?: any): string {
    const { geometry } = this.pattern;
    
    if (geometry.type !== 'svg' || !geometry.svgPath) {
      return '';
    }
    
    // Stroke width stays constant - density changes spacing, not line thickness
    const strokeWidth = 1.5;
    
    const transform = `translate(${x}, ${y}) scale(${scale}) rotate(${rotation} ${geometry.origin.x} ${geometry.origin.y})`;
    
    return `
      <g transform="${transform}">
        <path d="${geometry.svgPath}" 
              fill="none" 
              stroke="#1e40af" 
              stroke-width="${strokeWidth}" 
              stroke-linejoin="round"
              stroke-linecap="round" />
      </g>
    `;
  }
  
  /**
   * Render grid for alignment
   */
  private renderGrid(width: number, height: number): string {
    const gridSize = 50;
    let lines = '';
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#e5e7eb" stroke-width="0.5" />`;
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#e5e7eb" stroke-width="0.5" />`;
    }
    
    return `<g class="grid">${lines}</g>`;
  }  
  /**
   * Render stitch path visualization that follows the actual pattern
   */
  private renderStitchPath(width: number, height: number, scale: number, variant?: any): string {
    const { longarmProperties } = this.pattern;
    
    if (!longarmProperties || !longarmProperties.stitchPath.continuous) {
      return '';
    }
    
    // Get density to match pattern spacing
    const density = variant?.stitchDensity || this.pattern.longarmProperties?.density.default || 10;
    const spacingMultiplier = 10 / density;
    const effectiveSpacing = 80 * spacingMultiplier;
    
    // Create path that follows the pattern centers
    let pathData = 'M 40,40 ';
    let x = 40;
    let y = 40;
    let rowIndex = 0;
    
    // Follow the actual pattern layout
    while (y < height - 40) {
      if (rowIndex % 2 === 0) {
        // Even row - go right
        while (x < width - 40) {
          pathData += `Q ${x + effectiveSpacing/4},${y + 10} ${x + effectiveSpacing/2},${y} `;
          x += effectiveSpacing;
        }
        // Move down to next row
        pathData += `Q ${x},${y + effectiveSpacing/4} ${x - effectiveSpacing/2},${y + effectiveSpacing/2} `;
        y += effectiveSpacing;
        rowIndex++;
      } else {
        // Odd row - go left
        while (x > 40) {
          pathData += `Q ${x - effectiveSpacing/4},${y + 10} ${x - effectiveSpacing/2},${y} `;
          x -= effectiveSpacing;
        }
        // Move down to next row
        pathData += `Q ${x},${y + effectiveSpacing/4} ${x + effectiveSpacing/2},${y + effectiveSpacing/2} `;
        y += effectiveSpacing;
        rowIndex++;
      }
    }
    
    return `
      <g class="stitch-path" opacity="0.5">
        <path d="${pathData}" 
              fill="none" 
              stroke="#dc2626" 
              stroke-width="2" 
              stroke-dasharray="5,3" />
        <circle cx="40" cy="40" r="4" fill="#22c55e" />
        <text x="50" y="45" fill="#22c55e" font-size="10">Start</text>
      </g>
    `;
  }
  
  /**
   * Get variant by ID
   */
  private getVariant(variantId?: string) {
    if (!variantId) return null;
    return this.pattern.variants.find(v => v.id === variantId);
  }  
  /**
   * Calculate time estimate for quilting area
   */
  calculateTimeEstimate(width: number, height: number): number {
    const { longarmProperties } = this.pattern;
    
    if (!longarmProperties) return 0;
    
    // Convert mm to inches
    const widthInches = width / 25.4;
    const heightInches = height / 25.4;
    const areaSquareInches = widthInches * heightInches;
    
    // Realistic time: ~100 square inches per hour for medium density
    const minutesPerSquareInch = 0.6; // 36 seconds per square inch
    const totalMinutes = areaSquareInches * minutesPerSquareInch;
    
    return totalMinutes * 60; // Return in seconds
  }
  
  /**
   * Calculate thread usage for quilting area
   */
  calculateThreadUsage(width: number, height: number, density?: number): number {
    const { longarmProperties } = this.pattern;
    
    if (!longarmProperties) return 0;
    
    const stitchDensity = density || longarmProperties.density.default;
    
    // Convert to inches
    const widthInches = width / 25.4;
    const heightInches = height / 25.4;
    const areaSquareInches = widthInches * heightInches;
    
    // REALISTIC: ~0.2-0.3 yards per square inch for medium density
    const yardsPerSquareInch = 0.25;
    const densityMultiplier = stitchDensity / 10;
    
    // Calculate total yards
    const totalYards = areaSquareInches * yardsPerSquareInch * densityMultiplier;
    
    // Convert to meters (1 yard = 0.9144 meters)
    return totalYards * 0.9144;
  }
}