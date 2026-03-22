# Deploying Quiltographer to Vercel

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier works)
- A [Stripe](https://stripe.com) account (for payments — optional for beta)
- An [Anthropic](https://console.anthropic.com/) API key (for AI clarifications — optional, falls back to mock responses)

## 1. Push to GitHub

```bash
git remote add origin git@github.com:YOUR_USER/quiltographer.git
git push -u origin main
```

## 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set the **Root Directory** to `quiltographer-app`
4. Framework preset: **Next.js** (auto-detected)
5. Click **Deploy**

The first deploy will work without any environment variables — all API integrations degrade gracefully.

## 3. Configure Environment Variables

In your Vercel project, go to **Settings → Environment Variables** and add:

### Required for payments

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://quiltographer.vercel.app` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...` or `pk_test_...`) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for the Pro subscription |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### Required for AI clarifications

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Haiku (powers "Explain this step") |

### Optional — Comprehension pipeline

| Variable | Description |
|---|---|
| `GOOGLE_AI_API_KEY` | Google AI / Gemini key for PDF extraction |
| `OPENAI_API_KEY` | OpenAI key for pattern comprehension (gpt-4o-mini) |

## 4. Set Up Stripe Webhook

1. In Stripe Dashboard → **Developers → Webhooks**, click **Add endpoint**
2. Set the URL to `https://YOUR_DOMAIN/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** and add it as `STRIPE_WEBHOOK_SECRET` in Vercel

## 5. Create the Stripe Pro Product

1. In Stripe Dashboard → **Products**, create a new product
2. Name: **Quiltographer Pro**
3. Add a recurring price: **$4.99/month**
4. Copy the **Price ID** (starts with `price_`) and set it as `STRIPE_PRO_PRICE_ID`

## 6. Custom Domain (Optional)

1. In Vercel → **Settings → Domains**, add your domain
2. Update DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` to match your custom domain

## Build & Dev Commands

```bash
npm run dev      # Local development (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server locally
npm run lint     # Run ESLint
```

## Architecture Notes

- **Framework**: Next.js 16 with Turbopack
- **Styling**: Tailwind CSS with custom Japanese-inspired theme tokens
- **State**: Zustand (client-side pattern/reader state)
- **Payments**: Stripe Checkout + Customer Portal
- **AI**: Claude Haiku 4.5 for clarifications, Gemini/OpenAI for comprehension pipeline
- **Storage**: Client-side (localStorage) — no database required for MVP

## Troubleshooting

**Build fails locally?**
Make sure you're running the build from the `quiltographer-app` directory, not the repo root.

**Stripe checkout returns 503?**
The Stripe env vars aren't set. This is expected — the app shows a friendly "Coming soon" message.

**AI clarifications return mock responses?**
`ANTHROPIC_API_KEY` isn't set. The app falls back to built-in quilting explanations.
