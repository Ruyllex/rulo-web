// components/stream/solcito-cheer.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sun, Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SolcitoCheerProps {
  streamerId: string;
  streamerName: string;
  userBalance?: number; // ✅ Hacer opcional
  onCheerSent?: () => void;
}

const QUICK_AMOUNTS = [1, 10, 50, 100, 500, 1000];

export function SolcitoCheer({ 
  streamerId, 
  streamerName, 
  userBalance = 0, // ✅ Valor por defecto
  onCheerSent 
}: SolcitoCheerProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('100');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const solcitos = parseInt(amount);
    
    if (solcitos < 1) {
      toast.error('Mínimo 1 Solcito');
      return;
    }

    if (solcitos > userBalance) {
      toast.error('Solcitos insuficientes');
      return;
    }

    try {
      setLoading(true);
      
      await axios.post('/api/solcitos/send', {
        streamerId,
        amount: solcitos,
        message,
      });

      toast.success(`¡Enviaste ${solcitos} Solcitos!`);
      setOpen(false);
      setAmount('100');
      setMessage('');
      onCheerSent?.();
      
    } catch (error) {
      toast.error('Error al enviar Solcitos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCheerStyle = (value: number) => {
    if (value >= 10000) return 'from-purple-500 to-pink-500 animate-pulse';
    if (value >= 5000) return 'from-red-500 to-orange-500';
    if (value >= 1000) return 'from-orange-500 to-yellow-500';
    if (value >= 500) return 'from-yellow-500 to-green-500';
    if (value >= 100) return 'from-green-500 to-cyan-500'; // ✅ Cyan
    return 'from-gray-500 to-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30">
          <Sun className="h-4 w-4 text-cyan-100" />
          Enviar Solcitos
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-cyan-600 dark:text-cyan-400">
            Enviar Solcitos a {streamerName}
          </DialogTitle>
          <DialogDescription>
            Tu balance: <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {userBalance.toLocaleString()} ☀
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant={amount === quickAmount.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={quickAmount > userBalance}
                className={cn(
                  amount === quickAmount.toString() && "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white",
                  quickAmount > userBalance && "opacity-50"
                )}
              >
                {quickAmount >= 1000 
                  ? `${(quickAmount / 1000).toFixed(0)}K` 
                  : quickAmount} ☀
              </Button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Cantidad personalizada"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={userBalance}
              className="border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
            
            {/* Preview */}
            <div className={cn(
              "p-3 rounded-lg text-white text-center font-bold bg-gradient-to-r",
              getCheerStyle(parseInt(amount) || 0)
            )}>
              {parseInt(amount) || 0} Solcitos ☀
            </div>
          </div>

          {/* Message */}
          <Textarea
            placeholder="Mensaje (opcional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
            className="border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
          <span className="text-xs text-muted-foreground text-right">
            {message.length}/200
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 hover:bg-cyan-500/10">
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !amount || parseInt(amount) < 1 || parseInt(amount) > userBalance}
            className={cn(
              "flex-1 text-white bg-gradient-to-r shadow-lg",
              getCheerStyle(parseInt(amount) || 0)
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}