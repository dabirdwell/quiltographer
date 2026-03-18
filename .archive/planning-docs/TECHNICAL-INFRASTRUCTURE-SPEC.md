# Quiltographer Technical Infrastructure Specification
*Created: 2025-07-28*

## Pattern Definition System

```typescript
interface PatternDefinition {
  id: string;
  name: string;
  geometry: PatternGeometry; // SVG paths, parametric functions, or procedural rules
  variants: PatternVariant[]; // colorways, scales, densities
  culturalContext?: CulturalMetadata;
  constructionRules: ConstructionRule[]; // how pieces connect
  physicalConstraints: PhysicalConstraint[]; // seam allowances, fabric grain
}

interface PatternGeometry {
  type: 'svg' | 'parametric' | 'procedural';
  data: SVGPathData | ParametricFunction | ProceduralRule;
  boundingBox: BoundingBox;
  repeatUnit?: RepeatUnit;
}

interface CulturalMetadata {
  origin: {
    culture: string;
    period: string;
    region?: string;
  };
  significance: string;
  traditionalName?: string;
  attribution: string;
  usage: string[];
}
```

## Workspace State Architecture

```typescript
interface Workspace {
  id: string;
  canvas: CanvasState;
  history: HistoryStack; // undo/redo with branching
  layers: Layer[];
  context: WorkspaceContext; // zoom, pan, active tools
  constraints: Constraint[]; // grid, alignment, physical rules
  metadata: ProjectMetadata;
}

interface CanvasState {
  elements: CanvasElement[];
  size: Dimensions;
  grid: GridSettings;
  guides: Guide[];
  selection: Selection;
}

interface HistoryStack {
  current: number;
  entries: HistoryEntry[];
  branches: Map<number, HistoryBranch[]>;
  maxSize: number;
}
```
## Calculation Engine

```typescript
interface CalculationEngine {
  units: UnitSystem; // imperial/metric with fractional support
  seamAllowance: SeamAllowanceCalculator;
  
  yardageCalculator: {
    calculate(pattern: Pattern, dimensions: Dimensions): YardageRequirement;
    optimizeLayout(pieces: Piece[], fabricWidth: number): CuttingLayout;
    accountForGrain(pieces: Piece[], grainDirection: GrainSpec): AdjustedLayout;
    wastageReport(): WastageAnalysis;
  };
  
  templateEngine: {
    generatePDF(pieces: Piece[], options: TemplateOptions): PDFDocument;
    generateSVG(pieces: Piece[]): SVGDocument; // for cutting machines
    addRegistrationMarks(template: Template): Template;
    nestingOptimization(pieces: Piece[]): NestedLayout;
  };
  
  pieceInventory: {
    trackCut(piece: Piece): void;
    remaining(): Piece[];
    suggestBatching(): CuttingBatch[]; // group by color/fabric
  };
}

interface TemplateOptions {
  paperSize: PaperSize;
  includeSeamAllowance: boolean;
  addLabels: boolean; // piece numbers, grain lines
  testSquare: boolean; // for printer calibration
  mirrorPieces: boolean; // for directional fabrics
}
```
## Machine Format Translator

```typescript
interface MachineFormatSystem {
  formats: {
    dst: DSTFormat;      // Tajima
    pes: PESFormat;      // Brother
    jef: JEFFormat;      // Janome
    vp3: VP3Format;      // Viking
    xxx: XXXFormat;      // Singer
    qcc: QCCFormat;      // Quilter's Creative Touch
    plt: PLTFormat;      // Cutting plotters
    svg: SVGFormat;      // Cricut, Silhouette
  };
  
  translator: {
    analyze(file: ArrayBuffer): FormatInfo;
    convert(source: MachineFile, targetFormat: Format): MachineFile;
    validate(file: MachineFile): ValidationResult;
    preserveMetadata(source: MachineFile): Metadata;
  };
  
  machineProfiles: {
    [machineId: string]: {
      supportedFormats: Format[];
      maxDesignSize: Dimensions;
      colorLimits: number;
      specialRequirements: Requirement[];
    };
  };
  
  stitchOptimizer: {
    reduceJumps(design: StitchDesign): StitchDesign;
    optimizeColorChanges(design: StitchDesign): StitchDesign;
    density(design: StitchDesign): DensityMap;
  };
}
```
## Material Intelligence System

```typescript
interface MaterialIntelligence {
  // Color matching across brands
  colorDatabase: {
    threads: {
      madeira: ColorChart;
      gutermann: ColorChart;
      aurifil: ColorChart;
      sulky: ColorChart;
      dmc: ColorChart;
      mettler: ColorChart;
      superior: ColorChart;
      kingTut: ColorChart;
    };
    fabrics: {
      moda: FabricCollection;
      robertKaufman: FabricCollection;
      freeSpirit: FabricCollection;
      riley_blake: FabricCollection;
      artGallery: FabricCollection;
      windham: FabricCollection;
    };
  };
  
  // AI-powered matching
  colorMatcher: {
    findClosest(targetColor: Color, brand: Brand): Match[];
    crossReference(threadBrand: Brand, targetBrand: Brand): Mapping;
    suggestSubstitutes(unavailable: Material): Alternative[];
    matchFromPhoto(image: ImageData): ColorMatch[];
  };
  
  // Shopping integration
  shoppingAssistant: {
    checkAvailability(materials: Material[]): AvailabilityReport;
    findBestPrices(materials: Material[]): PriceComparison;
    suggestBundles(project: Project): Bundle[]; // save on shipping
    trackPriceHistory(material: Material): PriceHistory;
    alertOnSales(watchlist: Material[]): void;
  };
  
  // Physical properties database
  materialProperties: {
    shrinkageRates: Map<FabricType, ShrinkageRate>;
    colorFastness: Map<Material, FastnessRating>;
    grainBehavior: Map<FabricType, GrainCharacteristics>;
    compatibility: CompatibilityMatrix; // which materials work together
  };
}
```
## Workflow Integration

```typescript
interface QuiltingWorkflow {
  phases: {
    design: DesignPhase;
    calculation: CalculationPhase;
    shopping: ShoppingPhase;
    cutting: CuttingPhase;
    assembly: AssemblyPhase;
  };
  
  assistant: {
    suggestOptimalSize(): Dimensions; // based on bed sizes, wall spaces
    calculateAllVariants(): Variant[]; // different sizes of same design
    batchSimilarColors(): ColorBatch[]; // for efficient cutting
    sequenceAssembly(): AssemblySteps; // optimal construction order
  };
  
  exporters: {
    cuttingMachine(): MachineFile;
    printedTemplates(): PDF;
    shoppingList(): ShoppingList;
    assemblyGuide(): IllustratedGuide;
    costEstimate(): DetailedEstimate;
  };
}
```

## Cultural Intelligence Layer

```typescript
interface CulturalIntelligence {
  attributions: AttributionSystem;
  appropriatenessChecks: AppropriatenessEngine;
  culturalNarrative: NarrativeSystem;
  communityValidation: ValidationSystem;
}

interface AttributionSystem {
  track(pattern: Pattern, attribution: Attribution): void;
  verify(pattern: Pattern): AttributionStatus;
  suggest(pattern: Pattern): Attribution[];
  communityInput(pattern: Pattern): CommunityAttribution[];
}
```

## Tool System

```typescript
interface Tool {
  id: string;
  category: ToolCategory;
  parameters: ParameterDefinition[];
  preview: PreviewFunction;
  apply: ApplyFunction;
  culturalVariants?: CulturalVariant[]; // same tool, different traditions
}

interface ToolCategory {
  name: string;
  icon: IconDefinition;
  defaultTools: string[];
  culturalContext?: string;
}
```
## Implementation Notes

### Priority Order
1. **Pattern System** - Core to everything else
2. **Calculation Engine** - Immediate value for users
3. **Material Intelligence** - Differentiator feature
4. **Machine Translator** - Opens professional market
5. **Cultural Intelligence** - Essential for respectful growth

### Data Sources
- Thread color databases from manufacturer specs
- Fabric collections from seasonal catalogs
- Machine format specifications from technical docs
- Cultural pattern research from museums/archives
- Community validation from user contributions

### Technical Considerations
- Use WebAssembly for calculation performance
- IndexedDB for offline pattern/material storage
- WebGL for pattern rendering and preview
- Service Workers for offline functionality
- Real-time collaboration via WebRTC

### API Design Principles
- Version all APIs from day one
- Use semantic versioning
- Provide migration tools
- Document breaking changes
- Support graceful degradation

### Security & Privacy
- Encrypt user designs at rest
- No tracking of design content
- Optional cloud sync
- Local-first architecture
- GDPR compliance built-in

## Next Implementation Steps

1. **Create Pattern Schema** (Week 1)
   - Define TypeScript interfaces
   - Build validation system
   - Create example patterns
   - Test parametric generation

2. **Build Calculation Core** (Week 2-3)
   - Implement measurement system
   - Create yardage calculator
   - Build template generator
   - Test with real patterns

3. **Prototype Material DB** (Week 4)
   - Source color data
   - Build matching algorithm
   - Create UI for browsing
   - Test cross-brand matching

4. **Design Extension API** (Week 5)
   - Define hook points
   - Create provider interfaces
   - Build example extension
   - Document for developers

This infrastructure will position Quiltographer as the comprehensive quilting platform, not just another design tool.