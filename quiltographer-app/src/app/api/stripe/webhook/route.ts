import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";

// Webhook events are stored in memory for MVP
// In production, replace with database (Supabase)
const activeSubscriptions = new Map<
  string,
  { customerId: string; status: string; currentPeriodEnd: string }
>();

// Export for use by status endpoint
export { activeSubscriptions };

export async function POST(request: NextRequest) {
  try {
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

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const customerId = session.customer as string;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        let currentPeriodEnd = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();

        if (subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = new Date(
            sub.current_period_end * 1000
          ).toISOString();
        }

        activeSubscriptions.set(customerId, {
          customerId,
          status: "pro",
          currentPeriodEnd,
        });

        console.log(`Subscription activated for customer ${customerId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const status =
          subscription.status === "active" ||
          subscription.status === "trialing"
            ? "pro"
            : "cancelled";

        const currentPeriodEnd = new Date(
          subscription.current_period_end * 1000
        ).toISOString();

        activeSubscriptions.set(customerId, {
          customerId,
          status,
          currentPeriodEnd,
        });

        console.log(
          `Subscription updated for customer ${customerId}: ${status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        activeSubscriptions.set(customerId, {
          customerId,
          status: "cancelled",
          currentPeriodEnd: new Date().toISOString(),
        });

        console.log(`Subscription cancelled for customer ${customerId}`);
        break;
      }

      default:
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
