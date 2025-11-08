// app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const PAYPAL_API = process.env.PAYPAL_MODE === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

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
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID requerido" },
        { status: 400 }
      );
    }

    // Obtener access token
    const accessToken = await getPayPalAccessToken();

    // Capturar el pago
    const captureResponse = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await captureResponse.json();

    if (captureData.status === 'COMPLETED') {
      // Extraer información del custom_id
      const customId = captureData.purchase_units[0].payments.captures[0].custom_id;
      const [userId, packageId, solcitos] = customId.split('|');

      // Acreditar Solcitos al usuario
      await db.user.update({
        where: { externalUserId: userId },
        data: {
          solcitosBalance: {
            increment: parseInt(solcitos),
          },
        },
      });

      // Registrar la transacción
      await db.solcitoTransaction.create({
        data: {
          senderId: userId,
          receiverId: userId, // Compra propia
          amount: parseInt(solcitos),
          type: 'PURCHASE',
          paymentMethod: 'PAYPAL',
          paymentId: captureData.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Pago completado y Solcitos acreditados',
      });
    } else {
      return NextResponse.json(
        { error: 'Pago no completado' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error en capture-order:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}