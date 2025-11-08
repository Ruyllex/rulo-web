import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { completeTransaction, failTransaction } from "@/lib/transaction-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await paymentResponse.json();

    const transactionId = payment.metadata?.transaction_id || payment.external_reference;

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
    }

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (payment.status === "approved") {
      if (transaction.status === "COMPLETED") {
        return NextResponse.json({ received: true, already_processed: true });
      }

      await completeTransaction(transaction.id, paymentId);

      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        solcitosAdded: transaction.solcitosAmount + transaction.bonusAmount,
      });
    }

    else if (payment.status === "rejected" || payment.status === "cancelled") {
      if (transaction.status !== "FAILED") {
        await failTransaction(transaction.id, `Pago ${payment.status}`);
      }
      return NextResponse.json({ received: true, status: payment.status });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Error webhook MercadoPago:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}