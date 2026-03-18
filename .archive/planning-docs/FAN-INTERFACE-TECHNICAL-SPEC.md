# Fan Interface Technical Specification
Quick implementation reference for developers

## Core Component Structure

```tsx
// components/ui/FanInterface.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';

interface FanInterfaceProps<T> {
  isOpen: boolean;
  edge: 'top' | 'right' | 'bottom' | 'left';
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T, isActive: boolean) => ReactNode;
}
```

## CSS Architecture

```css
/* Base fan container */
.fan-container {
  --fan-radius: 250px;
  --segment-angle: 15deg;
  --handle-size: 40px;
  
  position: fixed;
  pointer-events: none;
}

.fan-container.open {
  pointer-events: auto;
}

/* Position classes */
.fan-container.edge-right {
  right: calc(var(--fan-radius) * -1);
  top: 50%;
  transform: translateY(-50%);
}

/* Segment styling */
.fan-segment {
  position: absolute;
  transform-origin: var(--origin-x) var(--origin-y);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Animation Sequences

```typescript
// Fan unfold animation
const unfoldAnimation = {
  initial: { rotate: 0, opacity: 0, scale: 0.8 },
  animate: (i: number) => ({
    rotate: i * 15 - 45, // Fan spread
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.02,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }),
  exit: { rotate: 0, opacity: 0, scale: 0.8 }
};

// Rotation physics
const rotationConfig = {
  type: "spring",
  damping: 30,
  stiffness: 300,
  mass: 0.8
};
```

## Gesture Handling

```typescript
const bind = useGesture({
  onDrag: ({ movement: [, my], velocity: [, vy], last }) => {
    const newRotation = currentRotation + my * 0.5;
    setRotation(newRotation);
    
    if (last && Math.abs(vy) > 0.5) {
      // Momentum scroll
      animateRotation(newRotation + vy * 100);
    }
  },
  onWheel: ({ delta: [, dy] }) => {
    setRotation(r => r + dy * 0.1);
  }
});
```

## State Management

```typescript
// zustand store slice
interface FanState {
  openFans: Set<string>;
  activeSelections: Map<string, any>;
  
  openFan: (fanId: string) => void;
  closeFan: (fanId: string) => void;
  setSelection: (fanId: string, item: any) => void;
}
```

## Quick Integration Example

```tsx
// In main app
const [patternFanOpen, setPatternFanOpen] = useState(false);

// Trigger
<button 
  onTouchStart={(e) => {
    if (e.touches[0].clientX > window.innerWidth - 50) {
      setPatternFanOpen(true);
    }
  }}
/>

// Fan component
<FanInterface
  isOpen={patternFanOpen}
  edge="right"
  items={patterns}
  onSelect={(pattern) => {
    addPattern(pattern);
    setPatternFanOpen(false);
  }}
  renderItem={(pattern, isActive) => (
    <PatternPreview pattern={pattern} highlighted={isActive} />
  )}
/>
```

## Sound Integration

```typescript
// Preload sounds for instant feedback
const fanSounds = {
  unfold: new Audio('/sounds/washi-unfold.mp3'),
  fold: new Audio('/sounds/washi-fold.mp3'),
  tick: new Audio('/sounds/bamboo-tick.mp3'),
  select: new Audio('/sounds/ink-stamp.mp3'),
  stretch: new Audio('/sounds/silk-stretch.mp3')
};

// Haptic feedback timing
const hapticPattern = {
  segmentChange: { type: 'impact', style: 'light' },
  selection: { type: 'impact', style: 'medium' },
  endReached: { type: 'notification', style: 'warning' }
};
```

## Scroll Indicator Implementation

```tsx
// Kumihimo cord component
const ScrollIndicator: FC<{position: 'top' | 'bottom', remaining: number}> = 
  ({ position, remaining }) => {
    const maxSegments = 5;
    const segments = Math.ceil((remaining / totalItems) * maxSegments);
    const isTense = remaining < 2;
    
    return (
      <div className={`kumihimo-cord ${position}`}>
        {Array.from({ length: segments }).map((_, i) => (
          <div 
            key={i}
            className={`cord-segment ${isTense ? 'tense' : 'relaxed'}`}
            style={{
              '--wave-offset': `${i * 20}deg`,
              '--segment-color': cordColors[i % cordColors.length]
            }}
          />
        ))}
      </div>
    );
  };
```

## Washi Paper Texture

```css
/* Base washi texture */
.fan-surface {
  position: relative;
  background: 
    radial-gradient(ellipse at top, #fdf4e3 0%, #f9f0dc 100%),
    url('data:image/svg+xml,...'); /* Inline SVG texture */
  
  /* Fiber overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      repeating-linear-gradient(
        87deg,
        transparent 0,
        transparent 3px,
        rgba(139, 69, 19, 0.02) 3px,
        rgba(139, 69, 19, 0.02) 4px
      ),
      repeating-linear-gradient(
        -87deg,
        transparent 0,
        transparent 2px,
        rgba(139, 69, 19, 0.015) 2px,
        rgba(139, 69, 19, 0.015) 3px
      );
    mix-blend-mode: multiply;
  }
}

/* Depth shadow on washi */
.fan-segment {
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(139, 69, 19, 0.05);
}

## Accessibility Implementation

```tsx
<div
  role="menu"
  aria-label="Pattern selection fan"
  aria-orientation="vertical"
>
  {items.map((item, index) => (
    <div
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') rotateNext();
        if (e.key === 'ArrowUp') rotatePrev();
        if (e.key === 'Enter') selectCurrent();
      }}
    >
      {renderItem(item, isActive)}
    </div>
  ))}
</div>
```