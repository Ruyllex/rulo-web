// components/stream/stream-alert.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Heart, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'cheer' | 'donation' | 'subscription' | 'follow';
  fromUser: string;
  amount?: number;
  message?: string;
  tier?: string;
}

export function StreamAlert({ alert }: { alert: Alert | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (alert) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!alert || !show) return null;

  const getAlertStyle = () => {
    switch (alert.type) {
      case 'cheer':
        if (!alert.amount) return 'from-gray-500 to-gray-600';
        if (alert.amount >= 10000) return 'from-purple-500 to-pink-500';
        if (alert.amount >= 5000) return 'from-red-500 to-orange-500';
        if (alert.amount >= 1000) return 'from-orange-500 to-yellow-500';
        if (alert.amount >= 500) return 'from-yellow-500 to-green-500';
        if (alert.amount >= 100) return 'from-green-500 to-blue-500';
        return 'from-blue-500 to-cyan-500';
      case 'donation':
        return 'from-green-500 to-emerald-500';
      case 'subscription':
        return 'from-purple-500 to-pink-500';
      case 'follow':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case 'cheer':
        return <Sun className="h-8 w-8 text-yellow-400 animate-bounce" />;
      case 'donation':
        return <Heart className="h-8 w-8 text-red-500 animate-pulse" />;
      case 'subscription':
        return <Star className="h-8 w-8 text-purple-400 animate-spin" />;
      case 'follow':
        return <Users className="h-8 w-8 text-blue-400" />;
    }
  };

  const getTitle = () => {
    switch (alert.type) {
      case 'cheer':
        return `${alert.fromUser} envió ${alert.amount} Solcitos ☀`;
      case 'donation':
        return `${alert.fromUser} donó $${alert.amount}`;
      case 'subscription':
        return `${alert.fromUser} se suscribió${alert.tier ? ` (Tier ${alert.tier})` : ''}`;
      case 'follow':
        return `${alert.fromUser} comenzó a seguirte`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className={cn(
          "p-6 rounded-2xl shadow-2xl bg-gradient-to-r text-white",
          getAlertStyle()
        )}>
          <div className="flex items-center gap-4">
            {getIcon()}
            <div>
              <h3 className="text-xl font-bold">{getTitle()}</h3>
              {alert.message && (
                <p className="mt-2 text-white/90">{alert.message}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
