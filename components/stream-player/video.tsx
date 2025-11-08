"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";

interface VideoProps {
  hostName: string;
  hostIdentity: string;
}

export const Video = ({ hostName, hostIdentity }: VideoProps) => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await fetch(
          `/api/livekit?room=${hostIdentity}&username=viewer-${Date.now()}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to get token");
        }
        
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Error getting viewer token:", error);
      } finally {
        setLoading(false);
      }
    };

    getToken();
  }, [hostIdentity]);

  if (loading) {
    return <VideoSkeleton />;
  }

  if (!token) {
    return (
      <div className="aspect-video flex items-center justify-center bg-black rounded-lg">
        <p className="text-white">Error al cargar el stream</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
      className="aspect-video bg-black rounded-lg overflow-hidden"
    >
      <VideoRenderer hostName={hostName} />
    </LiveKitRoom>
  );
};

const VideoRenderer = ({ hostName }: { hostName: string }) => {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  const videoTrack = tracks.find((track) => track.source === Track.Source.Camera);

  if (!videoTrack) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center space-y-4 p-8">
          {/* Animated offline indicator */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gray-500/20 blur-3xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-full p-6 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Text */}
          <div>
            <p className="text-white text-xl font-semibold">Stream Offline</p>
            <p className="text-gray-400 text-sm mt-2">
              {hostName} no está transmitiendo en este momento
            </p>
          </div>
          
          {/* Tip */}
          <div className="bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-gray-300 text-xs">
              💡 Los streamers pueden iniciar su transmisión usando OBS Studio con sus credenciales de stream
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <VideoTrack 
        trackRef={videoTrack} 
        className="w-full h-full object-contain"
      />
      
      {/* Live indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        EN VIVO
      </div>
    </div>
  );
};

// Exportar VideoSkeleton
export const VideoSkeleton = () => {
  return (
    <div className="aspect-video flex items-center justify-center bg-black rounded-lg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
        <p className="text-white text-sm">Cargando stream...</p>
      </div>
    </div>
  );
};