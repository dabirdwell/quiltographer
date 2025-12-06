# Pattern Reader MVP: Technical Specification
*The Extensible Foundation for Quiltographer*

## Core Principle: Build Once, Use Everywhere

Every line of code we write for Pattern Reader becomes infrastructure for the full Quiltographer platform. This isn't a throwaway MVP - it's the foundation.

## The Universal Pattern Schema (v1.0)

```typescript
// This schema is THE CORE - everything else is built on this
interface UniversalQuiltPattern {
  // Metadata (searchable, filterable)
  id: string;
  version: '1.0.0';
  source: {
    type: 'pdf' | 'manual' | 'ai-generated' | 'imported';
    originalFile?: string;
    parseDate?: Date;
    parser?: 'deterministic' | 'ai-assisted' | 'manual';
  };
  
  // Pattern Information
  metadata: {
    title: string;
    designer?: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    size: {
      finished: { width: string; height: string; units: 'inches' | 'cm' };
      blocks?: { count: number; size: string };
    };
    techniques: string[]; // ['piecing', 'applique', 'paper-piecing']
    estimatedTime: number; // hours
    tags: string[];
  };
  
  // Materials (shopping list)
  materials: {
    fabrics: Array<{
      id: string;
      name: string;
      amount: string;
      color?: string;
      notes?: string;
    }>;
    notions: Array<{
      item: string;
      amount?: string;
      optional?: boolean;
    }>;
    tools: string[]; // Required tools
  };
  
  // Cutting Instructions
  cutting: Array<{
    fabricId: string;
    pieces: Array<{
      shape: 'square' | 'rectangle' | 'triangle' | 'custom';
      size: string;
      quantity: number;
      label?: string; // "A", "B", etc.
      notes?: string;
    }>;
  }>;
  
  // Construction Steps
  construction: {
    steps: Array<{
      id: string;
      number: number;
      title?: string;
      instruction: string;
      
      // Enhanced clarity fields
      clarification?: {
        simplified: string;      // Plain English version
        tips?: string[];         // Helpful hints
        commonMistakes?: string[]; // What to avoid
        videoUrl?: string;       // Tutorial link
      };
      
      // Visual aids
      diagrams?: Array<{
        type: 'before' | 'during' | 'after' | 'detail';
        svg?: string;       // Inline SVG
        imageUrl?: string;  // External image
        caption?: string;
      }>;
      
      // Tracking
      pieces?: string[];    // Which pieces are used
      techniques?: string[]; // Techniques needed
      estimatedTime?: number; // minutes
      
      // User data (added during use)
      userData?: {
        completed?: boolean;
        notes?: string;
        photo?: string;
        completedAt?: Date;
      };
    }>;
    
    // Grouping for complex patterns
    sections?: Array<{
      title: string;
      stepIds: string[];
    }>;
  };
  
  // Extensibility for future features
  extensions?: {
    // For longarm machines
    quilting?: {
      design: string;
      density: number;
    };
    
    // For AI features
    ai?: {
      generatedVariations?: string[];
      suggestedModifications?: string[];
      difficultyAnalysis?: object;
    };
    
    // For community features
    community?: {
      sharedBy?: string;
      likes?: number;
      makes?: number;
      annotations?: object[];
    };
    
    // For business features
    business?: {
      pricing?: object;
      timeTracking?: object;
      clientInfo?: object;
    };
  };
}
```

## Pattern Reader MVP Architecture

### 1. PDF Parser Module
```typescript
// packages/pattern-reader/parser/
interface ParserEngine {
  // Deterministic parsing (V1)
  parseDeterministic(pdf: Buffer): ParseResult;
  
  // AI-enhanced parsing (V2)
  parseWithAI(pdf: Buffer, config: AIConfig): Promise<ParseResult>;
  
  // Convert to universal schema
  toUniversalPattern(parseResult: ParseResult): UniversalQuiltPattern;
  
  // Validation
  validate(pattern: UniversalQuiltPattern): ValidationResult;
}

// Start with deterministic, add AI later without changing interface
class PatternParser implements ParserEngine {
  async parse(pdf: Buffer): Promise<UniversalQuiltPattern> {
    // Try deterministic first
    let result = this.parseDeterministic(pdf);
    
    // If confidence low, enhance with AI (V2)
    if (result.confidence < 0.8 && this.aiEnabled) {
      result = await this.enhanceWithAI(result);
    }
    
    return this.toUniversalPattern(result);
  }
}
```

### 2. Pattern Display Component
```typescript
// packages/pattern-reader/components/
interface PatternViewerProps {
  pattern: UniversalQuiltPattern;
  currentStep?: number;
  onStepComplete?: (stepId: string) => void;
  accessibility?: AccessibilitySettings;
}

// This component becomes the core pattern view everywhere
export const PatternViewer: React.FC<PatternViewerProps> = ({
  pattern,
  currentStep = 0,
  onStepComplete,
  accessibility
}) => {
  // Used in Pattern Reader for viewing
  // Later used in Designer for previewing
  // Used in Community for sharing
  // Same component, different contexts
};
```

### 3. State Management
```typescript
// packages/pattern-reader/state/
interface PatternState {
  // Current pattern
  pattern: UniversalQuiltPattern | null;
  currentStepIndex: number;
  
  // Progress tracking
  completedSteps: string[];
  notes: Map<string, string>;
  
  // Settings
  textSize: 'normal' | 'large' | 'x-large';
  highContrast: boolean;
  
  // Actions (used by Pattern Reader AND future features)
  actions: {
    loadPattern: (pattern: UniversalQuiltPattern) => void;
    navigateToStep: (stepIndex: number) => void;
    markStepComplete: (stepId: string) => void;
    addNote: (stepId: string, note: string) => void;
    
    // Future actions (added progressively)
    sharePattern?: () => void;      // V2
    modifyPattern?: () => void;     // V3
    exportPattern?: () => void;     // V3
  };
}

// Using Zustand for state that works standalone AND in full app
export const usePatternStore = create<PatternState>((set, get) => ({
  // State management that scales from MVP to full platform
}));
```

### 4. API Layer (Extensible)
```typescript
// packages/pattern-reader/api/
class PatternAPI {
  // V1: Local only
  async savePattern(pattern: UniversalQuiltPattern): Promise<void> {
    localStorage.setItem(`pattern-${pattern.id}`, JSON.stringify(pattern));
  }
  
  // V2: Add cloud sync (same interface)
  async syncPattern(pattern: UniversalQuiltPattern): Promise<void> {
    if (this.user?.isPaid) {
      await this.cloudSync(pattern);
    }
    await this.savePattern(pattern); // Still save locally
  }
  
  // V3: Add sharing (extends existing)
  async sharePattern(pattern: UniversalQuiltPattern): Promise<string> {
    const shareId = await this.cloud.share(pattern);
    return `https://quiltographer.com/patterns/${shareId}`;
  }
}
```

## File Structure

```
quiltographer/
├── packages/
│   ├── pattern-core/          # Universal schema & types
│   │   ├── schema.ts          # THE schema
│   │   ├── validator.ts       # Schema validation
│   │   └── converter.ts       # Format converters
│   │
│   ├── pattern-reader/        # MVP app
│   │   ├── components/
│   │   │   ├── PatternViewer.tsx    # Main viewer
│   │   │   ├── StepCard.tsx         # Single step
│   │   │   ├── MaterialsList.tsx    # Shopping list
│   │   │   └── ProgressTracker.tsx  # Where you are
│   │   │
│   │   ├── parser/
│   │   │   ├── index.ts             # Parser engine
│   │   │   ├── deterministic.ts     # Regex parsing
│   │   │   └── ai-enhanced.ts       # AI fallback
│   │   │
│   │   ├── hooks/
│   │   │   ├── usePattern.ts        # Pattern state
│   │   │   └── useAccessibility.ts  # A11y settings
│   │   │
│   │   └── api/
│   │       ├── storage.ts           # Local/cloud storage
│   │       └── sharing.ts           # Pattern sharing
│   │
│   └── pattern-designer/      # Future: Design tools
│       └── [uses pattern-core for everything]
│
└── apps/
    ├── pattern-reader-app/     # Next.js MVP
    │   └── [imports from packages/pattern-reader]
    │
    └── quiltographer-app/      # Future: Full platform
        └── [imports ALL packages]
```

## Progressive Enhancement Path

### Week 1-4: Pattern Reader MVP
```typescript
// Ship with:
- Deterministic parser
- Basic pattern display  
- Step navigation
- Progress saving
- Text size adjustment

// Foundation laid:
✓ Universal schema defined
✓ Component library started
✓ State management ready
✓ API structure in place
```

### Week 5-8: AI Enhancement
```typescript
// Add to existing:
+ AI parsing for unclear sections
+ Natural language Q&A
+ Smart clarifications
+ Video links

// No breaking changes - just enhancement
```

### Week 9-12: Creation Tools
```typescript
// Extend schema:
pattern.source.type = 'ai-generated'

// Add components:
+ PatternGenerator
+ VisualEditor
+ ExportTools

// Same schema, new ways to create it
```

### Month 4-6: Full Platform
```typescript
// Combine everything:
import { PatternViewer } from '@quiltographer/pattern-reader';
import { PatternDesigner } from '@quiltographer/pattern-designer';
import { CommunityFeatures } from '@quiltographer/community';

// It all works together because it shares the same schema
```

## Database Design (When Needed)

```sql
-- Start with local storage, this comes later
CREATE TABLE patterns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  schema_version VARCHAR(10),
  pattern_data JSONB, -- The Universal Schema
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- Indexed fields from schema for searching
  title TEXT GENERATED ALWAYS AS (pattern_data->>'title') STORED,
  difficulty INT GENERATED ALWAYS AS (pattern_data->'metadata'->>'difficulty') STORED,
  tags TEXT[] GENERATED ALWAYS AS (pattern_data->'metadata'->>'tags') STORED
);

-- Community features (added progressively)
CREATE TABLE pattern_shares (
  pattern_id UUID REFERENCES patterns(id),
  shared_at TIMESTAMP,
  share_token VARCHAR(100) UNIQUE
);

CREATE TABLE pattern_annotations (
  pattern_id UUID REFERENCES patterns(id),
  step_id VARCHAR(50),
  user_id UUID REFERENCES users(id),
  annotation JSONB
);
```

## Testing Strategy

```typescript
// Test the schema comprehensively
describe('UniversalQuiltPattern', () => {
  it('parses real PDF patterns correctly', () => {
    // Test with 50+ real patterns
  });
  
  it('maintains compatibility as we extend', () => {
    // V1 patterns work in V2 parser
  });
  
  it('handles edge cases gracefully', () => {
    // Scanned patterns, unusual formats, etc.
  });
});

// Test that Pattern Reader components are reusable
describe('PatternViewer', () => {
  it('works standalone in Pattern Reader', () => {});
  it('works embedded in Designer', () => {});
  it('works in Community shares', () => {});
});
```

## Success Metrics

| Week | Metric | Target | Measurement |
|------|--------|--------|-------------|
| 1 | Schema Complete | 100% | All test patterns parse |
| 2 | Parser Accuracy | 80% | Successful parse rate |
| 3 | UI Complete | 100% | All MVP features working |
| 4 | Launch Ready | 100% | Payment, onboarding ready |
| 5 | User Satisfaction | 4.5+ | App store rating |
| 8 | Parse Success | 95% | With AI enhancement |

## The Key Insight

**Every decision we make for Pattern Reader must consider: "How does this become part of the full platform?"**

- Don't just parse PDFs → Create a universal schema
- Don't just display steps → Build reusable components  
- Don't just save progress → Design extensible state management
- Don't just store locally → Plan for cloud architecture

This way, Pattern Reader isn't a separate product we maintain forever - it's the foundation that naturally evolves into Quiltographer.

---

*Built right, Pattern Reader is not a detour - it's the fastest path to the full vision.*