export const STRIPE_CONFIG = {
  proPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  proPrice: 4.99,
  currency: 'usd',
  trialDays: 0,
  freePatternsPerMonth: 3,
  betaPassCode: 'quilt2026',
} as const;
