"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building2, MessageCircle, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentOptionsProps {
  amount: number;
  solcitos: number;
  packageId?: string;
  onPaymentComplete?: () => void;
}

export function PaymentOptions({ amount, solcitos, packageId, onPaymentComplete }: PaymentOptionsProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"paypal" | "transferencia">("paypal");
  
  // TUS DATOS BANCARIOS (cámbialos)
  const BANK_DATA = {
    cbu: "0000230300000029286397", // ← Cambia
    alias: "rulostreaming.sa", // ← Cambia
    titular: "Santiago Leonel Quiroz", // ← Cambia
    whatsapp: "5491130652655", // ← Cambia
    email: "alanchazarretaaaa@gmail.com", // ← Cambia
    entidad: "Global66", // ← Cambia
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const handleTransferencia = () => {
    const message = encodeURIComponent(
      `Hola! Quiero comprar ${solcitos} Solcitos por $${amount}.\n\n` +
      `Realizaré una transferencia. Luego enviaré el comprobante.`
    );
    
    window.open(
      `https://wa.me/${BANK_DATA.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId: packageId || 'custom',
          amount: amount,
          solcitos: solcitos
        })
      });

      const data = await response.json();

      if (response.ok && data.approvalUrl) {
        // Redirigir a PayPal para completar el pago
        window.location.href = data.approvalUrl;
      } else {
        toast.error(data.error || 'Error al crear orden de PayPal');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con PayPal');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Botones de selección de método */}
        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant={activeTab === "paypal" ? "default" : "outline"}
            onClick={() => setActiveTab("paypal")}
            className="flex-1"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            PayPal / Tarjeta
          </Button>
          <Button
            type="button"
            variant={activeTab === "transferencia" ? "default" : "outline"}
            onClick={() => setActiveTab("transferencia")}
            className="flex-1"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Transferencia
          </Button>
        </div>

        {/* Contenido según método seleccionado */}
        {activeTab === "paypal" ? (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium mb-2">💳 Pago con PayPal</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">Recibirás:</span>
                <span className="text-lg font-semibold text-primary">{solcitos} Solcitos</span>
              </div>
            </div>

            {/* Tarjeta visual PayPal */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="text-xl font-bold">PayPal</div>
                <div className="text-xs bg-white/20 px-2 py-1 rounded">Seguro</div>
              </div>
              <div className="space-y-2">
                <p className="text-sm opacity-90">Acepta:</p>
                <div className="flex gap-2">
                  <div className="bg-white/20 px-3 py-1 rounded text-xs">Visa</div>
                  <div className="bg-white/20 px-3 py-1 rounded text-xs">Mastercard</div>
                  <div className="bg-white/20 px-3 py-1 rounded text-xs">PayPal</div>
                </div>
              </div>
            </div>

            {/* Botón de pago PayPal */}
            <Button
              onClick={handlePayPalPayment}
              disabled={loading}
              className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Conectando con PayPal...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pagar ${amount.toFixed(2)} con PayPal
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Pago 100% seguro. Serás redirigido a PayPal para completar la compra.
              <br />
              Los Solcitos se acreditan instantáneamente después del pago.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen Transferencia */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium mb-2">💰 Pago por Transferencia</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">Recibirás:</span>
                <span className="text-lg font-semibold text-primary">{solcitos} Solcitos</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* CBU */}
              <div>
                <Label>CBU</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={BANK_DATA.cbu}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(BANK_DATA.cbu, "CBU")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Alias */}
              <div>
                <Label>Alias</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={BANK_DATA.alias}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(BANK_DATA.alias, "Alias")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Titular */}
              <div>
                <Label>Titular</Label>
                <Input
                  value={BANK_DATA.titular}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={BANK_DATA.email}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Entidad</Label>
                <Input
                  value={BANK_DATA.entidad}
                  readOnly
                  className="mt-1"
                />
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium mb-2">📸 Pasos a seguir:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Realiza la transferencia por ${amount.toFixed(2)}</li>
                <li>Toma captura del comprobante</li>
                <li>Envíalo por WhatsApp</li>
                <li>Acreditaremos tus Solcitos en 5-10 minutos</li>
              </ol>
            </div>

            <Button
              type="button"
              onClick={handleTransferencia}
              className="w-full"
              variant="default"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar Comprobante por WhatsApp
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              💡 Tip: Envía el comprobante lo antes posible para acreditación más rápida
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}