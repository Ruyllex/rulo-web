// app/(auth)/setup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(true);
  const [username, setUsername] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptedParental, setAcceptedParental] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    if (!accepted || (isMinor && !acceptedParental)) {
      alert("Debes aceptar los términos");
      return;
    }
    setShowTerms(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      alert("Username debe tener al menos 3 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/setup-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      router.push("/");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  if (showTerms) {
    return (
      <Dialog open={showTerms} onOpenChange={() => router.push("/")}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Términos y Condiciones – RULO</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground">
                Fecha: {new Date().toLocaleDateString()}
              </p>
              
              <p>Bienvenido a RULO. Al usar la plataforma, aceptás estos términos.</p>
              
              <div>
                <h3 className="font-semibold">1. Requisitos de Edad</h3>
                <p>Edad mínima: 13 años. Menores de 18 necesitan consentimiento parental.</p>
              </div>

              <div>
                <h3 className="font-semibold">2. Contenido Aceptable</h3>
                <p>No se permite contenido violento, sexual, acoso o datos personales.</p>
              </div>

              <div>
                <h3 className="font-semibold">3. Monetización</h3>
                <p>Menores pueden monetizar con consentimiento parental. 97% creador, 3% RULO.</p>
              </div>

              <div>
                <h3 className="font-semibold">4. Privacidad</h3>
                <p>No compartas ubicación ni datos personales. Reporta contenido inapropiado.</p>
              </div>

              <div>
                <h3 className="font-semibold">5. Suspensión</h3>
                <p>RULO puede suspender cuentas que violen estos términos.</p>
              </div>

              <div>
                <h3 className="font-semibold">6. Contacto</h3>
                <p>📩 soporte@rulo.com</p>
              </div>
            </div>
          </ScrollArea>

          {isMinor && (
            <div className="flex gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Como menor de edad, necesitas consentimiento de tus padres/tutores.
              </p>
            </div>
          )}

          <DialogFooter className="flex-col gap-3">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="minor" 
                checked={isMinor} 
                onChange={(e) => setIsMinor(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="minor" className="text-sm cursor-pointer">Soy menor de 18 años</label>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="terms" 
                checked={accepted} 
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm cursor-pointer">Acepto los Términos y Condiciones</label>
            </div>

            {isMinor && (
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="parental" 
                  checked={acceptedParental} 
                  onChange={(e) => setAcceptedParental(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="parental" className="text-sm cursor-pointer">Tengo consentimiento parental</label>
              </div>
            )}

            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
                Rechazar
              </Button>
              <Button onClick={handleAccept} className="flex-1" disabled={!accepted || (isMinor && !acceptedParental)}>
                Aceptar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido! 👋</h1>
          <p className="text-muted-foreground">Elige tu nombre de usuario</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre de usuario</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: StreamerPro123"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Solo letras, números y guiones bajos. 3-20 caracteres.
            </p>
          </div>
          
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creando..." : "Continuar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}