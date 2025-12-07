# Quiltographer: Unified Vision
*Recorded December 2025*

## The Core Metaphor: The Genie's Lamp

The AI assistant is the genie. Warm, poetic, deeply knowledgeable about quilting. Present in both products, but with different powers unlocked:

- **Pattern Reader**: The genie can *teach* and *explain*
- **Full Quiltographer**: The genie can *create* and *design*

Same personality. Same voice. Different wishes granted.

---

## The Fan as Visual Key

### Pattern Reader (Single Fan)
- One small fan handle, bottom corner
- Contains: Mode selector, Settings, Reference
- Clearly *part* of something larger - folded, dormant
- The ghost of where other fans would be... almost visible

### Full Quiltographer (Four Fans)
- Four fans, one on each edge:
  - **Right edge**: Pattern library
  - **Bottom edge**: Colors & fabrics  
  - **Left edge**: Tools
  - **Top edge**: Community / Quick actions
- Full gestural control - swipe to open, rotate to browse

### The Upgrade Moment
The fans *unfold*. What was a single handle becomes a full toolkit. The same interface, revealed.

---

## The Four-Fan Innovation: Parallel Exploration

Single fan = serial decisions (pick, close, pick, close, evaluate)

Four fans = parallel discovery

```
         Left thumb on color fan
                    ↓
    ┌───────────────────────────────────┐
    │                                   │
    │        Canvas updates             │
    │        in real-time               │
    │        as you explore             │
    │                                   │ ← Right thumb
    │                                   │   on pattern fan
    ├───────────────────────────────────┤
    │  ◆───◆───◆───●───◆───◆───◆      │
    └───────────────────────────────────┘
```

**Multi-touch iPad-first design**: Both thumbs in natural edge positions, adjusting two axes simultaneously. Canvas morphs in real-time.

### What This Enables
- **Accidental harmonies**: Combinations you'd never think to try
- **Unexpected scale discoveries**: "When blocks got bigger, the busy print works"
- **Rapid elimination**: Feel through 20 combinations in 10 seconds
- **No commit/revert cycle**: "Undo" is just sliding back

### The Pitch
> "Other quilt design tools make you click, apply, wait, and hope.
> Quiltographer lets you *play*."

---

## Sensory Design Language

### Ink
- Ink-wash animations for transitions and completions
- Not harsh - dispersing, organic, flowing
- Like calligraphy brush touching wet paper
- Step completion: gentle ink fade rather than confetti

### Fluid
- Wind/breath in animations (unfurling, settling)
- Water-like state transitions
- Nothing snaps - everything flows
- The fan opens like silk catching air

### Texture
- Washi paper is tactile, not flat
- Fiber visibility at edges
- Kumihimo cord has actual braid pattern
- Surfaces feel like they have weight

### Sound (Optional, Off by Default)
- Paper slide for fan open
- Bamboo tick for segment rotation
- Ink stamp for confirmation
- Silk stretch at list ends

---

## The Folded Crane (🦢)

Small origami crane, corner of screen.

### In Pattern Reader
- Folded, still
- Tap reveals a haiku about what's dormant:
  > *"The crane dreams of flight.*
  > *Some tools are still folded,*
  > *waiting for spring."*

### In Full Quiltographer
- Unfolded, subtle animation
- Represents creative flight enabled
- Same element, transformed

---

## Shared Elements Across Products

| Element | Pattern Reader | Full Quiltographer |
|---------|---------------|-------------------|
| Washi paper | Background texture | Canvas surface |
| Kumihimo cord | Pattern progress | Design session progress |
| Visual diagrams | Static SVG illustrations | Interactive, draggable blocks |
| AI assistant | Explains techniques | Generates designs |
| Block references | "This uses Flying Geese" | "Add Flying Geese to canvas" |
| Fan interface | One fan (settings/nav) | Four fans (full toolkit) |
| Seasonal awareness | Encouragement messages | Entire palette shifts |
| Glossary | Learn terms | Use terms to create |
| Ink animations | Step transitions | All interactions |

---

## The AI Voice (Unified)

Whether explaining or creating, same warmth:

**Explaining (Reader):**
> "Right Sides Together means placing your fabrics so the printed sides face each other - like closing a book. When you sew and flip, the seam hides inside."

**Creating (Full):**
> "I've placed three Log Cabin blocks in a Barn Raising arrangement. The light fabrics spiral outward from the center. Shall I try a different rotation?"

Same metaphors. Same sense of a knowledgeable quilter behind the words.

---

## Pattern Reader Modes

### The Four Phases of Following a Pattern

1. **Overview Mode**: First read. Scroll is fine - you're reading.
2. **Cut Mode**: Just cutting checklist. Big checkboxes. Standing at table.
3. **Make Mode**: ONE step, full screen. Swipe to navigate. No scroll. 90% of time here.
4. **Ref Mode**: Calculators, glossary, materials. The organized junk drawer.

### Make Mode Focus

```
┌─────────────────────────────────────────┐
│                                         │
│              Step 5 of 12               │
│                                         │
│    "Press seam toward darker fabric"    │
│                                         │
│            [ ← PRESS → ]                │
│                                         │
│                               🦢        │
├─────────────────────────────────────────┤
│   [ ← ]              [ → ]        ☰    │
└─────────────────────────────────────────┘
```

60% empty space. The instruction floats like calligraphy on rice paper.

---

## Mysterious Hints (Not Sales Pitches)

### After Completing a Pattern
> "You've finished your Flying Geese table runner.
> The geese know where they're going now.
> 
> What's next for you?"

### When Viewing Block Diagram
> "This pattern uses a classic Log Cabin block.
> *One of 47 in the traditional collection.*"

Information in Reader. Link to block library in Full.

---

## The Feeling We're After

**Pattern Reader should feel like:**
> "This is beautiful and complete. But I sense there's more here."

**Full Quiltographer should feel like:**
> "Ah. *This* is what the crane was dreaming about."

---

## Technical Foundation (Shared)

- Next.js 14 with App Router
- SVG-first rendering (scales to canvas)
- Japanese theme system (already built)
- Same component library
- Same AI voice/prompts
- State management ready for real-time updates

---

*This document captures the vision as of December 2025. 
The Pattern Reader MVP comes first, but every decision 
should serve this larger whole.*
