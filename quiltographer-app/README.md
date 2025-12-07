# 🎨 Quiltographer

A modern quilt design studio with a beautiful Japanese-inspired interface. Built with Next.js 14, TypeScript, and SVG-first pattern rendering.

## 🚀 Quick Start

The development server is already running at [http://localhost:3000](http://localhost:3000)

## What We've Built So Far

### ✅ Core Infrastructure
- **Next.js 14** project with TypeScript and Tailwind CSS
- **Japanese-inspired design system** with custom colors (sumi ink, washi paper, indigo, persimmon, sage, clay)
- **SVG-based pattern engine** for infinite scaling
- **Component structure** organized for scalability

### ✅ Components Created
1. **Canvas Component** (`/src/components/canvas/Canvas.tsx`)
   - SVG-based rendering surface
   - Grid system with customizable divisions
   - Ready for zoom/pan controls
   - Clean, minimal design

2. **Log Cabin Block** (`/src/components/patterns/LogCabinBlock.tsx`)
   - Traditional quilt pattern implementation
   - Parametric color system
   - SVG-based for perfect scaling
   - Example of pattern component structure

3. **Toolbar** (`/src/components/tools/Toolbar.tsx`)
   - Design tool selection
   - Save/Export buttons
   - Clean icon-based interface
   - Ready for tool integration

4. **Main App Page** (`/src/app/page.tsx`)
   - Header with branding
   - Sidebar with pattern library and color palette
   - Main canvas area with toolbar
   - Responsive layout

### 🎨 Design System

#### Colors (Japanese-inspired)
- **Sumi** (墨): `#1a1a1a` - Deep black ink
- **Washi** (和紙): `#faf8f3` - Traditional paper
- **Indigo** (藍): `#264653` - Deep blue
- **Persimmon** (柿): `#e76f51` - Vibrant orange
- **Sage** (鼠): `#84a98c` - Muted green
- **Clay** (土): `#e9c46a` - Warm yellow

## 🏗️ Next Steps

### Immediate Features to Build
1. **Pattern Manipulation**
   - Drag and drop patterns onto canvas
   - Rotate, scale, and position patterns
   - Pattern selection and multi-select

2. **More Pattern Blocks**
   - Flying Geese
   - Nine Patch
   - Half Square Triangle
   - Sashiko patterns

3. **Canvas Interactions**
   - Zoom controls (mouse wheel + buttons)
   - Pan functionality
   - Snap to grid
   - Alignment guides

4. **State Management**
   - Implement Zustand for global state
   - Undo/redo functionality
   - Pattern history

5. **Export Features**
   - Export as PDF with cutting guides
   - Material calculations
   - Pattern instructions

### Advanced Features (Later)
- AI pattern generation
- Collaborative editing
- Pattern marketplace
- 3D preview
- Mobile app

## 📁 Project Structure

```
quiltographer-app/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   │   ├── canvas/      # Canvas components
│   │   ├── patterns/    # Pattern blocks
│   │   ├── tools/       # Tool components
│   │   └── ui/          # UI components
│   ├── lib/             # Utilities
│   │   ├── patterns/    # Pattern algorithms
│   │   └── utils.ts     # Helper functions
│   ├── types/           # TypeScript types
│   └── hooks/           # Custom React hooks
└── public/              # Static assets
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎯 Why This Beats EQ8

- **Web-based**: Works on any device, any OS
- **Modern UI**: Beautiful, intuitive interface
- **SVG-based**: Infinite scaling, perfect exports
- **AI-ready**: Built for future AI integration
- **Collaborative**: Ready for real-time collaboration
- **Free/Affordable**: No $240 price tag

---

Built with ❤️ for the quilting community
