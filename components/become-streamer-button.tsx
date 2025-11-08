"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BecomeStreamerButtonProps {
  username: string;
}

export function BecomeStreamerButton({ username }: BecomeStreamerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleBecomeStreamer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🚀 Iniciando proceso de activación de streamer...");
      
      const response = await fetch("/api/become-streamer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!response.ok) {
        // Mostrar el error específico de la API
        const errorMsg = data.details || data.error || "Error desconocido";
        throw new Error(errorMsg);
      }

      toast.success("¡Ahora eres un streamer! 🎉");
      toast.info("Redirigiendo a tus credenciales...");
      
      // Pequeño delay para que se vea el toast
      setTimeout(() => {
        router.push(`/u/${username}/keys`);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("❌ Error becoming streamer:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error al activar modo streamer";
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            <br />
            <span className="text-xs mt-2 block">
              Revisa la consola del navegador (F12) y la terminal del servidor para más detalles.
            </span>
          </AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleBecomeStreamer}
        disabled={loading}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Configurando streaming...
          </>
        ) : (
          "Activar Modo Streamer"
        )}
      </Button>

      {loading && (
        <div className="text-sm text-muted-foreground text-center">
          <p>⏳ Esto puede tardar unos segundos...</p>
          <p className="text-xs mt-1">Generando credenciales de LiveKit</p>
        </div>
      )}
    </div>
  );
}