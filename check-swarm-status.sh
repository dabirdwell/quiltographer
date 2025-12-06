#!/bin/bash
# Quiltographer Swarm Monitoring Guide

echo "🔍 Checking Quiltographer Swarm Status..."
echo "========================================="

cd /Users/david/Documents/Claude_Technical/quiltographer

# Method 1: Check basic status
echo "1️⃣ Basic System Status:"
./claude-flow status

echo ""
echo "2️⃣ Memory Statistics:"
./claude-flow memory stats

echo ""
echo "3️⃣ List any active agents:"
./claude-flow agent list

echo ""
echo "4️⃣ Check for recent memory entries:"
./claude-flow memory query --recent --limit 5

echo ""
echo "5️⃣ Check hive-mind status:"
./claude-flow hive-mind status || echo "Hive-mind not initialized"

echo ""
echo "6️⃣ Check for any swarm sessions:"
./claude-flow hive-mind sessions 2>/dev/null || echo "No sessions found"

echo ""
echo "7️⃣ Check process activity:"
ps aux | grep -i "claude-flow" | grep -v grep || echo "No claude-flow processes running"

echo ""
echo "8️⃣ Check for log files:"
find . -name "*.log" -o -name "*swarm*" -type f 2>/dev/null | head -10
