#!/bin/bash
# Install Claude Code and Activate Quiltographer Swarm

echo "🚀 Installing Claude Code & Activating Quiltographer Swarm"
echo "========================================================="
echo ""

# Step 1: Install Claude Code
echo "📦 Step 1: Installing Claude Code CLI..."
echo "Running: npm install -g @anthropic-ai/claude-code"
echo ""
echo "Please run this command in your terminal:"
echo "  npm install -g @anthropic-ai/claude-code"
echo ""
echo "Or with sudo if needed:"
echo "  sudo npm install -g @anthropic-ai/claude-code"
echo ""
echo "Press Enter when installation is complete..."
read

# Step 2: Verify Installation
echo "✓ Step 2: Verifying Claude Code installation..."
claude --version || echo "❌ Claude Code not found. Please ensure installation completed."

# Step 3: Add MCP Servers
echo ""
echo "🔧 Step 3: Adding MCP servers..."
echo "Running these commands:"
echo ""
cd /Users/david/Documents/Claude_Technical/quiltographer

echo "Adding claude-flow MCP server..."
claude mcp add claude-flow npx claude-flow@alpha mcp start

echo "Adding ruv-swarm MCP server..."
claude mcp add ruv-swarm npx ruv-swarm@latest mcp start

# Step 4: List MCP Servers
echo ""
echo "📋 Step 4: Verifying MCP servers..."
claude mcp list

# Step 5: Activate the Swarm
echo ""
echo "🐝 Step 5: Activating Quiltographer swarm..."
echo ""
echo "Option A - Resume existing session:"
echo "  npx claude-flow@alpha hive-mind resume session-1753631529354-xvvo1rxv7"
echo ""
echo "Option B - Use Claude Code directly:"
echo "  claude \"Start Quiltographer discovery phase with stored tasks\" --use-mcp claude-flow"
echo ""
echo "Which option would you like? (A/B): "
read option

if [ "$option" = "A" ] || [ "$option" = "a" ]; then
    npx claude-flow@alpha hive-mind resume session-1753631529354-xvvo1rxv7
elif [ "$option" = "B" ] || [ "$option" = "b" ]; then
    claude "Start Quiltographer discovery phase with stored tasks" --use-mcp claude-flow
fi

# Step 6: Monitor
echo ""
echo "📊 Step 6: Monitoring swarm progress..."
echo "Opening monitor in 5 seconds..."
sleep 5
npx claude-flow@alpha monitor --follow
