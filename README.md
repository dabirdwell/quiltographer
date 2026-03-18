# Quiltographer

**Finally understand your quilt patterns.** Upload any PDF pattern. Get clear, step-by-step instructions. Ask AI when you're confused.

Built by Humanity & AI LLC.

## Quick Start

```bash
cd quiltographer-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or go directly to [/reader](http://localhost:3000/reader) to upload a pattern.

## Features

- **PDF Pattern Reader** — Upload any quilt pattern PDF, get step-by-step instructions
- **AI Clarification** — "I don't understand this step" button powered by Claude Haiku
- **Materials Checklist** — Check off materials as you gather them (persisted)
- **Session Persistence** — Close the browser, come back tomorrow, resume where you left off
- **Font Scaling** — 100%, 150%, 200%, 300% — readable at arm's length
- **High Contrast Mode** — For bright sewing rooms or low-vision quilters
- **Mobile/Tablet First** — 48px touch targets, responsive layout
- **Abbreviation Decoder** — RST, HST, WOF, FPP automatically expanded

## Pricing

- **Free** — 3 patterns per month
- **Pro** — $4.99/mo, unlimited patterns + unlimited AI clarifications
- **Beta Pass** — `?beta=quilt2026` URL parameter unlocks full access

## Project Structure

```
quiltographer-app/     # Next.js application
  src/app/             # Pages and API routes
    page.tsx           # Landing page
    reader/page.tsx    # Pattern Reader (core product)
    api/parse-pdf/     # PDF extraction endpoint
    api/clarify/       # AI clarification endpoint (Claude Haiku)
    api/stripe/        # Checkout + webhook
  src/components/      # UI components
    reader/            # StepContent, PatternUpload, MaterialsList
    fan/               # Step navigation
    ui/                # Design system (Button, Text, Surface, etc.)
    japanese/          # Theme system
  src/lib/             # Business logic
    reader/            # Schema, calculators, glossary
    stripe/            # Config + client
    providers/         # AI provider registry
packages/              # Shared schemas and parser
test-patterns/         # Sample PDFs for testing
```

## Environment Variables

```
ANTHROPIC_API_KEY=     # Required for AI clarification (Claude Haiku)
GOOGLE_AI_API_KEY=     # Optional: Gemini for vision-based PDF extraction
OPENAI_API_KEY=        # Optional: GPT-4o-mini for deep comprehension
STRIPE_SECRET_KEY=     # For payments (optional in dev)
STRIPE_WEBHOOK_SECRET= # For subscription webhooks
STRIPE_PRO_PRICE_ID=   # Stripe price ID for Pro tier
```

## Current State (March 2026)

- `npm run dev` starts cleanly
- 6 of 8 test PDFs parse successfully (2 are preview cards, correctly rejected)
- Reader UI displays steps with prev/next, materials checklist, AI clarification
- Font scaling works at 200%+ without layout breaking
- AI clarification calls Claude Haiku API and returns useful rewrites
- Landing page with pricing, email capture, and Stripe checkout
- Beta pass URL (`?beta=quilt2026`) grants full access
- Session persistence via localStorage
- Keyboard navigation (arrows, M for materials, Esc to go back)

## Parser Capabilities

Handles: "Step N:" format, numbered instructions, yardage extraction, fat quarters, strips, precuts, backing/binding/batting, abbreviation expansion, technique detection, section-aware step numbering.

Known limitations: Image-only PDFs (1-page preview cards) contain no extractable text. Some patterns embed early steps in images. Fabric names are approximate when not labeled in the PDF.
