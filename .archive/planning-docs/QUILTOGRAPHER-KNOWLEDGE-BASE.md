# Quiltographer Project Knowledge Base

## Project Overview
Quiltographer is a modern quilt design platform that combines traditional quilting wisdom with AI capabilities and community features, wrapped in a Japanese-inspired interface. It aims to democratize and revolutionize quilt design while preserving cultural traditions.

## Key Project Locations
- **Project Root**: `/Users/david/Documents/Claude_Technical/quiltographer`
- **Source Code**: `/Users/david/Documents/Claude_Technical/quiltographer/src`
- **Documentation**: `/Users/david/Documents/Claude_Technical/quiltographer/docs`
- **Scripts**: `/Users/david/Documents/Claude_Technical/quiltographer/scripts`
- **Claude Flow**: `.claude/` directory contains AI agent configurations
- **Memory Database**: `.swarm/memory.db` (SQLite)
- **Hive Mind**: `.hive-mind/` directory

## Active Development Status

### Current Swarm Status
- **Swarm ID**: `swarm-1753631529352-rli20ikpd`
- **Session ID**: `session-1753631529354-xvvo1rxv7`
- **Objective**: Research and architect Quiltographer platform
- **Status**: Active but workers idle (needs Claude Code integration)

### Tasks in Memory
1. `swarm/tasks/research-competitors` - Analyze EQ8, QuiltAssistant, QuiltPro, PreQuilt
2. `swarm/tasks/tech-stack` - Evaluate Next.js 14 vs Remix, Tailwind, tRPC vs GraphQL
3. `swarm/tasks/architecture` - Design system architecture
4. `swarm/tasks/user-research` - Analyze quilter needs
5. `swarm/tasks/ai-integration` - Design AI features
6. `swarm/tasks/prototype` - Create SVG pattern engine POC

## Tech Stack Decisions (Pending)

### Recommended Stack (To Be Confirmed)
```typescript
{
  frontend: {
    framework: "Next.js 14 (App Router)",
    styling: "Tailwind CSS + Radix UI",
    state: "Zustand (app) + Valtio (canvas)",
    graphics: "SVG-first with Fabric.js enhancement"
  },
  backend: {
    api: "tRPC",
    database: "PostgreSQL with Drizzle ORM",
    auth: "Lucia Auth",
    storage: "Uploadthing or S3"
  },
  ai: {
    primary: "OpenAI API",
    vectorDB: "Pinecone",
    edgeCompute: "Vercel Edge Functions"
  },
  deployment: {
    platform: "Vercel",
    cdn: "Cloudflare",
    monitoring: "PostHog + Sentry"
  }
}
```

## Core Features to Implement

### Phase 1: Pattern Engine (Priority)
- SVG-based pattern representation
- Pattern manipulation algorithms
- Rendering system
- Performance optimization
- Pattern storage

### Phase 2: Design Interface
- Canvas system with zoom/pan
- Tool palettes
- Layer management
- Japanese-inspired UI components
- Accessibility features

### Phase 3: AI Integration
- Pattern generation from descriptions
- Style transfer
- Color recommendations
- Difficulty assessment
- Natural language interface

### Phase 4: Community Features
- User profiles
- Pattern sharing
- Collaborative design
- Knowledge base
- Comments and ratings

## Project Structure
```
quiltographer/
├── .claude/              # Claude Flow configurations
│   ├── agents/          # 64 specialized AI agents
│   ├── commands/        # Command documentation
│   └── settings.json    # Claude integration settings
├── .hive-mind/          # Hive mind system
├── .swarm/              # Swarm memory database
├── src/
│   ├── app/             # Next.js app directory
│   ├── components/
│   │   ├── canvas/      # Pattern design canvas
│   │   ├── patterns/    # Pattern components
│   │   ├── tools/       # Design tools
│   │   └── ui/          # UI components
│   ├── lib/
│   │   ├── ai/          # AI integration
│   │   ├── db/          # Database queries
│   │   ├── patterns/    # Pattern algorithms
│   │   └── utils/       # Utilities
│   ├── hooks/           # React hooks
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── public/
│   └── patterns/        # Pattern assets
├── docs/
│   ├── architecture/    # System design docs
│   ├── api/            # API documentation
│   └── guides/         # User guides
├── scripts/            # Development scripts
└── tests/              # Test files
```

## Development Commands

### Claude Flow Commands
```bash
# Check swarm status
npx claude-flow@alpha hive-mind status

# View memory contents
npx claude-flow@alpha memory query "search-term"

# Monitor in real-time
npx claude-flow@alpha monitor --follow

# Resume session
npx claude-flow@alpha hive-mind resume session-1753631529354-xvvo1rxv7
```

### Quick Scripts Available
- `start-quiltographer-swarm.sh` - Original swarm start
- `monitor-swarm.sh` - Check swarm progress
- `assign-tasks.sh` - Assign tasks to workers
- `watch-live.sh` - Real-time monitoring
- `check-swarm-status.sh` - Comprehensive status check

## Design Philosophy

### Japanese Design Principles
- **Ma (間)**: Conscious use of space
- **Wabi-sabi (侘寂)**: Beauty in imperfection
- **Shibui (渋い)**: Simple, subtle beauty
- **Kanketsu (完結)**: Simplicity and completeness

### Core Values
1. **Cultural Preservation**: Respect traditional patterns
2. **Accessibility First**: WCAG AAA compliance
3. **Community Centric**: Knowledge sharing focus
4. **Sustainable Practice**: Material optimization
5. **Inclusive Design**: Multi-generational appeal

## AI Agent Capabilities

### Available Agent Types (64 total)
- **Core**: researcher, planner, coder, tester, reviewer
- **Architecture**: system-architect, frontend-architect, backend-architect
- **Specialized**: ui-designer, algorithm-engineer, database-architect
- **AI/ML**: ai-architect, ml-engineer, prompt-engineer
- **Community**: social-architect, ux-researcher
- **Testing**: qa-engineer, performance-tester, security-auditor

## Technique References

### Paper Piecing (FPP)
See `docs/Paper_Piecing_Reference.md` - Foundation Paper Piecing technique documentation with Pride & Joy Quilting as exemplar. Key for pattern reader FPP support requirements (numbering sequences, assembly diagrams, export features).

---

## Critical Files to Reference

### Configuration Files
- `claude-flow.config.json` - Main Claude Flow config
- `.claude/settings.json` - Claude integration settings
- `.mcp.json` - MCP server configuration
- `package.json` - Project dependencies

### Documentation
- `CLAUDE.md` - Claude Flow instructions
- `docs/swarm-progress.md` - Development tracking
- Various `.claude/commands/*.md` - Command docs

### Scripts
- All `.sh` files in project root
- Python automation scripts (if created)

## Next Steps Required

1. **Install Claude Code CLI**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Add MCP Servers**
   ```bash
   claude mcp add claude-flow npx claude-flow@alpha mcp start
   claude mcp add ruv-swarm npx ruv-swarm@latest mcp start
   ```

3. **Activate Swarm Workers**
   - Workers are currently idle
   - Need proper Claude Code integration
   - Tasks are stored in memory waiting

## Communication Preferences

### When Working on Quiltographer:
1. **Always check** swarm memory for existing decisions
2. **Reference** this knowledge base for context
3. **Use** Desktop Commander for file operations
4. **Maintain** Japanese design aesthetic
5. **Prioritize** pattern engine development
6. **Document** all architectural decisions
7. **Test** accessibility continuously
8. **Consider** cultural sensitivity

### File Operations
- Use absolute paths: `/Users/david/Documents/Claude_Technical/quiltographer/...`
- Check existing files before creating new ones
- Update `docs/swarm-progress.md` after major milestones
- Store decisions in swarm memory with proper keys

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Tailwind for styling
- tRPC for API (pending confirmation)
- Clear, descriptive naming
- Comprehensive comments

## Important Context

### Current State
- Project initialized with Claude Flow
- Basic structure created
- Discovery swarm launched but needs activation
- 6 research tasks defined and stored
- Awaiting Claude Code integration

### Blockers
- Hive-mind workers idle (need Claude Code)
- Tech stack awaiting swarm research results
- No actual code written yet

### Opportunities
- Can proceed with direct development
- Pattern engine can be prototyped immediately
- UI components can be designed in parallel
- Documentation can be created continuously

This knowledge base should be placed in the project folder and referenced at the start of any Quiltographer development conversation.
