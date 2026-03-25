import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_CONFIG } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get or create Stripe customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let stripeCustomerId = subscription?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // 3. Create checkout session
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: STRIPE_CONFIG.proPriceId,
          quantity: 1,
        },
      ],
      success_url: "https://quiltographer.humanityandai.com/reader?checkout=success",
      cancel_url: "https://quiltographer.humanityandai.com/#pricing",
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
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
