# PDF Parser for Quiltographer

## Overview
This package parses quilt pattern PDFs and converts them into the Universal Pattern Schema used throughout Quiltographer.

## Current Status (July 29, 2025 - Evening)
- ✅ Basic parser structure created
- ✅ Section identification logic
- ✅ Materials parsing
- ✅ Cutting instructions parsing  
- ✅ Construction steps parsing
- ✅ Abbreviation expansion
- ✅ Warning generation
- 🔄 Needs real PDF testing
- 📋 TODO: Diagram generation
- 📋 TODO: Image extraction

## Features

### Section Identification
The parser identifies common pattern sections:
- Materials/Supplies/Fabric Requirements
- Cutting Instructions
- Construction/Assembly Instructions
- Finishing/Binding

### Smart Parsing
- **Measurement parsing**: Handles "2½", "2 1/2", "2.5"
- **Abbreviation expansion**: RST → Right Sides Together
- **Technique identification**: Detects piecing methods
- **Warning generation**: Adds helpful warnings
- **Time estimation**: Rough time per step

### Output Format
Converts PDFs into the Universal Pattern Schema with:
- Clarified instructions
- Structured cutting lists
- Tagged techniques
- Generated warnings
- Estimated timing

## Usage

### Installation
```bash
cd packages/pdf-parser
npm install
```

### Basic Usage
```typescript
import { parseQuiltPattern } from '@quiltographer/pdf-parser';

const pdfBuffer = fs.readFileSync('pattern.pdf');
const pattern = await parseQuiltPattern(pdfBuffer, {
  expandAbbreviations: true,
  addClarifications: true
});
```

### Testing
```bash
npm run dev  # Runs test-parser.ts
```

## Architecture

### Main Components
1. **QuiltPatternParser class** - Main parsing logic
2. **Section identification** - Regex-based section detection
3. **Content parsers** - Specialized for each section type
4. **Pattern builder** - Assembles final schema object

### Key Methods
- `parsePattern()` - Main entry point
- `identifySections()` - Splits PDF into logical sections
- `parseMaterials()` - Extracts fabric requirements
- `parseCutting()` - Parses cutting instructions
- `parseConstructionSteps()` - Extracts assembly steps

## Next Steps

### Immediate TODOs
1. **Test with real PDFs** - Need sample patterns
2. **Improve section detection** - Handle more formats
3. **Add diagram generation** - SVG from instructions
4. **Extract images** - If PDF contains diagrams

### Enhancement Ideas
1. **Machine learning** for better parsing
2. **Template matching** for common patterns
3. **OCR support** for scanned patterns
4. **Multi-language** support

## Testing

### Manual Testing
1. Add a PDF to `samples/test-pattern.pdf`
2. Run `npm run dev`
3. Check output in `output/parsed-pattern.json`

### Unit Tests (TODO)
```bash
npm test  # Not implemented yet
```

## Common Pattern Formats

### Materials Section
```
Materials:
Background: 2 1/2 yards
Feature fabric: 1 yard
Batting: 45" x 60"
```

### Cutting Instructions
```
From background fabric:
- Cut 4 strips 2 1/2" x WOF
- Cut 20 squares 3 1/2" x 3 1/2"
```

### Construction Steps
```
Step 1. Arrange blocks in desired layout.
Step 2. Sew blocks RST with 1/4" seam allowance.
Step 3. Press seams toward darker fabric.
```

## Troubleshooting

### PDF won't parse
- Check if PDF has selectable text (not scanned)
- Try different PDF library options
- Check console for specific errors

### Wrong section identification
- Review SECTION_PATTERNS regex
- Add console.log to see how sections are split
- Some patterns use non-standard headings

### Measurements not parsing
- Check MEASUREMENT_REGEX patterns
- Add test cases for specific formats
- Consider cultural differences (metric vs imperial)

## Contributing
When adding features:
1. Update the Universal Pattern Schema if needed
2. Add parsing logic to appropriate method
3. Include test cases
4. Document any new pattern formats handled

---

## Continue Development
To continue from where we left off:
1. Install dependencies: `npm install`
2. Review `parser.ts` for current logic
3. Add real PDF samples for testing
4. Run `npm run dev` to test
5. Iterate on parsing accuracy

The parser is functional but needs real-world testing to refine the regex patterns and section identification.