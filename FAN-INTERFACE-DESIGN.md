# 🎌 Quiltographer Fan Interface Design Document
Version 1.0 - January 28, 2025

## Concept Overview

The Fan Interface is Quiltographer's signature interaction pattern - a Japanese-inspired UI element that combines traditional aesthetics with modern touch interactions. It serves as both a functional selection mechanism and a differentiating brand element.

## Core Design Principles

### Cultural Inspiration
- **Sensu (扇子)**: Traditional Japanese folding fan
- **Kinetic Beauty**: Movement as part of the experience  
- **Ma (間)**: Thoughtful use of negative space
- **Seasonal Flow**: Natural, cyclical interactions

### Interaction Philosophy
- Touch-first design optimized for iPad
- Gestural control replacing traditional menus
- Immediate visual feedback through canvas updates
- Playful yet professional experience

## Visual Design

### Fan States
```
1. Closed (Off-screen)
   |
   |  Hidden, waiting for gesture
   |

2. Unfolding (Animation)
        ╱
      ╱ ╱
    ╱ ╱ ╱
   ╱ ╱ ╱ ╱

3. Open (Interactive)
      ╭─────╮
      │ ╱ ╲ │  ← Preview overlay
      ╱  |  ╲
    ╱    |    ╲
  ╱      |      ╲
╱────────┼────────╲
         │
    Selected item

4. End-of-list (Rubber-band)
         ○  ← Fan handle appears
       ╱ | ╲
     ╱   |   ╲  ← Elastic bounce
   ╱     |     ╲
```

### Material Design Elements

#### Washi Paper Background
```css
.fan-surface {
  background-image: 
    url('washi-texture.png'),
    linear-gradient(to bottom, #fdf4e3, #f9f0dc);
  background-blend-mode: multiply;
  opacity: 0.95;
}

/* Subtle fiber visibility */
.washi-overlay {
  background: repeating-linear-gradient(
    87deg,
    transparent,
    transparent 3px,
    rgba(139, 69, 19, 0.03) 3px,
    rgba(139, 69, 19, 0.03) 4px
  );
}
```

#### Kumihimo Cord Indicators
```typescript
// Braided cord showing scroll position
interface ScrollIndicator {
  type: 'kumihimo-cord';
  material: 'silk' | 'cotton';
  colors: string[];  // Interwoven colors
  thickness: number;
  
  // Dynamic properties
  topLength: number;    // 0-100% of remaining items
  bottomLength: number; // 0-100% of remaining items
  tension: number;      // Stretched when near limits
}

// Visual representation
const cordVisual = {
  pattern: '∿∿∿∿∿', // Wavy for relaxed
  stretched: '≈≈≈≈≈', // Tighter when pulled
  absent: '     ',     // No cord at list end
};
```

### Layout Positions
- **Right Edge**: Pattern selection
- **Bottom Edge**: Color variants
- **Left Edge**: Tools
- **Top Edge**: Quick actions

## Functional Specifications

### Gesture Controls
| Gesture | Action | Feedback |
|---------|--------|----------|
| Swipe from edge | Open fan | Unfold animation + soft "shh" sound |
| Swipe up/down | Rotate fan items | Subtle "tick" per segment |
| Tap center item | Select and close | Confirmation "pop" |
| Swipe away | Close without selecting | Fold animation + "fwip" sound |
| Tap outside | Dismiss to folded | Quick fold + soft sound |
| Two-finger rotate | Fast spin (iPad) | Momentum physics |
| Pinch | Close fan | Smooth collapse |

### Sound Design
```javascript
const fanSounds = {
  unfold: 'soft-paper-slide.mp3',    // "shhhhh"
  fold: 'paper-snap.mp3',             // "fwip"
  segmentTick: 'bamboo-tick.mp3',    // subtle click
  selection: 'ink-stamp.mp3',         // satisfying confirmation
  rubberBand: 'silk-stretch.mp3'     // at list ends
};
```

### Scroll Indicators
```
     Kumihimo (braided cord) indicators
            ┌──────┐
     ∿∿∿∿∿∿∿│      │  ← More items above
            │      │
   Selected │  ■   │
            │      │
     ~~~~~~~~│      │  ← More items below
            └──────┘
     
The cord shortens as you approach the end
```

### Animation Timing
```javascript
const animations = {
  unfold: {
    duration: 300ms,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 20ms per segment
  },
  rotation: {
    physics: 'momentum-based',
    friction: 0.95,
    snapPoints: true
  },
  selection: {
    scale: 1.1,
    duration: 200ms,
    haptic: 'medium'
  }
};
```

## Component Architecture

### Base Fan Interface
```typescript
interface FanInterface<T> {
  // Positioning
  edge: 'top' | 'right' | 'bottom' | 'left';
  offset?: number; // Distance from corner
  
  // Content
  items: T[];
  renderItem: (item: T, isActive: boolean) => ReactNode;
  renderPreview?: (item: T) => ReactNode;
  
  // Behavior
  onSelect: (item: T) => void;
  onPreview?: (item: T) => void; // Live preview
  
  // Styling
  theme?: FanTheme;
  maxVisible?: number; // Segments shown
  segmentAngle?: number; // Degrees per item
}

interface FanTheme {
  handleStyle: 'traditional' | 'modern' | 'minimal';
  colors: {
    active: string;
    inactive: string;
    handle: string;
  };
  materials?: 'paper' | 'silk' | 'wood';
}
```

## Use Case Implementations

### 1. Pattern Selection Fan
```typescript
const PatternFan = {
  edge: 'right',
  items: patternTypes,
  renderItem: (pattern) => <PatternThumbnail {...pattern} />,
  renderPreview: (pattern) => <PatternFullPreview {...pattern} />,
  onPreview: (pattern) => updateCanvasPreview(pattern),
  onSelect: (pattern) => addPatternToCanvas(pattern)
};
```

### 2. Color Variant Fan
```typescript
const ColorVariantFan = {
  edge: 'bottom',
  items: selectedPattern.variants,
  renderItem: (variant) => <MiniPattern colors={variant.colors} />,
  onPreview: (variant) => updatePatternColors(variant),
  onSelect: (variant) => applyColorVariant(variant)
};
```

### 3. Tool Selection Fan
```typescript
const ToolFan = {
  edge: 'left',
  items: availableTools,
  renderItem: (tool) => <ToolIcon icon={tool.icon} />,
  onSelect: (tool) => setActiveTool(tool)
};
```

## iPad Optimizations

### Touch Enhancements
- **Apple Pencil**: Precise selection with hover states
- **Multi-touch**: Two-finger rotation for fast scrolling
- **ProMotion**: 120Hz animations on supported iPads
- **Haptic Feedback**: Subtle taps on segment changes

### Responsive Scaling
```css
/* iPad Mini */
@media (min-width: 768px) {
  --fan-radius: 200px;
  --segment-size: 60px;
}

/* iPad Pro 12.9" */
@media (min-width: 1366px) {
  --fan-radius: 300px;
  --segment-size: 80px;
}
```

## Accessibility

### VoiceOver Support
- Announce fan opening: "Pattern selection fan opened"
- Read current selection: "Log Cabin pattern, 3 of 12"
- Gesture hints: "Swipe up or down to browse patterns"

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .fan-interface {
    animation: none;
    transition: opacity 0.2s;
  }
}
```

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load only visible segments + buffer
2. **GPU Acceleration**: Transform3d for all animations
3. **Request Animation Frame**: Smooth rotation tracking
4. **Virtual Scrolling**: For fans with many items

### Memory Management
```typescript
// Dispose of off-screen segments
const visibleRange = {
  start: currentIndex - 3,
  end: currentIndex + 3
};

// Pre-render adjacent segments
const preloadRange = {
  start: currentIndex - 5,
  end: currentIndex + 5
};
```

## Future Enhancements

### Phase 1 (MVP)
- Pattern selection fan
- Basic animations
- Touch gestures

### Phase 2
- Color variant fan
- Preview overlay
- Haptic feedback

### Phase 3
- Multi-fan support
- Tool selection
- Quick actions

### Phase 4
- Seasonal themes
- Custom fan designs
- Social sharing of fan layouts

## Brand Impact

### Marketing Messages
- "The first quilt designer with Japanese fan interface"
- "Where tradition unfolds into innovation"
- "Design flows like seasons"

### Differentiation Points
1. No other quilt software uses gestural fans
2. Combines cultural aesthetics with modern UX
3. Creates memorable, shareable moments
4. Natural fit for social media demos

## Implementation Notes

### Technology Stack
- React with Framer Motion for animations
- Touch gesture library (react-use-gesture)
- CSS transforms for performance
- Canvas API for live previews

### Testing Considerations
- Test on all iPad sizes
- Verify gesture conflicts with iOS
- Performance testing with 50+ items
- Accessibility audit with real users

---

This fan interface transforms routine selection tasks into delightful moments, making Quiltographer not just a tool, but an experience.