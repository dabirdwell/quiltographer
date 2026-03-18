# 🎌 Fan Interface Design Specification

## Concept Overview

The Fan Interface is Quiltographer's signature interaction pattern - a Japanese-inspired UI element that combines cultural aesthetics with modern touch interactions. It appears as a folding fan (sensu/扇子) that emerges from screen edges, unfolds to reveal options, and allows spinning selection through natural gestures.

## Core Design Principles

### Cultural Inspiration
- **Sensu (扇子)**: Traditional Japanese folding fan
- **Ma (間)**: Conscious use of negative space when closed
- **Kinetic Beauty**: Movement as integral to the experience
- **Seasonal Flow**: Options flow like changing seasons

### Interaction Philosophy
- **Discoverable**: Peek from edges hints at availability
- **Delightful**: Unfolding animation creates anticipation
- **Efficient**: Spinning through options is faster than tapping
- **Memorable**: Unique interaction creates brand identity

## Visual Design

### Anatomy of the Fan
```
              ┌─────────────┐ ← Preview Overlay (semi-transparent)
              │   Pattern   │    Shows selected item detail
              │   Preview   │
              └─────────────┘
                     ↓
    ╱────────────────┼────────────────╲
  ╱──────────────────┼──────────────────╲
╱────────────────────┼────────────────────╲  ← Fan Segments
─────────────────────┼─────────────────────   (5-9 visible)
╲────────────────────┼────────────────────╱
  ╲──────────────────┼──────────────────╱
    ╲────────────────┼────────────────╱
                     │
                  ═══╪═══ ← Handle (appears at list ends)
```

### States

1. **Hidden**: Thin edge glow indicates availability
2. **Peeking**: 10px visible on edge interaction
3. **Unfolding**: Animated expansion (0.3s ease-out)
4. **Open**: Full fan display with center selection
5. **Spinning**: Smooth rotation during scroll
6. **Rubber-band**: Elastic bounce at list ends

## Interaction Patterns

### Gestures (iPad Optimized)
| Gesture | Action | Feedback |
|---------|--------|----------|
| Swipe from edge | Open fan | Unfold animation |
| Swipe up/down | Spin fan | Haptic ticks |
| Tap segment | Jump to item | Spring animation |
| Pinch | Close fan | Fold animation |
| Two-finger rotate | Fast spin | Momentum physics |
| Flick | Velocity scroll | Deceleration curve |

### Selection Mechanics
- **Center Lock**: Middle segment is always selected
- **Live Preview**: Background updates during spin
- **Confirmation**: Tap center or swipe away to confirm
- **Cancel**: Pinch or tap outside to close without change

## Implementation Specifications

### Fan Types and Edge Assignments

#### Right Edge: Pattern Selection Fan
```typescript
{
  edge: 'right',
  items: PatternDefinitions[],
  segmentCount: 7,
  anglePerSegment: 15,
  renderItem: (pattern) => <PatternThumbnail />,
  backgroundColor: 'rgba(255, 248, 240, 0.9)', // Warm paper
}
```

#### Bottom Edge: Color Variant Fan
```typescript
{
  edge: 'bottom',
  items: ColorVariants[],
  segmentCount: 5,
  anglePerSegment: 20,
  renderItem: (variant) => <ColorSwatchArc />,
  backgroundColor: 'rgba(240, 248, 255, 0.9)', // Cool paper
}
```

#### Left Edge: Tool Fan
```typescript
{
  edge: 'left',
  items: Tools[],
  segmentCount: 5,
  anglePerSegment: 18,
  renderItem: (tool) => <ToolIcon animated />,
  backgroundColor: 'rgba(245, 245, 245, 0.9)', // Neutral
}
```

#### Top Edge: Quick Actions Fan
```typescript
{
  edge: 'top',
  items: QuickActions[],
  segmentCount: 5,
  anglePerSegment: 20,
  renderItem: (action) => <ActionButton />,
  backgroundColor: 'rgba(250, 250, 250, 0.9)', // Clean
}
```

### Animation Specifications

#### Unfold Sequence
```css
@keyframes fanUnfold {
  0% {
    transform: translateX(100%) scaleX(0.1);
    opacity: 0;
  }
  30% {
    transform: translateX(0) scaleX(0.3);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0) scaleX(1) rotate(var(--fan-angle));
    opacity: 1;
  }
}

.fan-segment {
  animation: fanUnfold 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: calc(var(--index) * 0.05s);
}
```

#### Handle Appearance
- Shows decorative handle when reaching list end
- Rubber-band effect with `tension: 200, friction: 20`
- Handle design changes based on theme (wood, metal, paper)

## Technical Architecture

### Component Structure
```typescript
interface FanInterface<T> {
  // Positioning
  edge: 'top' | 'right' | 'bottom' | 'left';
  offset?: number; // Distance from corner
  
  // Content
  items: T[];
  renderItem: (item: T, isActive: boolean, index: number) => ReactNode;
  renderPreview?: (item: T) => ReactNode;
  
  // Behavior
  onSelect: (item: T) => void;
  onPreview?: (item: T) => void;
  closeOnSelect?: boolean;
  
  // Visual
  theme?: 'traditional' | 'modern' | 'minimal';
  handleStyle?: 'wood' | 'metal' | 'paper' | 'none';
  segmentCount?: number; // Visible segments (5-9)
  anglePerSegment?: number; // Degrees (15-25)
  
  // Interaction
  gestures?: {
    swipeToOpen: boolean;
    pinchToClose: boolean;
    twoFingerRotate: boolean;
    velocityScroll: boolean;
    hapticFeedback: 'light' | 'medium' | 'strong';
  };
  
  // Performance
  lazyLoad?: boolean;
  preloadRange?: number; // Segments to preload
}
```

### State Management
```typescript
interface FanState {
  isOpen: boolean;
  currentIndex: number;
  scrollVelocity: number;
  isDragging: boolean;
  isAnimating: boolean;
  
  // Advanced
  openProgress: number; // 0-1 for partial opening
  spinSpeed: number; // For momentum
  selectedHistory: number[]; // For quick return
}
```

## Use Cases

### 1. Pattern Selection
- User swipes from right edge
- Fan unfolds showing pattern thumbnails
- As user spins, canvas shows ghosted preview
- Center pattern is highlighted
- Background subtly shifts to show pattern in context

### 2. Color Variant Selection
- User selects a pattern first
- Swipe up from bottom opens color fan
- Each segment shows same pattern, different colors
- Real-time preview on canvas
- Can cycle through variants without closing

### 3. Tool Selection
- Swipe from left for tools
- Icons animate as they reach center
- Current tool stays highlighted
- Quick muscle memory for common tools

### 4. Project Management
- Top swipe for project actions
- Save, Load, Export, Share
- Context-sensitive options
- Most recent projects in fan

## Differentiation Strategy

### Unique Selling Points
1. **Cultural Authenticity**: Real Japanese design principles
2. **Touch-First**: Built for tablets, not adapted
3. **Memorable**: Users will show others
4. **Efficient**: Faster than traditional menus
5. **Brandable**: Instantly recognizable

### Competitive Advantages
- No other design tool uses fan interface
- Perfect for creative/artistic applications
- Natural for iPad Pro + Apple Pencil
- Scales from phone to tablet elegantly

## Implementation Phases

### Phase 1: Core Fan Component
- Basic open/close animations
- Single fan implementation
- Pattern selection use case

### Phase 2: Full Integration
- All four edge fans
- Gesture recognition
- Haptic feedback

### Phase 3: Advanced Features
- Multi-fan compositions
- Seasonal themes
- Custom fan designs
- Sound design

### Phase 4: Platform Optimization
- Apple Pencil pressure sensitivity
- ProMotion 120Hz support
- Accessibility features
- Keyboard shortcuts

## Performance Considerations

### Optimization Strategies
```typescript
// Lazy loading
const FanContent = lazy(() => import('./FanContent'));

// Virtualization for long lists
const visibleRange = {
  start: Math.max(0, currentIndex - 3),
  end: Math.min(items.length, currentIndex + 3)
};

// GPU acceleration
.fan-interface {
  will-change: transform;
  contain: layout style paint;
}

// Debounced preview updates
const debouncedPreview = debounce(updatePreview, 100);
```

### Memory Management
- Unmount hidden fans
- Recycle segment components
- Limit preview resolution
- Cancel pending animations

## Accessibility

### Keyboard Navigation
- `Tab` to focus fan trigger
- `Space/Enter` to open
- `Arrow keys` to navigate
- `Escape` to close

### Screen Reader Support
- Announce fan opening/closing
- Read current selection
- Describe available gestures
- Provide skip navigation

### Reduced Motion
- Simple slide instead of unfold
- No spinning animation
- Instant selection
- Respect system preferences

## Future Enhancements

### AI Integration
- Smart item ordering based on usage
- Predictive highlighting
- Context-aware options
- Gesture learning

### Advanced Interactions
- Fan-to-fan dragging
- Nested subfans
- 3D depth effects
- Particle effects on selection

### Customization
- User-created fan themes
- Custom handle designs
- Personal gesture preferences
- Saved fan configurations

---

*The Fan Interface represents Quiltographer's commitment to marrying traditional aesthetics with cutting-edge interaction design, creating an experience that is both culturally respectful and technologically innovative.*