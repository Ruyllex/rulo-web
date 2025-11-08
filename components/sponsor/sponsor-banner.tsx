"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Sponsor {
  id: string;
  name: string;
  description?: string;
  logoUrl: string;
  bannerUrl?: string;
  websiteUrl?: string;
  affiliateCode?: string;
  affiliateUrl?: string;
  type: "PLATFORM" | "STREAMER";
}

interface SponsorBannerProps {
  sponsors: Sponsor[];
  variant?: "sidebar" | "horizontal" | "grid";
}

export const SponsorBanner = ({
  sponsors,
  variant = "sidebar",
}: SponsorBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sponsors.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [sponsors.length]);

  const handleSponsorClick = async (sponsor: Sponsor) => {
    try {
      await fetch('/api/sponsors/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId: sponsor.id }),
      });

      const url = sponsor.affiliateUrl || sponsor.websiteUrl;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error tracking sponsor click:', error);
    }
  };

  if (sponsors.length === 0) return null;

  if (variant === "sidebar") {
    const currentSponsor = sponsors[currentIndex];
    
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Patrocinador
          </span>
          {sponsors.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {sponsors.length}
            </span>
          )}
        </div>

        <div
          className="relative cursor-pointer group"
          onClick={() => handleSponsorClick(currentSponsor)}
        >
          {currentSponsor.bannerUrl ? (
            <img
              src={currentSponsor.bannerUrl}
              alt={currentSponsor.name}
              className="w-full rounded-lg transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg flex items-center justify-center">
              <img
                src={currentSponsor.logoUrl}
                alt={currentSponsor.name}
                className="max-h-16 max-w-full object-contain"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{currentSponsor.name}</h3>
          {currentSponsor.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {currentSponsor.description}
            </p>
          )}
        </div>

        {currentSponsor.affiliateCode && (
          <div className="bg-primary/10 border border-primary/20 p-2 rounded text-center">
            <p className="text-xs text-muted-foreground">Código de descuento</p>
            <p className="font-mono font-bold text-primary">
              {currentSponsor.affiliateCode}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          variant="outline"
          onClick={() => handleSponsorClick(currentSponsor)}
        >
          Visitar sitio web
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className="flex items-center gap-4 overflow-x-auto py-4 px-2">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="flex-shrink-0 cursor-pointer group relative"
            onClick={() => handleSponsorClick(sponsor)}
          >
            <div className="bg-card border rounded-lg p-4 hover:border-primary transition-colors">
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded whitespace-nowrap">
                {sponsor.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sponsors.map((sponsor) => (
          <Card
            key={sponsor.id}
            className="p-4 cursor-pointer hover:border-primary transition-colors group"
            onClick={() => handleSponsorClick(sponsor)}
          >
            <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="max-h-20 max-w-full object-contain relative z-10"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            <h3 className="font-semibold mb-1">{sponsor.name}</h3>
            {sponsor.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {sponsor.description}
              </p>
            )}

            {sponsor.affiliateCode && (
              <div className="bg-primary/10 border border-primary/20 p-2 rounded text-center mb-3">
                <p className="text-xs text-muted-foreground">Código</p>
                <p className="font-mono font-semibold text-primary text-sm">
                  {sponsor.affiliateCode}
                </p>
              </div>
            )}

            <Button variant="outline" className="w-full" size="sm">
              Ver más
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Card>
        ))}
      </div>
    );
  }

  return null;
};

export const useSponsors = (streamerId?: string) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const endpoint = streamerId
          ? `/api/sponsors?streamerId=${streamerId}`
          : '/api/sponsors';
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        setSponsors(data.sponsors || []);
      } catch (error) {
        console.error('Error loading sponsors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSponsors();
  }, [streamerId]);

  return { sponsors, loading };
};