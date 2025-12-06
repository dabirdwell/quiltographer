#!/bin/bash

# Quick test script for Pattern Reader PDF Parser

echo "🧵 Pattern Reader PDF Parser - Quick Test"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the pdf-parser directory"
    echo "   cd /Users/david/Documents/Claude_Technical/quiltographer/packages/pdf-parser"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for PDFs in samples
PDF_COUNT=$(find samples -name "*.pdf" 2>/dev/null | wc -l | tr -d ' ')

if [ "$PDF_COUNT" -eq "0" ]; then
    echo "⚠️  No PDFs found in samples/"
    echo ""
    echo "📥 Please download some free patterns from:"
    echo "   • https://www.robertkaufman.com/quilting/quilts_patterns/"
    echo "   • https://www.freespiritfabrics.com/free-patterns"
    echo "   • https://modafabrics.com/free-patterns"
    echo ""
    echo "Save them to: samples/"
    echo ""
    echo "🧪 Running with mock data instead..."
else
    echo "✅ Found $PDF_COUNT PDF(s) in samples/"
    echo ""
fi

# Run the parser
echo "🚀 Running parser..."
echo "===================="
npm run dev

echo ""
echo "✅ Done! Check output/ for results"