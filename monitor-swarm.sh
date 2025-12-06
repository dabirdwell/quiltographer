#!/bin/bash
# Monitor Quiltographer Swarm Progress

cd /Users/david/Documents/Claude_Technical/quiltographer

echo "📊 Quiltographer Swarm Progress Monitor"
echo "======================================"
echo ""

# Check hive-mind status
echo "🐝 Hive-Mind Status:"
npx claude-flow@alpha hive-mind status

echo ""
echo "📝 Recent Memory Entries:"
npx claude-flow@alpha memory query --recent --limit 5

echo ""
echo "🔍 Search for Architecture Decisions:"
npx claude-flow@alpha memory query "architecture"

echo ""
echo "🔍 Search for Tech Stack Recommendations:"
npx claude-flow@alpha memory query "tech stack"

echo ""
echo "📈 Memory Statistics:"
npx claude-flow@alpha memory stats

echo ""
echo "💡 To see real-time updates, run:"
echo "   npx claude-flow@alpha monitor --follow"
echo ""
echo "💡 To resume this session later:"
echo "   npx claude-flow@alpha hive-mind resume session-1753631529354-xvvo1rxv7"
