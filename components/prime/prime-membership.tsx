// components/prime/prime-membership.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Check, 
  X, 
  Loader2, 
  Sparkles, 
  MessageCircle, 
  Shield,
  Zap,
  Lock,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PrimeMembershipProps {
  user: {
    id: string;
    username: string;
    isPrime: boolean;
    primeMemberships?: Array<{
      status: string;
      endDate: Date;
    }>;
  };
}

export function PrimeMembership({ user }: PrimeMembershipProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const activeMembership = user.primeMemberships?.find(m => m.status === 'active');
  const isPrime = user.isPrime && activeMembership;

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      window.history.replaceState({}, '', '/prime');
      router.refresh();
      setTimeout(() => setShowSuccess(false), 5000);
    }
    if (searchParams.get('error')) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
    if (searchParams.get('cancelled') === 'true') {
      setShowCancelled(true);
      window.history.replaceState({}, '', '/prime');
      setTimeout(() => setShowCancelled(false), 5000);
    }
  }, [searchParams, router]);

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/prime/subscribe', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok && data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert(data.error || 'Error al crear suscripción');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la suscripción');
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro que deseas cancelar tu membresía Prime? Seguirás teniendo acceso hasta la fecha de expiración.')) {
      return;
    }

    setIsCancelling(true);

    try {
      const response = await fetch('/api/prime/cancel', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        router.refresh();
      } else {
        alert(data.error || 'Error al cancelar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cancelar la suscripción');
    } finally {
      setIsCancelling(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Sin Anuncios',
      description: 'Disfruta de streams sin interrupciones publicitarias',
      color: 'text-blue-500'
    },
    {
      icon: Sparkles,
      title: 'Emojis Exclusivos',
      description: 'Acceso a emojis premium para usar en el chat',
      color: 'text-yellow-500'
    },
    {
      icon: Lock,
      title: 'Contenido VIP',
      description: 'Acceso anticipado a streams especiales y contenido exclusivo',
      color: 'text-purple-500'
    },
    {
      icon: Crown,
      title: 'Badge Prime',
      description: 'Muestra tu insignia Prime en todos los chats',
      color: 'text-orange-500'
    },
    {
      icon: MessageCircle,
      title: 'Color de Chat',
      description: 'Personaliza el color de tu nombre en el chat',
      color: 'text-green-500'
    },
    {
      icon: Zap,
      title: 'Prioridad de Soporte',
      description: 'Atención prioritaria del equipo de soporte',
      color: 'text-red-500'
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Mensajes de feedback */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Bienvenido a Prime! Tu membresía está activa.
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
            Suscripción cancelada. Puedes intentar nuevamente cuando quieras.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Crown className="h-12 w-12 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Membresía Prime
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Mejora tu experiencia con beneficios exclusivos y acceso a contenido premium
        </p>
      </div>

      {/* Estado actual del usuario */}
      {isPrime && activeMembership && (
        <Card className="border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <CardTitle>Estado de Membresía</CardTitle>
              </div>
              <Badge className="bg-yellow-500">
                PRIME ACTIVO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Válido hasta: {format(new Date(activeMembership.endDate), 'PPP', { locale: es })}
              </span>
            </div>
            <Button
              onClick={handleCancel}
              disabled={isCancelling}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Cancelar Membresía'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card de suscripción */}
      {!isPrime && (
        <Card className="border-2 border-yellow-500">
          <CardHeader className="text-center space-y-4 ">
            <div className="flex items-center justify-center">
              <Crown className="h-16 w-16 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-3xl ">$3.99 USD</CardTitle>
              <CardDescription className="text-base">por mes</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-5 w-5" />
                  Suscribirse a Prime
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Beneficios */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Beneficios de Prime</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {benefit.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">¿Cómo cancelo mi suscripción?</h3>
            <p className="text-sm text-muted-foreground">
              Puedes cancelar en cualquier momento desde esta página. Seguirás teniendo acceso Prime hasta el final de tu período de facturación actual.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">¿Cuándo se renueva mi suscripción?</h3>
            <p className="text-sm text-muted-foreground">
              Tu suscripción se renueva automáticamente cada 30 días desde la fecha de activación.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
            <p className="text-sm text-muted-foreground">
              Aceptamos PayPal y todas las tarjetas de crédito/débito principales a través de PayPal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}