// app/test-prime/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import axios from 'axios';

export default function TestPrime() {
  const [loading, setLoading] = useState(false);
  const [primeStatus, setPrimeStatus] = useState<any>(null);

  const checkPrimeStatus = async () => {
    try {
      const res = await axios.get('/api/prime/subscribe');
      setPrimeStatus(res.data);
    } catch (error) {
      setPrimeStatus({ error: 'No autenticado o error en API' });
    }
  };

  const subscribeToPrime = async (method: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/prime/subscribe', {
        paymentMethod: method
      });
      
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Test Membresía Prime ⭐</h1>
      
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Estado Actual</h2>
          <Button onClick={checkPrimeStatus}>Verificar Estado Prime</Button>
          {primeStatus && (
            <pre className="mt-4 p-4 bg-gray-100 rounded">
              {JSON.stringify(primeStatus, null, 2)}
            </pre>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Suscribirse a Prime</h2>
          <p className="text-gray-600">$3.99 USD/mes</p>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => subscribeToPrime('mercadopago')}
              disabled={loading}
            >
              Pagar con MercadoPago
            </Button>
            
            <Button 
              onClick={() => subscribeToPrime('stripe')}
              disabled={loading}
            >
              Pagar con Stripe
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}