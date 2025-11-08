import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { stripe } from '@/lib/stripe';
import { paypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { createTransaction } from '@/lib/transaction-service';
import { TransactionType, PaymentProvider } from '@prisma/client';
import { SOLCITO_PACKAGES } from '@/lib/solcito-packages';

const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { packageId, paymentMethod } = body;

    const packageData = SOLCITO_PACKAGES.find(p => p.id === packageId);
    if (!packageData) {
      return new NextResponse("Paquete no encontrado", { status: 404 });
    }

    const totalSolcitos = packageData.solcitos;
    const baseSolcitos = packageData.amount;
    const bonusSolcitos = packageData.bonus;
    const priceUSD = packageData.priceUSD;

    let dbUser = await db.user.findUnique({
      where: { externalUserId: user.id }
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          externalUserId: user.id,
          username: user.username || user.firstName || 'user',
          imageUrl: user.imageUrl || '',
        }
      });
    }

    if (paymentMethod === 'mercadopago') {
      const transaction = await createTransaction({
        userId: dbUser.id,
        type: TransactionType.PURCHASE,
        amount: priceUSD,
        solcitosAmount: baseSolcitos,
        bonusAmount: bonusSolcitos,
        provider: PaymentProvider.MERCADOPAGO,
        description: `Compra de ${totalSolcitos} Solcitos`,
        metadata: { packageId, packageName: packageData.name },
      });

      const preference = new Preference(mercadopago);
      
      const preferenceData = await preference.create({
        body: {
          items: [{
            id: packageId,
            title: `${totalSolcitos} Solcitos ☀`,
            description: bonusSolcitos > 0 ? `Incluye ${bonusSolcitos} de bonus 🎁` : undefined,
            quantity: 1,
            unit_price: priceUSD,
            currency_id: 'USD',
          }],
          payer: {
            email: user.emailAddresses?.[0]?.emailAddress || '',
            name: user.firstName || '',
            surname: user.lastName || '',
          },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?transaction_id=${transaction.id}`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?transaction_id=${transaction.id}`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?transaction_id=${transaction.id}`
          },
          auto_return: 'approved',
          external_reference: transaction.id,
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
          metadata: {
            transaction_id: transaction.id,
            user_id: dbUser.id,
            solcitos_amount: baseSolcitos.toString(),
            bonus_amount: bonusSolcitos.toString(),
          },
        }
      });

      return NextResponse.json({ 
        checkoutUrl: preferenceData.init_point,
        transactionId: transaction.id,
      });
    }

    else if (paymentMethod === 'stripe') {
      const transaction = await createTransaction({
        userId: dbUser.id,
        type: TransactionType.PURCHASE,
        amount: priceUSD,
        solcitosAmount: baseSolcitos,
        bonusAmount: bonusSolcitos,
        provider: PaymentProvider.STRIPE,
        description: `Compra de ${totalSolcitos} Solcitos`,
        metadata: { packageId, packageName: packageData.name },
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${totalSolcitos} Solcitos ☀`,
              description: bonusSolcitos > 0 ? `Incluye ${bonusSolcitos} de bonus 🎁` : undefined,
            },
            unit_amount: Math.round(priceUSD * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transaction.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/showcase?cancelled=true`,
        metadata: {
          transaction_id: transaction.id,
          user_id: dbUser.id,
          solcitos_amount: baseSolcitos.toString(),
          bonus_amount: bonusSolcitos.toString(),
        },
      });

      return NextResponse.json({ 
        checkoutUrl: session.url,
        transactionId: transaction.id,
      });
    }

    else if (paymentMethod === 'paypal') {
      const transaction = await createTransaction({
        userId: dbUser.id,
        type: TransactionType.PURCHASE,
        amount: priceUSD,
        solcitosAmount: baseSolcitos,
        bonusAmount: bonusSolcitos,
        provider: PaymentProvider.PAYPAL,
        description: `Compra de ${totalSolcitos} Solcitos`,
        metadata: { packageId, packageName: packageData.name },
      });

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          custom_id: transaction.id,
          description: `${totalSolcitos} Solcitos`,
          amount: {
            currency_code: 'USD',
            value: priceUSD.toFixed(2),
          },
          items: [{
            name: `${totalSolcitos} Solcitos ☀`,
            description: bonusSolcitos > 0 ? `Incluye ${bonusSolcitos} de bonus 🎁` : undefined,
            unit_amount: {
              currency_code: 'USD',
              value: priceUSD.toFixed(2)
            },
            quantity: '1',
            category: 'DIGITAL_GOODS'
          }]
        }],
        application_context: {
          brand_name: 'Rulo Streaming',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paypal/success?transaction_id=${transaction.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/showcase?cancelled=true`,
        }
      });

      const client = paypalClient();
      const order = await client.execute(request);
      
      const approvalUrl = order.result.links.find((link: any) => 
        link.rel === 'approve'
      )?.href;

      return NextResponse.json({ 
        checkoutUrl: approvalUrl,
        orderId: order.result.id,
        transactionId: transaction.id,
      });
    }

    return new NextResponse("Método de pago no soportado", { status: 400 });

  } catch (error) {
    console.error('[SOLCITO_PURCHASE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            username: true,
            solcitosBalance: true,
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: transaction.id,
      status: transaction.status,
      solcitosAmount: transaction.solcitosAmount,
      bonusAmount: transaction.bonusAmount,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      processedAt: transaction.processedAt,
      user: transaction.user,
    });

  } catch (error) {
    console.error('[TRANSACTION_CHECK_ERROR]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}