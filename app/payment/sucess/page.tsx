"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, XCircle, Sparkles, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [details, setDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    if (!transactionId) {
      setStatus("error");
      return;
    }
    checkPayment();
  }, [transactionId, retryCount]);

  const checkPayment = async () => {
    try {
      if (retryCount === 0) {
        await new Promise(r => setTimeout(r, 2000));
      }

      const res = await fetch(`/api/solcitos/purchase?transaction_id=${transactionId}`);
      const data = await res.json();

      if (data.status === "COMPLETED") {
        setStatus("success");
        setDetails(data);
      } else if (data.status === "FAILED") {
        setStatus("error");
      } else if (retryCount < 5) {
        setTimeout(() => setRetryCount(p => p + 1), 3000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      if (retryCount < 5) {
        setTimeout(() => setRetryCount(p => p + 1), 3000);
      } else {
        setStatus("error");
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-950/20 via-background to-cyan-950/20 p-4">
        <Card className="border-cyan-500/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-cyan-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
              Procesando tu pago...
            </h2>
            <p className="text-muted-foreground">Estamos verificando tu transacción</p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">Intento {retryCount + 1} de 6...</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950/20 via-background to-red-950/20 p-4">
        <Card className="border-red-500/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Error en el pago</h2>
            <p className="text-muted-foreground mb-6">Hubo un problema al procesar tu pago.</p>
            <div className="flex flex-col gap-3">
              <Link href="/showcase" className="w-full">
                <Button className="w-full">Intentar nuevamente</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-950/20 via-background to-cyan-950/20 p-4">
      <Card className="border-cyan-500/20 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
            ¡Pago exitoso!
          </h2>
          <p className="text-muted-foreground mb-6">
            Tus Solcitos han sido acreditados correctamente
          </p>

          {details && (
            <>
              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl p-6 mb-6 border border-cyan-500/30">
                <div className="text-6xl font-bold text-cyan-600 mb-2">
                  +{(details.solcitosAmount + details.bonusAmount).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Solcitos agregados</p>
                {details.bonusAmount > 0 && (
                  <Badge className="mt-3 bg-green-600">
                    <Gift className="h-3 w-3 mr-1" />
                    +{details.bonusAmount} bonus 🎁
                  </Badge>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Tu nuevo balance</p>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-500" />
                  <span className="text-2xl font-bold text-cyan-600">
                    {details.user.solcitosBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/showcase" className="w-full">
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700">
                Comprar más Solcitos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">Ir al inicio</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}