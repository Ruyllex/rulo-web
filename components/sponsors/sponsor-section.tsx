'use client';

import { useState, useEffect } from 'react';
import { SponsorBanner } from './sponsor-banner';
import { cn } from '@/lib/utils';

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string | null;
  websiteUrl: string | null;
  affiliateCode: string | null;
  affiliateUrl: string | null;
  description: string | null;
}

interface SponsorSectionProps {
  sponsors: Sponsor[];
  variant?: 'sidebar' | 'horizontal' | 'grid';
  className?: string;
}

export function SponsorSection({
  sponsors,
  variant = 'sidebar',
  className,
}: SponsorSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate para variante sidebar (cada 8 segundos)
  useEffect(() => {
    if (variant === 'sidebar' && sponsors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [variant, sponsors.length]);

  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  // Variante Sidebar - Carrusel vertical con rotación automática
  if (variant === 'sidebar') {
    return (
      <div className={cn('space-y-3', className)}>
        {sponsors.length === 1 ? (
          <SponsorBanner sponsor={sponsors[0]} variant="sidebar" />
        ) : (
          <div className="relative">
            {/* Sponsor actual */}
            <div className="transition-all duration-500">
              <SponsorBanner
                sponsor={sponsors[currentIndex]}
                variant="sidebar"
              />
            </div>

            {/* Indicadores de carrusel */}
            {sponsors.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {sponsors.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentIndex
                        ? 'w-8 bg-cyan-500'
                        : 'w-1.5 bg-cyan-500/30 hover:bg-cyan-500/50'
                    )}
                    aria-label={`Ir al sponsor ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Texto de rotación */}
            {sponsors.length > 1 && (
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                Rotación automática cada 8s
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Variante Horizontal - Scroll horizontal de banners
  if (variant === 'horizontal') {
    return (
      <div className={cn('relative', className)}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex-shrink-0 snap-start"
              style={{ width: 'min(100%, 600px)' }}
            >
              <SponsorBanner sponsor={sponsor} variant="horizontal" />
            </div>
          ))}
        </div>

        {/* Gradiente de fade en los bordes */}
        <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    );
  }

  // Variante Grid - Grid responsive de sponsors
  if (variant === 'grid') {
    return (
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
          className
        )}
      >
        {sponsors.map((sponsor) => (
          <SponsorBanner
            key={sponsor.id}
            sponsor={sponsor}
            variant="grid"
          />
        ))}
      </div>
    );
  }

  return null;
}