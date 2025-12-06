#!/bin/bash
# Alternative: Use Hive-Mind System

echo "🐝 Starting Quiltographer with Hive-Mind System"
echo "=============================================="

cd /Users/david/Documents/Claude_Technical/quiltographer

# Initialize hive-mind if needed
echo "1️⃣ Initializing Hive-Mind..."
./claude-flow hive-mind init --force

# Create a hive-mind swarm with specific objective
echo ""
echo "2️⃣ Spawning Hive-Mind Swarm..."
./claude-flow hive-mind spawn "Research and architect Quiltographer: a modern quilt design platform. Research existing tools, recommend tech stack, create architecture" \
  --queen-type strategic \
  --max-workers 6 \
  --worker-types "researcher,system-architect,frontend-architect,backend-architect,ux-researcher,ai-architect"

# Check status
echo ""
echo "3️⃣ Checking Hive-Mind Status..."
./claude-flow hive-mind status

# Monitor in real-time (press Ctrl+C to stop)
echo ""
echo "4️⃣ Starting real-time monitor (press Ctrl+C to stop)..."
echo "You can also run these commands in another terminal:"
echo "  ./claude-flow hive-mind status"
echo "  ./claude-flow memory query --recent"
echo ""
./claude-flow monitor --follow
