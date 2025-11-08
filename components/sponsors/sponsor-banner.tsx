'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

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

interface SponsorBannerProps {
  sponsor: Sponsor;
  variant?: 'sidebar' | 'horizontal' | 'grid' | 'compact';
  className?: string;
}

export function SponsorBanner({
  sponsor,
  variant = 'sidebar',
  className,
}: SponsorBannerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    try {
      // Registrar click
      await axios.post('/api/sponsors/click', {
        sponsorId: sponsor.id,
      });

      // Abrir URL
      const url = sponsor.affiliateUrl || sponsor.websiteUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error recording sponsor click:', error);
    }
  };

  // Variante Compact - Para toggle colapsado
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'w-full p-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all group',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[5/2] w-full">
          <Image
            src={sponsor.logoUrl}
            alt={sponsor.name}
            fill
            className="object-contain"
          />
        </div>
        {sponsor.affiliateCode && (
          <div className="mt-1 text-center">
            <Badge className="text-[10px] bg-cyan-600 text-white">
              {sponsor.affiliateCode}
            </Badge>
          </div>
        )}
      </button>
    );
  }

  // Variante Sidebar - Vertical, para el sidebar
  if (variant === 'sidebar') {
    return (
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 group',
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[5/2] bg-gradient-to-br from-cyan-500/5 to-cyan-600/5">
          <Image
            src={sponsor.logoUrl}
            alt={sponsor.name}
            fill
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
        </div>

        {(sponsor.affiliateCode || sponsor.description) && (
          <div className="p-3 space-y-2 border-t border-cyan-500/10">
            {sponsor.affiliateCode && (
              <div className="flex items-center justify-center gap-2">
                <Tag className="h-3 w-3 text-cyan-500" />
                <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                  Código: {sponsor.affiliateCode}
                </Badge>
              </div>
            )}

            {sponsor.description && (
              <p className="text-xs text-muted-foreground text-center line-clamp-2">
                {sponsor.description}
              </p>
            )}

            {(sponsor.affiliateUrl || sponsor.websiteUrl) && (
              <div className="flex items-center justify-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                <ExternalLink className="h-3 w-3" />
                <span>Ver más</span>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  // Variante Horizontal - Banner ancho
  if (variant === 'horizontal') {
    const imageUrl = sponsor.bannerUrl || sponsor.logoUrl;

    return (
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 group',
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[8/2] bg-gradient-to-r from-cyan-500/5 via-cyan-600/5 to-cyan-500/5">
          <Image
            src={imageUrl}
            alt={sponsor.name}
            fill
            className={cn(
              'transition-transform group-hover:scale-105',
              sponsor.bannerUrl ? 'object-cover' : 'object-contain p-4'
            )}
          />

          {/* Overlay con info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-lg mb-1">{sponsor.name}</h3>
              {sponsor.description && (
                <p className="text-sm text-gray-200 line-clamp-2 mb-2">
                  {sponsor.description}
                </p>
              )}
              {sponsor.affiliateCode && (
                <Badge className="bg-cyan-600 text-white">
                  Código: {sponsor.affiliateCode}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Variante Grid - Cuadrado para grids
  if (variant === 'grid') {
    return (
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 group',
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square bg-gradient-to-br from-cyan-500/5 to-cyan-600/5">
          <Image
            src={sponsor.logoUrl}
            alt={sponsor.name}
            fill
            className="object-contain p-6 transition-transform group-hover:scale-105"
          />
        </div>

        <div className="p-4 border-t border-cyan-500/10">
          <h3 className="font-semibold text-center mb-2">{sponsor.name}</h3>

          {sponsor.description && (
            <p className="text-xs text-muted-foreground text-center line-clamp-2 mb-3">
              {sponsor.description}
            </p>
          )}

          {sponsor.affiliateCode && (
            <div className="flex items-center justify-center gap-2">
              <Tag className="h-3 w-3 text-cyan-500" />
              <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                {sponsor.affiliateCode}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 mt-2">
            <ExternalLink className="h-3 w-3" />
            <span>Visitar sitio</span>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}