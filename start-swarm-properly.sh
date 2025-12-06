#!/bin/bash
# Properly Start Quiltographer Discovery Swarm

echo "🚀 Starting Quiltographer Discovery Swarm - Correct Method"
echo "========================================================"

cd /Users/david/Documents/Claude_Technical/quiltographer

# First, let's start the orchestrator
echo "1️⃣ Starting orchestrator..."
./claude-flow start --daemon &
sleep 3

# Check if it started
echo "2️⃣ Checking orchestrator status..."
./claude-flow status

# Now let's properly create the discovery swarm
echo ""
echo "3️⃣ Creating Discovery Swarm with individual agents..."

# Method 1: Try using the executor flag
echo "Attempting swarm with --executor flag..."
./claude-flow swarm "Research and architect Quiltographer: a modern quilt design platform combining traditional quilting with AI. Research existing tools (EQ8, QuiltAssistant), analyze user needs, recommend modern tech stack. Create comprehensive architecture document." \
  --executor \
  --max-agents 6 \
  --memory-key "quiltographer-discovery"

# If that doesn't work, Method 2: Spawn agents individually
echo ""
echo "4️⃣ Alternative: Spawning agents individually..."
./claude-flow agent spawn researcher --name "Market Researcher" &
./claude-flow agent spawn system-architect --name "System Architect" &
./claude-flow agent spawn ux-researcher --name "UX Researcher" &
./claude-flow agent spawn frontend-architect --name "Frontend Architect" &
./claude-flow agent spawn backend-architect --name "Backend Architect" &
./claude-flow agent spawn ai-architect --name "AI Architect" &

sleep 5

# Create tasks for each agent
echo ""
echo "5️⃣ Creating tasks for agents..."
./claude-flow task create research "Research existing quilt design tools and analyze market" --priority high
./claude-flow task create architecture "Design system architecture for Quiltographer" --priority high
./claude-flow task create ux-research "Analyze user needs and create personas" --priority high
./claude-flow task create frontend-arch "Recommend frontend stack and architecture" --priority high
./claude-flow task create backend-arch "Design backend architecture and API structure" --priority high
./claude-flow task create ai-design "Design AI integration for pattern generation" --priority high

echo ""
echo "6️⃣ Final status check..."
./claude-flow status
./claude-flow agent list
./claude-flow task list
