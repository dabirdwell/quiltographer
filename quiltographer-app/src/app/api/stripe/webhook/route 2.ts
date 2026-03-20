import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        // For v1 with localStorage, we just log it.
        // When Supabase auth is added in v2, upsert the subscription record here.
        console.log('Checkout completed:', event.data.object.id);
        break;
      }
      case 'customer.subscription.updated': {
        console.log('Subscription updated:', event.data.object.id);
        break;
      }
      case 'customer.subscription.deleted': {
        console.log('Subscription cancelled:', event.data.object.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
