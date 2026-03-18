#!/bin/bash
# Simple Quiltographer Discovery Start

cd /Users/david/Documents/Claude_Technical/quiltographer

echo "🚀 Starting Quiltographer Discovery - Simple Method"
echo "================================================"
echo ""

# Method 1: Try the hive-mind approach (usually works better)
echo "Starting Hive-Mind Discovery Swarm..."
npx claude-flow@alpha hive-mind init --force

npx claude-flow@alpha hive-mind spawn \
  "Research and architect Quiltographer: a modern quilt design platform. Analyze existing tools like EQ8, research user needs, recommend tech stack (consider Next.js 14, Tailwind, tRPC, PostgreSQL), design architecture" \
  --max-workers 6 \
  --worker-types "researcher,architect" \
  --queen-type strategic

echo ""
echo "✅ Swarm should now be running!"
echo ""
echo "Monitor with:"
echo "  npx claude-flow@alpha hive-mind status"
echo "  npx claude-flow@alpha memory query --recent"
