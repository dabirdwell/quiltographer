import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { STRIPE_CONFIG } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !STRIPE_CONFIG.proPriceId) {
      return NextResponse.json(
        { error: 'Stripe is not configured yet. Coming soon!' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: STRIPE_CONFIG.proPriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/reader?upgraded=true`,
      cancel_url: `${origin}/?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
