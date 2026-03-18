#!/bin/bash
# Launch Quiltographer Swarm with Claude Code Integration

echo "🚀 Launching Quiltographer Discovery Swarm with Claude Code"
echo "=========================================================="
echo ""
echo "This script will launch an interactive Claude Code session"
echo "that coordinates multiple AI agents to research and architect"
echo "your quilt design platform."
echo ""

cd /Users/david/Documents/Claude_Technical/quiltographer

# Option 1: Hive-Mind for persistent, resumable sessions
echo "Option 1: Hive-Mind (Recommended for long projects)"
echo "Run this command in your terminal:"
echo ""
echo "npx claude-flow@alpha hive-mind spawn \"Research and architect Quiltographer: analyze competitors (EQ8, QuiltAssistant, QuiltPro, PreQuilt), evaluate tech stacks (Next.js vs Remix, Tailwind, tRPC vs GraphQL), design system architecture, analyze user needs, design AI features, create SVG pattern engine prototype\" --claude --auto-spawn --verbose"
echo ""

# Option 2: Simple swarm for quick tasks
echo "Option 2: Simple Swarm (For quick research)"
echo "Run this command in your terminal:"
echo ""
echo "npx claude-flow@alpha swarm \"Research Quiltographer competitors and tech stack\" --claude --max-agents 8"
echo ""

echo "📝 Notes:"
echo "- Claude Code will open in interactive mode"
echo "- The Queen coordinator will orchestrate worker agents"
echo "- Progress will be stored in memory"
echo "- You can monitor progress with: npx claude-flow@alpha hive-mind status"
echo ""
echo "Press Ctrl+C to exit this message and copy one of the commands above"
