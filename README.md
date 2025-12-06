# Quiltographer - AI-Powered Quilt Design Platform

## 🎯 Project Vision
Quiltographer revolutionizes quilt design by combining traditional quilting wisdom with modern AI capabilities, creating an inclusive platform that preserves cultural heritage while enabling innovation.

## 📁 Project Knowledge Files

### Essential Documentation
1. **[QUILTOGRAPHER-KNOWLEDGE-BASE.md](./QUILTOGRAPHER-KNOWLEDGE-BASE.md)**
   - Complete project context and structure
   - Current development status
   - Technical decisions and architecture
   - Use this as primary reference for all development

2. **[PREFERENCES-AND-INSTRUCTIONS.md](./PREFERENCES-AND-INSTRUCTIONS.md)**
   - How to work on this project
   - Code style and standards
   - Communication preferences
   - Development workflow

3. **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)**
   - Essential commands and status
   - Quick access to key information
   - Current swarm details

4. **[CLAUDE-CODE-SETUP.md](./CLAUDE-CODE-SETUP.md)**
   - Installation instructions for Claude Code
   - MCP server configuration
   - Troubleshooting guide

## 🚀 Getting Started

### Current Status
- **Discovery Swarm**: Active but workers idle
- **Session ID**: `session-1753631529354-xvvo1rxv7`
- **Next Step**: Install Claude Code to activate workers

### Quick Setup
```bash
# 1. Install Claude Code
npm install -g @anthropic-ai/claude-code

# 2. Run activation script
chmod +x INSTALL-AND-ACTIVATE.sh
./INSTALL-AND-ACTIVATE.sh

# 3. Monitor progress
./monitor-swarm.sh
```

## 🏗️ Project Structure
```
quiltographer/
├── 📚 Knowledge Files (START HERE)
│   ├── QUILTOGRAPHER-KNOWLEDGE-BASE.md
│   ├── PREFERENCES-AND-INSTRUCTIONS.md
│   ├── QUICK-REFERENCE.md
│   └── CLAUDE-CODE-SETUP.md
├── 🤖 AI/Swarm Configuration
│   ├── .claude/         # Agent configurations
│   ├── .hive-mind/      # Swarm system
│   └── .swarm/          # Memory database
├── 📝 Documentation
│   └── docs/
│       ├── architecture/
│       └── swarm-progress.md
├── 🛠️ Scripts
│   ├── monitor-swarm.sh
│   ├── INSTALL-AND-ACTIVATE.sh
│   └── [other helper scripts]
└── 💻 Source (to be created)
    └── src/
        ├── components/
        ├── lib/
        └── [implementation]
```

## 🎨 Design Philosophy
- **Japanese Aesthetics**: Ma (間), Wabi-sabi (侘寂), Shibui (渋い)
- **Accessibility First**: WCAG AAA compliance
- **Cultural Preservation**: Respect for traditional patterns
- **Community Centric**: Knowledge sharing and collaboration

## 🛠️ Tech Stack (Pending Swarm Confirmation)
- **Frontend**: Next.js 14, Tailwind CSS, SVG-first approach
- **Backend**: tRPC, PostgreSQL with Drizzle ORM
- **AI**: OpenAI API, Pinecone vector DB
- **Deployment**: Vercel

## 📋 Development Phases
1. **Discovery & Architecture** (Current)
2. **Foundation Setup**
3. **Pattern Engine Development**
4. **UI Implementation**
5. **AI Integration**
6. **Community Features**

## 🤝 How to Contribute

### For AI Assistants
1. Always read `QUILTOGRAPHER-KNOWLEDGE-BASE.md` first
2. Check swarm memory for existing decisions
3. Follow preferences in `PREFERENCES-AND-INSTRUCTIONS.md`
4. Use Desktop Commander for direct execution
5. Update progress tracking after major work

### For Developers
1. Install dependencies and Claude Code
2. Review architecture decisions in swarm memory
3. Follow the code style guide
4. Ensure accessibility in all features
5. Document cultural considerations

## 📊 Monitoring Commands
```bash
# Check swarm status
npx claude-flow@alpha hive-mind status

# View memory
npx claude-flow@alpha memory query "search-term"

# Real-time monitoring
npx claude-flow@alpha monitor --follow

# Check all status
./check-swarm-status.sh
```

## 🎯 Current Priority
**Install Claude Code** to activate the idle swarm workers and begin the discovery phase. Six research tasks are already loaded in memory waiting to be processed.

## 📞 Support
- Check swarm memory for decisions
- Review documentation in `docs/`
- Monitor progress with provided scripts
- Use Desktop Commander for all file operations

---

**Remember**: Quiltographer is more than software - it's a bridge between tradition and innovation, preserving cultural heritage while enabling creative expression.
