"use client";

import { useEffect, useState, useRef } from "react";
import { LiveKitRoom, VideoTrack, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";

interface BrowserBroadcastProps {
  isHost: boolean;
  isLive: boolean;
  username: string;
  onToggleStream: () => Promise<void>;
}

function BroadcastControls({ 
  isLive, 
  onToggleStream 
}: { 
  isLive: boolean; 
  onToggleStream: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { localParticipant } = useLocalParticipant();
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const toggleCamera = async () => {
    if (!localParticipant) return;
    
    const videoTrack = localParticipant.getTrack(Track.Source.Camera);
    if (videoTrack) {
      if (isCameraEnabled) {
        await localParticipant.setCameraEnabled(false);
      } else {
        await localParticipant.setCameraEnabled(true);
      }
      setIsCameraEnabled(!isCameraEnabled);
    }
  };

  const toggleMic = async () => {
    if (!localParticipant) return;
    
    const audioTrack = localParticipant.getTrack(Track.Source.Microphone);
    if (audioTrack) {
      if (isMicEnabled) {
        await localParticipant.setMicrophoneEnabled(false);
      } else {
        await localParticipant.setMicrophoneEnabled(true);
      }
      setIsMicEnabled(!isMicEnabled);
    }
  };

  const handleToggleStream = async () => {
    setIsLoading(true);
    try {
      await onToggleStream();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <Button
        onClick={toggleCamera}
        variant="outline"
        size="sm"
        disabled={!isLive}
      >
        {isCameraEnabled ? (
          <>
            <Video className="h-4 w-4 mr-2" />
            Cámara ON
          </>
        ) : (
          <>
            <VideoOff className="h-4 w-4 mr-2" />
            Cámara OFF
          </>
        )}
      </Button>

      <Button
        onClick={toggleMic}
        variant="outline"
        size="sm"
        disabled={!isLive}
      >
        {isMicEnabled ? (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Micro ON
          </>
        ) : (
          <>
            <MicOff className="h-4 w-4 mr-2" />
            Micro OFF
          </>
        )}
      </Button>

      <Button
        onClick={handleToggleStream}
        variant={isLive ? "destructive" : "default"}
        disabled={isLoading}
      >
        {isLoading ? "Cargando..." : isLive ? "Terminar Stream" : "Iniciar Stream"}
      </Button>
    </div>
  );
}

function BroadcastVideo() {
  const { localParticipant } = useLocalParticipant();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!localParticipant) return;

    const videoTrack = localParticipant.videoTracks.values().next().value;
    
    if (videoTrack && videoRef.current) {
      videoTrack.videoTrack?.attach(videoRef.current);
    }

    return () => {
      if (videoTrack) {
        videoTrack.videoTrack?.detach();
      }
    };
  }, [localParticipant]);

  if (!localParticipant) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-white">Cargando cámara...</p>
      </div>
    );
  }

  const videoTrack = localParticipant.videoTracks.values().next().value;

  return (
    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {videoTrack ? (
        <VideoTrack trackRef={videoTrack} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-white">Sin video</p>
        </div>
      )}
    </div>
  );
}

export function BrowserBroadcast({
  isHost,
  isLive,
  username,
  onToggleStream,
}: BrowserBroadcastProps) {
  const [token, setToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!isHost) return;

    const getToken = async () => {
      try {
        setIsConnecting(true);
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: username,
            role: "host",
          }),
        });

        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Error obteniendo token:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    getToken();
  }, [isHost, username]);

  if (!isHost) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded">
        <p className="text-sm">No tienes permisos para transmitir.</p>
      </div>
    );
  }

  if (isConnecting || !token) {
    return (
      <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-center">Conectando...</p>
      </div>
    );
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;

  if (!serverUrl) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded">
        <p className="text-sm">Error: LiveKit no está configurado correctamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transmitir desde el navegador</h2>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-2 text-red-500 animate-pulse">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              EN VIVO
            </span>
          )}
        </div>
      </div>

      {!isLive ? (
        <div className="space-y-4">
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <Video className="h-16 w-16 mx-auto opacity-50" />
              <p className="text-lg">Presiona "Iniciar Stream" para comenzar</p>
              <p className="text-sm opacity-70">
                Se te pedirá permiso para usar tu cámara y micrófono
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={onToggleStream} size="lg">
              Iniciar Stream
            </Button>
          </div>
        </div>
      ) : (
        <LiveKitRoom
          serverUrl={serverUrl}
          token={token}
          connect={true}
          video={true}
          audio={true}
          onDisconnected={() => {
            console.log("Desconectado de LiveKit");
          }}
        >
          <div className="space-y-4">
            <BroadcastVideo />
            <BroadcastControls isLive={isLive} onToggleStream={onToggleStream} />
            
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded">
              <p className="text-sm">
                <strong>💡 Tip:</strong> Usa los controles para activar/desactivar tu cámara y micrófono durante el stream.
              </p>
            </div>
          </div>
        </LiveKitRoom>
      )}
    </div>
  );
}