'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestMonetization() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testAPIs = async () => {
    setLoading(true);
    const results: any = {};
    
    try {
      const res = await fetch('/api/solcitos/purchase', { method: 'GET' });
      results.solcitosPurchase = res.ok ? '✅ OK' : '❌ Error';
    } catch (e) {
      results.solcitosPurchase = '❌ No existe';
    }

    try {
      const res = await fetch('/api/prime/subscribe', { method: 'GET' });
      results.primeAPI = res.ok ? '✅ OK' : '❌ Error';
    } catch (e) {
      results.primeAPI = '❌ No existe';
    }

    try {
      const res = await fetch('/api/webhooks/mercadopago', { method: 'GET' });
      results.mercadopagoWebhook = res.ok ? '✅ OK' : '❌ Error';
    } catch (e) {
      results.mercadopagoWebhook = '❌ No existe';
    }

    try {
      const res = await fetch('/api/webhooks/stripe', { method: 'GET' });
      results.stripeWebhook = res.ok ? '✅ OK' : '❌ Error';
    } catch (e) {
      results.stripeWebhook = '❌ No existe';
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">🧪 Test del Sistema de Monetización</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test de APIs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAPIs} disabled={loading}>
            {loading ? 'Testeando...' : 'Verificar APIs'}
          </Button>
          
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2 mt-4">
              <div>Solcitos Purchase API: {testResults.solcitosPurchase}</div>
              <div>Prime API: {testResults.primeAPI}</div>
              <div>MercadoPago Webhook: {testResults.mercadopagoWebhook}</div>
              <div>Stripe Webhook: {testResults.stripeWebhook}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Visual de Componentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>✅ Si ves esta página sin errores, los componentes UI funcionan</p>
            <p>✅ El sistema de rutas funciona</p>
            <p>✅ Las importaciones están correctas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}