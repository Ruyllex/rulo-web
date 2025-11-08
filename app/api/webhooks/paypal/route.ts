import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { completeTransaction, failTransaction } from "@/lib/transaction-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const webhook = JSON.parse(body);

    const eventType = webhook.event_type;
    const resource = webhook.resource;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.COMPLETED') {
      const transactionId = resource.custom_id || resource.purchase_units?.[0]?.custom_id;

      if (!transactionId) {
        return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
      }

      const transaction = await db.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      if (transaction.status === "COMPLETED") {
        return NextResponse.json({ received: true, already_processed: true });
      }

      await completeTransaction(transaction.id, resource.id);

      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        solcitosAdded: transaction.solcitosAmount + transaction.bonusAmount,
      });
    }

    else if (eventType === 'PAYMENT.CAPTURE.DENIED' || eventType === 'CHECKOUT.ORDER.VOIDED') {
      const transactionId = resource.custom_id || resource.purchase_units?.[0]?.custom_id;
      
      if (transactionId) {
        await failTransaction(transactionId, `PayPal: ${eventType}`);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Error webhook PayPal:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}