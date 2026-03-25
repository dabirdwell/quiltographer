export const STRIPE_CONFIG = {
  proPriceId: process.env.STRIPE_PRO_PRICE_ID!,
  proPrice: 7.99,
  currency: "usd",
  trialDays: 0,
} as const;
