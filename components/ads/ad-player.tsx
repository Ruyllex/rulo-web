'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';
import { AdType } from '@prisma/client';

interface AdPlayerProps {
  type: AdType;
  onAdComplete?: () => void;
  onAdSkip?: () => void;
  viewerCount?: number;
}

export function AdPlayer({ type, onAdComplete, onAdSkip, viewerCount }: AdPlayerProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const [canSkip, setCanSkip] = useState(false);
  const [timeWatched, setTimeWatched] = useState(0);
  const [muted, setMuted] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchAd();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchAd = async () => {
    try {
      const params = new URLSearchParams({
        type,
        ...(viewerCount && { viewerCount: viewerCount.toString() }),
      });

      const response = await axios.get(`/api/ads/get?${params}`);
      
      if (response.data.ad) {
        setAd(response.data.ad);
        
        // Registrar impresión
        const impression = await recordImpression(response.data.ad.id);
        setImpressionId(impression.id);
        
        // Iniciar contador
        startTimer(response.data.ad.skipAfter);
      } else {
        onAdComplete?.();
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
      onAdComplete?.();
    } finally {
      setLoading(false);
    }
  };

  const recordImpression = async (adId: string) => {
    // Aquí deberías tener una ruta para registrar impresiones
    // Por ahora simulamos
    return { id: crypto.randomUUID() };
  };

  const startTimer = (skipAfter: number) => {
    timerRef.current = setInterval(() => {
      setTimeWatched((prev) => {
        const newTime = prev + 1;
        if (newTime >= skipAfter) {
          setCanSkip(true);
        }
        return newTime;
      });
    }, 1000);
  };

  const handleClick = async () => {
    if (!ad || !impressionId) return;

    try {
      await axios.post('/api/ads/click', {
        adId: ad.id,
        impressionId,
      });

      if (ad.clickUrl) {
        window.open(ad.clickUrl, '_blank');
      }
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  const handleSkip = async () => {
    if (!ad || !impressionId || !canSkip) return;

    try {
      await axios.post('/api/ads/skip', {
        adId: ad.id,
        impressionId,
        watchTime: timeWatched,
      });

      onAdSkip?.();
    } catch (error) {
      console.error('Error recording skip:', error);
    }
  };

  const handleComplete = async () => {
    if (!ad || !impressionId) return;

    try {
      await axios.post('/api/ads/complete', {
        adId: ad.id,
        impressionId,
        watchTime: timeWatched,
      });

      onAdComplete?.();
    } catch (error) {
      console.error('Error recording completion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-black">
        <div className="text-white">Cargando anuncio...</div>
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-black border-cyan-500/20">
      {/* Ad Content */}
      <div className="relative aspect-video bg-black" onClick={handleClick}>
        {ad.videoUrl ? (
          <video
            src={ad.videoUrl}
            autoPlay
            muted={muted}
            onEnded={handleComplete}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : null}

        {/* Overlay controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Timer and Skip Button */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {canSkip ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSkip}
              className="pointer-events-auto bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Saltar Anuncio
            </Button>
          ) : (
            <div className="bg-black/70 px-3 py-1 rounded text-white text-sm">
              Anuncio: {ad.skipAfter - timeWatched}s
            </div>
          )}
        </div>

        {/* Mute Button */}
        {ad.videoUrl && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMuted(!muted)}
            className="absolute bottom-4 right-4 pointer-events-auto text-white hover:bg-white/20"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        )}

        {/* Ad Info */}
        <div className="absolute bottom-4 left-4 text-white pointer-events-none">
          <h3 className="text-lg font-bold">{ad.title}</h3>
          {ad.clickUrl && (
            <div className="flex items-center gap-1 text-sm text-cyan-400 mt-1">
              <ExternalLink className="h-3 w-3" />
              <span>Click para más info</span>
            </div>
          )}
        </div>
      </div>

      {/* Ad Label */}
      <div className="absolute top-4 left-4 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
        ANUNCIO
      </div>
    </Card>
  );
}