"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function PayPalCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const token = searchParams.get('token');
    const orderId = searchParams.get('token'); // PayPal usa 'token' como orderId

    if (orderId) {
      capturePayment(orderId);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  const capturePayment = async (orderId: string) => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          router.push('/showcase?success=true');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error capturando pago:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Procesando tu pago...</h2>
            <p className="text-muted-foreground">
              Por favor espera mientras verificamos tu transacción
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-600">¡Pago Exitoso!</h2>
            <p className="text-muted-foreground">
              Tus Solcitos han sido acreditados
            </p>
            <p className="text-sm">Redirigiendo...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-600">Error en el Pago</h2>
            <p className="text-muted-foreground">
              Hubo un problema procesando tu pago
            </p>
            <button
              onClick={() => router.push('/showcase')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Volver a la Tienda
            </button>
          </>
        )}
      </div>
    </div>
  );
}