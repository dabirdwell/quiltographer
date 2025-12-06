# Quiltographer Quick Reference

## Project Location
`/Users/david/Documents/Claude_Technical/quiltographer`

## Current Status
- **Swarm**: Active but idle (ID: `swarm-1753631529352-rli20ikpd`)
- **Session**: `session-1753631529354-xvvo1rxv7`
- **Workers**: 4 idle (researcher, coder, analyst, tester)
- **Tasks**: 6 stored in memory, awaiting Claude Code

## Key Commands
```bash
# Check status
npx claude-flow@alpha hive-mind status
npx claude-flow@alpha memory query "term"

# Monitor
npx claude-flow@alpha monitor --follow

# Resume session
npx claude-flow@alpha hive-mind resume session-1753631529354-xvvo1rxv7
```

## Tech Stack (Pending Confirmation)
- **Frontend**: Next.js 14, Tailwind CSS, SVG-first
- **Backend**: tRPC, PostgreSQL, Drizzle ORM
- **AI**: OpenAI API, Pinecone
- **Deploy**: Vercel

## Core Features Priority
1. Pattern Engine (SVG-based)
2. Design Interface (Japanese-inspired)
3. AI Integration (Pattern generation)
4. Community Features (Sharing, collaboration)

## Design Principles
- Ma (間) - Space
- Wabi-sabi (侘寂) - Imperfect beauty
- Accessibility first
- Cultural preservation

## Important Files
- `QUILTOGRAPHER-KNOWLEDGE-BASE.md` - Full project context
- `PREFERENCES-AND-INSTRUCTIONS.md` - How to work on project
- `CLAUDE-CODE-SETUP.md` - Installation instructions
- `docs/swarm-progress.md` - Track progress

## Next Immediate Steps
1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Add MCP servers (see CLAUDE-CODE-SETUP.md)
3. Activate swarm workers
4. Begin discovery phase

## Memory Keys Pattern
```
swarm/decisions/[category]/[item]
swarm/research/[topic]/[subtopic]
swarm/tasks/[type]/[specific]
implementation/[feature]/[component]
```

## Quick Scripts
- `monitor-swarm.sh` - Check progress
- `start-direct-dev.sh` - Direct development
- `check-swarm-status.sh` - Full status

Remember: Always check swarm memory before making decisions!
