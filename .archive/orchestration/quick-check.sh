#!/bin/bash
# Quick Swarm Progress Check

cd /Users/david/Documents/Claude_Technical/quiltographer

echo "🔍 Quick Swarm Status Check"
echo "=========================="
echo ""

# Check if anything is in memory about quiltographer
echo "📝 Checking for Quiltographer research in memory..."
./claude-flow memory query quiltographer
./claude-flow memory query architect
./claude-flow memory query discovery

echo ""
echo "📊 Memory Statistics:"
./claude-flow memory stats

echo ""
echo "🐝 Hive-Mind Status:"
./claude-flow hive-mind status 2>/dev/null || echo "No active hive-mind swarm"

echo ""
echo "🤖 Agent Status:"
./claude-flow agent list
