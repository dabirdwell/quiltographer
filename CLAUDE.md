# CLAUDE.md — Quiltographer

## Scope — READ THESE ONLY
The active application code is in `quiltographer-app/src/`. Everything else is archived or build artifacts.

**Read:** `quiltographer-app/src/app/`, `quiltographer-app/src/components/`, `quiltographer-app/src/lib/`, `quiltographer-app/src/data/`, `quiltographer-app/src/hooks/`
**Also read:** `quiltographer-app/package.json`, `quiltographer-app/tsconfig.json`, this file

**DO NOT read:** `.archive/`, `app_backup/`, `node_modules/`, `.next/`, planning docs from months ago. They are historical and will waste your context.

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
