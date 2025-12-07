// Quilting Calculators - Binding, Backing, and Conversions

export interface BindingResult {
  totalLength: number;
  stripsNeeded: number;
  cutInstruction: string;
  fabricNeeded: string;
}

export interface BackingResult {
  yardageNeeded: number;
  seamPlacement: 'none' | 'vertical' | 'horizontal';
  cutInstructions: string[];
  pieceCount: number;
}

export interface ConversionResult {
  original: number;
  converted: number;
  fromUnit: 'inches' | 'cm';
  toUnit: 'inches' | 'cm';
  formatted: string;
}

// Calculate binding strips needed
export function calculateBinding(
  quiltWidth: number,
  quiltHeight: number,
  bindingWidth: number = 2.5,
  usableFabricWidth: number = 40
): BindingResult {
  const perimeter = (quiltWidth + quiltHeight) * 2;
  const extraForCorners = 12; // inches for mitered corners
  const extraForJoining = 10; // inches for joining strips
  const totalLength = perimeter + extraForCorners + extraForJoining;

  const stripsNeeded = Math.ceil(totalLength / usableFabricWidth);

  // Calculate fabric needed (each strip is bindingWidth tall)
  const fabricInches = stripsNeeded * bindingWidth;
  const fabricYards = Math.ceil(fabricInches / 36 * 10) / 10; // Round up to nearest 0.1 yard

  return {
    totalLength: Math.round(totalLength),
    stripsNeeded,
    cutInstruction: `Cut ${stripsNeeded} strips ${bindingWidth}" x WOF`,
    fabricNeeded: `${fabricYards} yards (${Math.round(fabricYards * 36)}" total)`,
  };
}

// Calculate backing yardage needed
export function calculateBacking(
  quiltWidth: number,
  quiltHeight: number,
  fabricWidth: number = 42,
  extraMargin: number = 4 // inches on each side for quilting
): BackingResult {
  const neededWidth = quiltWidth + (extraMargin * 2);
  const neededHeight = quiltHeight + (extraMargin * 2);
  const usableWidth = fabricWidth - 2; // Remove selvages

  // Can we use a single width?
  if (neededWidth <= usableWidth) {
    // Single width - just need length
    const lengthInches = neededHeight;
    const yardage = Math.ceil(lengthInches / 36 * 10) / 10;

    return {
      yardageNeeded: yardage,
      seamPlacement: 'none',
      cutInstructions: [`Cut backing ${Math.ceil(neededHeight)}" long (${yardage} yards)`],
      pieceCount: 1,
    };
  }

  // Need to piece - check if vertical or horizontal is more efficient
  const verticalPieces = Math.ceil(neededWidth / usableWidth);
  const verticalYardage = (neededHeight * verticalPieces) / 36;

  const horizontalPieces = Math.ceil(neededHeight / usableWidth);
  const horizontalYardage = (neededWidth * horizontalPieces) / 36;

  if (verticalYardage <= horizontalYardage) {
    // Vertical seams are more efficient
    const yardage = Math.ceil(verticalYardage * 10) / 10;
    return {
      yardageNeeded: yardage,
      seamPlacement: 'vertical',
      cutInstructions: [
        `Cut ${verticalPieces} pieces ${Math.ceil(neededHeight)}" long`,
        'Sew pieces together along long edges',
        `Trim to ${neededWidth}" wide`,
      ],
      pieceCount: verticalPieces,
    };
  } else {
    // Horizontal seams are more efficient
    const yardage = Math.ceil(horizontalYardage * 10) / 10;
    return {
      yardageNeeded: yardage,
      seamPlacement: 'horizontal',
      cutInstructions: [
        `Cut ${horizontalPieces} pieces ${Math.ceil(neededWidth)}" long`,
        'Sew pieces together along short edges',
        `Trim to ${neededHeight}" tall`,
      ],
      pieceCount: horizontalPieces,
    };
  }
}

// Metric/Imperial conversions
export function convertMeasurement(
  value: number,
  from: 'inches' | 'cm'
): ConversionResult {
  const INCHES_TO_CM = 2.54;

  if (from === 'inches') {
    const converted = value * INCHES_TO_CM;
    return {
      original: value,
      converted: Math.round(converted * 10) / 10,
      fromUnit: 'inches',
      toUnit: 'cm',
      formatted: `${value}" = ${Math.round(converted * 10) / 10}cm`,
    };
  } else {
    const converted = value / INCHES_TO_CM;
    return {
      original: value,
      converted: Math.round(converted * 100) / 100,
      fromUnit: 'cm',
      toUnit: 'inches',
      formatted: `${value}cm = ${Math.round(converted * 100) / 100}"`,
    };
  }
}

// Parse measurement string and convert
export function parseMeasurement(text: string): {
  value: number;
  unit: 'inches' | 'cm' | 'unknown';
} | null {
  // Match patterns like 2½", 2.5", 2 1/2", 10cm, etc.
  const inchPatterns = [
    /(\d+)\s*½\s*["″]?/,      // 2½" or 2½
    /(\d+)\s*¼\s*["″]?/,      // 2¼"
    /(\d+)\s*¾\s*["″]?/,      // 2¾"
    /(\d+(?:\.\d+)?)\s*["″]/,  // 2.5" or 2"
    /(\d+)\s+(\d+)\/(\d+)\s*["″]?/, // 2 1/2"
  ];

  const cmPatterns = [
    /(\d+(?:\.\d+)?)\s*cm/i,
  ];

  // Try inch patterns
  for (const pattern of inchPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2] && match[3]) {
        // Fraction format: "2 1/2"
        return { value: parseInt(match[1]) + parseInt(match[2]) / parseInt(match[3]), unit: 'inches' };
      }
      let value = parseFloat(match[1]);
      // Check for fraction symbols
      if (text.includes('½')) value += 0.5;
      else if (text.includes('¼')) value += 0.25;
      else if (text.includes('¾')) value += 0.75;
      return { value, unit: 'inches' };
    }
  }

  // Try cm patterns
  for (const pattern of cmPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { value: parseFloat(match[1]), unit: 'cm' };
    }
  }

  return null;
}

// Extract all measurements from instruction text
export function extractMeasurements(text: string): Array<{
  original: string;
  value: number;
  unit: 'inches' | 'cm';
}> {
  const results: Array<{original: string; value: number; unit: 'inches' | 'cm'}> = [];

  // Patterns to find measurements
  const patterns = [
    /\d+\s*½\s*["″]?/g,
    /\d+\s*¼\s*["″]?/g,
    /\d+\s*¾\s*["″]?/g,
    /\d+(?:\.\d+)?\s*["″]/g,
    /\d+\s+\d+\/\d+\s*["″]?/g,
    /\d+(?:\.\d+)?\s*cm/gi,
    /\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?["″]?/g, // dimensions like 5" x 5"
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const parsed = parseMeasurement(match);
        if (parsed && parsed.unit !== 'unknown') {
          results.push({
            original: match.trim(),
            value: parsed.value,
            unit: parsed.unit,
          });
        }
      }
    }
  }

  // Remove duplicates
  const unique = results.filter((item, index, self) =>
    index === self.findIndex(t => t.original === item.original)
  );

  return unique;
}

// Format number as quilting fraction
export function formatAsFraction(value: number): string {
  const whole = Math.floor(value);
  const decimal = value - whole;

  // Common quilting fractions
  const fractions: Record<number, string> = {
    0.125: '⅛',
    0.25: '¼',
    0.375: '⅜',
    0.5: '½',
    0.625: '⅝',
    0.75: '¾',
    0.875: '⅞',
  };

  // Find closest fraction
  let closestFrac = 0;
  let closestDiff = 1;
  for (const [frac] of Object.entries(fractions)) {
    const diff = Math.abs(decimal - parseFloat(frac));
    if (diff < closestDiff) {
      closestDiff = diff;
      closestFrac = parseFloat(frac);
    }
  }

  // If close enough to a standard fraction
  if (closestDiff < 0.03) {
    if (whole === 0) return fractions[closestFrac];
    if (closestFrac === 0) return `${whole}`;
    return `${whole}${fractions[closestFrac]}`;
  }

  // Otherwise return decimal
  return value.toFixed(2);
}
