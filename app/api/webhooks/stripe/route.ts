import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { completeTransaction, failTransaction } from "@/lib/transaction-service";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        const transactionId = session.metadata?.transaction_id;

        if (!transactionId) {
          return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
        }

        try {
          await completeTransaction(transactionId, session.id);
          return NextResponse.json({ success: true, transactionId });
        } catch (error: any) {
          if (error.message?.includes("ya completada")) {
            return NextResponse.json({ received: true, already_processed: true });
          }
          throw error;
        }
      }
    }

    else if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const transactionId = session.metadata?.transaction_id;

      if (transactionId) {
        await failTransaction(transactionId, `Stripe: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Error webhook Stripe:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}