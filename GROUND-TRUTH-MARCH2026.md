# Quiltographer Ground Truth: Real-Pattern Parser Test

**Date:** March 24, 2026 (supersedes March 18-19 report)
**Tester:** Automated diagnostic (Claude + test harness)
**Parser tested:** `/api/parse-pdf/route.ts` — the production parser
**Patterns tested:** 12 PDFs (8 pre-existing + 4 freshly downloaded from RobertKaufman.com)

---

## Executive Summary

**Before fixes (March 24 morning):** The parser extracted steps and materials but had a **critical blind spot**: cutting instructions were completely broken (0/9 patterns). Fabric names were anonymous ("Fabric 1", "Fabric 2").

**After fixes (March 24):** Cutting extraction now works on **8/9 patterns** (from 0/9). The fix added written-number-to-digit conversion, multi-fabric label support, subcut handling, and "fussy cut"/"trim" verb support. Abbreviation double-expansion was also fixed.

**Verdict: Approaching beta-shippable.** Cutting extraction now works for the dominant Robert Kaufman format. Remaining gaps: anonymous fabric names, no visual diagrams, and non-standard formats (template-based cutting, precut packs). A quilter can now get a useful cutting checklist + construction steps from most patterns, but still needs the original PDF for fabric identification and diagrams.

---

## Results: Pattern Parse Rates

| Category | Count | Notes |
|---|---|---|
| PDFs tested | 12 | 8 original + 4 freshly downloaded |
| Text extraction succeeded | 12/12 | pdf-parse works reliably |
| Correctly identified as pattern | 9/12 | |
| Correctly rejected (preview cards) | 3/12 | 1-page marketing images with <300 chars |
| Construction steps found | 9/9 patterns | Range: 4-19 steps |
| Materials found | 9/9 patterns | Range: 2-17 items |
| Cutting instructions found | **8/9 patterns** | **Fixed March 24** (was 0/9) |
| Finished size found | 9/9 patterns | All correct |
| Pattern name found | 9/9 patterns | All reasonable |

---

## Failure Modes

### 1. ~~CRITICAL~~ FIXED: Cutting Instructions — 0% -> 89% Success Rate

**Was:** `extractCuttingInstructions()` failed on every real PDF because regexes expected digit-only quantities.

**Fix applied:** Added `wordToNumber()` conversion (one->1 through "one hundred twenty-five"->125), multi-fabric labels ("From each of Fabrics B and H"), "fussy cut"/"trim" verb support, and line-by-line piece parsing for squares, rectangles, strips, and unlabeled dimension pairs.

**Result:** 8/9 patterns now extract cutting instructions with correct fabric labels (Fabric A, Fabric B, Binding Fabric). The one failure (Kite Flight/SKINNY) uses template-based cutting which is a fundamentally different format.

**Remaining gaps:**
- Subcut hierarchy not preserved (strips and their subcuts appear as flat list)
- Template-based cutting (triangle rulers, printed templates) not handled
- Written-out numbers above "nine hundred ninety-nine" not handled (rare)

### 2. HIGH: Anonymous Fabric Names — "Fabric 1", "Fabric 2"

The materials extractor finds yardage amounts but loses the fabric letter labels (A, B, C...) and color/SKU names. The Robert Kaufman PDFs have a table format:

```
A  SRKD-23485-205  MULTI  1 yard
B  SRKD-23490-32   MINT   1/4 yard
```

But pdf-parse extracts this as jumbled text (table columns interleaved), and the yardage regex captures amounts without matching them to fabric labels. Result: a quilter sees "Fabric 1: 1 yards" instead of "Fabric A (Mint, SRKD-23490-32): 1/4 yard".

**Impact:** Materials list is present but barely useful. Quilter must cross-reference with original PDF.

### 3. ~~MEDIUM~~ FIXED: Abbreviation Double-Expansion

**Was:** `expandAbbreviations()` created ugly double expansions like "Half-Square Triangles (Half Square Triangles (HSTs))".

**Fix applied:** Added negative lookbehind for `(` and negative lookahead that checks the abbreviation isn't already inside parentheses. Regex changed from `\bHSTs\b(?!\s*\()` to `(?<!\()\bHSTs\b(?!\s*\()(?![^(]*\))`.

### 4. MEDIUM: Step Quality Varies

- **Good:** Steps contain full instruction text, technique detection works (HST, pressing, piecing, Flying Geese)
- **Bad:** Steps are sometimes very long run-on blocks (multiple paragraphs merged into one step)
- **Bad:** Section attribution is imprecise — steps in "Block Assembly" get assigned to "Binding" because the binding section header appears earlier in text
- **Bad:** "Kite Flight" (SKINNY) has duplicate Step 4 (assembly + finishing) — parser keeps both without dedup
- **Good:** FreedomFlight correctly detects steps starting at Step 7 and notes "Steps 1-6 are in diagram images"

### 5. LOW: Non-Yardage Materials Missed

The SKINNY pattern uses "Skinny Strips" (precut fabric packs), not yardage. The parser only finds 2 materials (batting + thread) and misses the actual fabric requirements. This affects any pattern using precuts, charm packs, jelly rolls, etc.

### 6. LOW: Difficulty Always 1 or 3

Robert Kaufman patterns all say "Difficulty Rating: Beginner" -> mapped to 1. The SKINNY pattern says "Confident Beginner" but this isn't in the detection regex. Patterns without explicit difficulty default to 3. The 1-5 scale is never meaningfully exercised.

---

## Schema Assessment

The `UniversalPattern` schema in `packages/core/` is **well-designed and comprehensive**. It supports:
- Cutting instructions with shape, quantity, dimensions (if the parser could fill them)
- Construction steps with techniques, warnings, tips
- Fabric requirements with name, amount, unit, color, notes
- Block definitions and quilt layout

The **ReaderPattern** schema in the app is a simplified subset that's adequate for the reader UI.

**The gap is not in the schema — it's in the parser's ability to populate it.**

---

## What Works Well

1. **PDF text extraction** — pdf-parse handles all tested PDFs without errors
2. **Pattern vs. preview detection** — correctly rejects 1-page marketing images
3. **Pattern name extraction** — smart scoring system with title-like candidate selection
4. **Finished size extraction** — 100% success rate on real patterns
5. **Step extraction** — "Step N:" regex works well for Robert Kaufman format
6. **Technique detection** — identifies HST, Flying Geese, chain piecing, etc.
7. **Image-step detection** — correctly notes when steps start mid-count
8. **Warning generation** — seam allowance, bias handling, etc.

---

## Gap Analysis: Parser Output vs. "Step-by-Step Instructions a Quilter Can Follow"

| What a quilter needs | Parser provides? | Gap |
|---|---|---|
| Pattern name and size | Yes | Minimal |
| Fabric shopping list with colors | Partial — amounts yes, names no | **Large** |
| What to cut from each fabric | **Yes (8/9)** | Small (subcut hierarchy) |
| Assembly steps in order | Yes, mostly | Moderate (section ordering) |
| Technique explanations | Technique names only | Moderate (no how-to) |
| Visual diagrams | No | Large (not attempted) |
| Seam allowance warnings | Yes | None |
| Finished block sizes | No | Moderate |
| Pressing directions | Detected but not structured | Small |

**Bottom line:** A quilter could read the construction steps and somewhat follow along, but they'd need the original PDF open next to it for: cutting instructions, fabric identification, and visual diagrams. The parser adds value (abbreviation expansion, technique tagging, warnings) but doesn't replace the original PDF.

---

## Fixes Applied (March 24)

### DONE P0: Cutting Instruction Extraction
- Added `wordToNumber()` for written-out numbers (one->1 through compound hundreds)
- Added `parseQuantity()` helper used throughout cutting extraction
- Rewrote `extractCuttingInstructions()` with line-by-line parsing
- Handles: squares, rectangles, strips, unlabeled dimension pairs
- Handles: "From each of Fabrics X and Y", "fussy cut", "trim"
- Handles: multi-line "From Fabric X" blocks with subcut pieces
- Result: 0/9 -> 8/9 patterns

### DONE P2: Abbreviation Double-Expansion
- Added lookbehind/lookahead to skip abbreviations already inside parentheses

## Remaining Recommended Fixes

### P1: Fix Fabric Name Mapping (still needed)
- Match yardage amounts to Fabric A/B/C letter labels
- Extract color names (MULTI, MINT, NAVY, etc.) from nearby text
- Extract SKU numbers for Robert Kaufman patterns
- Fall back to color description when label isn't found

### P3: Improve Step Section Attribution
- Fix section boundary detection (currently "Binding" captures too early)
- Dedup duplicate step numbers (SKINNY Step 4 appears twice)

### P4: Support Precut Formats
- Detect "Skinny Strips", "Charm Pack", "Jelly Roll", "Layer Cake" as material types
- Parse non-yardage quantity formats ("1 Kona Classic Skinny Strips")

### P5: Subcut Hierarchy
- Preserve parent-child relationship between WOF strips and their subcuts
- Display as nested list in the reader UI

---

## Test Patterns Used

### Pre-existing (8):
| File | Pages | Steps | Materials | Status |
|---|---|---|---|---|
| BAROQUEBLOOM_BaroqueBloom.pdf | 3 | 4 | 9 | Parsed |
| CoastalShells_Collage.pdf | 4 | 10 | 17 | Parsed |
| Color-Cascade.pdf | 5 | 8 | 10 | Parsed |
| FreedomFlight_FreedomFlight.pdf | 6 | 11 | 12 | Parsed |
| ImperialCollectionGracefulCranes_Aurora.pdf | 1 | 0 | 0 | Preview card (rejected) |
| PainterlyPetalsValley_CobblestoneStreet.pdf | 1 | 0 | 0 | Preview card (rejected) |
| RubyRose-CornerStones.pdf | 6 | 19 | 10 | Parsed |
| Sample Quilt Pattern SKINNY.pdf | 4 | 5 | 2 | Parsed (materials incomplete) |

### Freshly Downloaded (4):
| File | Source | Pages | Steps | Materials | Status |
|---|---|---|---|---|---|
| downloaded-BlossomsAndHearts.pdf | RobertKaufman.com | 1 | 0 | 0 | Preview card (rejected) |
| downloaded-Boardwalk.pdf | RobertKaufman.com | 3 | 4 | 16 | Parsed |
| downloaded-BurstOfColor.pdf | RobertKaufman.com | 4 | 10 | 6 | Parsed |
| downloaded-Supernova.pdf | RobertKaufman.com | 7 | 9 | 16 | Parsed |

---

## Previous Sprint Fixes (March 18-19) — Still Working

These fixes from the MVP sprint are confirmed still functional:
1. Name extraction scoring system — working correctly
2. Section-scoped step numbering — working correctly
3. Steps-starting-mid-count detection — working correctly
4. AI Clarification wired to Claude Haiku — architecture confirmed
5. Landing page and responsive layout — confirmed

---

## Raw Diagnostic Data

- All raw text extractions: `diagnostic-output/*.raw.txt`
- All parsed JSON outputs: `diagnostic-output/*.parsed.json`
- Summary: `diagnostic-output/summary.json`
- Test harness: `test-parser-diagnostic.js`
