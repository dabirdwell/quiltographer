# Ground Truth Assessment — March 18, 2026

## App Shell: WORKS
- `npm install`: Clean (after clearing corrupted node_modules)
- `next build`: Compiles successfully (39.9s, Turbopack)
- All routes render: /, /reader, /reader/test, /test, /test-diagrams, /longarm-demo
- API routes compile: /api/parse-pdf, /api/comprehend, /api/clarify
- Stack: Next.js 16.0.7, React 19.2.1, TypeScript 5, Tailwind 3.4

## Parser Test Results (8 PDFs)

| PDF | Pages | Steps | Materials | Verdict | Issues |
|-----|-------|-------|-----------|---------|--------|
| BaroqueBloom | 3 | 4 | 9 | PASS | None |
| CoastalShells_Collage | 4 | 10 | 12 | PASS | Duplicate step 2 |
| Color-Cascade | 5 | 8 | 11 | PASS | Duplicate steps 1, 3 |
| FreedomFlight | 6 | 10 | 11 | PASS | Steps start at 7 (1-6 in images) |
| ImperialCollection_Aurora | 1 | 0 | 0 | FAIL | Image-only preview card |
| PainterlyPetals_Cobblestone | 1 | 0 | 1 | FAIL | Image-only preview card |
| RubyRose-CornerStones | 6 | 19 | 11 | PASS | 12 duplicate step numbers |
| Sample SKINNY (Kite Flight) | 4 | 5 | 3 | PASS | Duplicate step 4, no fabric yardage |

**Score: 6/8 parse successfully (75%). 2 failures are preview cards, not patterns.**
**Of 6 real patterns: 5 have duplicate step numbers, 1 starts mid-count.**

## Critical Issues

### 1. Name Extraction Broken
4 of 6 patterns get "Difficulty Rating: Beginner" as name. Parser grabs first short line from top of PDF, which is often metadata, not the pattern name.

### 2. Duplicate Step Numbers
Most Robert Kaufman patterns have repeated "Step N:" labels across different sections (e.g., "Block Assembly: Step 1-4" then "Quilt Assembly: Step 1-4"). Parser currently deduplicates by sorting and renumbering, but this merges steps from different sections and loses the section context.

### 3. Steps Starting Mid-Count
FreedomFlight has Steps 1-6 embedded in images. Text extraction only finds Steps 7-16. Parser handles this fine (renumbers to 1-10) but user loses early steps.

### 4. Material Names Missing
Yardage amounts are found but fabric names are rarely extracted. Most entries show as "Fabric A", "Fabric B" etc. because the pattern doesn't put names adjacent to amounts.

### 5. Image-Only PDFs Handled Correctly
Preview cards (1-page, image-heavy) are properly rejected with "not a pattern" error.

## Architecture: CORRECT
- Reader is wired to /api/parse-pdf (local, free, fast) — NOT the AI pipeline
- Session persistence via localStorage works
- Keyboard navigation works
- Font scaling works
- High contrast mode works

## What Needs Building
1. Fix parser name extraction
2. Handle section-scoped step numbering
3. AI Clarification (real Claude API, not mock)
4. Landing page at /
5. Stripe integration
6. Mobile/tablet responsive layout
7. Touch target sizes (48px min)
