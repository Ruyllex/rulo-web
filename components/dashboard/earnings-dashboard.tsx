// components/dashboard/earnings-dashboard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Wallet,
  CreditCard,
  CircleDollarSign
} from 'lucide-react';
import { useState } from 'react';

interface EarningsDashboardProps {
  totalEarnings: number;
  availableBalance: number;
  solcitosEarned: number;
  totalDonations: number;
  totalSubscribers: number;
  thisMonthEarnings: number;
}

export function EarningsDashboard({
  totalEarnings = 0,
  availableBalance = 0,
  solcitosEarned = 0,
  totalDonations = 0,
  totalSubscribers = 0,
  thisMonthEarnings = 0,
}: EarningsDashboardProps) {
  const [withdrawing, setWithdrawing] = useState(false);
  
  const minWithdraw = 50; // Mínimo $50 para retirar
  const canWithdraw = availableBalance >= minWithdraw;

  const handleWithdraw = async () => {
    setWithdrawing(true);
    // Implementar lógica de retiro
    setTimeout(() => setWithdrawing(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Balance Principal */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle>Balance Disponible</CardTitle>
          <CardDescription>Listo para retirar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-green-500">
              ${availableBalance.toFixed(2)}
            </span>
            <Button
              onClick={handleWithdraw}
              disabled={!canWithdraw || withdrawing}
              className="bg-green-500 hover:bg-green-600"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {canWithdraw ? 'Retirar' : `Min. $${minWithdraw}`}
            </Button>
          </div>
          {!canWithdraw && (
            <Progress 
              value={(availableBalance / minWithdraw) * 100} 
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solcitos Ganados
            </CardTitle>
            <Sun className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {solcitosEarned.toLocaleString()} ☀
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ ${(solcitosEarned * 0.01).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Donaciones Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">${totalDonations.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Después de comisiones
            </p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suscriptores
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Activos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Este Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métodos de Retiro */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Retiro</CardTitle>
          <CardDescription>Configura cómo recibir tus pagos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <CircleDollarSign className="h-5 mr-3" />
            MercadoPago
            <span className="ml-auto text-green-500 text-sm">Conectado</span>
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="h-5 w-5 mr-3" />
            Transferencia Bancaria
            <span className="ml-auto text-muted-foreground text-sm">Configurar</span>
          </Button>
          
          <Button variant="outline" className="w-full justify-start opacity-50" disabled>
            PayPal
            <span className="ml-auto text-muted-foreground text-sm">Próximamente</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}