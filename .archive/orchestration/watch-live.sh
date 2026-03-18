#!/bin/bash
# Real-time Quiltographer Swarm Monitor

cd /Users/david/Documents/Claude_Technical/quiltographer

echo "🔴 Starting Real-Time Swarm Monitor"
echo "Press Ctrl+C to stop"
echo "==================================="
echo ""

# This will show live updates
npx claude-flow@alpha monitor --follow
