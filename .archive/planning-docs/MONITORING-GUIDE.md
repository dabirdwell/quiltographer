# 🔍 Quiltographer Swarm Progress Monitoring Guide

## The Issue
The initial swarm command may not have started properly. Here's how to fix it and monitor progress.

## Option 1: Restart with Hive-Mind (Recommended)
```bash
# This uses the newer hive-mind system
/Users/david/Documents/Claude_Technical/quiltographer/start-hivemind.sh
```

## Option 2: Traditional Swarm Approach
```bash
# This starts the orchestrator and spawns agents
/Users/david/Documents/Claude_Technical/quiltographer/start-swarm-properly.sh
```

## Monitoring Commands

### Real-Time Monitoring
```bash
# Watch live updates (best option)
./claude-flow monitor --follow

# Alternative real-time view
./claude-flow monitor --real-time
```

### Status Checks
```bash
# Overall system status
./claude-flow status

# List active agents
./claude-flow agent list

# Show running tasks
./claude-flow task list

# Hive-mind specific status
./claude-flow hive-mind status
```

### Memory Inspection
```bash
# See what agents are thinking/storing
./claude-flow memory query --recent --limit 10

# Search for specific topics
./claude-flow memory query "architecture"
./claude-flow memory query "tech stack"

# Get memory statistics
./claude-flow memory stats
```

### Session Management
```bash
# List all sessions
./claude-flow hive-mind sessions

# Resume a specific session
./claude-flow hive-mind resume [session-id]
```

## What You Should See When It's Working

### Successful Hive-Mind Start:
```
✔ Hive Mind swarm spawned successfully!

🐝 Swarm Summary:
──────────────────────────────────────
Swarm ID: swarm-[timestamp]
Objective: Research and architect Quiltographer...
Queen Type: strategic
Workers: 6
Worker Types: researcher, architect, etc.
──────────────────────────────────────
```

### Active Monitoring Output:
```
🐝 Active Swarm Status
━━━━━━━━━━━━━━━━━━━━
researcher: Analyzing competitor tools...
system-architect: Designing component structure...
ux-researcher: Creating user personas...
frontend-architect: Evaluating frameworks...

Memory Entries: 47
Progress: ████████░░ 78%
```

## Troubleshooting

### If Nothing is Running:
1. Check if claude-flow needs npm global install:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. Try the simpler agent spawn approach:
   ```bash
   # Start orchestrator
   ./claude-flow start --daemon
   
   # Spawn a single agent as test
   ./claude-flow agent spawn researcher --name "Test"
   
   # Create a task
   ./claude-flow task create test "Research quilt design tools"
   ```

3. Check for errors in the process:
   ```bash
   # Look for any error logs
   find . -name "*.log" -exec tail -20 {} \;
   ```

### If Memory is Empty:
The agents might be running but not storing results yet. Wait a few minutes and check again:
```bash
# Force a memory check
./claude-flow memory list

# Check specific namespaces
./claude-flow memory query --namespace swarm
./claude-flow memory query --namespace agents
```

## Visual Progress Indicators

### What Each Agent Should Produce:

**Researcher Output**:
- Competitor analysis document
- Feature comparison matrix
- User pain points list

**System Architect Output**:
- Architecture diagrams
- Component structure
- Technology decisions

**Frontend Architect Output**:
- Framework recommendation
- Component hierarchy
- State management plan

**Backend Architect Output**:
- API design
- Database schema
- Infrastructure plan

**UX Researcher Output**:
- User personas
- Journey maps
- Success metrics

**AI Architect Output**:
- AI integration points
- Model recommendations
- Pattern generation design

## Desktop Commander Integration

You can monitor everything through Desktop Commander:
```bash
# Check running processes
ps aux | grep claude-flow

# Monitor system resources
top -pid [claude-flow-pid]

# Watch file changes in real-time
watch -n 1 "ls -la /Users/david/Documents/Claude_Technical/quiltographer"
```

## Expected Timeline

- **0-5 min**: Swarm initialization
- **5-30 min**: Agents begin producing insights
- **30-60 min**: Initial recommendations appear
- **2-4 hours**: Complete discovery phase results

## Quick Status Script

I've created: `/Users/david/Documents/Claude_Technical/quiltographer/check-swarm-status.sh`

Run it anytime to see all status info at once!
