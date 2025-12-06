# Universal Pattern Schema Documentation

## Overview
The Universal Pattern Schema is the foundation of Quiltographer, designed to work across all features:
- **Pattern Reader**: Parsing PDFs into structured data
- **AI Chat**: Generating patterns from conversation
- **Canvas**: Manipulating and designing patterns
- **Community**: Sharing patterns
- **Export**: Machine formats, PDFs, etc.

## Core Principle
One pattern format that can represent:
1. Traditional pieced quilt instructions (from PDFs)
2. AI-generated quilt designs
3. User-created patterns in the canvas
4. Longarm quilting patterns
5. Community-shared patterns

## Schema Structure

### 1. Core Identification
```typescript
{
  id: string;              // Unique identifier
  version: '1.0.0';        // Schema version for migrations
  created: Date;
  updated: Date;
}
```

### 2. Source Tracking
Tracks where the pattern came from:
- `pdf`: Parsed from uploaded PDF (Pattern Reader)
- `ai-generated`: Created by chat interface
- `user-created`: Made in canvas
- `imported`: From EQ8 or other software
- `community`: Shared by another user

### 3. Materials Section
What you need to make the quilt:
```typescript
materials: {
  fabrics: [
    {
      name: "Background",
      amount: 2.5,
      unit: "yards",
      color: "#f0f0f0",
      notes: "Solid or subtle print"
    }
  ],
  notions: [...],  // Batting, binding, etc.
  tools: [...],    // Required tools
  thread: [...]    // Thread requirements
}
```

### 4. Construction Section (Core Value)
This is where Pattern Reader shines:
```typescript
construction: {
  cuttingInstructions: [
    {
      fabric: "Background",
      pieces: [{
        shape: "square",
        quantity: 20,
        dimensions: "2½ inches"  // or {width: 2.5, height: 2.5, unit: "inches"}
      }]
    }
  ],
  steps: [
    {
      number: 1,
      instruction: "Place squares RST",  // Original
      clarifiedInstruction: "Place squares Right Sides Together (pretty sides facing)",
      diagrams: [...],
      warnings: ["Ensure corners align perfectly"],
      techniques: ["basic-piecing"]
    }
  ]
}
```

### 5. Visual Representation
How the pattern looks:
```typescript
visuals: {
  blocks: [...],      // Individual block designs
  layout: {...},      // How blocks arrange into quilt
  colorways: [...],   // Color variations
  quilting: [...]     // References to longarm patterns
}
```

## Usage Examples

### Pattern Reader Flow
1. User uploads PDF
2. Parser extracts text sections
3. Identifies materials, cutting, construction sections
4. Creates ConstructionStep objects with:
   - Original instruction
   - Clarified version (expanded abbreviations)
   - Generated diagrams
   - Warnings for common mistakes
   - References to technique library

### AI Chat Flow
1. User describes desired quilt
2. AI generates UniversalPattern with:
   - AI metadata (prompt, confidence)
   - Complete construction steps
   - Calculated materials
   - Visual layout
3. Same format as Pattern Reader output!

### Canvas Flow
1. User designs visually
2. Canvas generates UniversalPattern with:
   - Block definitions
   - Layout arrangement
   - Calculated cutting instructions
   - Assembly steps derived from design

## Key Features

### 1. Abbreviation Expansion
Pattern Reader automatically expands:
- RST → Right Sides Together
- HST → Half Square Triangle
- WOF → Width of Fabric

### 2. Measurement Parsing
Handles various formats:
- "2½ inches" 
- "2 1/2 inches"
- "2.5 inches"
- "5cm"

### 3. Visual Generation
From text instructions, generate:
- Assembly diagrams
- Cutting layouts
- Pressing directions
- Placement guides

### 4. Technique Library
Referenced techniques include:
- Step-by-step instructions
- Visual guides
- Video links (future)
- Skill level
- Required tools

### 5. Extensibility
The `extensions` field allows for:
- Machine embroidery data
- Longarm quilting patterns
- Calculation results
- AI metadata
- Future features without breaking changes

## Migration Strategy
```typescript
// Schema is versioned
version: '1.0.0'

// Migration function handles updates
migratePattern(oldPattern, '0.9.0') → UniversalPattern v1.0.0
```

## Benefits

### For Pattern Reader
- Structured steps with clarifications
- Visual aids for every step
- Warnings prevent common mistakes
- Progress tracking built-in

### For AI Chat
- Same structure as human-designed patterns
- Can reference technique library
- Includes calculation data
- Source tracking for attribution

### For Canvas
- Visual designs create valid patterns
- Can import Pattern Reader patterns
- Export to any format
- Community sharing ready

### For Users
- One pattern works everywhere
- Seamless feature integration
- Future-proof design
- Quality consistent across sources

## Implementation Priority

### Phase 1: Pattern Reader Core
Focus on:
- ConstructionStep parsing
- Abbreviation expansion
- Basic diagram generation
- Warning system

### Phase 2: AI Integration
Add:
- AI metadata
- Pattern generation from chat
- Technique references
- Calculation integration

### Phase 3: Full Platform
Complete:
- Canvas import/export
- Community features
- Machine formats
- Advanced visualizations

## Validation
Every pattern is validated:
```typescript
const result = validateUniversalPattern(pattern);
if (!result.valid) {
  console.error('Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
}
```

This ensures quality whether from:
- PDF parsing
- AI generation  
- User creation
- Community sharing

---

The Universal Pattern Schema is designed to grow with Quiltographer while maintaining backwards compatibility. Start simple with Pattern Reader, expand into the full vision.