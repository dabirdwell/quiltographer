# Quiltographer: Ground Truth
## February 2026 — Verified Codebase Audit & Feature Roadmap

*Every claim in this document was verified by reading the actual source code. Nothing is assumed from previous session notes, strategy docs, or Gemini transcripts.*

---

## The Product in One Sentence

**Quiltographer is a pattern companion that makes quilt instructions visual, clear, and confidence-building — starting as a Pattern Reader and growing into a full design studio.**

The design philosophy: delightful experiences that hide understated power underneath. Modular growth from a simpler product to a more complete one. Every feature earns its place by serving the quilter standing at their cutting table.

---

## What Actually Exists (Verified)

### The Active Codebase

**Location:** `/Users/david/Documents/Claude_Technical/quiltographer/quiltographer-app/`
**Stack:** Next.js 16 + React 19 + Tailwind + Zustand + Radix UI
**No database. No auth. No deployment.**

#### Pattern Reader Pipeline — WORKING END-TO-END

The core product loop exists and functions: **Upload → Extract → Comprehend → Display**

| Component | File | Lines | Status |
|---|---|---|---|
| Pipeline orchestrator | `src/lib/comprehension/pipeline.ts` | 323 | Working. 5-stage process with progress callbacks |
| PDF extraction | `src/lib/providers/extraction/pdf-local.ts` | ~80 | Working. pdf-parse library, markdown conversion |
| AI comprehension | `src/lib/providers/comprehension/openai.ts` | 230 | Working. GPT-4o-mini, structured JSON outputs |
| Data converter | `src/lib/reader/converter.ts` | 102 | Working. Bridges AI output to reader UI schema |
| Reader schema | `src/lib/reader/schema.ts` | 84 | Working. Clean interfaces |
| API route | `src/app/api/comprehend/route.ts` | 67 | Working. 5-min timeout, error handling |
| Clarification API | `src/app/api/clarify/route.ts` | ~50 | Working. On-demand AI help per step |
| Reader page | `src/app/reader/page.tsx` | 332 | Working. Upload → processing → reading flow |

**What the AI comprehension returns per step** (verified from openai.ts prompts): clarified title and instruction, "why this matters" context, "what you'll create" description, techniques used (abbreviations expanded), common mistakes with prevention, pro tips, warnings, measurements, estimated time, stopping point recommendation, diagram type suggestion with parameters.

**Pipeline performance** (verified): Kite Flight Quilt — 4 real steps, 6 API calls, ~66 seconds. Cost ~$0.01-0.02 per pattern (GPT-4o-mini).

**What's genuinely good:** The AI comprehension layer does real work — it extracts techniques, predicts mistakes, provides quilter-specific guidance. This is the core value and it delivers.

**What's not good enough:** 66 seconds is too long. Step detection regex is fragile (only "Step N:" format). PDF extraction via pdf-parse loses formatting, columns, and images.

#### Reader UI Components — FUNCTIONAL BUT UNPOLISHED

| Component | File | Lines | What It Does |
|---|---|---|---|
| StepContent | `reader/StepContent.tsx` | 519 | Main step display. Font size controls, technique explanations, AI help buttons (clarify/simplify/tools/technique), progress encouragement |
| VisualDiagram | `reader/VisualDiagram.tsx` | 327 | Auto-generates simple SVG diagrams based on detected techniques |
| FanNavigation | `fan/FanNavigation.tsx` | 203 | Japanese fan-inspired step navigation with scroll, completion tracking |
| WashiSurface | `japanese/WashiSurface.tsx` | ~60 | Washi paper texture wrapper |
| KumihimoProgress | `japanese/KumihimoProgress.tsx` | ~80 | Braided progress indicator |
| PatternUpload | `reader/PatternUpload.tsx` | ~150 | File upload with drag-and-drop |
