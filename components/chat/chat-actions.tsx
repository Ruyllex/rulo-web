"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Smile, Gift, ShoppingCart, Crown, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SolcitoIcon } from "@/components/solcito-icon";
import { cn } from "@/lib/utils";

// Botón de Emojis Simple
export function EmojiButton() {
  const [showEmojis, setShowEmojis] = useState(false);

  const emojis = [
    "😀", "😂", "🤣", "😊", "😍", "🥰", "😎", "🤔",
    "👍", "👏", "🎉", "❤️", "🔥", "⭐", "💯", "✨",
    "🎮", "🎯", "🎪", "🎨", "🎭", "🎬", "🎤", "🎧",
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowEmojis(!showEmojis)}
        className="p-2 hover:bg-cyan-500/10 rounded transition-colors"
        type="button"
      >
        <Smile className="h-4 w-4" />
      </button>

      {showEmojis && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowEmojis(false)}
          />
          
          {/* Panel de emojis */}
          <div className="absolute bottom-full left-0 mb-2 z-20 bg-background border border-cyan-500/20 rounded-lg p-2 shadow-lg w-64">
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  className="p-2 text-lg hover:bg-cyan-500/10 rounded transition-colors"
                  onClick={() => {
                    // Aquí agregarías el emoji al input
                    setShowEmojis(false);
                  }}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Botón de Regalo de Solcitos
export function GiftSolcitosButton({
  streamerId,
  streamerName,
  userBalance = 0,
}: {
  streamerId: string;
  streamerName: string;
  userBalance?: number;
}) {
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const giftAmounts = [1, 10, 25, 50, 100, 250, 500, 1000];

  const handleGift = async (amount: number) => {
    if (userBalance === 0) {
      setShowGiftPanel(false);
      toast.error("No tienes Solcitos", {
        description: "¿Quieres comprar ahora?",
        action: {
          label: "Comprar",
          onClick: () => router.push("/showcase"),
        },
      });
      return;
    }

    if (userBalance < amount) {
      setShowGiftPanel(false);
      toast.error(`Solcitos insuficientes`, {
        description: `Tienes ${userBalance.toLocaleString()} y necesitas ${amount.toLocaleString()}`,
      });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/solcitos/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: streamerId,
          amount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowGiftPanel(false);
        toast.success(`¡Enviaste ${amount} Solcitos!`, {
          description: `Nuevo balance: ${data.newBalance} Solcitos`,
        });
        // Recargar la página para actualizar el balance
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        toast.error("Error al enviar", {
          description: data.error || "Intenta de nuevo",
        });
      }
    } catch (error) {
      toast.error("Error al enviar Solcitos");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowGiftPanel(!showGiftPanel)}
        className="p-2 hover:bg-cyan-500/10 rounded transition-colors"
        type="button"
        disabled={sending}
      >
        <Gift className="h-4 w-4" />
      </button>

      {showGiftPanel && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowGiftPanel(false)}
          />
          
          {/* Panel de regalo */}
          <div className="absolute bottom-full left-0 mb-2 z-20 bg-background border border-cyan-500/20 rounded-lg p-3 shadow-lg w-64">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                Enviar Solcitos a {streamerName}
              </h4>
              <p className="text-xs text-muted-foreground">
                Tu balance: {userBalance.toLocaleString()} Solcitos
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {giftAmounts.map((amount) => {
                const canAfford = userBalance >= amount;
                return (
                  <button
                    key={amount}
                    onClick={() => handleGift(amount)}
                    disabled={!canAfford || sending}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-lg border transition-all",
                      canAfford
                        ? "border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:scale-105"
                        : "border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed"
                    )}
                    type="button"
                  >
                    <SolcitoIcon size="xs" showAmount={false} />
                    <span className={cn(
                      "text-xs font-bold mt-1",
                      canAfford ? "text-cyan-600 dark:text-cyan-400" : "text-red-500"
                    )}>
                      {amount}
                    </span>
                  </button>
                );
              })}
            </div>

            {userBalance === 0 && (
              <div className="mt-3 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded">
                <p className="text-xs text-cyan-600 dark:text-cyan-400 text-center">
                  No tienes Solcitos. ¡Compra ahora!
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Botón de Comprar Solcitos
export function BuySolcitosButton({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/showcase");
  };

  if (variant === "icon") {
    return (
      <button
        className="p-2 hover:bg-cyan-500/10 rounded transition-colors"
        onClick={handleClick}
        type="button"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      className={cn(
        "px-3 py-1.5 text-sm rounded-lg",
        "border border-cyan-500/20 hover:border-cyan-500/50",
        "hover:bg-cyan-500/10 transition-all"
      )}
      onClick={handleClick}
      type="button"
    >
      Comprar
    </button>
  );
}

// Botón de Suscribirse (Prime) - VERSIÓN MEJORADA CON TAMAÑO CONSISTENTE
export function SubscribeButton({
  streamerId,
  streamerName,
  isSubscribed = false,
  isPrime = false,
  size = "default",
  className = "",
}: {
  streamerId: string;
  streamerName: string;
  isSubscribed?: boolean;
  isPrime?: boolean;
  size?: "sm" | "default" | "md" | "lg";
  className?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSubscribe = () => {
    router.push("/prime");
  };

  // Tamaños consistentes con los otros botones
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    default: "h-10 px-4 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    default: "h-4 w-4",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Si ya está suscrito
  if (isPrime || isSubscribed) {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
          "border border-purple-500/30",
          "text-purple-400 cursor-default",
          sizeClasses[size],
          className
        )}
        type="button"
      >
        <Crown className={iconSizes[size]} />
        <span>Suscrito</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "bg-gradient-to-r from-cyan-500/10 to-cyan-600/10",
          "border border-cyan-500/30 hover:border-cyan-500/50",
          "hover:from-cyan-500/20 hover:to-cyan-600/20",
          "text-cyan-400 transition-all",
          sizeClasses[size],
          className
        )}
        type="button"
      >
        <Heart className={iconSizes[size]} />
        <span>Suscribirse</span>
      </button>

      {/* Modal de Suscripción */}
      {showModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-background border border-cyan-500/20 rounded-lg shadow-2xl p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent mb-2">
                  Suscríbete con Prime
                </h3>
                <p className="text-sm text-muted-foreground">
                  Apoya a {streamerName} y obtén beneficios exclusivos
                </p>
              </div>

              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold">Beneficios Prime:</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-500" />
                    Badge exclusivo en el chat
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-500" />
                    Sin anuncios en streams
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-500" />
                    Emojis personalizados
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-500" />
                    Acceso a chat exclusivo
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-500" />
                    Apoya directamente al streamer
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubscribe}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-semibold",
                    "bg-gradient-to-r from-cyan-600 to-cyan-700",
                    "hover:from-cyan-500 hover:to-cyan-600",
                    "text-white shadow-lg shadow-cyan-500/30",
                    "transition-all flex items-center justify-center gap-2"
                  )}
                  type="button"
                >
                  <Crown className="h-4 w-4" />
                  Suscribirse $3.99/mes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}