"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KeysClientProps {
  username: string;
  initialServerUrl: string;
  initialStreamKey: string;
  hasCredentials: boolean;
}

export function KeysClient({
  username,
  initialServerUrl,
  initialStreamKey,
  hasCredentials: initialHasCredentials,
}: KeysClientProps) {
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [credentials, setCredentials] = useState({
    serverUrl: initialServerUrl,
    streamKey: initialStreamKey,
  });
  const [hasCredentials, setHasCredentials] = useState(initialHasCredentials);

  // Generar credenciales automáticamente si no existen
  useEffect(() => {
    if (!hasCredentials && !generating) {
      generateIngress();
    }
  }, []);

  const generateIngress = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ingress", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate ingress");
      }

      const data = await response.json();
      
      setCredentials({
        serverUrl: data.ingress.url,
        streamKey: data.ingress.streamKey,
      });
      setHasCredentials(true);
      
      toast.success("Credenciales generadas exitosamente");
      router.refresh();
    } catch (error) {
      console.error("Error generating ingress:", error);
      toast.error("Error al generar credenciales. Por favor recarga la página.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado al portapapeles`);
    } catch (error) {
      toast.error("Error al copiar. Intenta seleccionar y copiar manualmente.");
    }
  };

  const handleRegenerate = async () => {
    const confirmed = confirm(
      "⚠️ ¿Estás seguro?\n\nEsto invalidará tu stream key actual. Deberás actualizar las credenciales en OBS."
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ingress", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate");
      }

      const data = await response.json();
      
      setCredentials({
        serverUrl: data.ingress.url,
        streamKey: data.ingress.streamKey,
      });
      
      toast.success("Stream key regenerado exitosamente");
      toast.info("Actualiza las credenciales en OBS");
      router.refresh();
    } catch (error) {
      console.error("Error regenerating key:", error);
      toast.error("Error al regenerar stream key");
    } finally {
      setLoading(false);
    }
  };

  if (generating) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Generando tus credenciales de streaming...
              </h2>
              <p className="text-muted-foreground text-sm">
                Esto puede tardar unos segundos
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasCredentials || !credentials.serverUrl) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudieron generar las credenciales. Por favor recarga la página o contacta soporte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Credenciales de Stream</h1>
        <p className="text-muted-foreground mt-2">
          Configura OBS Studio con estas credenciales para comenzar a transmitir
        </p>
      </div>

      {/* Credenciales */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciales para OBS</CardTitle>
          <CardDescription>
            Usa estas credenciales en OBS Studio para conectar tu stream
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Server URL */}
          <div className="space-y-2">
            <Label>Server URL</Label>
            <div className="flex gap-2">
              <Input
                value={credentials.serverUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(credentials.serverUrl, "Server URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Este es el servidor donde OBS enviará tu stream
            </p>
          </div>

          {/* Stream Key */}
          <div className="space-y-2">
            <Label>Stream Key</Label>
            <div className="flex gap-2">
              <Input
                type={showKey ? "text" : "password"}
                value={credentials.streamKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(credentials.streamKey, "Stream Key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">
              ⚠️ IMPORTANTE: No compartas tu stream key con nadie
            </p>
          </div>

          {/* Botón Regenerar */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Stream Key
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Usa esto solo si crees que tu stream key fue comprometido
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guía de configuración OBS */}
      <Card>
        <CardHeader>
          <CardTitle>📹 Configuración en OBS Studio</CardTitle>
          <CardDescription>
            Sigue estos pasos para configurar OBS con tus credenciales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Paso 1 */}
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary text-primary-foreground p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Abre OBS Studio</p>
                <p className="text-sm text-muted-foreground">
                  Si no lo tienes, descárgalo en{" "}
                  <a
                    href="https://obsproject.com/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    obsproject.com
                  </a>
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary text-primary-foreground p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Ve a Configuración → Stream</p>
                <p className="text-sm text-muted-foreground">
                  Haz clic en "Configuración" (abajo a la derecha) → Pestaña "Stream"
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary text-primary-foreground p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Selecciona "Personalizado"</p>
                <p className="text-sm text-muted-foreground">
                  En el dropdown de "Servicio", selecciona <strong>Custom</strong> o{" "}
                  <strong>Personalizado</strong>
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary text-primary-foreground p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                4
              </div>
              <div className="flex-1">
                <p className="font-medium">Pega tus credenciales</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Server:</strong> Copia el Server URL de arriba
                  <br />
                  <strong>Stream Key:</strong> Copia tu Stream Key
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary text-primary-foreground p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                5
              </div>
              <div className="flex-1">
                <p className="font-medium">Guarda y comienza a transmitir</p>
                <p className="text-sm text-muted-foreground">
                  Haz clic en <strong>Aplicar</strong> → <strong>Aceptar</strong> →{" "}
                  <strong>Iniciar transmisión</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Alert de confirmación */}
          <Alert className="bg-green-500/10 border-green-500/50 mt-6">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              <strong>¡Todo listo!</strong> Tu stream aparecerá automáticamente en{" "}
              <code className="bg-green-500/20 px-1 rounded">/{username}</code> cuando
              inicies la transmisión en OBS
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tips adicionales */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            💡 Tips para mejor calidad
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Bitrate recomendado:</strong> 3000-6000 Kbps (según tu internet)
            </li>
            <li>
              • <strong>Resolución:</strong> 1920x1080 (1080p) o 1280x720 (720p)
            </li>
            <li>
              • <strong>FPS:</strong> 30 o 60 fps
            </li>
            <li>
              • <strong>Codificador:</strong> x264 o Hardware (NVENC/QuickSync si está disponible)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}