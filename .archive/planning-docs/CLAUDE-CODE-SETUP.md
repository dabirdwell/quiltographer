# Claude Code Installation & Setup Instructions

## Step 1: Install Claude Code CLI

```bash
# Install globally via npm
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

## Step 2: Add MCP Servers

After installation, add the required MCP servers:

```bash
# Add Claude Flow MCP server
claude mcp add claude-flow npx claude-flow@alpha mcp start

# Add RUV Swarm MCP server (optional but recommended)
claude mcp add ruv-swarm npx ruv-swarm@latest mcp start
```

## Step 3: Verify MCP Integration

```bash
# List installed MCP servers
claude mcp list

# Test Claude Flow connection
claude --use-mcp claude-flow "Check status"
```

## Step 4: Configure Project Settings

The project already has these configuration files:
- `.claude/settings.json` - Claude integration settings
- `.mcp.json` - MCP server configuration
- `claude-flow.config.json` - Claude Flow settings

## Step 5: Activate the Swarm

Once Claude Code is installed:

```bash
# Navigate to project
cd /Users/david/Documents/Claude_Technical/quiltographer

# Resume the existing swarm session
npx claude-flow@alpha hive-mind resume session-1753631529354-xvvo1rxv7

# Or spawn a new swarm with Claude Code integration
claude "Build Quiltographer discovery phase" --use-mcp claude-flow
```

## Step 6: Monitor Progress

```bash
# Real-time monitoring
npx claude-flow@alpha monitor --follow

# Check swarm status
npx claude-flow@alpha hive-mind status

# Query memory for results
npx claude-flow@alpha memory query "architecture"
```

## Troubleshooting

### If Claude Code installation fails:
```bash
# Try with sudo (macOS/Linux)
sudo npm install -g @anthropic-ai/claude-code

# Or use npx directly
npx @anthropic-ai/claude-code --version
```

### If MCP servers don't connect:
1. Check that claude-flow is properly initialized in the project
2. Ensure you're in the project directory when adding MCP servers
3. Try restarting the Claude Code daemon

### If swarm remains idle:
1. The current swarm may need to be terminated and restarted
2. Use `claude` command directly instead of `npx claude-flow`
3. Check memory for any error messages

## Expected Behavior After Setup

When properly configured, you should be able to:
1. Run `claude "task"` and have it automatically use swarm intelligence
2. See workers become active and start processing tasks
3. Monitor real-time progress of research and development
4. Access swarm memory for decisions and findings

## Next Commands After Installation

```bash
# Check if workers are now active
npx claude-flow@alpha hive-mind status

# If still idle, trigger them with Claude Code
claude "Start Quiltographer discovery tasks" --use-mcp claude-flow

# Monitor the results
npx claude-flow@alpha monitor --follow
```
