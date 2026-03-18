#!/bin/bash

echo "🎨 Starting Quiltographer Development!"
echo "======================================"

# Create the Next.js app
echo "📦 Creating Next.js 14 project..."
npx create-next-app@latest quiltographer-app --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git

# Navigate to the project
cd quiltographer-app

# Install core dependencies
echo "📚 Installing core dependencies..."
npm install zustand valtio @radix-ui/react-icons @radix-ui/react-* lucide-react clsx tailwind-merge

# Install dev dependencies
npm install -D @types/node

echo "✅ Project created successfully!"
echo ""
echo "Next steps:"
echo "1. cd quiltographer-app"
echo "2. npm run dev"
echo ""
echo "🎯 Ready to build the pattern engine!"
