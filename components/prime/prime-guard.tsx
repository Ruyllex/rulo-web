// components/prime/prime-guard.tsx
'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PrimeGuardProps {
  children: ReactNode;
  isPrime: boolean;
  fallback?: ReactNode;
}

export function PrimeGuard({ children, isPrime, fallback }: PrimeGuardProps) {
  const router = useRouter();

  if (isPrime) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md border-yellow-500">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-full bg-yellow-100">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Contenido Exclusivo Prime</CardTitle>
            <CardDescription className="mt-2">
              Este contenido está disponible solo para miembros Prime
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Sin anuncios</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Emojis exclusivos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Contenido VIP</span>
            </div>
          </div>
          <Button
            onClick={() => router.push('/prime')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            size="lg"
          >
            <Crown className="mr-2 h-5 w-5" />
            Hazte Prime por $3.99/mes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para verificar Prime en el cliente
export function usePrimeStatus() {
  // Este hook se puede expandir para hacer verificaciones en tiempo real
  return {
    isPrime: false, // Por defecto, debe venir del servidor
    isLoading: false
  };
}