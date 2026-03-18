#!/bin/bash
# Assign Tasks to Quiltographer Discovery Swarm

cd /Users/david/Documents/Claude_Technical/quiltographer

echo "📋 Assigning Tasks to Swarm Workers"
echo "==================================="
echo ""

# Create research tasks
echo "Creating research tasks..."
npx claude-flow@alpha task create "research-competitors" \
  "Research and analyze existing quilt design tools: EQ8, QuiltAssistant, QuiltPro, PreQuilt. Document features, pricing, strengths, weaknesses" \
  --priority high \
  --assign researcher

npx claude-flow@alpha task create "research-users" \
  "Research quilt design user needs: interview data, pain points, desired features, workflow analysis" \
  --priority high \
  --assign researcher

# Create architecture tasks  
echo ""
echo "Creating architecture tasks..."
npx claude-flow@alpha task create "tech-stack-analysis" \
  "Analyze and recommend tech stack for Quiltographer: compare Next.js 14 vs Remix, Tailwind vs others, tRPC vs GraphQL, PostgreSQL vs SQLite" \
  --priority high \
  --assign analyst

npx claude-flow@alpha task create "system-architecture" \
  "Design system architecture: component structure, data flow, API design, deployment strategy" \
  --priority high \
  --assign analyst

# Create coding tasks
echo ""
echo "Creating initial coding tasks..."
npx claude-flow@alpha task create "prototype-pattern-engine" \
  "Create proof-of-concept for SVG-based pattern engine with basic shapes and transformations" \
  --priority medium \
  --assign coder

# Create testing tasks
echo ""
echo "Creating testing strategy tasks..."
npx claude-flow@alpha task create "testing-strategy" \
  "Design testing strategy for Quiltographer: unit tests, integration tests, performance benchmarks" \
  --priority medium \
  --assign tester

echo ""
echo "✅ Tasks assigned! Workers should now be active."
echo ""
echo "Check progress with:"
echo "  npx claude-flow@alpha hive-mind status"
echo "  npx claude-flow@alpha task list"
echo "  npx claude-flow@alpha memory query --recent"
