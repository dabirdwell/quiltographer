# Quiltographer Development Preferences & Instructions

## How to Work with This Project

### Starting a Conversation
Always begin by:
1. Checking project location: `/Users/david/Documents/Claude_Technical/quiltographer`
2. Reading current swarm status: `npx claude-flow@alpha hive-mind status`
3. Checking memory for recent decisions: `npx claude-flow@alpha memory query --recent`
4. Reviewing `QUILTOGRAPHER-KNOWLEDGE-BASE.md` for context

### Core Preferences

#### 1. **Use Direct Terminal Interaction**
- Execute commands directly via Desktop Commander
- Don't just create scripts - run them
- Monitor processes in real-time
- Interact with running processes when needed

#### 2. **Maintain Design Philosophy**
- Japanese-inspired aesthetics (Ma, Wabi-sabi, Shibui)
- Accessibility-first (WCAG AAA)
- Cultural sensitivity and preservation
- Clean, minimal interfaces

#### 3. **Development Approach**
- Swarm-first when Claude Code is available
- Direct development when swarms are idle
- Always document decisions in memory
- Test early and continuously

#### 4. **Code Preferences**
```typescript
// Preferred style example
interface QuiltPattern {
  id: string;              // Always use descriptive names
  elements: PatternElement[]; // Arrays for collections
  metadata: {              // Group related data
    created: Date;
    modified: Date;
    author: string;
  };
}

// Component style
export const PatternCanvas: React.FC<Props> = ({ pattern }) => {
  // Hooks at the top
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<SVGSVGElement>(null);
  
  // Clear, named functions
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.1, Math.min(10, prev + delta)));
  };
  
  // Descriptive returns
  return (
    <div className="relative w-full h-full">
      {/* Japanese-inspired minimal design */}
    </div>
  );
};
```

### Key Directories & Files to Always Check

#### Configuration Files
- `claude-flow.config.json` - Main configuration
- `.claude/settings.json` - Integration settings  
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

#### Source Directories
- `src/components/canvas/` - Pattern design canvas
- `src/components/patterns/` - Pattern library components
- `src/lib/patterns/` - Pattern algorithms and math
- `src/lib/ai/` - AI integration code

#### Documentation
- `QUILTOGRAPHER-KNOWLEDGE-BASE.md` - Project overview
- `docs/swarm-progress.md` - Development tracking
- `docs/architecture/` - Design decisions

#### Scripts
- `monitor-swarm.sh` - Check swarm progress
- `start-direct-dev.sh` - Direct development

### Communication Style

#### When Discussing Features
- Reference cultural context
- Consider accessibility implications
- Suggest sustainable practices
- Think about community impact

#### When Writing Code
- Explain complex algorithms
- Document pattern mathematics
- Include accessibility comments
- Note cultural significance

#### When Making Decisions
- Check swarm memory first
- Document in appropriate memory keys
- Update progress tracking
- Consider all user personas

### Memory Key Conventions

Use these patterns for storing decisions:
```
swarm/decisions/tech-stack/[component]
swarm/research/competitors/[tool-name]
swarm/architecture/[module]
swarm/tasks/[task-type]/[specific-task]
implementation/patterns/[pattern-name]
implementation/features/[feature-name]
```

### Workflow Preferences

#### For Research Tasks
1. Query existing memory
2. Synthesize findings
3. Store structured results
4. Update documentation

#### For Implementation
1. Check architecture decisions
2. Implement with tests
3. Ensure accessibility
4. Document thoroughly

#### For AI Integration
1. Design ethical boundaries
2. Respect cultural patterns
3. Implement graceful fallbacks
4. Test with diverse inputs

### Error Handling Approach

Always implement comprehensive error handling:
```typescript
try {
  // Risky operation
  const result = await generatePattern(input);
  return { success: true, data: result };
} catch (error) {
  // Log for debugging
  console.error('Pattern generation failed:', error);
  
  // User-friendly message
  return {
    success: false,
    error: 'Unable to generate pattern. Please try a simpler design.',
    technicalDetails: process.env.NODE_ENV === 'development' ? error : undefined
  };
}
```

### Testing Philosophy

- Unit tests for all algorithms
- Integration tests for workflows  
- Accessibility tests for all UI
- Performance tests for canvas operations
- Cultural sensitivity reviews

### Performance Targets

- Pattern render: <16ms (60fps)
- Pattern save: <100ms  
- AI generation: <3s
- Page load: <1s
- Accessibility: 100% keyboard navigable

### Collaboration Approach

When working with swarms:
1. Trust agent expertise
2. Review all outputs
3. Integrate findings thoughtfully
4. Maintain human oversight

### Progress Tracking

Always update after significant work:
1. Update `docs/swarm-progress.md`
2. Store decisions in memory
3. Commit with clear messages
4. Document learnings

### Quality Standards

Every feature must:
- Be accessible
- Respect cultural heritage
- Perform efficiently
- Have error handling
- Include documentation
- Pass all tests

### When Blocked

If swarms are idle or systems aren't working:
1. Document the issue clearly
2. Attempt direct implementation
3. Create workarounds
4. Note for future resolution

Remember: Quiltographer is more than software - it's a bridge between tradition and innovation, a tool for creative expression, and a platform for community connection. Every decision should honor this vision.
