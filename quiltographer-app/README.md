# Quiltographer

AI-powered pattern reader for quilters. Upload any PDF quilt pattern, get clear step-by-step instructions, and ask AI when you're confused.

Built with Next.js 16, TypeScript, Tailwind CSS, and Stripe.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys (see Environment Variables below)

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page. Navigate to `/reader` to use the pattern reader.

## Environment Variables

Create a `.env.local` file from `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | No | Stripe secret key for Pro subscriptions |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (client-side) |
| `STRIPE_PRO_PRICE_ID` | No | Stripe Price ID for the Pro plan ($4.99/mo) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `ANTHROPIC_API_KEY` | No | Anthropic API key for AI clarifications |
| `NEXT_PUBLIC_APP_URL` | No | App URL for Stripe redirects (defaults to `http://localhost:3000`) |
| `GOOGLE_AI_API_KEY` | No | Google AI key for Gemini-based PDF extraction |
| `OPENAI_API_KEY` | No | OpenAI key for comprehension pipeline |

The app runs without any keys configured — Stripe checkout and AI features gracefully degrade with user-facing messages.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page with pricing
│   ├── reader/page.tsx          # Pattern Reader (core feature)
│   └── api/
│       ├── parse-pdf/           # PDF text extraction
│       ├── comprehend/          # AI comprehension pipeline
│       ├── clarify/             # Step-by-step AI clarifications
│       └── stripe/
│           ├── checkout/        # Create Stripe Checkout session
│           ├── webhook/         # Handle Stripe subscription events
│           └── portal/          # Stripe Customer Portal
├── components/
│   ├── reader/                  # Pattern reader UI components
│   ├── ui/                      # Shared UI primitives
│   ├── diagrams/                # SVG quilt diagrams
│   ├── fan/                     # Fan navigation component
│   └── patterns/                # Pattern block renderers
├── lib/
│   ├── stripe/                  # Stripe client & config
│   ├── reader/                  # Schema, glossary, calculators
│   ├── providers/               # AI provider abstractions
│   └── comprehension/           # Comprehension pipeline
├── hooks/                       # React hooks (session, preferences, subscription)
└── types/                       # TypeScript type definitions
```

## Features

- **PDF Pattern Upload** — Drop any PDF quilt pattern for automatic step extraction
- **Step-by-Step Reader** — One instruction at a time, readable from your sewing machine
- **Font Scaling** — 100% to 300% text size for arm's-length reading
- **AI Clarifications** — Plain-English rewrites of confusing steps (powered by Anthropic)
- **Materials Checklist** — Track what you've gathered with auto-saving progress
- **Abbreviation Decoder** — RST, HST, WOF, FPP expanded inline
- **Session Persistence** — Close the browser, pick up where you left off
- **Stripe Subscriptions** — Free tier (3 patterns/mo, 10 AI calls) and Pro ($4.99/mo, unlimited)

## Stripe Setup

1. Create a [Stripe account](https://dashboard.stripe.com) and get your API keys
2. Create a recurring Price ($4.99/mo) in the Stripe Dashboard
3. Set up a webhook endpoint pointing to `<your-domain>/api/stripe/webhook` listening for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Add the keys to `.env.local`

For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Deployment

Deployed on Vercel. Push to `main` to trigger a deploy. Set the environment variables in your Vercel project settings.

---

Built by [Humanity & AI LLC](https://humanityandai.com)
