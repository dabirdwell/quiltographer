#!/bin/bash

echo "🔍 Checking development environment..."
echo "====================================="

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    echo "✅ git: $(git --version)"
else
    echo "⚠️  git not found (optional but recommended)"
fi

echo ""
echo "🎯 Ready to build Quiltographer!"
echo ""
echo "Next steps:"
echo "1. Run: ./start-quiltographer.sh"
echo "2. cd quiltographer-app"
echo "3. npm run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "📚 Check QUICK-START-GUIDE.md for component examples!"
