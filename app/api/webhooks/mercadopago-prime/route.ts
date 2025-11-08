// app/api/webhooks/mercadopago-prime/route.ts
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '@/lib/db';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log('[MERCADOPAGO_PRIME_WEBHOOK] Received:', body);

    if (body.type === "payment" && body.data?.id) {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: body.data.id });
      
      // Verificar que es un pago de Prime
      const metadata = payment.metadata as any;
      if (payment.status === 'approved' && 
          payment.external_reference &&
          metadata?.product_type === 'prime_membership') {
        
        const userId = payment.external_reference;
        
        // Buscar usuario
        const user = await db.user.findUnique({
          where: { externalUserId: userId }
        });

        if (!user) {
          console.error('Usuario no encontrado:', userId);
          return new NextResponse("User not found", { status: 404 });
        }

        // Verificar si ya tiene Prime
        const existingPrime = await db.primeMembership.findUnique({
          where: { userId: user.id }
        });

        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 mes de Prime

        if (existingPrime) {
          // Extender membresía existente
          const newEndDate = new Date(existingPrime.endDate);
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          
          await db.primeMembership.update({
            where: { id: existingPrime.id },
            data: {
              status: 'active',
              endDate: newEndDate,
              mercadoPagoId: payment.id?.toString()
            }
          });

          console.log(`✅ Prime extendido para usuario ${user.username} hasta ${newEndDate}`);
        } else {
          // Crear nueva membresía
          await db.primeMembership.create({
            data: {
              userId: user.id,
              status: 'active',
              price: payment.transaction_amount || 3.99,
              startDate: now,
              endDate: endDate,
              mercadoPagoId: payment.id?.toString()
            }
          });

          console.log(`✅ Prime activado para usuario ${user.username} hasta ${endDate}`);
        }

        // Actualizar estado de Prime en el usuario
        await db.user.update({
          where: { id: user.id },
          data: { 
            isPrime: true 
          }
        });

        // TODO: Enviar email de confirmación
        // await sendPrimeWelcomeEmail(user.email);

        // TODO: Otorgar badges y emojis de Prime
        // await grantPrimeBenefits(user.id);
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[MERCADOPAGO_PRIME_WEBHOOK_ERROR]', error);
    return new NextResponse("Error", { status: 500 });
  }
}

// Endpoint de verificación
export async function GET(req: Request) {
  return NextResponse.json({ 
    status: 'ok',
    webhook: 'mercadopago-prime',
    configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN
  });
}