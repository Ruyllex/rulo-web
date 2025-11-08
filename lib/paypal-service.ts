// lib/paypal-service.ts
import paypal from '@paypal/checkout-server-sdk';
import { SOLCITO_PACKAGES, getPackageById } from './solcito-packages';

// Exportar para que las APIs puedan usarlo
export { SOLCITO_PACKAGES, getPackageById } from './solcito-packages';
export type { SolcitoPackage } from './solcito-packages';

// Tipos personalizados
interface PayPalOrder {
  id: string;
  status: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  purchase_units?: Array<{
    custom_id?: string;
  }>;
}

interface PayPalCapture {
  id: string;
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
  }>;
}

// Configurar ambiente de PayPal
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

// Cliente de PayPal
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

// Crear orden de PayPal
export async function createPayPalOrder(
  packageId: string,
  userId: string,
  username: string
): Promise<PayPalOrder> {
  const package_ = getPackageById(packageId);
  if (!package_) {
    throw new Error('Paquete no encontrado');
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: `${package_.solcitos} Solcitos - ${package_.name}`,
        amount: {
          currency_code: 'USD',
          value: package_.priceUSD.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: package_.priceUSD.toFixed(2)
            }
          }
        },
        items: [
          {
            name: `${package_.solcitos} Solcitos`,
            description: `Paquete ${package_.name}`,
            unit_amount: {
              currency_code: 'USD',
              value: package_.priceUSD.toFixed(2)
            },
            quantity: '1',
            category: 'DIGITAL_GOODS'
          }
        ],
        custom_id: JSON.stringify({
          userId,
          packageId,
          solcitos: package_.solcitos,
          username
        })
      }
    ],
    application_context: {
      brand_name: 'Twitch Clone',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paypal/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/showcase?cancelled=true`
    }
  });

  try {
    const response = await client().execute(request);
    return response.result as PayPalOrder;
  } catch (error) {
    console.error('[PAYPAL_CREATE_ORDER_ERROR]', error);
    throw error;
  }
}

// Capturar pago de PayPal
export async function capturePayPalOrder(orderId: string): Promise<PayPalCapture> {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const response = await client().execute(request);
    return response.result as PayPalCapture;
  } catch (error) {
    console.error('[PAYPAL_CAPTURE_ERROR]', error);
    throw error;
  }
}

// Verificar webhook de PayPal
export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: any
): Promise<boolean> {
  const request = new paypal.notifications.webhooks.WebhookVerifySignatureRequest();
  
  request.requestBody({
    transmission_id: headers['paypal-transmission-id'],
    transmission_time: headers['paypal-transmission-time'],
    cert_url: headers['paypal-cert-url'],
    auth_algo: headers['paypal-auth-algo'],
    transmission_sig: headers['paypal-transmission-sig'],
    webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
    webhook_event: body
  });

  try {
    const response = await client().execute(request);
    return response.result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('[PAYPAL_VERIFY_WEBHOOK_ERROR]', error);
    return false;
  }
}