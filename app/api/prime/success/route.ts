// app/api/prime/success/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal-service';
import { activatePrime } from '@/lib/prime-service';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/prime?error=missing_token', req.url)
      );
    }

    // Capturar el pago
    const capture = await capturePayPalOrder(token);

    if (capture.status !== 'COMPLETED') {
      console.error('[PRIME_SUCCESS] Pago no completado:', capture.status);
      return NextResponse.redirect(
        new URL('/prime?error=payment_failed', req.url)
      );
    }

    // Extraer datos custom
    const customId = capture.purchase_units?.[0]?.custom_id;
    if (!customId) {
      return NextResponse.redirect(
        new URL('/prime?error=invalid_data', req.url)
      );
    }

    const customData = JSON.parse(customId);
    const { userId, type } = customData;

    if (type !== 'prime_membership' || !userId) {
      return NextResponse.redirect(
        new URL('/prime?error=invalid_data', req.url)
      );
    }

    // Activar membresía Prime
    await activatePrime(userId, 'paypal', capture.id, 30);

    console.log(`✅ [PRIME_SUCCESS] Membresía Prime activada para usuario ${userId}`);

    return NextResponse.redirect(
      new URL('/prime?success=true', req.url)
    );

  } catch (error) {
    console.error('[PRIME_SUCCESS_ERROR]', error);
    return NextResponse.redirect(
      new URL('/prime?error=processing_error', req.url)
    );
  }
}