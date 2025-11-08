import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export const getStripeInstance = () => stripe;

export const createCheckoutSession = async (params: Stripe.Checkout.SessionCreateParams) => {
  return await stripe.checkout.sessions.create(params);
};

export const createCustomer = async (params: Stripe.CustomerCreateParams) => {
  return await stripe.customers.create(params);
};

export const retrieveSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

export const retrieveSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};

export const cancelSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

export const createPaymentIntent = async (params: Stripe.PaymentIntentCreateParams) => {
  return await stripe.paymentIntents.create(params);
};

export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string,
  secret: string
) => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};