# Quiltographer Visual Diagrams Roadmap

**Created:** December 8, 2025  
**Context:** Pattern Reader MVP → Full Quiltographer evolution  
**Author:** Claude (Opus 4.5) in collaboration with David Birdwell

---

## Strategic Overview

### The Problem
Quilters are visual-tactile learners. Text instructions like "place squares RST and sew ¼" from corner" are confusing without seeing the technique. 92% of quilters struggle with text-only patterns.

### The Solution (Phased)

| Phase | Approach | Coverage |
|-------|----------|----------|
| **MVP (Now)** | Pre-baked interactive technique diagrams | ~90% of published patterns |
| **v2** | AI customizes colors/measurements from pattern text | Same techniques, personalized |
| **Full Product** | Cosmos-based arbitrary input understanding | Drawings, photos, video |

### Why Pre-Baked Works

Quilting is remarkably **modular**. Almost everything is built from a small set of atomic operations combined in different ways. A library of 25-30 well-designed technique diagrams covers the vast majority of published patterns.

---

## Architecture

### Current Implementation

**Interactive Diagrams** (like `HSTDiagram.tsx`):
- Multi-phase click-through animation
- User controls pace
- Japanese aesthetic (corner marks, fabric textures, sashiko stitching)
- Parameterized colors passed in
- 384 lines, production quality

**Auto-Detection** (in `VisualDiagram.tsx`):
- Analyzes instruction text for technique keywords
- Maps to appropriate diagram component
- Falls back to simple static SVG for unknown techniques

### Target Architecture

```
AI Comprehension Pipeline
        ↓
Detects technique (HST, Flying Geese, etc.)
        ↓
Extracts parameters (colors, measurements)
        ↓
Maps to TechniqueDiagram component
        ↓
Renders interactive visualization
```

Each technique diagram should:
1. Accept color parameters (fabric1, fabric2, accent)
2. Accept measurement parameters where relevant
3. Have multiple phases showing progression
4. Include Japanese aesthetic elements
5. Be self-contained and reusable

---

## Technique Diagram Priority List

### Tier 1: Essential (Build First)
These appear in 80%+ of beginner/intermediate patterns.

| Technique | Complexity | Status | Notes |
|-----------|------------|--------|-------|
| **HST (Half Square Triangle)** | Medium | ✅ DONE | 6 phases, full animation |
| **RST (Right Sides Together)** | Low | Partial | Basic version in VisualDiagram |
| **Pressing** | Low | Partial | Needs interactive version |
| **Chain Piecing** | Medium | Not started | Very common efficiency technique |
| **Flying Geese** | Medium | Not started | Nearly as common as HST |
| **Strip Piecing** | Medium | Not started | Foundation of many patterns |

### Tier 2: Common Units (Build Second)
These are the building blocks of most traditional patterns.

| Technique | Complexity | Notes |
|-----------|------------|-------|
| **Four Patch** | Low | Simple but needs clear orientation |
| **Nine Patch** | Low | Slightly more complex layout |
| **QST (Quarter Square Triangle)** | Medium | HST variation, 2 cuts |
| **Snowball Corners (Stitch & Flip)** | Medium | Very popular modern technique |
| **Log Cabin Rounds** | Medium-High | Sequential building, multiple phases |
| **Square-in-a-Square** | Medium | Common traditional unit |

### Tier 3: Intermediate Techniques (Build Third)
Less common but important for pattern coverage.

| Technique | Complexity | Notes |
|-----------|------------|-------|
| **Half Rectangle Triangle** | Medium | Less common than HST |
| **Economy Block** | Medium | Efficient use of fabric |
| **Binding** | High | Multiple methods, finishing technique |
| **Mitered Borders** | High | Precise angle work |
| **Y-Seams** | High | Challenging, needs clear guidance |
| **Nesting Seams** | Low | Important for accuracy |

### Tier 4: Advanced/Specialty (Future)
These require more complex visualization.

| Technique | Complexity | Notes |
|-----------|------------|-------|
| **Foundation Paper Piecing** | Very High | Different workflow entirely |
| **Curved Piecing** | Very High | Requires different visualization |
| **Appliqué (various methods)** | High | Multiple sub-techniques |
| **English Paper Piecing** | Medium | Hand sewing focus |

---

## Detailed Specifications

### Flying Geese (Priority: HIGH)

**What it is:** Rectangle unit with triangle "goose" pointing up, background triangles on sides.

**Phases:**
1. Show finished unit (goal state)
2. Cut pieces: 1 large square, 4 small squares (or show no-waste method)
3. Place small square RST on corner of large square
4. Draw diagonal, sew on line
5. Trim excess, press
6. Repeat for second corner
7. Final unit with measurements

**Parameters:**
- `gooseColor`: Main triangle color
- `backgroundColors`: [left, right] or single color
- `finishedWidth`: e.g., "3 inches"
- `finishedHeight`: e.g., "6 inches"

**Visual notes:**
- Show grain line direction (important for geese)
- Indicate which way to press
- Show common mistakes to avoid

---

### Chain Piecing (Priority: HIGH)

**What it is:** Efficiency technique - sewing multiple units without cutting thread between.

**Phases:**
1. Show stack of prepared pairs
2. Feed first pair through machine
3. Without lifting presser foot, feed next pair
4. Show "chain" of connected units
5. Clip apart
6. Press all at once

**Parameters:**
- `fabricColors`: Array of color pairs
- `unitCount`: How many in the chain (3-5 for demo)

**Visual notes:**
- Emphasize the time-saving aspect
- Show thread "bridges" between units
- Animate the continuous flow

---

### Strip Piecing (Priority: HIGH)

**What it is:** Sewing long strips together, then cross-cutting into units.

**Phases:**
1. Show individual strips (cut sizes)
2. Sew strips together lengthwise
3. Press seams (show direction)
4. Cross-cut into segments
5. Show resulting units

**Parameters:**
- `stripColors`: Array of colors top to bottom
- `stripWidths`: Array of cut widths
- `segmentWidth`: Cross-cut measurement

**Visual notes:**
- Show ruler alignment for accurate cutting
- Indicate seam allowance
- Demonstrate how strip sets create multiple identical units

---

### Log Cabin (Priority: MEDIUM)

**What it is:** Building rounds of strips around a center square.

**Phases:**
1. Center square
2. Add strip to one side, press
3. Add strip to adjacent side (longer), press
4. Continue around (show 2-3 complete rounds)
5. Final block

**Parameters:**
- `centerColor`: Center square
- `lightColors`: Array for light side progression
- `darkColors`: Array for dark side progression
- `stripWidth`: Consistent strip width
- `rounds`: Number of rounds to show

**Visual notes:**
- Traditional: lights on 2 adjacent sides, darks on other 2
- Show measuring from center out
- Indicate press direction (usually toward outside)

---

## Japanese Aesthetic Guidelines

All diagrams should incorporate:

### Visual Elements
- **Corner registration marks** (like HSTDiagram has)
- **Fabric texture patterns** (subtle, not distracting)
- **Sashiko-inspired stitching lines** for seams
- **Ink stamp signature** element
- **Generous whitespace** (Ma - 間)

### Color Philosophy
- **Wabi-sabi**: Slightly imperfect, natural feeling
- **Shibui**: Subtle, understated elegance
- Default palettes should feel handcrafted, not digital

### Animation Style
- **Deliberate pacing**: Not rushed, respect the craft
- **User-controlled**: Click to advance, not auto-play
- **Graceful transitions**: Ease-in-out, not jarring

### Typography
- Phase labels should feel hand-lettered
- Measurements in clear, readable font
- Japanese terms where appropriate (with translation)

---

## Future: Cosmos Integration

### What Cosmos Enables

NVIDIA Cosmos is a world foundation model designed for physical AI. Key capabilities:

1. **Physics-aware understanding**: Knows how fabric behaves, folds, layers
2. **Spatial reasoning**: Understands "on top of," "aligned with," "rotated"
3. **Temporal prediction**: Given current state, predicts next logical step
4. **Multimodal input**: Text, image, video all work as input

### Quilting Applications

**Watching Progress:**
- User points phone at their work surface
- Cosmos understands what they've assembled so far
- Identifies current step, suggests next action
- Catches mistakes before they compound

**Analyzing Drawings:**
- User sketches a block idea on paper
- Takes photo
- Cosmos interprets: "This looks like a modified Ohio Star with flying geese units"
- Generates construction sequence

**Video Guidance:**
- Shows technique video from Cosmos-generated simulation
- Physics-accurate fabric behavior
- Can adjust to match user's specific fabrics/colors

### Integration Path

1. **Phase 1 (Now):** Pre-baked diagrams, keyword detection
2. **Phase 2:** Cosmos classifies uploaded pattern images
3. **Phase 3:** Cosmos generates custom diagrams from descriptions
4. **Phase 4:** Real-time video understanding of quilting progress

### Resources

- GitHub: https://github.com/nvidia-cosmos
- Models on HuggingFace: nvidia-cosmos
- Cosmos Cookbook for developers
- Open weight models available for fine-tuning

---

## Implementation Notes

### File Locations
- Interactive diagrams: `/src/components/diagrams/`
- Auto-detection logic: `/src/components/reader/VisualDiagram.tsx`
- Color themes: Passed as props, defined in parent components

### Testing
Each diagram should be testable at `/test` route with color picker (like current HST demo).

### Accessibility
- Diagrams should have alt text describing each phase
- Color contrast must meet WCAG standards
- Phase navigation should work with keyboard

---

## Summary

**For Pattern Reader MVP:** Build 6-8 Tier 1 diagrams. This covers the vast majority of published patterns and creates immediate value.

**Recommended build order:**
1. Flying Geese (very common, complements existing HST)
2. Chain Piecing (efficiency technique, appears in most patterns)
3. Strip Piecing (foundation of many block types)
4. Pressing (interactive version, often confusing for beginners)
5. Four Patch / Nine Patch (simple but essential)
6. Snowball Corners (popular modern technique)

**For Full Quiltographer:** Cosmos integration enables understanding arbitrary input - hand drawings, photos of progress, even video of quilting technique. This is the "eventually cover all use cases" path.

The pre-baked library isn't a limitation - it's the right scope for generating revenue now while building toward the larger vision.
