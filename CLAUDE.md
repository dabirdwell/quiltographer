# CLAUDE.md — Quiltographer

## PRODUCT VISION — READ BEFORE ANY SPRINT
The current app is Phase 1 (Pattern Reader). The FULL product is a creative design studio.
**Original spec (527 lines):** `Fawkes/Products and Services/External_References/No other coding AI...md`
**Original concept (Apple Note):** `Claude_Vault/08_Archives/Interpretive_Archive_July2025/Quiltographer.md`
**MVP synthesis:** `Fawkes/Products and Services/Quiltographer/QUILTOGRAPHER-MVP-SYNTHESIS-DEC2025.md`
**Gap analysis:** `Fawkes/Products and Services/Spec_vs_Reality_Gap_Analysis.md`

Key features NOT YET BUILT that are in the spec:
- Infinite design canvas with layers, grid, snap-to
- Full Japanese fan radial interface (FanRadial.tsx is a placeholder)
- Color management with fabric texture simulation
- AI style transfer (image → quilt pattern)
- Construction sequence intelligence (build order)
- Smart Library (catalog scraps/fabric/thread → AI suggests designs)
- Thread/fabric shopping assistance
- Pattern translation between machine types
- 3D preview with draping simulation

Do NOT build features that conflict with this roadmap.

## Project
Quiltographer is an AI-powered quilting pattern reader. Upload a PDF pattern → get clear step-by-step instructions, fabric calculations, and difficulty ratings.

## Tech Stack
- Next.js (App Router) in `quiltographer-app/`
- Claude Haiku API for pattern clarification
- Stripe subscription (checkout/portal/webhook already built)
- Supabase auth (already built)
- Japanese design aesthetic (fan navigation, washi surfaces)

## Build
```bash
cd quiltographer-app && npm run build
```
This is a monorepo — always `cd quiltographer-app` before running commands.

## Key Routes
- `/` — Landing/marketing page
- `/reader` — Core pattern reader
- `/gallery` — Pattern gallery with difficulty badges
- `/calculator` — Fabric calculator
- `/assistant` — AI Pattern Assistant chat
- `/login` — Supabase auth

## Git Rules
- `git add` specific files only — NEVER `git add -A`
- Verify with `git diff --cached --stat` before committing
- Push to origin main
