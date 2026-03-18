#!/bin/bash
# Fresh Start for Quiltographer Swarm - One More Try!

echo "🚀 FRESH START - QUILTOGRAPHER AI SWARM"
echo "========================================"
echo ""
echo "This is our focused approach - one simple command that should work!"
echo ""

cd /Users/david/Documents/Claude_Technical/quiltographer

# Clean any old sessions
rm -rf .hive-mind/sessions/* 2>/dev/null
rm -rf .swarm/*.log 2>/dev/null

echo "📋 Starting focused research swarm..."
echo ""

# Single focused command - research first, build second
npx claude-flow@latest swarm "Please research and document: 1) EQ8 quilt design software - features, pricing, pros/cons. 2) Compare Next.js 14 vs Remix for a modern web app. 3) Recommend architecture for Quiltographer - a modern quilt design platform with SVG patterns, AI assistance, and Japanese-inspired design. Store all findings in memory with clear labels." --max-agents 3 --parallel

echo ""
echo "🔍 To check progress in another terminal:"
echo "npx claude-flow@latest memory query 'EQ8'"
echo "npx claude-flow@latest memory query 'Next.js'"
echo "npx claude-flow@latest memory query 'architecture'"
