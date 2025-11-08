// components/dashboard/stream-status.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Clock } from "lucide-react";

interface StreamStatusProps {
  hostIdentity: string;
  username: string;
}

export const StreamStatus = ({ hostIdentity, username }: StreamStatusProps) => {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificar estado del stream cada 10 segundos
    const checkStreamStatus = async () => {
      try {
        const response = await fetch(`/api/stream/status?roomName=${hostIdentity}`);
        if (response.ok) {
          const data = await response.json();
          setIsLive(data.isLive);
          setViewerCount(data.viewerCount || 0);
        }
      } catch (error) {
        console.error("Error checking stream status:", error);
      } finally {
        setChecking(false);
      }
    };

    checkStreamStatus();
    const interval = setInterval(checkStreamStatus, 10000);

    return () => clearInterval(interval);
  }, [hostIdentity]);

  useEffect(() => {
    // Contador de duración del stream
    if (!isLive) {
      setStreamDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (checking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado del Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Estado del Stream</span>
          {isLive ? (
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              EN VIVO
            </Badge>
          ) : (
            <Badge variant="secondary">OFFLINE</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Espectadores</span>
            </div>
            <span className="text-2xl font-bold">{viewerCount}</span>
          </div>

          {isLive && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Duración</span>
              </div>
              <span className="text-2xl font-bold font-mono">
                {formatDuration(streamDuration)}
              </span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {isLive ? (
              <p>
                Tu stream está en vivo. Los usuarios pueden verlo en{" "}
                <span className="font-mono bg-muted px-1 rounded">
                  /{username}
                </span>
              </p>
            ) : (
              <p>
                Inicia tu stream desde OBS con las credenciales de la pestaña &quot;Keys&quot;
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};