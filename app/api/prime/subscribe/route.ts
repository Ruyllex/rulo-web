// app/api/prime/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSelf } from '@/lib/auth-service';
import { PRIME_PRICE } from '@/lib/prime-service';

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();

    // Verificar si ya tiene Prime activo
    if (self.isPrime) {
      return NextResponse.json(
        { error: 'Ya tienes membresía Prime activa' },
        { status: 400 }
      );
    }

    // Por simplicidad, vamos a crear una orden única de PayPal
    // Para suscripciones recurrentes reales, necesitarías PayPal Subscriptions API
    // Aquí haremos un pago único por 30 días

    const paypal = await import('@paypal/checkout-server-sdk');
    
    function environment() {
      const clientId = process.env.PAYPAL_CLIENT_ID!;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
      
      if (process.env.NODE_ENV === 'production') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
      }
      return new paypal.core.SandboxEnvironment(clientId, clientSecret);
    }
    
    function client() {
      return new paypal.core.PayPalHttpClient(environment());
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: 'Membresía Prime - 30 días',
          amount: {
            currency_code: 'USD',
            value: PRIME_PRICE.toFixed(2)
          },
          custom_id: JSON.stringify({
            userId: self.id,
            username: self.username,
            type: 'prime_membership'
          })
        }
      ],
      application_context: {
        brand_name: 'Twitch Clone Prime',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/prime/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/prime?cancelled=true`
      }
    });

    const order = await client().execute(request);
    const approvalUrl = order.result.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    if (!approvalUrl) {
      throw new Error('No se pudo obtener URL de aprobación');
    }

    return NextResponse.json({
      orderId: order.result.id,
      approvalUrl
    });

  } catch (error) {
    console.error('[PRIME_SUBSCRIBE_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al crear suscripción Prime' },
      { status: 500 }
    );
  }
}