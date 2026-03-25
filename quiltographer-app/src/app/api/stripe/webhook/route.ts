import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Use service role client for webhook — no user session available
function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body and verify webhook signature
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // 2. Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") break;

        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.error("No supabase_user_id in checkout session metadata");
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        // Retrieve the subscription to get the current_period_end
        let currentPeriodEnd: string | null = null;
        if (subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId, {
            expand: ["items.data"],
          });
          const item = sub.items?.data?.[0];
          if (item) {
            currentPeriodEnd = new Date(
              item.current_period_end * 1000
            ).toISOString();
          }
        }

        const { error } = await supabase.from("subscriptions").upsert(
          {
            id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId ?? null,
            status: "pro",
            current_period_end: currentPeriodEnd,
          },
          { onConflict: "id" }
        );

        if (error) {
          console.error("Failed to upsert subscription on checkout:", error);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Map Stripe status to our status
        const status =
          subscription.status === "active" ||
          subscription.status === "trialing"
            ? "pro"
            : "cancelled";

        const item = subscription.items?.data?.[0];
        const currentPeriodEnd = item
          ? new Date(item.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_end: currentPeriodEnd,
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error(
            "Failed to update subscription on subscription.updated:",
            error
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error(
            "Failed to update subscription on subscription.deleted:",
            error
          );
        }

        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
