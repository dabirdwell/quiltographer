import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_CONFIG } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !STRIPE_CONFIG.proPriceId) {
      return NextResponse.json(
        { error: "Stripe is not configured yet. Coming soon!" },
        { status: 503 }
      );
    }

    // For MVP without auth: create a checkout session with client-provided email
    const body = await request.json().catch(() => ({}));
    const email = body.email || undefined;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: STRIPE_CONFIG.proPriceId,
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      success_url: `${appUrl}/reader?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
      metadata: {
        source: "quiltographer",
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
