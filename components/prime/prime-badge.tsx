// components/prime/prime-badge.tsx
import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PrimeBadgeProps {
  variant?: 'default' | 'compact';
  showTooltip?: boolean;
  className?: string;
}

export function PrimeBadge({ variant = 'default', showTooltip = true, className = '' }: PrimeBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Crown className="h-4 w-4 text-yellow-500" />
      </div>
    );
  }

  return (
    <Badge 
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-none text-white ${className}`}
      variant="default"
    >
      <Crown className="h-3 w-3 mr-1" />
      PRIME
    </Badge>
  );
}

// Badge para mostrar en el chat
export function PrimeChatBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
      <Crown className="h-3 w-3" />
    </span>
  );
}

// Badge simple para el navbar
export function PrimeNavBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
      <Crown className="h-3.5 w-3.5 text-yellow-500" />
      <span className="text-xs font-semibold text-yellow-500">PRIME</span>
    </div>
  );
}