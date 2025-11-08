import { NextRequest, NextResponse } from 'next/server';
import { paypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { completeTransaction } from '@/lib/transaction-service';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    const transactionId = searchParams.get('transaction_id');

    if (!token || !transactionId) {
      return NextResponse.redirect(
        new URL('/payment/failure?error=missing_params', req.url)
      );
    }

    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const client = paypalClient();
    const capture = await client.execute(request);

    await completeTransaction(transactionId, capture.result.id);

    return NextResponse.redirect(
      new URL(`/payment/success?transaction_id=${transactionId}`, req.url)
    );

  } catch (error: any) {
    console.error('Error PayPal success:', error);
    return NextResponse.redirect(
      new URL(`/payment/failure?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }
}