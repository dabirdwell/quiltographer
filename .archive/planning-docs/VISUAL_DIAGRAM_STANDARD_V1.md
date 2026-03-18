# Quiltographer Visual Diagram Standard v1.0

**Created:** December 10, 2025
**Purpose:** Establish the aesthetic and interaction standards for all technique diagrams

---

## Design Philosophy

### Core Principles

1. **Ma (間) - Negative Space**
   - Generous breathing room around elements
   - Let the eye rest between phases
   - Empty space is as important as content

2. **Wabi-sabi (侘寂) - Imperfect Beauty**
   - Subtle texture, not clinical perfection
   - Hand-drawn feeling, not CAD precision
   - Natural materials (washi, ink, thread)

3. **Shibui (渋い) - Restrained Elegance**
   - Never flashy or overwhelming
   - Delight through subtlety, not spectacle
   - Animation serves understanding, not decoration

4. **Ikigai (生きがい) - Purpose**
   - Every motion has meaning
   - Animation clarifies, not entertains
   - Guide the eye to what matters next

---

## Animation Vocabulary

### Entry Animations

**Ink Bleed Reveal**
- Elements appear as if ink is spreading on washi paper
- Soft edge that expands outward
- Use for: New phases, new elements appearing
- Timing: 400-600ms with easeOut

```css
@keyframes inkBleed {
  0% { 
    clip-path: circle(0% at center);
    opacity: 0.3;
  }
  50% { 
    opacity: 0.8;
  }
  100% { 
    clip-path: circle(100% at center);
    opacity: 1;
  }
}
```

**Brush Stroke Draw**
- Lines appear as if being drawn by brush
- Use stroke-dasharray/stroke-dashoffset animation
- Use for: Diagonal lines, sewing paths, measurement lines
- Timing: 300-500ms with easeInOut

```css
@keyframes brushDraw {
  from { stroke-dashoffset: 200; }
  to { stroke-dashoffset: 0; }
}
```

**Fold Reveal**
- Elements appear as if fabric is being folded open
- Slight 3D transform with perspective
- Use for: Showing RST layers, pressing open
- Timing: 400ms with spring easing

### Attention Animations

**Gentle Pulse**
- Subtle scale oscillation (1.0 → 1.02 → 1.0)
- Very slow, barely perceptible
- Use for: "This is where to look" indicator
- Timing: 2000ms, infinite, ease-in-out

```css
@keyframes gentlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

**Breath Glow**
- Soft shadow/glow that expands and contracts
- Like the element is breathing
- Use for: Current action area, clickable elements
- Timing: 3000ms, infinite, ease-in-out

```css
@keyframes breathGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 0 rgba(231, 111, 81, 0));
  }
  50% { 
    filter: drop-shadow(0 0 8px rgba(231, 111, 81, 0.3));
  }
}
```

**Ink Dot Pulse**
- Small indicator dot that pulses like a heartbeat
- Use for: "Click here" or "Pay attention here"
- Timing: 1500ms, infinite

### Transition Animations

**Silk Slide**
- Elements glide smoothly like silk
- Use for: Phase transitions, repositioning
- Timing: 300ms with easeOut

**Paper Fold**
- Elements transform as if paper is folding
- Slight perspective shift
- Use for: Pressing, folding actions

**Thread Pull**
- Elements move as if being pulled by thread
- Slight overshoot/spring
- Use for: Stitching paths, chain piecing

### Exit Animations

**Fade to Memory**
- Element fades but leaves subtle ghost
- Previous state visible as reference
- Use for: Completed steps still relevant

**Brush Away**
- Element dissolves like wet ink being brushed
- Use for: Completed steps no longer needed

---

## Micro-Interactions

### Hover States

**Fabric Lift**
- On hover, fabric elements lift slightly (translateY -2px)
- Subtle shadow deepens
- Use for: Interactive fabric pieces

**Ink Darken**
- Lines darken slightly on hover
- Stroke width increases by 0.5px
- Use for: Clickable lines/paths

**Label Emerge**
- Hidden labels fade in on hover
- Position near cursor, not overlapping element
- Use for: Measurements, technical details

### Click Feedback

**Stamp Press**
- Brief scale down (0.98) then return
- Like pressing a hanko (stamp)
- Timing: 100ms down, 200ms return

**Ripple Touch**
- Soft circular ripple from click point
- Fades outward
- Use for: Phase advancement clicks

### Focus States

**Thread Border**
- Focus ring styled as sashiko stitching
- Dashed, offset animation
- Accessible but beautiful

---

## Phase Transitions

### Between Phases

1. **Current content exits** (200ms)
   - Fade or slide appropriate to content
   - Don't linger - respect user's time

2. **Brief pause** (100ms)
   - Let the eye reset
   - Anticipation moment

3. **New content enters** (300-400ms)
   - Primary elements first
   - Secondary elements follow (stagger 50-100ms)
   - Labels last

4. **Attention guides activate** (after 500ms)
   - Pulse begins on key element
   - Only if user hasn't interacted

### Phase Indicator Animation

- Current phase dot: Gentle pulse
- Completed phases: Filled, subtle glow
- Upcoming phases: Hollow, low opacity
- Transition: Smooth scale and color change

---

## Color in Motion

### Color Should Breathe

- Never static flat color
- Subtle gradient shifts over time
- Fabric colors should have micro-texture animation

### Semantic Color Motion

- **Persimmon (#e76f51)**: Warm pulse for action items
- **Sage (#84a98c)**: Calm fade for completion
- **Indigo (#264653)**: Steady for information
- **Silk Red (#dc2626)**: Sharp for cutting/warnings

### Thread Color Animation

- Sashiko stitching: Subtle dash-offset animation
- Creates illusion of thread moving through fabric
- Very slow (10+ seconds per cycle)

---

## Sound Design (Future)

*Not implemented in v1.0, but designed for*

- **Phase advance**: Soft paper rustle
- **Cutting**: Clean snip
- **Pressing**: Fabric whisper
- **Completion**: Gentle chime (like furin wind bell)

All sounds should be:
- Optional (off by default)
- Short (<500ms)
- Natural, not synthetic
- Volume-matched and pleasant

---

## Accessibility Requirements

### Motion Sensitivity

- Respect `prefers-reduced-motion`
- Reduced motion mode:
  - No infinite animations
  - Instant transitions instead of animated
  - Static indicators instead of pulses
  
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Management

- Clear focus indicators
- Logical tab order
- Phase navigation via keyboard (← →)
- Screen reader announcements for phase changes

### Color Contrast

- All text meets WCAG AA (4.5:1 minimum)
- Interactive elements meet 3:1 for non-text
- Don't rely on color alone for meaning

---

## Implementation Checklist

For each diagram, verify:

- [ ] Uses WashiSurface or equivalent background
- [ ] Corner registration marks present
- [ ] Ink stamp signature element
- [ ] Click-to-advance interaction
- [ ] Keyboard navigation works
- [ ] Phase indicator with KumihimoProgress or equivalent
- [ ] Entry animations on phase change
- [ ] Attention pulse on primary action area
- [ ] Hover states on interactive elements
- [ ] Respects prefers-reduced-motion
- [ ] Focus states styled
- [ ] ARIA labels for phases
- [ ] Uses theme colors consistently
- [ ] Measurements parameterized
- [ ] Colors parameterized

---

## Reference Implementation

The `HSTDiagram.tsx` component serves as the reference implementation for this standard. All new diagrams should match or exceed its aesthetic quality while incorporating the animation vocabulary defined here.

### Update Plan for HSTDiagram

To bring HSTDiagram to full v1.0 compliance:

1. Add ink bleed reveal for new phases
2. Add brush stroke draw for diagonal line
3. Add gentle pulse on clickable area
4. Add breath glow on current action
5. Add micro-texture animation to fabric fills
6. Add slow sashiko stitch animation
7. Add prefers-reduced-motion support
8. Integrate KumihimoProgress for phase indicator

---

## File Organization

```
src/components/diagrams/
├── animations/
│   ├── inkBleed.ts         # Ink bleed animation utilities
│   ├── brushDraw.ts        # Brush stroke drawing
│   ├── attention.ts        # Pulse, glow effects
│   └── transitions.ts      # Phase transition helpers
├── shared/
│   ├── CornerMarks.tsx     # Registration marks
│   ├── InkStamp.tsx        # Signature stamp
│   ├── FabricPattern.tsx   # Reusable fabric textures
│   └── DiagramContainer.tsx # Standard container with WashiSurface
├── HSTDiagram.tsx          # Reference implementation
├── FlyingGeeseDiagram.tsx
├── ChainPiecingDiagram.tsx
└── index.ts
```

---

*This standard should evolve as we learn what delights users and clarifies techniques.*
