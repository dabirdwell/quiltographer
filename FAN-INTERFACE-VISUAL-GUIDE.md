# Fan Interface Visual Guide

## Visual States Reference

### 1. Closed State (Idle)
```
Screen Edge →│
             │
             │  (Hidden)
             │
             │
```

### 2. Peek State (Touch Started)
```
Screen Edge →│╱
             │  ← Small preview appears
             │    with washi texture
             │
```

### 3. Unfolding Animation (Opening)
```
Frame 1:     │╱
Frame 2:     │╱╱
Frame 3:    ╱│╱╱╱
Frame 4:   ╱╱│╱╱╱╱
Frame 5:  ╱╱╱│╱╱╱╱╱  ← Segments stagger in
              
Sound: "shhhhh" (paper sliding)
```

### 4. Open State (Interactive)
```
        ╭─────────────╮
        │ Log Cabin   │  ← Preview overlay
        ╰─────────────╯
              ↓
         ∿∿∿∿∿∿∿∿  ← Kumihimo cord (scroll indicator)
         ╔═══════╗     Shows items remaining above
       ╱ ║       ║ ╲
     ╱   ║       ║   ╲    ← Active segment highlighted
   ╱     ║       ║     ╲     on washi paper texture
 ╱       ║       ║       ╲
╱────────╚═══════╝────────╲
         ~~~~~~~~~~  ← Kumihimo cord (scroll indicator)
                        Shows items remaining below
```

### 5. Rotation Interaction
```
Swipe Up ↑
         ∿∿∿  ← Cord gets shorter near end
    [Flying Geese]     ← Rotating out
    [Log Cabin]        ← Currently selected
    [Nine Patch]       ← Rotating in
         ~~~~  ← Cord length shows distance to end
Swipe Down ↓

Sound: subtle "tick" per segment
```

### 6. End of List (Rubber Band)
```
         ╭─╮
         │○│  ← Fan handle appears
         ╰─╯     (no cord indicator here)
       ╱ | ╲
     ╱   |   ╲  ← Elastic bounce effect
   ╱  ~~~|~~~  ╲
 ╱       |       ╲
 
Sound: "silk-stretch" effect
```

### 7. Folding Animation (Closing)
```
Frame 1:  ╱╱╱│╱╱╱╱╱
Frame 2:   ╱╱│╱╱╱╱
Frame 3:    ╱│╱╱╱
Frame 4:     │╱╱
Frame 5:     │╱
Frame 6:     │  ← Tucked away

Sound: "fwip" (quick paper fold)
```

## Color Schemes

### Traditional Fan Theme
```css
--fan-bg: #fdf4e3;        /* Washi paper */
--fan-accent: #8b4513;    /* Wood handle */
--fan-shadow: #00000020;  /* Soft shadow */
--selection: #dc2626;     /* Red silk */
```

### Modern Minimal Theme
```css
--fan-bg: #ffffff;
--fan-accent: #1f2937;
--fan-shadow: #0000000a;
--selection: #3b82f6;
```

### Seasonal Themes
```css
/* Spring - Sakura */
--fan-bg: #fce7f3;
--fan-accent: #ec4899;

/* Summer - Ocean */
--fan-bg: #dbeafe;
--fan-accent: #0ea5e9;

/* Autumn - Maple */
--fan-bg: #fed7aa;
--fan-accent: #ea580c;

/* Winter - Snow */
--fan-bg: #f3f4f6;
--fan-accent: #6b7280;
```

## Size Variations

### Compact (iPad Mini)
```
Fan Radius: 180px
Segments: 5 visible
Handle: 32px
```

### Standard (iPad Air)
```
Fan Radius: 250px
Segments: 7 visible
Handle: 40px
```

### Large (iPad Pro 12.9")
```
Fan Radius: 350px
Segments: 9 visible
Handle: 48px
```

## Interaction Zones

```
         Active Zone
        ╱─────────╲
      ╱      ↕      ╲     ← Swipe here to rotate
    ╱   Dead Zone    ╲
  ╱         ↕         ╲   ← No interaction
╱───────────┼───────────╲
            │
      Tap to close
```

## Shadow & Depth

```css
/* Layered shadows for depth */
.fan-container {
  filter: 
    drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))
    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06));
}

/* Selected segment lifts */
.fan-segment.active {
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.15));
  transform: translateZ(10px);
}
```

## Integration Points

### 1. Pattern Library Fan (Right Edge)
```
├─ Log Cabin
├─ Flying Geese
├─ Nine Patch
├─ Sashiko Cross
└─ [Handle at end]
```

### 2. Color Variants Fan (Bottom Edge)
```
├─ Traditional
├─ Modern
├─ Autumn
├─ Ocean
└─ [Handle at end]
```

### 3. Tools Fan (Left Edge)
```
├─ Select
├─ Move
├─ Rotate
├─ Delete
└─ [Handle at end]
```

### 4. Actions Fan (Top Edge)
```
├─ New
├─ Save
├─ Export
├─ Share
└─ [Handle at end]
```