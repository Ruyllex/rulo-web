'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Sparkles, 
  Check, 
  Gem, 
  Flame, 
  Zap, 
  Coins, 
  Crown, 
  Diamond,
  ShieldCheck,
  Clock,
  CreditCard,
  X,
  CheckCircle,
  FileText,
  ScrollText
} from 'lucide-react';
import { SOLCITO_PACKAGES } from '@/lib/solcito-packages';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentOptions } from '../payment/payment-options';

interface SolcitoStoreProps {
  currentBalance?: number;
}

const iconMap = {
  gem: Gem,
  sparkles: Sparkles,
  flame: Flame,
  zap: Zap,
  coins: Coins,
  crown: Crown,
  diamond: Diamond
};

export function SolcitoStore({ currentBalance = 0 }: SolcitoStoreProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<typeof SOLCITO_PACKAGES[0] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      window.history.replaceState({}, '', '/showcase');
      router.refresh();
      setTimeout(() => setShowSuccess(false), 5000);
    }
    if (searchParams.get('error')) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
    if (searchParams.get('cancelled') === 'true') {
      setShowCancelled(true);
      window.history.replaceState({}, '', '/showcase');
      setTimeout(() => setShowCancelled(false), 5000);
    }
  }, [searchParams, router]);

  const handleSelectPackage = (pkg: typeof SOLCITO_PACKAGES[0]) => {
    setSelectedPackage(pkg);
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  return (
    <div className="space-y-8">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-400">
            ¡Compra exitosa! Tus Solcitos han sido acreditados.
          </AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            Hubo un error procesando tu pago. Por favor intenta nuevamente.
          </AlertDescription>
        </Alert>
      )}

      {showCancelled && (
        <Alert>
          <X className="h-4 w-4" />
          <AlertDescription>
            Compra cancelada. Puedes intentar nuevamente cuando quieras.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
            <Sparkles className="h-8 w-8 text-cyan-500" />
            Tienda de Solcitos
          </h1>
          
          <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600"
              >
                <FileText className="h-4 w-4 mr-1" />
                Términos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <ScrollText className="h-6 w-6 text-cyan-500" />
                  Términos de Venta de Rulo Streaming
                </DialogTitle>
                <DialogDescription>
                  Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 text-sm">
                <p>
                  Bienvenido a <strong>Rulo Streaming</strong>. Al realizar una compra dentro de Rulo, aceptás estos Términos de Venta.
                </p>

                <section>
                  <h3 className="font-semibold text-base mb-2 text-cyan-700 dark:text-cyan-400">1. Qué podés comprar</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Solcitos:</strong> moneda virtual para apoyar streamers</li>
                    <li><strong>Suscripciones:</strong> beneficios exclusivos</li>
                    <li><strong>Membresía Premium:</strong> funciones avanzadas</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2 text-cyan-700 dark:text-cyan-400">2. Métodos de pago</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>PayPal</li>
                    <li>Tarjetas de crédito/débito</li>
                    <li>Transferencia bancaria (Argentina)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2 text-cyan-700 dark:text-cyan-400">3. Sobre los Solcitos</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Moneda virtual exclusiva de Rulo</li>
                    <li>No tienen valor fuera de la plataforma</li>
                    <li>No son reembolsables (salvo error técnico)</li>
                    <li>No son transferibles</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2 text-cyan-700 dark:text-cyan-400">4. Reembolsos</h3>
                  <p>Las compras no son reembolsables excepto por error técnico o duplicación de pago.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2 text-cyan-700 dark:text-cyan-400">5. Contacto</h3>
                  <ul className="list-none ml-4 space-y-1">
                    <li>📧 Email: soporte@rulostreaming.com</li>
                    <li>📱 WhatsApp: [número de soporte]</li>
                  </ul>
                </section>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => setTermsOpen(false)} 
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600"
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-muted-foreground">
          Compra Solcitos para apoyar a tus streamers favoritos
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <span className="text-sm font-medium">Balance actual:</span>
          <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
            {currentBalance.toLocaleString()}
            <Sparkles className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-cyan-600 dark:text-cyan-400">
          Selecciona un Paquete
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SOLCITO_PACKAGES.map((pkg) => {
            const pricePerSolcito = (pkg.priceUSD / pkg.solcitos).toFixed(4);
            const IconComponent = iconMap[pkg.icon];
            const isSelected = selectedPackage?.id === pkg.id;

            return (
              <Card 
                key={pkg.id}
                className={`
                  relative transition-all cursor-pointer
                  ${isSelected 
                    ? 'border-cyan-500 border-2 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-500/50 scale-105' 
                    : 'hover:scale-105 hover:shadow-lg hover:border-cyan-500/50'
                  }
                  ${pkg.popular && !isSelected ? 'border-cyan-500 border-2' : ''}
                `}
                onClick={() => handleSelectPackage(pkg)}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-full p-1 shadow-lg shadow-cyan-500/50">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}

                {pkg.popular && !isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white flex items-center gap-1 shadow-lg">
                      <Flame className="h-3 w-3" />
                      Más Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-3">
                  <div className="flex justify-center mb-2">
                    <div className={`
                      p-3 rounded-full transition-all
                      ${isSelected 
                        ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 shadow-lg shadow-cyan-500/50' 
                        : 'bg-cyan-500/10 hover:bg-cyan-500/20'
                      }
                    `}>
                      <IconComponent className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-cyan-500'}`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {pkg.solcitos.toLocaleString()}
                    </span>
                    <span className="text-sm"> Solcitos</span>
                    {pkg.bonus > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +{pkg.bonus} bonus 🎁
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold">
                      ${pkg.priceUSD.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${pricePerSolcito} por Solcito
                    </div>
                  </div>

                  {pkg.discount && (
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" />
                      Ahorra {pkg.discount}%
                    </div>
                  )}

                  <Button
                    className={`w-full transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                        : 'hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600'
                    }`}
                    size="lg"
                    variant={isSelected ? 'default' : 'outline'}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Seleccionado
                      </>
                    ) : (
                      'Seleccionar'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedPackage && (
        <div id="payment-section" className="scroll-mt-8">
          <div className="border-t border-cyan-500/20 pt-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                  <Sparkles className="h-5 w-5 text-cyan-600" />
                  Resumen de tu Compra
                </h3>
                <div className="space-y-1 text-sm text-cyan-900 dark:text-cyan-100">
                  <div className="flex justify-between">
                    <span>Paquete:</span>
                    <span className="font-semibold">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solcitos:</span>
                    <span className="font-semibold">{selectedPackage.solcitos.toLocaleString()}</span>
                  </div>
                  {selectedPackage.bonus > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Bonus:</span>
                      <span className="font-semibold">+{selectedPackage.bonus}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-cyan-600 dark:text-cyan-400 pt-2 border-t border-cyan-300 dark:border-cyan-700">
                    <span>Total:</span>
                    <span>${selectedPackage.priceUSD.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <PaymentOptions 
                amount={selectedPackage.priceUSD} 
                solcitos={selectedPackage.solcitos}
                packageId={selectedPackage.id}
              />

              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPackage(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:bg-cyan-500/10 hover:text-cyan-600"
                >
                  ← Cambiar Paquete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedPackage && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            👆 Selecciona un paquete para continuar con el pago
          </p>
        </div>
      )}

      <Card className="bg-muted border-cyan-500/20">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-cyan-700 dark:text-cyan-300">Pago Seguro</div>
                <div className="text-muted-foreground">
                  PayPal, Transferencia o Tarjeta
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-cyan-700 dark:text-cyan-300">Acreditación Rápida</div>
                <div className="text-muted-foreground">
                  5-10 min (Transferencia) o Instantáneo (PayPal)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-cyan-700 dark:text-cyan-300">Múltiples Métodos</div>
                <div className="text-muted-foreground">
                  PayPal, Tarjetas, CBU/Alias
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}