// app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

const PAYPAL_API = process.env.PAYPAL_MODE === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Generar access token de PayPal
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { packageId, amount, solcitos } = await req.json();

    if (!amount || !solcitos) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    // Obtener access token
    const accessToken = await getPayPalAccessToken();

    // Crear la orden en PayPal
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: `${solcitos} Solcitos`,
            custom_id: `${user.id}|${packageId}|${solcitos}`, // Para identificar después
          },
        ],
        application_context: {
          brand_name: 'Tu Plataforma de Streaming',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/showcase?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/showcase?cancelled=true`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal error:', orderData);
      return NextResponse.json(
        { error: 'Error al crear orden en PayPal' },
        { status: 500 }
      );
    }

    // Obtener el link de aprobación
    const approvalUrl = orderData.links.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    return NextResponse.json({
      orderId: orderData.id,
      approvalUrl,
    });

  } catch (error) {
    console.error('Error en create-order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}