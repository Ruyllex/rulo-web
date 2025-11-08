'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  Wallet,
  CreditCard,
  Coins,
  Users,
  Gift,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: string;
  from: string;
}

interface IngresosClientProps {
  user: {
    id: string;
    username: string;
    solcitosBalance: number;
    totalSolcitosEarned: number;
    availableBalance: number;
  };
  stats: {
    totalEarnings: number;
    availableBalance: number;
    thisMonthEarnings: number;
    totalDonations: number;
    totalSubscribers: number;
    thisMonthSolcitos: number;
  };
  transactions: Transaction[];
}

export function IngresosClient({ user, stats, transactions }: IngresosClientProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const mainStats = [
    {
      title: "Ganancias Totales",
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Balance Disponible",
      value: formatCurrency(stats.availableBalance),
      icon: Wallet,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Listo para retirar",
    },
    {
      title: "Ingresos Este Mes",
      value: formatCurrency(stats.thisMonthEarnings),
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Suscriptores Activos",
      value: stats.totalSubscribers.toString(),
      icon: Users,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const additionalStats = [
    {
      label: "Total Donaciones",
      value: formatCurrency(stats.totalDonations),
      icon: Gift,
    },
    {
      label: "Solcitos Este Mes",
      value: stats.thisMonthSolcitos.toLocaleString(),
      icon: Coins,
    },
    {
      label: "Solcitos Totales",
      value: user.totalSolcitosEarned.toLocaleString(),
      icon: Coins,
    },
  ];

  const canWithdraw = stats.availableBalance >= 50;

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ingresos</h1>
            <p className="text-muted-foreground">
              Gestiona tus ganancias y solicita retiros
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setShowInfoModal(true)}
            >
              <HelpCircle className="h-4 w-4" />
              ¿Cómo retirar?
            </Button>
            <Button 
              className="gap-2"
              disabled={!canWithdraw}
            >
              <CreditCard className="h-4 w-4" />
              Solicitar Retiro
            </Button>
          </div>
        </div>

        {/* Alerta si no puede retirar */}
        {!canWithdraw && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            {/* <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">
                    Monto para retiro
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Actualmente tienes {formatCurrency(stats.availableBalance)}.
                    {' '}
                    <button 
                      onClick={() => setShowInfoModal(true)}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Ver cómo retirar
                      <Info className="h-3 w-3" />
                    </button>
                  </p>
                </div>
              </div>
            </CardContent> */}
          </Card>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.description && (
                        <p className="text-xs text-muted-foreground">
                          {stat.description}
                        </p>
                      )}
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {additionalStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-semibold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No hay transacciones aún</p>
                <p className="text-sm">Tus ingresos aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{entry.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.date} • De {entry.from}
                      </p>
                    </div>
                    <p className="font-semibold text-green-500">
                      +{formatCurrency(entry.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-purple-500" />
                Solcitos
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Comisión: 3%
              </p>
              <p className="text-xs text-muted-foreground">
                Los espectadores pueden enviarte Solcitos para apoyar tu contenido
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Suscripciones
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Comisión: 30%
              </p>
              <p className="text-xs text-muted-foreground">
                Gana ingresos recurrentes con suscripciones mensuales
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-500" />
                Donaciones
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Comisión: 8%
              </p>
              <p className="text-xs text-muted-foreground">
                Recibe donaciones directas de tus seguidores
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Información de Retiro */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="h-6 w-6" />
              Cómo Retirar Dinero de Rulo
            </DialogTitle>
            <DialogDescription>
              Sigue estos pasos para retirar tus ganancias
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Intro */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                Para retirar dinero de Rulo, primero debes tener tus datos de pago 
                configurados y cumplir con el pago mínimo establecido por la plataforma. 
                Una vez que tengas esto, ve a la sección de pagos o panel de creador en 
                tu cuenta de Rulo, solicita el retiro de fondos y selecciona tu método 
                de pago asociado, como una billetera digital o cuenta bancaria.
              </p>
            </div>

            {/* Pasos */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">
                Pasos para retirar dinero de Rulo:
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Asegura tu cuenta y datos",
                    description: "Vincula una plataforma de pago (como Vita Wallet o PayPal) a tu cuenta de Rulo.",
                    icon: CheckCircle,
                  },
                  {
                    step: 2,
                    title: "Verifica el monto mínimo",
                    description: "Confirma que hayas alcanzado el mínimo de $50.00 USD que Rulo requiere para retirar tus ganancias.",
                    icon: DollarSign,
                  },
                  {
                    step: 3,
                    title: "Accede a la sección de pagos",
                    description: "Dirígete al panel de control de tu creador en Rulo y busca la opción de \"Pagos\" o \"Retiro de fondos\".",
                    icon: Wallet,
                  },
                  {
                    step: 4,
                    title: "Solicita el retiro",
                    description: "Selecciona tu método de pago asociado y verifica los datos.",
                    icon: CreditCard,
                  },
                  {
                    step: 5,
                    title: "Completa la transferencia",
                    description: "Inicia el proceso de transferencia y el dinero se reflejará en tu cuenta en unos pocos días hábiles.",
                    icon: TrendingUp,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-muted-foreground">
                            PASO {item.step}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status actual */}
            <div className={`border rounded-lg p-4 ${
              canWithdraw 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
              <div className="flex items-start gap-3">
                {canWithdraw ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold mb-1">
                    {canWithdraw 
                      ? '¡Puedes retirar tus fondos!' 
                      : 'Aún no alcanzas el mínimo'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance disponible: <span className="font-semibold">
                      {formatCurrency(stats.availableBalance)}
                    </span>
                    {!canWithdraw && (
                      <span> / {formatCurrency(50)} mínimo</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowInfoModal(false)}
              >
                Cerrar
              </Button>
              <Button 
                className="flex-1 gap-2"
                disabled={!canWithdraw}
              >
                <CreditCard className="h-4 w-4" />
                Configurar Método de Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}